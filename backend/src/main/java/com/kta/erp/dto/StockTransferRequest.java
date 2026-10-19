package com.kta.erp.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Data
public class StockTransferRequest {

    @NotNull(message = "Source godown ID is required")
    private Long fromGodownId;

    @NotNull(message = "Destination godown ID is required")
    private Long toGodownId;

    private LocalDate transferDate;
    private LocalDate expectedDelivery;
    private String notes;

    @Valid
    @NotEmpty(message = "At least one item is required")
    private List<StockTransferItemRequest> items = new ArrayList<>();
}

