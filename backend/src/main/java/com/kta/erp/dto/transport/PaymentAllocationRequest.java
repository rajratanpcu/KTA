package com.kta.erp.dto.transport;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class PaymentAllocationRequest {

    @NotNull(message = "Bill ID is required")
    private Long billId;

    @NotNull(message = "Allocated amount is required")
    @DecimalMin(value = "0.01", inclusive = true, message = "Allocated amount must be greater than 0")
    @Digits(integer = 13, fraction = 2, message = "Invalid allocated amount format")
    private BigDecimal allocatedAmount;
}
