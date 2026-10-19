package com.kta.erp.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class StockTransferResponse {

    private Long id;
    private String transferNumber;
    private Long fromGodownId;
    private String fromGodownName;
    private Long toGodownId;
    private String toGodownName;
    private String status;
    private LocalDate transferDate;
    private LocalDate expectedDelivery;
    private LocalDate receivedDate;
    private String notes;
    private List<StockTransferItemResponse> items;
    private Long createdById;
    private String createdByName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
