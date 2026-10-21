package com.kta.erp.service.excel;

import com.kta.erp.dto.excel.ExcelImportPreviewResponse;
import com.kta.erp.dto.excel.ExcelRowValidation;
import com.kta.erp.dto.excel.ExcelSheetSummary;
import lombok.Builder;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Slf4j
@Service
public class VyaparExcelParserService {

    private static final DateTimeFormatter ISO_DATE = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    @Data
    @Builder
    public static class ParsedInvoice {
        private int rowNum;
        private String invoiceNumber;
        private LocalDate invoiceDate;
        private String customerName;
        private BigDecimal totalAmount;
        private BigDecimal paidAmount;
        private BigDecimal balanceDue;
        private String paymentStatus;
        private String paymentMode;
        private String notes;
    }

    @Data
    @Builder
    public static class ParsedLineItem {
        private int rowNum;
        private String invoiceNumber;
        private LocalDate itemDate;
        private String customerName;
        private String itemName;
        private String category;
        private BigDecimal quantity;
        private String unit;
        private BigDecimal unitPrice;
        private BigDecimal discount;
        private BigDecimal tax;
        private BigDecimal lineTotal;
    }

    @Data
    @Builder
    public static class ParsedPayment {
        private int rowNum;
        private String voucherNumber;
        private LocalDate voucherDate;
        private String voucherType;
        private String partyName;
        private BigDecimal amount;
        private String paymentMode;
        private String notes;
    }

    @Data
    @Builder
    public static class ParsedParty {
        private int rowNum;
        private String partyName;
        private String partyType;
        private String phoneNumber;
        private String address;
        private String state;
        private String gstin;
        private BigDecimal currentBalance;
        private Integer invoicesCount;
        private BigDecimal totalInvoiced;
    }

    @Data
    @Builder
    public static class ParsedItem {
        private int rowNum;
        private String itemCode;
        private String itemName;
        private String category;
        private String unit;
        private BigDecimal salePrice;
        private BigDecimal purchasePrice;
        private BigDecimal stockQuantity;
        private BigDecimal stockValue;
        private String status;
    }

    @Data
    @Builder
    public static class ParsedTransaction {
        private int rowNum;
        private Long txnId;
        private LocalDate txnDate;
        private String voucherType;
        private String refInvNo;
        private String partyName;
        private BigDecimal inflow;
        private BigDecimal outflow;
        private BigDecimal balance;
        private String paymentMode;
        private String remarks;
    }

    @Data
    public static class ParsedWorkbookData {
        private String fileName;
        private long fileSize;
        private List<ParsedInvoice> invoices = new ArrayList<>();
        private List<ParsedLineItem> lineItems = new ArrayList<>();
        private List<ParsedPayment> payments = new ArrayList<>();
        private List<ParsedParty> parties = new ArrayList<>();
        private List<ParsedItem> items = new ArrayList<>();
        private List<ParsedTransaction> transactions = new ArrayList<>();
        private Map<String, Object> executiveKpis = new LinkedHashMap<>();
        private Map<String, ExcelSheetSummary> sheetSummaries = new LinkedHashMap<>();
        private List<ExcelRowValidation> errors = new ArrayList<>();
        private List<ExcelRowValidation> warnings = new ArrayList<>();
    }

    public ParsedWorkbookData parseWorkbook(InputStream is, String fileName, long fileSize) throws Exception {
        Workbook workbook = WorkbookFactory.create(is);
        ParsedWorkbookData data = new ParsedWorkbookData();
        data.setFileName(fileName);
        data.setFileSize(fileSize);

        for (int i = 0; i < workbook.getNumberOfSheets(); i++) {
            Sheet sheet = workbook.getSheetAt(i);
            String name = sheet.getSheetName().trim();

            if (name.equalsIgnoreCase("Executive Summary")) {
                parseExecutiveSummary(sheet, data);
            } else if (name.equalsIgnoreCase("Sales Invoices")) {
                parseSalesInvoices(sheet, data);
            } else if (name.equalsIgnoreCase("Invoice Line Items")) {
                parseInvoiceLineItems(sheet, data);
            } else if (name.equalsIgnoreCase("Payments & Receipts")) {
                parsePayments(sheet, data);
            } else if (name.equalsIgnoreCase("Parties Ledger")) {
                parseParties(sheet, data);
            } else if (name.equalsIgnoreCase("Item Master & Stock")) {
                parseItems(sheet, data);
            } else if (name.equalsIgnoreCase("All Transactions Register")) {
                parseTransactions(sheet, data);
            }
        }

        // Cross-sheet reconciliation validation
        validateReconciliation(data);

        workbook.close();
        return data;
    }

