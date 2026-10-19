package com.kta.erp.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class StockTransferItemResponse {

    private Long id;
    private Long productId;
    private String productName;
    private String productSku;
    private BigDecimal quantity;
    private BigDecimal receivedQuantity;
    private String unit;
    private String notes;
}
