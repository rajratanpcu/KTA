package com.kta.erp.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class StockMovementRequest {

    @NotBlank(message = "Movement type is required")
    private String movementType;

    @NotNull(message = "Product ID is required")
    private Long productId;

    @NotNull(message = "Godown ID is required")
    private Long godownId;

    @NotNull(message = "Quantity is required")
    @DecimalMin(value = "0.001", inclusive = true, message = "Quantity must be greater than 0")
    @Digits(integer = 12, fraction = 3, message = "Invalid quantity format")
    private BigDecimal quantity;

    @NotBlank(message = "Unit is required")
    @Size(max = 20, message = "Unit must not exceed 20 characters")
    private String unit;

    private String referenceType;
    private Long referenceId;
    private String referenceNumber;
    private String batchNumber;
    private String notes;
}