    private void parseExecutiveSummary(Sheet sheet, ParsedWorkbookData data) {
        ExcelSheetSummary summary = new ExcelSheetSummary();
        summary.setSheetName(sheet.getSheetName());
        summary.setHeaders(List.of("Metric Description", "Amount / Count", "Calculation / Source Sheet", "Notes"));
        summary.setDetectedHeaderRow(6);
        List<Map<String, Object>> preview = new ArrayList<>();

        for (int r = 0; r <= sheet.getLastRowNum(); r++) {
            Row row = sheet.getRow(r);
            if (row == null) continue;
            String desc = getCellString(row.getCell(0));
            if (desc != null && !desc.isBlank()) {
                String valStr = getCellString(row.getCell(1));
                if (valStr != null && !valStr.isBlank()) {
                    data.getExecutiveKpis().put(desc, valStr);
                    if (preview.size() < 8) {
                        preview.add(Map.of("metric", desc, "value", valStr));
                    }
                }
            }
        }
        summary.setTotalRows(sheet.getLastRowNum() + 1);
        summary.setValidRecords(data.getExecutiveKpis().size());
        summary.setPreviewRows(preview);
        data.getSheetSummaries().put(sheet.getSheetName(), summary);
    }

    private void parseSalesInvoices(Sheet sheet, ParsedWorkbookData data) {
        int headerRow = findHeaderRow(sheet, "Invoice No");
        ExcelSheetSummary summary = new ExcelSheetSummary();
        summary.setSheetName(sheet.getSheetName());
        summary.setDetectedHeaderRow(headerRow + 1);
        List<Map<String, Object>> preview = new ArrayList<>();
        List<String> headers = getRowHeaders(sheet.getRow(headerRow));
        summary.setHeaders(headers);

        int valid = 0;
        int skipped = 0;

        for (int r = headerRow + 1; r <= sheet.getLastRowNum(); r++) {
            Row row = sheet.getRow(r);
            if (row == null) continue;

            String slNo = getCellString(row.getCell(0));
            String invNo = getCellString(row.getCell(1));
            String partyName = getCellString(row.getCell(3));

            if (isTotalOrSummaryRow(slNo, invNo, partyName)) {
                skipped++;
                continue;
            }

            if (invNo == null || invNo.isBlank()) {
                continue;
            }

            LocalDate date = getCellDate(row.getCell(2));
            BigDecimal total = getCellDecimal(row.getCell(4));
            BigDecimal paid = getCellDecimal(row.getCell(5));
            BigDecimal bal = getCellDecimal(row.getCell(6));
            String status = getCellString(row.getCell(7));
            String mode = getCellString(row.getCell(8));
            String notes = getCellString(row.getCell(9));

            if (date == null) {
                data.getErrors().add(ExcelRowValidation.builder()
                        .sheetName(sheet.getSheetName())
                        .rowNumber(r + 1)
                        .field("Date")
                        .message("Invalid or missing date for invoice " + invNo)
                        .severity("ERROR")
                        .build());
            }

            ParsedInvoice invoice = ParsedInvoice.builder()
                    .rowNum(r + 1)
                    .invoiceNumber(invNo.trim())
                    .invoiceDate(date != null ? date : LocalDate.now())
                    .customerName(partyName != null ? partyName.trim() : "Unknown Customer")
                    .totalAmount(total)
                    .paidAmount(paid)
                    .balanceDue(bal)
                    .paymentStatus(status != null ? status.trim() : "Unpaid")
                    .paymentMode(mode != null ? mode.trim() : "Cash")
                    .notes(notes)
                    .build();

            data.getInvoices().add(invoice);
            valid++;

            if (preview.size() < 5) {
                preview.add(Map.of(
                        "invoiceNo", invoice.getInvoiceNumber(),
                        "date", String.valueOf(invoice.getInvoiceDate()),
                        "customer", invoice.getCustomerName(),
                        "total", invoice.getTotalAmount(),
                        "paid", invoice.getPaidAmount(),
                        "status", invoice.getPaymentStatus()
                ));
            }
        }

        summary.setTotalRows(sheet.getLastRowNum() + 1);
        summary.setValidRecords(valid);
        summary.setSkippedSummaryRows(skipped);
        summary.setPreviewRows(preview);
        data.getSheetSummaries().put(sheet.getSheetName(), summary);
    }

