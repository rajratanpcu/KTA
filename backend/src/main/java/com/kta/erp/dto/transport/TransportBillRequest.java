package com.kta.erp.dto.transport;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Data
public class TransportBillRequest {

    @NotBlank(message = "Bill number is required")
    @Size(max = 50, message = "Bill number must not exceed 50 characters")
    private String billNumber;

    @NotNull(message = "Bill date is required")
    private LocalDate billDate;

    private LocalDate dueDate;

    @NotNull(message = "Transporter ID is required")
    private Long transporterId;

    @Size(max = 50, message = "Consignment number must not exceed 50 characters")
    private String consignmentNumber;

    @Size(max = 50, message = "LR number must not exceed 50 characters")
    private String lrNumber;

    @Size(max = 50, message = "Invoice reference must not exceed 50 characters")
    private String invoiceReference;

    @Size(max = 20, message = "Vehicle number must not exceed 20 characters")
    private String vehicleNumber;

    @Size(max = 255, message = "Supplier name must not exceed 255 characters")
    private String supplierName;

    @Size(max = 255, message = "Destination must not exceed 255 characters")
    private String destination;

    @Size(max = 50, message = "Purchase reference must not exceed 50 characters")
    private String purchaseReference;

    @Size(max = 100, message = "Payment terms must not exceed 100 characters")
    private String paymentTerms;

    private String description;
    private String remarks;

    // Financial details
    @NotNull(message = "Freight charges is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Freight charges must be non-negative")
    @Digits(integer = 13, fraction = 2, message = "Invalid freight charges format")
    private BigDecimal freightCharges;

    @DecimalMin(value = "0.0", inclusive = true, message = "Loading charges must be non-negative")
    @Digits(integer = 13, fraction = 2, message = "Invalid loading charges format")
    private BigDecimal loadingCharges = BigDecimal.ZERO;

    @DecimalMin(value = "0.0", inclusive = true, message = "Unloading charges must be non-negative")
    @Digits(integer = 13, fraction = 2, message = "Invalid unloading charges format")
    private BigDecimal unloadingCharges = BigDecimal.ZERO;

    @DecimalMin(value = "0.0", inclusive = true, message = "Other charges must be non-negative")
    @Digits(integer = 13, fraction = 2, message = "Invalid other charges format")
    private BigDecimal otherCharges = BigDecimal.ZERO;

    @DecimalMin(value = "0.0", inclusive = true, message = "GST amount must be non-negative")
    @Digits(integer = 13, fraction = 2, message = "Invalid GST amount format")
    private BigDecimal gstAmount = BigDecimal.ZERO;

    @DecimalMin(value = "0.0", inclusive = true, message = "GST rate must be non-negative")
    @DecimalMax(value = "100.0", inclusive = true, message = "GST rate must not exceed 100")
    @Digits(integer = 3, fraction = 2, message = "Invalid GST rate format")
    private BigDecimal gstRate;

    @DecimalMin(value = "0.0", inclusive = true, message = "Discount must be non-negative")
    @Digits(integer = 13, fraction = 2, message = "Invalid discount format")
    private BigDecimal discount = BigDecimal.ZERO;

    @Digits(integer = 13, fraction = 2, message = "Invalid round off format")
    private BigDecimal roundOff = BigDecimal.ZERO;

    private String status = "DRAFT";

    private Long scannedDocumentId;

    @DecimalMin(value = "0.0", inclusive = true, message = "Extraction confidence must be between 0 and 1")
    @DecimalMax(value = "1.0", inclusive = true, message = "Extraction confidence must be between 0 and 1")
    @Digits(integer = 1, fraction = 2, message = "Invalid extraction confidence format")
    private BigDecimal extractionConfidence;

    private Boolean needsReview = false;

    @Valid
    private List<TransportBillItemRequest> items = new ArrayList<>();
}
