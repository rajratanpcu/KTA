package com.kta.erp.entity.transport;

import com.kta.erp.entity.User;
import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Entity
@Table(name = "transport_bills")
public class TransportBill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "bill_number", unique = true, nullable = false, length = 50)
    private String billNumber;

    @Column(name = "bill_date", nullable = false)
    private LocalDate billDate;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "transporter_id", nullable = false)
    private Transporter transporter;

    @Column(name = "consignment_number", length = 50)
    private String consignmentNumber;

    @Column(name = "lr_number", length = 50)
    private String lrNumber;

    @Column(name = "invoice_reference", length = 50)
    private String invoiceReference;

    @Column(name = "vehicle_number", length = 20)
    private String vehicleNumber;

    @Column(name = "supplier_name")
    private String supplierName;

    @Column(length = 255)
    private String destination;

    @Column(name = "purchase_reference", length = 50)
    private String purchaseReference;

    @Column(name = "payment_terms", length = 100)
    private String paymentTerms;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    // Financial details
    @Column(name = "freight_charges", nullable = false, precision = 15, scale = 2)
    private BigDecimal freightCharges = BigDecimal.ZERO;

    @Column(name = "loading_charges", nullable = false, precision = 15, scale = 2)
    private BigDecimal loadingCharges = BigDecimal.ZERO;

    @Column(name = "unloading_charges", nullable = false, precision = 15, scale = 2)
    private BigDecimal unloadingCharges = BigDecimal.ZERO;

    @Column(name = "other_charges", nullable = false, precision = 15, scale = 2)
    private BigDecimal otherCharges = BigDecimal.ZERO;

    @Column(name = "taxable_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal taxableAmount;

    @Column(name = "gst_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal gstAmount = BigDecimal.ZERO;

    @Column(name = "gst_rate", precision = 5, scale = 2)
    private BigDecimal gstRate;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal discount = BigDecimal.ZERO;

    @Column(name = "round_off", nullable = false, precision = 15, scale = 2)
    private BigDecimal roundOff = BigDecimal.ZERO;

    @Column(name = "total_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "amount_paid", nullable = false, precision = 15, scale = 2)
    private BigDecimal amountPaid = BigDecimal.ZERO;

    @Column(name = "balance_due", nullable = false, precision = 15, scale = 2)
    private BigDecimal balanceDue;

    @Column(nullable = false, length = 3)
    private String currency = "INR";

    // Status and metadata
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private BillStatus status = BillStatus.PENDING;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "scanned_document_id")
    private ScannedDocument scannedDocument;

    @Column(name = "extraction_confidence", precision = 3, scale = 2)
    private BigDecimal extractionConfidence;

    @Column(name = "needs_review", nullable = false)
    private Boolean needsReview = false;

    // Items
    @OneToMany(mappedBy = "bill", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TransportBillItem> items = new ArrayList<>();

    // Audit
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum BillStatus {
        DRAFT, PENDING, PARTIALLY_PAID, PAID, OVERDUE
    }
}
