package com.kta.erp.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class StockBalanceResponse {

    private Long id;
    private Long productId;
    private String productName;
    private String productSku;
    private Long godownId;
    private String godownName;
    private String godownCode;
    private BigDecimal availableQuantity;
    private BigDecimal reservedQuantity;
    private BigDecimal inTransitQuantity;
    private BigDecimal totalQuantity;
    private BigDecimal reorderLevel;
    private boolean lowStock;
    private String unit;
    private LocalDateTime lastCountedAt;
    private LocalDateTime updatedAt;
}
