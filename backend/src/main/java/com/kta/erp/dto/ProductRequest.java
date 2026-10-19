package com.kta.erp.dto;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class ProductRequest {

    @NotBlank(message = "SKU is required")
    @Size(max = 50, message = "SKU must not exceed 50 characters")
    private String sku;

    @Size(max = 50, message = "Barcode must not exceed 50 characters")
    private String barcode;

    @NotBlank(message = "Product name is required")
    @Size(max = 255, message = "Product name must not exceed 255 characters")
    private String name;

    private String description;

    private Long categoryId;

    private Long unitId;

    @NotNull(message = "Purchase price is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Purchase price must be non-negative")
    @Digits(integer = 13, fraction = 2, message = "Invalid purchase price format")
    private BigDecimal purchasePrice;

    @NotNull(message = "Selling price is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Selling price must be non-negative")
    @Digits(integer = 13, fraction = 2, message = "Invalid selling price format")
    private BigDecimal sellingPrice;

    @NotNull(message = "GST rate is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "GST rate must be non-negative")
    @DecimalMax(value = "100.0", inclusive = true, message = "GST rate must not exceed 100")
    @Digits(integer = 3, fraction = 2, message = "Invalid GST rate format")
    private BigDecimal gstRate;

    @Min(value = 0, message = "Minimum stock level must be non-negative")
    private Integer minStockLevel;

    private Boolean active = true;
}
