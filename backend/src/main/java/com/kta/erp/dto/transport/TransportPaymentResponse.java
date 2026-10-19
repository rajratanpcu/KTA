package com.kta.erp.dto.transport;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class TransportPaymentResponse {

    private Long id;
    private String paymentNumber;
    private LocalDate paymentDate;
    private Long transporterId;
    private String transporterName;
    private BigDecimal amount;
    private String paymentMethod;
    private String transactionReference;
    private String notes;
    private List<PaymentAllocationResponse> allocations;
    private Long createdById;
    private String createdByName;
    private LocalDateTime createdAt;
}
