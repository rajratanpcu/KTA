package com.kta.erp.dto.transport;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class PaymentAllocationResponse {

    private Long id;
    private Long paymentId;
    private Long billId;
    private String billNumber;
    private BigDecimal allocatedAmount;
    private LocalDateTime allocationDate;
}