    private void parseInvoiceLineItems(Sheet sheet, ParsedWorkbookData data) {
        int headerRow = findHeaderRow(sheet, "Item Name");
        ExcelSheetSummary summary = new ExcelSheetSummary();
        summary.setSheetName(sheet.getSheetName());
        summary.setDetectedHeaderRow(headerRow + 1);
        summary.setHeaders(getRowHeaders(sheet.getRow(headerRow)));
        List<Map<String, Object>> preview = new ArrayList<>();

        int valid = 0;
        int skipped = 0;

        for (int r = headerRow + 1; r <= sheet.getLastRowNum(); r++) {
            Row row = sheet.getRow(r);
            if (row == null) continue;

            String slNo = getCellString(row.getCell(0));
            String invNo = getCellString(row.getCell(1));
            String itemName = getCellString(row.getCell(4));

            if (isTotalOrSummaryRow(slNo, invNo, itemName)) {
                skipped++;
                continue;
            }

            if (itemName == null || itemName.isBlank()) {
                continue;
            }

            LocalDate date = getCellDate(row.getCell(2));
            String customer = getCellString(row.getCell(3));
            String category = getCellString(row.getCell(5));
            BigDecimal qty = getCellDecimal(row.getCell(6));
            String unit = getCellString(row.getCell(7));
            BigDecimal unitPrice = getCellDecimal(row.getCell(8));
            BigDecimal discount = getCellDecimal(row.getCell(9));
            BigDecimal tax = getCellDecimal(row.getCell(10));
            BigDecimal total = getCellDecimal(row.getCell(11));

            ParsedLineItem item = ParsedLineItem.builder()
                    .rowNum(r + 1)
                    .invoiceNumber(invNo != null ? invNo.trim() : "")
                    .itemDate(date)
                    .customerName(customer)
                    .itemName(itemName.trim())
                    .category(category != null ? category.trim() : "-")
                    .quantity(qty)
                    .unit(unit != null ? unit.trim() : "Pcs")
                    .unitPrice(unitPrice)
                    .discount(discount)
                    .tax(tax)
                    .lineTotal(total)
                    .build();

            data.getLineItems().add(item);
            valid++;

            if (preview.size() < 5) {
                preview.add(Map.of(
                        "invoiceNo", item.getInvoiceNumber(),
                        "item", item.getItemName(),
                        "qty", item.getQuantity(),
                        "unit", item.getUnit(),
                        "rate", item.getUnitPrice(),
                        "total", item.getLineTotal()
                ));
            }
        }

        summary.setTotalRows(sheet.getLastRowNum() + 1);
        summary.setValidRecords(valid);
        summary.setSkippedSummaryRows(skipped);
        summary.setPreviewRows(preview);
        data.getSheetSummaries().put(sheet.getSheetName(), summary);
    }

