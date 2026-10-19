package com.kta.erp.dto.transport;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class TransportBillItemResponse {

    private Long id;
    private Long billId;
    private String itemName;
    private String productCode;
    private Long productId;
    private String productName;
    private BigDecimal quantity;
    private String unit;
    private Integer packageCount;
    private BigDecimal weight;
    private BigDecimal rate;
    private BigDecimal amount;
    private Boolean needsReview;
    private LocalDateTime createdAt;
}
