package com.kta.erp.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class ProductResponse {

    private Long id;
    private String sku;
    private String barcode;
    private String name;
    private String description;
    private Long categoryId;
    private String categoryName;
    private Long unitId;
    private String unitName;
    private String unitAbbreviation;
    private BigDecimal purchasePrice;
    private BigDecimal sellingPrice;
    private BigDecimal gstRate;
    private Integer minStockLevel;
    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