    private void parsePayments(Sheet sheet, ParsedWorkbookData data) {
        int headerRow = findHeaderRow(sheet, "Voucher Type");
        ExcelSheetSummary summary = new ExcelSheetSummary();
        summary.setSheetName(sheet.getSheetName());
        summary.setDetectedHeaderRow(headerRow + 1);
        summary.setHeaders(getRowHeaders(sheet.getRow(headerRow)));
        List<Map<String, Object>> preview = new ArrayList<>();

        int valid = 0;
        int skipped = 0;

        for (int r = headerRow + 1; r <= sheet.getLastRowNum(); r++) {
            Row row = sheet.getRow(r);
            if (row == null) continue;

            String slNo = getCellString(row.getCell(0));
            String vNo = getCellString(row.getCell(1));
            String party = getCellString(row.getCell(4));

            if (isTotalOrSummaryRow(slNo, vNo, party)) {
                skipped++;
                continue;
            }

            if (party == null || party.isBlank()) continue;

            LocalDate date = getCellDate(row.getCell(2));
            String type = getCellString(row.getCell(3));
            BigDecimal amount = getCellDecimal(row.getCell(5));
            String mode = getCellString(row.getCell(6));
            String notes = getCellString(row.getCell(7));

            ParsedPayment payment = ParsedPayment.builder()
                    .rowNum(r + 1)
                    .voucherNumber(vNo != null ? vNo.trim() : "PMT-" + (r + 1))
                    .voucherDate(date != null ? date : LocalDate.now())
                    .voucherType(type != null ? type.trim() : "Payment In (Receipt)")
                    .partyName(party.trim())
                    .amount(amount)
                    .paymentMode(mode != null ? mode.trim() : "Cash")
                    .notes(notes)
                    .build();

            data.getPayments().add(payment);
            valid++;

            if (preview.size() < 5) {
                preview.add(Map.of(
                        "voucherNo", payment.getVoucherNumber(),
                        "date", String.valueOf(payment.getVoucherDate()),
                        "type", payment.getVoucherType(),
                        "party", payment.getPartyName(),
                        "amount", payment.getAmount()
                ));
            }
        }

        summary.setTotalRows(sheet.getLastRowNum() + 1);
        summary.setValidRecords(valid);
        summary.setSkippedSummaryRows(skipped);
        summary.setPreviewRows(preview);
        data.getSheetSummaries().put(sheet.getSheetName(), summary);
    }

    private void parseParties(Sheet sheet, ParsedWorkbookData data) {
        int headerRow = findHeaderRow(sheet, "Party Name");
        ExcelSheetSummary summary = new ExcelSheetSummary();
        summary.setSheetName(sheet.getSheetName());
        summary.setDetectedHeaderRow(headerRow + 1);
        summary.setHeaders(getRowHeaders(sheet.getRow(headerRow)));
        List<Map<String, Object>> preview = new ArrayList<>();

        int valid = 0;
        int skipped = 0;

        for (int r = headerRow + 1; r <= sheet.getLastRowNum(); r++) {
            Row row = sheet.getRow(r);
            if (row == null) continue;

            String slNo = getCellString(row.getCell(0));
            String name = getCellString(row.getCell(1));

            if (isTotalOrSummaryRow(slNo, name, null)) {
                skipped++;
                continue;
            }

            if (name == null || name.isBlank()) continue;

            String type = getCellString(row.getCell(2));
            String phone = getCellString(row.getCell(3));
            String address = getCellString(row.getCell(4));
            String state = getCellString(row.getCell(5));
            String gstin = getCellString(row.getCell(6));
            BigDecimal balance = getCellDecimal(row.getCell(7));
            BigDecimal invCountDec = getCellDecimal(row.getCell(8));
            BigDecimal totalInvoiced = getCellDecimal(row.getCell(9));

            ParsedParty party = ParsedParty.builder()
                    .rowNum(r + 1)
                    .partyName(name.trim())
                    .partyType(type != null ? type.trim() : "Customer")
                    .phoneNumber(cleanValue(phone))
                    .address(cleanValue(address))
                    .state(cleanValue(state) != null ? cleanValue(state) : "Bihar")
                    .gstin(cleanValue(gstin))
                    .currentBalance(balance)
                    .invoicesCount(invCountDec != null ? invCountDec.intValue() : 0)
                    .totalInvoiced(totalInvoiced)
                    .build();

            data.getParties().add(party);
            valid++;

            if (preview.size() < 5) {
                preview.add(Map.of(
                        "name", party.getPartyName(),
                        "type", party.getPartyType(),
                        "phone", party.getPhoneNumber() != null ? party.getPhoneNumber() : "-",
                        "balance", party.getCurrentBalance(),
                        "invoices", party.getInvoicesCount()
                ));
            }
        }

        summary.setTotalRows(sheet.getLastRowNum() + 1);
        summary.setValidRecords(valid);
        summary.setSkippedSummaryRows(skipped);
        summary.setPreviewRows(preview);
        data.getSheetSummaries().put(sheet.getSheetName(), summary);
    }

