package com.kta.erp.dto.transport;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class TransportBillResponse {

    private Long id;
    private String billNumber;
    private LocalDate billDate;
    private LocalDate dueDate;
    private Long transporterId;
    private String transporterName;
    private String consignmentNumber;
    private String lrNumber;
    private String invoiceReference;
    private String vehicleNumber;
    private String supplierName;
    private String destination;
    private String purchaseReference;
    private String paymentTerms;
    private String description;
    private String remarks;

    // Financial details
    private BigDecimal freightCharges;
    private BigDecimal loadingCharges;
    private BigDecimal unloadingCharges;
    private BigDecimal otherCharges;
    private BigDecimal taxableAmount;
    private BigDecimal gstAmount;
    private BigDecimal gstRate;
    private BigDecimal discount;
    private BigDecimal roundOff;
    private BigDecimal totalAmount;
    private BigDecimal amountPaid;
    private BigDecimal balanceDue;
    private String currency;

    // Status and metadata
    private String status;
    private Long scannedDocumentId;
    private BigDecimal extractionConfidence;
    private Boolean needsReview;

    // Items
    private List<TransportBillItemResponse> items;

    // Audit
    private Long createdById;
    private String createdByName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
