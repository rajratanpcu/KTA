package com.kta.erp.service.excel;

import com.kta.erp.dto.excel.ExcelImportResultResponse;
import com.kta.erp.entity.*;
import com.kta.erp.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class VyaparDataImportService {

    private final CustomerRepository customerRepository;
    private final SupplierRepository supplierRepository;
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final UnitRepository unitRepository;
    private final GodownRepository godownRepository;
    private final StockBalanceRepository stockBalanceRepository;
    private final SalesInvoiceRepository salesInvoiceRepository;
    private final InvoiceLineItemRepository invoiceLineItemRepository;
    private final PaymentReceiptRepository paymentReceiptRepository;
    private final AllTransactionRepository allTransactionRepository;
    private final ExcelImportAuditRepository excelImportAuditRepository;

    @Transactional(rollbackFor = Exception.class)
    public ExcelImportResultResponse executeImport(VyaparExcelParserService.ParsedWorkbookData data, String importMode, String importedBy) {
        log.info("Starting Excel data import. Mode: {}, File: {}, Records: Invoices={}, Items={}, Parties={}",
                importMode, data.getFileName(), data.getInvoices().size(), data.getItems().size(), data.getParties().size());

        ExcelImportResultResponse response = new ExcelImportResultResponse();
        response.setImportMode(importMode);

        List<String> errors = new ArrayList<>();
        List<String> warnings = new ArrayList<>();
        List<String> notes = new ArrayList<>();

        try {
            // If REPLACE_DEMO mode is selected, remove existing demo records cleanly
            if ("REPLACE_DEMO".equalsIgnoreCase(importMode)) {
                cleanDemoData(notes);
            }

            // Step 1: Ensure Default Godown for Hajipur exists
            Godown centralGodown = ensureCentralGodown();

            // Step 2: Import Parties (Parties Ledger)
            int partiesCount = importParties(data.getParties(), warnings);
            response.setPartiesImported(partiesCount);

            // Step 3: Import Item Master & Stock
            int productsCount = importItemsAndStock(data.getItems(), centralGodown, warnings);
            response.setProductsImported(productsCount);

            // Step 4: Import Sales Invoices
            int invoicesCount = importSalesInvoices(data.getInvoices(), warnings);
            response.setInvoicesImported(invoicesCount);

            // Step 5: Import Invoice Line Items
            int lineItemsCount = importInvoiceLineItems(data.getLineItems(), warnings);
            response.setLineItemsImported(lineItemsCount);

            // Step 6: Import Payments & Receipts
            int paymentsCount = importPayments(data.getPayments(), warnings);
            response.setPaymentsImported(paymentsCount);

            // Step 7: Import All Transactions Register
            int txnCount = importAllTransactions(data.getTransactions(), warnings);
            response.setTransactionsImported(txnCount);

            // Calculate Totals
            BigDecimal totalSales = data.getInvoices().stream()
                    .map(VyaparExcelParserService.ParsedInvoice::getTotalAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal totalReceipts = data.getPayments().stream()
                    .filter(p -> p.getVoucherType().toLowerCase().contains("in") || p.getVoucherType().toLowerCase().contains("receipt"))
                    .map(VyaparExcelParserService.ParsedPayment::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            response.setTotalSalesAmount(totalSales.setScale(2, RoundingMode.HALF_UP));
            response.setTotalReceiptsAmount(totalReceipts.setScale(2, RoundingMode.HALF_UP));

            response.setStatus("SUCCESS");
            response.setMessage(String.format("Vyapar Excel data imported successfully! %d invoices, %d products, %d parties processed.",
                    invoicesCount, productsCount, partiesCount));

            notes.add(String.format("Reconciled Total Sales: ₹%s across %d invoices", totalSales.toPlainString(), invoicesCount));
            notes.add(String.format("Reconciled Total Collections: ₹%s across %d receipts", totalReceipts.toPlainString(), paymentsCount));
            notes.add("Inventory quantities assigned to central godown 'GDN-HAJIPUR'. Negative stock preserved without coercion.");

            response.setErrors(errors);
            response.setWarnings(warnings);
            response.setReconciliationNotes(notes);

            // Save Audit Log
            ExcelImportAudit audit = ExcelImportAudit.builder()
                    .fileName(data.getFileName())
                    .fileSize(data.getFileSize())
                    .importMode(importMode)
                    .invoicesCount(invoicesCount)
                    .lineItemsCount(lineItemsCount)
                    .paymentsCount(paymentsCount)
                    .partiesCount(partiesCount)
                    .productsCount(productsCount)
                    .transactionsCount(txnCount)
                    .totalSalesAmount(totalSales)
                    .totalReceiptsAmount(totalReceipts)
                    .status("SUCCESS")
                    .notes(String.join(" | ", notes))
                    .importedBy(importedBy != null ? importedBy : "ADMIN")
                    .build();
            excelImportAuditRepository.save(audit);

            return response;

        } catch (Exception ex) {
            log.error("Failed to execute Vyapar Excel import. Rolling back transaction.", ex);
            errors.add("Import failed: " + ex.getMessage());
            response.setStatus("FAILED");
            response.setMessage("Import transaction failed and rolled back cleanly: " + ex.getMessage());
            response.setErrors(errors);
            response.setWarnings(warnings);
            response.setReconciliationNotes(notes);

            ExcelImportAudit failedAudit = ExcelImportAudit.builder()
                    .fileName(data.getFileName())
                    .fileSize(data.getFileSize())
                    .importMode(importMode)
                    .status("FAILED")
                    .errorMessage(ex.getMessage())
                    .importedBy(importedBy != null ? importedBy : "ADMIN")
                    .build();
            excelImportAuditRepository.save(failedAudit);

            throw new RuntimeException("Import transaction aborted: " + ex.getMessage(), ex);
        }
    }

    private void cleanDemoData(List<String> notes) {
        log.warn("REPLACE_DEMO mode active. Clearing existing transactions, line items, invoices, and demo inventory...");
        invoiceLineItemRepository.deleteAllInBatch();
        salesInvoiceRepository.deleteAllInBatch();
        paymentReceiptRepository.deleteAllInBatch();
        allTransactionRepository.deleteAllInBatch();
        notes.add("Cleaned demo sales invoices, line items, payment receipts, and transaction records.");
    }

    private Godown ensureCentralGodown() {
        return godownRepository.findByCode("GDN-HAJIPUR").orElseGet(() -> {
            Godown g = new Godown();
            g.setCode("GDN-HAJIPUR");
            g.setName("Kushwaha Tent Agency - Central Godown");
            g.setLocation("Hajipur, Vaishali, Bihar");
            g.setContactPerson("Raj Ratan");
            g.setPhone("9876543210");
            g.setCapacity(50000);
            g.setActive(true);
            return godownRepository.save(g);
        });
    }

    private int importParties(List<VyaparExcelParserService.ParsedParty> parties, List<String> warnings) {
        int count = 0;
        int custCodeCounter = (int) customerRepository.count() + 1;
        int suppCodeCounter = (int) supplierRepository.count() + 1;

        for (VyaparExcelParserService.ParsedParty p : parties) {
            String type = p.getPartyType() != null ? p.getPartyType().trim() : "Customer";

            if (type.equalsIgnoreCase("Supplier")) {
                Optional<Supplier> existingSupp = supplierRepository.findFirstByNameIgnoreCase(p.getPartyName());
                Supplier s = existingSupp.orElseGet(Supplier::new);
                if (s.getId() == null) {
                    s.setCode(String.format("SUP-%03d", suppCodeCounter++));
                    s.setName(p.getPartyName());
                }
                s.setPhone(p.getPhoneNumber() != null ? p.getPhoneNumber() : "-");
                s.setAddress(p.getAddress() != null ? p.getAddress() : "Hajipur");
                s.setCity("Hajipur");
                s.setState(p.getState() != null ? p.getState() : "Bihar");
                s.setPincode("844101");
                s.setGstNumber(p.getGstin());
                s.setBalance(p.getCurrentBalance() != null ? p.getCurrentBalance() : BigDecimal.ZERO);
                s.setActive(true);
                supplierRepository.save(s);
                count++;
            } else {
                // Customer or Both
                Optional<Customer> existingCust = customerRepository.findFirstByNameIgnoreCase(p.getPartyName());
                Customer c = existingCust.orElseGet(Customer::new);
                if (c.getId() == null) {
                    c.setCode(String.format("CUST-%03d", custCodeCounter++));
                    c.setName(p.getPartyName());
                }
                c.setPhone(p.getPhoneNumber() != null ? p.getPhoneNumber() : "-");
                c.setAddress(p.getAddress() != null ? p.getAddress() : "Hajipur");
                c.setCity("Hajipur");
                c.setState(p.getState() != null ? p.getState() : "Bihar");
                c.setPincode("844101");
                c.setGstNumber(p.getGstin());
                c.setBalance(p.getCurrentBalance() != null ? p.getCurrentBalance() : BigDecimal.ZERO);
                c.setActive(true);
                customerRepository.save(c);
                count++;
            }
        }
        return count;
    }

    private int importItemsAndStock(List<VyaparExcelParserService.ParsedItem> items, Godown centralGodown, List<String> warnings) {
        int count = 0;
        int catCounter = 1;

        for (VyaparExcelParserService.ParsedItem item : items) {
            // Ensure Category
            String catName = item.getCategory() != null && !item.getCategory().isBlank() ? item.getCategory() : "General";
            Category cat = categoryRepository.findFirstByNameIgnoreCase(catName).orElseGet(() -> {
                Category newCat = new Category();
                newCat.setName(catName);
                newCat.setDescription("Vyapar Import: " + catName);
                newCat.setCode("CAT-" + System.currentTimeMillis() % 100000);
                return categoryRepository.save(newCat);
            });

            // Ensure Unit
            String unitName = item.getUnit() != null && !item.getUnit().isBlank() ? item.getUnit() : "Pcs";
            Unit unit = unitRepository.findFirstByNameIgnoreCase(unitName).orElseGet(() -> {
                Unit newUnit = new Unit();
                newUnit.setName(unitName);
                newUnit.setCode(unitName.toUpperCase().replaceAll("[^A-Z]", ""));
                if (newUnit.getCode().isEmpty()) newUnit.setCode("PCS");
                return unitRepository.save(newUnit);
            });

            // Find or create product by SKU / Item Code
            Optional<Product> existingProd = productRepository.findBySku(item.getItemCode());
            if (existingProd.isEmpty()) {
                existingProd = productRepository.findFirstByNameIgnoreCase(item.getItemName());
            }

            Product prod = existingProd.orElseGet(Product::new);
            prod.setSku(item.getItemCode());
            prod.setName(item.getItemName());
            prod.setCategory(cat);
            prod.setUnit(unit);
            prod.setSellingPrice(item.getSalePrice() != null ? item.getSalePrice() : BigDecimal.ZERO);
            prod.setPurchasePrice(item.getPurchasePrice() != null ? item.getPurchasePrice() : BigDecimal.ZERO);
            prod.setGstRate(BigDecimal.ZERO);
            prod.setMinStockLevel(10);
            prod.setActive(true);
            Product savedProd = productRepository.save(prod);

            // Update Stock Balance in Central Godown
            BigDecimal stockQty = item.getStockQuantity() != null ? item.getStockQuantity() : BigDecimal.ZERO;
            Optional<StockBalance> optBalance = stockBalanceRepository.findByProductIdAndGodownId(savedProd.getId(), centralGodown.getId());
            StockBalance balance = optBalance.orElseGet(StockBalance::new);
            balance.setProduct(savedProd);
            balance.setGodown(centralGodown);
            balance.setAvailableQuantity(stockQty);
            balance.setReservedQuantity(BigDecimal.ZERO);
            balance.setInTransitQuantity(BigDecimal.ZERO);
            balance.setLastCountedAt(LocalDateTime.now());
            stockBalanceRepository.save(balance);

            count++;
        }
        return count;
    }

    private int importSalesInvoices(List<VyaparExcelParserService.ParsedInvoice> invoices, List<String> warnings) {
        int count = 0;
        for (VyaparExcelParserService.ParsedInvoice inv : invoices) {
            Optional<SalesInvoice> opt = salesInvoiceRepository.findByInvoiceNumber(inv.getInvoiceNumber());
            SalesInvoice entity = opt.orElseGet(SalesInvoice::new);

            entity.setInvoiceNumber(inv.getInvoiceNumber());
            entity.setInvoiceDate(inv.getInvoiceDate());
            entity.setCustomerName(inv.getCustomerName());
            entity.setTotalAmount(inv.getTotalAmount());
            entity.setPaidAmount(inv.getPaidAmount());
            entity.setBalanceDue(inv.getBalanceDue());
            entity.setPaymentStatus(inv.getPaymentStatus());
            entity.setPaymentMode(inv.getPaymentMode());
            entity.setNotes(inv.getNotes());

            salesInvoiceRepository.save(entity);
            count++;
        }
        return count;
    }

    private int importInvoiceLineItems(List<VyaparExcelParserService.ParsedLineItem> lineItems, List<String> warnings) {
        int count = 0;
        int lineCounter = 1;
        String lastInv = "";

        for (VyaparExcelParserService.ParsedLineItem item : lineItems) {
            if (!item.getInvoiceNumber().equals(lastInv)) {
                lineCounter = 1;
                lastInv = item.getInvoiceNumber();
            }

            InvoiceLineItem entity = new InvoiceLineItem();
            entity.setInvoiceNumber(item.getInvoiceNumber());
            entity.setLineNumber(lineCounter++);
            entity.setItemDate(item.getItemDate());
            entity.setCustomerName(item.getCustomerName());
            entity.setItemName(item.getItemName());
            entity.setCategory(item.getCategory());
            entity.setQuantity(item.getQuantity());
            entity.setUnit(item.getUnit());
            entity.setUnitPrice(item.getUnitPrice());
            entity.setDiscount(item.getDiscount());
            entity.setTax(item.getTax());
            entity.setLineTotal(item.getLineTotal());

            // Link to parent invoice if exists
            salesInvoiceRepository.findByInvoiceNumber(item.getInvoiceNumber()).ifPresent(entity::setInvoice);

            invoiceLineItemRepository.save(entity);
            count++;
        }
        return count;
    }

    private int importPayments(List<VyaparExcelParserService.ParsedPayment> payments, List<String> warnings) {
        int count = 0;
        for (VyaparExcelParserService.ParsedPayment p : payments) {
            PaymentReceipt entity = new PaymentReceipt();
            entity.setVoucherNumber(p.getVoucherNumber());
            entity.setVoucherDate(p.getVoucherDate());
            entity.setVoucherType(p.getVoucherType());
            entity.setPartyName(p.getPartyName());
            entity.setAmount(p.getAmount());
            entity.setPaymentMode(p.getPaymentMode());
            entity.setNotes(p.getNotes());

            paymentReceiptRepository.save(entity);
            count++;
        }
        return count;
    }

    private int importAllTransactions(List<VyaparExcelParserService.ParsedTransaction> transactions, List<String> warnings) {
        int count = 0;
        for (VyaparExcelParserService.ParsedTransaction t : transactions) {
            AllTransaction entity = new AllTransaction();
            entity.setTxnId(t.getTxnId());
            entity.setTxnDate(t.getTxnDate());
            entity.setVoucherType(t.getVoucherType());
            entity.setRefInvNumber(t.getRefInvNo());
            entity.setPartyName(t.getPartyName());
            entity.setInflowAmount(t.getInflow());
            entity.setOutflowAmount(t.getOutflow());
            entity.setBalanceAmount(t.getBalance());
            entity.setPaymentMode(t.getPaymentMode());
            entity.setRemarks(t.getRemarks());

            allTransactionRepository.save(entity);
            count++;
        }
        return count;
    }
}