    private void parseItems(Sheet sheet, ParsedWorkbookData data) {
        int headerRow = findHeaderRow(sheet, "Item Code");
        ExcelSheetSummary summary = new ExcelSheetSummary();
        summary.setSheetName(sheet.getSheetName());
        summary.setDetectedHeaderRow(headerRow + 1);
        summary.setHeaders(getRowHeaders(sheet.getRow(headerRow)));
        List<Map<String, Object>> preview = new ArrayList<>();

        int valid = 0;
        int skipped = 0;

        for (int r = headerRow + 1; r <= sheet.getLastRowNum(); r++) {
            Row row = sheet.getRow(r);
            if (row == null) continue;

            String slNo = getCellString(row.getCell(0));
            String code = getCellString(row.getCell(1));
            String name = getCellString(row.getCell(2));

            if (isTotalOrSummaryRow(slNo, code, name)) {
                skipped++;
                continue;
            }

            if (name == null || name.isBlank()) continue;

            String cat = getCellString(row.getCell(3));
            String unit = getCellString(row.getCell(4));
            BigDecimal sale = getCellDecimal(row.getCell(5));
            BigDecimal purchase = getCellDecimal(row.getCell(6));
            BigDecimal stock = getCellDecimal(row.getCell(7));
            BigDecimal val = getCellDecimal(row.getCell(8));
            String status = getCellString(row.getCell(9));

            if (stock.compareTo(BigDecimal.ZERO) < 0) {
                data.getWarnings().add(ExcelRowValidation.builder()
                        .sheetName(sheet.getSheetName())
                        .rowNumber(r + 1)
                        .field("Stock Quantity")
                        .value(stock.toPlainString())
                        .message("Negative stock quantity detected for item '" + name + "': " + stock + " (source value preserved for review)")
                        .severity("WARNING")
                        .build());
            }

            ParsedItem item = ParsedItem.builder()
                    .rowNum(r + 1)
                    .itemCode(code != null ? code.trim() : "ITM-" + (r + 1))
                    .itemName(name.trim())
                    .category(cleanValue(cat) != null ? cleanValue(cat) : "Tent & Event Materials")
                    .unit(unit != null ? unit.trim() : "Pcs")
                    .salePrice(sale)
                    .purchasePrice(purchase)
                    .stockQuantity(stock)
                    .stockValue(val)
                    .status(status != null ? status.trim() : "Active")
                    .build();

            data.getItems().add(item);
            valid++;

            if (preview.size() < 5) {
                preview.add(Map.of(
                        "code", item.getItemCode(),
                        "name", item.getItemName(),
                        "unit", item.getUnit(),
                        "salePrice", item.getSalePrice(),
                        "stockQty", item.getStockQuantity(),
                        "status", item.getStatus()
                ));
            }
        }

        summary.setTotalRows(sheet.getLastRowNum() + 1);
        summary.setValidRecords(valid);
        summary.setSkippedSummaryRows(skipped);
        summary.setPreviewRows(preview);
        data.getSheetSummaries().put(sheet.getSheetName(), summary);
    }

