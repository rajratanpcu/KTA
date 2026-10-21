package com.kta.erp.dto.excel;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExcelImportResultResponse {
    private String status; // "SUCCESS", "FAILED"
    private String message;
    private String importMode; // "IMPORT_NEW", "REPLACE_DEMO"
    private int invoicesImported;
    private int lineItemsImported;
    private int paymentsImported;
    private int partiesImported;
    private int productsImported;
    private int transactionsImported;
    private BigDecimal totalSalesAmount;
    private BigDecimal totalReceiptsAmount;
    @Builder.Default
    private List<String> errors = new ArrayList<>();
    @Builder.Default
    private List<String> warnings = new ArrayList<>();
    @Builder.Default
    private List<String> reconciliationNotes = new ArrayList<>();
}
