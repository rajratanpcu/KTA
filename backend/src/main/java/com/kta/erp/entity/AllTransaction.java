package com.kta.erp.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "all_transactions")
public class AllTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "txn_id")
    private Long txnId;

    @Column(name = "txn_date", nullable = false)
    private LocalDate txnDate;

    @Column(name = "voucher_type", nullable = false, length = 50)
    private String voucherType;

    @Column(name = "ref_inv_number", length = 100)
    private String refInvNumber;

    @Column(name = "party_name", nullable = false)
    private String partyName;

    @Column(name = "inflow_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal inflowAmount = BigDecimal.ZERO;

    @Column(name = "outflow_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal outflowAmount = BigDecimal.ZERO;

    @Column(name = "balance_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal balanceAmount = BigDecimal.ZERO;

    @Column(name = "payment_mode", length = 50)
    private String paymentMode;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
    }
}