    private void parseTransactions(Sheet sheet, ParsedWorkbookData data) {
        int headerRow = findHeaderRow(sheet, "Txn ID");
        ExcelSheetSummary summary = new ExcelSheetSummary();
        summary.setSheetName(sheet.getSheetName());
        summary.setDetectedHeaderRow(headerRow + 1);
        summary.setHeaders(getRowHeaders(sheet.getRow(headerRow)));
        List<Map<String, Object>> preview = new ArrayList<>();

        int valid = 0;
        int skipped = 0;

        for (int r = headerRow + 1; r <= sheet.getLastRowNum(); r++) {
            Row row = sheet.getRow(r);
            if (row == null) continue;

            String slNo = getCellString(row.getCell(0));
            String txnIdStr = getCellString(row.getCell(1));
            String party = getCellString(row.getCell(5));

            if (isTotalOrSummaryRow(slNo, txnIdStr, party)) {
                skipped++;
                continue;
            }

            if (party == null || party.isBlank()) continue;

            Long txnId = null;
            try {
                if (txnIdStr != null && !txnIdStr.isBlank()) {
                    txnId = Double.valueOf(txnIdStr).longValue();
                }
            } catch (Exception ignored) {}

            LocalDate date = getCellDate(row.getCell(2));
            String type = getCellString(row.getCell(3));
            String ref = getCellString(row.getCell(4));
            BigDecimal inflow = getCellDecimal(row.getCell(6));
            BigDecimal outflow = getCellDecimal(row.getCell(7));
            BigDecimal balance = getCellDecimal(row.getCell(8));
            String mode = getCellString(row.getCell(9));
            String remarks = getCellString(row.getCell(10));

            ParsedTransaction txn = ParsedTransaction.builder()
                    .rowNum(r + 1)
                    .txnId(txnId)
                    .txnDate(date != null ? date : LocalDate.now())
                    .voucherType(type != null ? type.trim() : "Unknown")
                    .refInvNo(ref != null ? ref.trim() : null)
                    .partyName(party.trim())
                    .inflow(inflow)
                    .outflow(outflow)
                    .balance(balance)
                    .paymentMode(mode != null ? mode.trim() : "Cash")
                    .remarks(remarks)
                    .build();

            data.getTransactions().add(txn);
            valid++;

            if (preview.size() < 5) {
                preview.add(Map.of(
                        "txnId", txn.getTxnId() != null ? txn.getTxnId() : "-",
                        "date", String.valueOf(txn.getTxnDate()),
                        "type", txn.getVoucherType(),
                        "party", txn.getPartyName(),
                        "inflow", txn.getInflow(),
                        "outflow", txn.getOutflow()
                ));
            }
        }

        summary.setTotalRows(sheet.getLastRowNum() + 1);
        summary.setValidRecords(valid);
        summary.setSkippedSummaryRows(skipped);
        summary.setPreviewRows(preview);
        data.getSheetSummaries().put(sheet.getSheetName(), summary);
    }

