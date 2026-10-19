package com.kta.erp.service.transport;

import com.kta.erp.dto.transport.*;
import com.kta.erp.entity.Product;
import com.kta.erp.entity.User;
import com.kta.erp.entity.transport.*;
import com.kta.erp.repository.ProductRepository;
import com.kta.erp.repository.UserRepository;
import com.kta.erp.repository.transport.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TransportBillService {

    private final TransportBillRepository billRepository;
    private final TransporterRepository transporterRepository;
    private final TransportBillItemRepository itemRepository;
    private final ScannedDocumentRepository documentRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final TransportPaymentAllocationRepository allocationRepository;

    public List<TransportBillResponse> getAllBills() {
        return billRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<TransportBillResponse> getBillsByTransporter(Long transporterId) {
        return billRepository.findByTransporterId(transporterId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<TransportBillResponse> getBillsByStatus(String status) {
        TransportBill.BillStatus billStatus = TransportBill.BillStatus.valueOf(status);
        return billRepository.findByStatus(billStatus).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<TransportBillResponse> getBillsNeedingReview() {
        return billRepository.findByNeedsReviewTrue().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<TransportBillResponse> getOverdueBills() {
        return billRepository.findOverdueBills(LocalDate.now()).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public TransportBillResponse getBillById(Long id) {
        TransportBill bill = billRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transport bill not found with id: " + id));
        return toResponse(bill);
    }

    public BigDecimal getOutstandingBalance(Long transporterId) {
        return billRepository.getTotalOutstandingByTransporter(transporterId);
    }

    @Transactional
    public TransportBillResponse createBill(TransportBillRequest request, Long userId) {
        if (billRepository.existsByBillNumber(request.getBillNumber())) {
            throw new RuntimeException("Bill already exists with number: " + request.getBillNumber());
        }

        TransportBill bill = new TransportBill();
        mapRequestToEntity(request, bill, userId);

        // Calculate totals
        calculateTotals(bill, request);

        TransportBill saved = billRepository.save(bill);
        return toResponse(saved);
    }

    @Transactional
    public TransportBillResponse updateBill(Long id, TransportBillRequest request, Long userId) {
        TransportBill bill = billRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transport bill not found with id: " + id));

        if (!bill.getBillNumber().equals(request.getBillNumber()) &&
            billRepository.existsByBillNumber(request.getBillNumber())) {
            throw new RuntimeException("Bill already exists with number: " + request.getBillNumber());
        }

        // Clear existing items
        bill.getItems().clear();

        mapRequestToEntity(request, bill, userId);
        calculateTotals(bill, request);

        TransportBill updated = billRepository.save(bill);
        return toResponse(updated);
    }

    @Transactional
    public void deleteBill(Long id) {
        if (!billRepository.existsById(id)) {
            throw new RuntimeException("Transport bill not found with id: " + id);
        }
        billRepository.deleteById(id);
    }

    private void mapRequestToEntity(TransportBillRequest request, TransportBill bill, Long userId) {
        bill.setBillNumber(request.getBillNumber());
        bill.setBillDate(request.getBillDate());
        bill.setDueDate(request.getDueDate());
        bill.setConsignmentNumber(request.getConsignmentNumber());
        bill.setLrNumber(request.getLrNumber());
        bill.setInvoiceReference(request.getInvoiceReference());
        bill.setVehicleNumber(request.getVehicleNumber());
        bill.setSupplierName(request.getSupplierName());
        bill.setDestination(request.getDestination());
        bill.setPurchaseReference(request.getPurchaseReference());
        bill.setPaymentTerms(request.getPaymentTerms());
        bill.setDescription(request.getDescription());
        bill.setRemarks(request.getRemarks());

        bill.setFreightCharges(request.getFreightCharges());
        bill.setLoadingCharges(request.getLoadingCharges());
        bill.setUnloadingCharges(request.getUnloadingCharges());
        bill.setOtherCharges(request.getOtherCharges());
        bill.setGstAmount(request.getGstAmount());
        bill.setGstRate(request.getGstRate());
        bill.setDiscount(request.getDiscount());
        bill.setRoundOff(request.getRoundOff());

        bill.setStatus(TransportBill.BillStatus.valueOf(request.getStatus()));
        bill.setExtractionConfidence(request.getExtractionConfidence());
        bill.setNeedsReview(request.getNeedsReview());

        Transporter transporter = transporterRepository.findById(request.getTransporterId())
                .orElseThrow(() -> new RuntimeException("Transporter not found with id: " + request.getTransporterId()));
        bill.setTransporter(transporter);

        if (request.getScannedDocumentId() != null) {
            ScannedDocument document = documentRepository.findById(request.getScannedDocumentId())
                    .orElseThrow(() -> new RuntimeException("Scanned document not found with id: " + request.getScannedDocumentId()));
            bill.setScannedDocument(document);
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        bill.setCreatedBy(user);

        // Add items
        for (TransportBillItemRequest itemReq : request.getItems()) {
            TransportBillItem item = new TransportBillItem();
            item.setBill(bill);
            item.setItemName(itemReq.getItemName());
            item.setProductCode(itemReq.getProductCode());
            item.setQuantity(itemReq.getQuantity());
            item.setUnit(itemReq.getUnit());
            item.setPackageCount(itemReq.getPackageCount());
            item.setWeight(itemReq.getWeight());
            item.setRate(itemReq.getRate());
            item.setAmount(itemReq.getAmount());
            item.setNeedsReview(itemReq.getNeedsReview());

            if (itemReq.getProductId() != null) {
                Product product = productRepository.findById(itemReq.getProductId())
                        .orElse(null);
                item.setProduct(product);
            }

            bill.getItems().add(item);
        }
    }

    private void calculateTotals(TransportBill bill, TransportBillRequest request) {
        BigDecimal taxableAmount = request.getFreightCharges()
                .add(request.getLoadingCharges())
                .add(request.getUnloadingCharges())
                .add(request.getOtherCharges());

        BigDecimal totalAmount = taxableAmount
                .add(request.getGstAmount())
                .subtract(request.getDiscount())
                .add(request.getRoundOff());

        bill.setTaxableAmount(taxableAmount);
        bill.setTotalAmount(totalAmount);

        // Calculate balance due (total - paid via allocations)
        BigDecimal paid = allocationRepository.getTotalAllocatedToBill(bill.getId());
        if (paid == null) paid = BigDecimal.ZERO;

        bill.setAmountPaid(paid);
        bill.setBalanceDue(totalAmount.subtract(paid));
    }

    private TransportBillResponse toResponse(TransportBill bill) {
        TransportBillResponse response = new TransportBillResponse();
        response.setId(bill.getId());
        response.setBillNumber(bill.getBillNumber());
        response.setBillDate(bill.getBillDate());
        response.setDueDate(bill.getDueDate());
        response.setTransporterId(bill.getTransporter().getId());
        response.setTransporterName(bill.getTransporter().getCompanyName());
        response.setConsignmentNumber(bill.getConsignmentNumber());
        response.setLrNumber(bill.getLrNumber());
        response.setInvoiceReference(bill.getInvoiceReference());
        response.setVehicleNumber(bill.getVehicleNumber());
        response.setSupplierName(bill.getSupplierName());
        response.setDestination(bill.getDestination());
        response.setPurchaseReference(bill.getPurchaseReference());
        response.setPaymentTerms(bill.getPaymentTerms());
        response.setDescription(bill.getDescription());
        response.setRemarks(bill.getRemarks());

        response.setFreightCharges(bill.getFreightCharges());
        response.setLoadingCharges(bill.getLoadingCharges());
        response.setUnloadingCharges(bill.getUnloadingCharges());
        response.setOtherCharges(bill.getOtherCharges());
        response.setTaxableAmount(bill.getTaxableAmount());
        response.setGstAmount(bill.getGstAmount());
        response.setGstRate(bill.getGstRate());
        response.setDiscount(bill.getDiscount());
        response.setRoundOff(bill.getRoundOff());
        response.setTotalAmount(bill.getTotalAmount());
        response.setAmountPaid(bill.getAmountPaid());
        response.setBalanceDue(bill.getBalanceDue());
        response.setCurrency(bill.getCurrency());

        response.setStatus(bill.getStatus().name());
        if (bill.getScannedDocument() != null) {
            response.setScannedDocumentId(bill.getScannedDocument().getId());
        }
        response.setExtractionConfidence(bill.getExtractionConfidence());
        response.setNeedsReview(bill.getNeedsReview());

        response.setItems(bill.getItems().stream()
                .map(this::toItemResponse)
                .collect(Collectors.toList()));

        response.setCreatedById(bill.getCreatedBy().getId());
        response.setCreatedByName(bill.getCreatedBy().getFullName());
        response.setCreatedAt(bill.getCreatedAt());
        response.setUpdatedAt(bill.getUpdatedAt());

        return response;
    }

    private TransportBillItemResponse toItemResponse(TransportBillItem item) {
        TransportBillItemResponse response = new TransportBillItemResponse();
        response.setId(item.getId());
        response.setBillId(item.getBill().getId());
        response.setItemName(item.getItemName());
        response.setProductCode(item.getProductCode());
        if (item.getProduct() != null) {
            response.setProductId(item.getProduct().getId());
            response.setProductName(item.getProduct().getName());
        }
        response.setQuantity(item.getQuantity());
        response.setUnit(item.getUnit());
        response.setPackageCount(item.getPackageCount());
        response.setWeight(item.getWeight());
        response.setRate(item.getRate());
        response.setAmount(item.getAmount());
        response.setNeedsReview(item.getNeedsReview());
        response.setCreatedAt(item.getCreatedAt());
        return response;
    }
}
