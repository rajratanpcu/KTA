package com.kta.erp.dto.transport;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class TransportBillItemRequest {

    @NotBlank(message = "Item name is required")
    @Size(max = 255, message = "Item name must not exceed 255 characters")
    private String itemName;

    @Size(max = 50, message = "Product code must not exceed 50 characters")
    private String productCode;

    private Long productId;

    @NotNull(message = "Quantity is required")
    @DecimalMin(value = "0.001", inclusive = true, message = "Quantity must be greater than 0")
    @Digits(integer = 12, fraction = 3, message = "Invalid quantity format")
    private BigDecimal quantity;

    @NotBlank(message = "Unit is required")
    @Size(max = 20, message = "Unit must not exceed 20 characters")
    private String unit;

    @Min(value = 0, message = "Package count must be non-negative")
    private Integer packageCount;

    @DecimalMin(value = "0.0", inclusive = true, message = "Weight must be non-negative")
    @Digits(integer = 12, fraction = 3, message = "Invalid weight format")
    private BigDecimal weight;

    @DecimalMin(value = "0.0", inclusive = true, message = "Rate must be non-negative")
    @Digits(integer = 13, fraction = 2, message = "Invalid rate format")
    private BigDecimal rate;

    @DecimalMin(value = "0.0", inclusive = true, message = "Amount must be non-negative")
    @Digits(integer = 13, fraction = 2, message = "Invalid amount format")
    private BigDecimal amount;

    private Boolean needsReview = false;
}