    private void validateReconciliation(ParsedWorkbookData data) {
        BigDecimal totalSalesInvoices = data.getInvoices().stream()
                .map(ParsedInvoice::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalLineItems = data.getLineItems().stream()
                .map(ParsedLineItem::getLineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal diff = totalSalesInvoices.subtract(totalLineItems).abs();
        if (diff.compareTo(new BigDecimal("1.00")) > 0) {
            data.getWarnings().add(ExcelRowValidation.builder()
                    .sheetName("Reconciliation")
                    .rowNumber(0)
                    .field("Total Amount")
                    .message(String.format("Sales invoices sum (₹%s) differs from line items sum (₹%s) by ₹%s. Both records preserved.",
                            totalSalesInvoices.toPlainString(), totalLineItems.toPlainString(), diff.toPlainString()))
                    .severity("WARNING")
                    .build());
        }
    }

    public ExcelImportPreviewResponse createPreviewResponse(ParsedWorkbookData data) {
        BigDecimal totalSales = data.getInvoices().stream()
                .map(ParsedInvoice::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalReceipts = data.getPayments().stream()
                .filter(p -> p.getVoucherType().toLowerCase().contains("in") || p.getVoucherType().toLowerCase().contains("receipt"))
                .map(ParsedPayment::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return ExcelImportPreviewResponse.builder()
                .fileName(data.getFileName())
                .fileSize(data.getFileSize())
                .detectedSheets(new ArrayList<>(data.getSheetSummaries().keySet()))
                .sheetSummaries(data.getSheetSummaries())
                .kpiSummary(data.getExecutiveKpis())
                .validationErrors(data.getErrors())
                .warnings(data.getWarnings())
                .canProceed(data.getErrors().isEmpty())
                .expectedSalesTotal(totalSales.setScale(2, RoundingMode.HALF_UP))
                .expectedReceiptsTotal(totalReceipts.setScale(2, RoundingMode.HALF_UP))
                .expectedInvoiceCount(data.getInvoices().size())
                .expectedPartyCount(data.getParties().size())
                .expectedProductCount(data.getItems().size())
                .build();
    }

    private int findHeaderRow(Sheet sheet, String keyword) {
        for (int r = 0; r < Math.min(10, sheet.getLastRowNum() + 1); r++) {
            Row row = sheet.getRow(r);
            if (row == null) continue;
            for (int c = 0; c < row.getLastCellNum(); c++) {
                String val = getCellString(row.getCell(c));
                if (val != null && val.toLowerCase().contains(keyword.toLowerCase())) {
                    return r;
                }
            }
        }
        return 3; // Default 4th row (0-indexed 3)
    }

    private List<String> getRowHeaders(Row row) {
        List<String> list = new ArrayList<>();
        if (row == null) return list;
        for (int c = 0; c < row.getLastCellNum(); c++) {
            String val = getCellString(row.getCell(c));
            list.add(val != null ? val.trim() : "Col" + (c + 1));
        }
        return list;
    }

    private boolean isTotalOrSummaryRow(String... values) {
        for (String v : values) {
            if (v != null) {
                String clean = v.trim().toLowerCase();
                if (clean.equals("total") || clean.startsWith("total ") || clean.equals("subtotal")) {
                    return true;
                }
            }
        }
        return false;
    }

    private String cleanValue(String val) {
        if (val == null) return null;
        String t = val.trim();
        if (t.equals("-") || t.equalsIgnoreCase("n/a") || t.isEmpty()) return null;
        return t;
    }

    private String getCellString(Cell cell) {
        if (cell == null) return null;
        try {
            switch (cell.getCellType()) {
                case STRING:
                    return cell.getStringCellValue();
                case NUMERIC:
                    if (DateUtil.isCellDateFormatted(cell)) {
                        return cell.getLocalDateTimeCellValue().toLocalDate().toString();
                    }
                    double d = cell.getNumericCellValue();
                    if (d == (long) d) {
                        return String.valueOf((long) d);
                    }
                    return String.valueOf(d);
                case BOOLEAN:
                    return String.valueOf(cell.getBooleanCellValue());
                case FORMULA:
                    try {
                        return cell.getStringCellValue();
                    } catch (Exception e) {
                        return String.valueOf(cell.getNumericCellValue());
                    }
                default:
                    return null;
            }
        } catch (Exception e) {
            return null;
        }
    }

    private BigDecimal getCellDecimal(Cell cell) {
        if (cell == null) return BigDecimal.ZERO;
        try {
            switch (cell.getCellType()) {
                case NUMERIC:
                    return BigDecimal.valueOf(cell.getNumericCellValue()).setScale(2, RoundingMode.HALF_UP);
                case STRING:
                    String s = cell.getStringCellValue().replaceAll("[^0-9.-]", "");
                    if (s.isBlank()) return BigDecimal.ZERO;
                    return new BigDecimal(s).setScale(2, RoundingMode.HALF_UP);
                case FORMULA:
                    try {
                        return BigDecimal.valueOf(cell.getNumericCellValue()).setScale(2, RoundingMode.HALF_UP);
                    } catch (Exception e) {
                        return BigDecimal.ZERO;
                    }
                default:
                    return BigDecimal.ZERO;
            }
        } catch (Exception e) {
            return BigDecimal.ZERO;
        }
    }

    private LocalDate getCellDate(Cell cell) {
        if (cell == null) return null;
        try {
            if (cell.getCellType() == CellType.NUMERIC && DateUtil.isCellDateFormatted(cell)) {
                return cell.getDateCellValue().toInstant().atZone(ZoneId.systemDefault()).toLocalDate();
            }
            String s = getCellString(cell);
            if (s != null && !s.isBlank()) {
                s = s.trim();
                if (s.contains("T")) s = s.substring(0, s.indexOf('T'));
                return LocalDate.parse(s, ISO_DATE);
            }
        } catch (Exception ignored) {}
        return null;
    }
}
