package com.kta.erp.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class StockMovementResponse {

    private Long id;
    private String movementNumber;
    private String movementType;
    private Long productId;
    private String productName;
    private String productSku;
    private Long godownId;
    private String godownName;
    private BigDecimal quantity;
    private String unit;
    private String direction;
    private String referenceType;
    private Long referenceId;
    private String referenceNumber;
    private String batchNumber;
    private String notes;
    private LocalDateTime movementDate;
    private Long createdById;
    private String createdByName;
    private LocalDateTime createdAt;
}
