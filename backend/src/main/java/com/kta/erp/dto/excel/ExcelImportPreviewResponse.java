package com.kta.erp.dto.excel;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExcelImportPreviewResponse {
    private String fileName;
    private long fileSize;
    private List<String> detectedSheets;
    private Map<String, ExcelSheetSummary> sheetSummaries;
    private Map<String, Object> kpiSummary;
    @Builder.Default
    private List<ExcelRowValidation> validationErrors = new ArrayList<>();
    @Builder.Default
    private List<ExcelRowValidation> warnings = new ArrayList<>();
    private boolean canProceed;
    private BigDecimal expectedSalesTotal;
    private BigDecimal expectedReceiptsTotal;
    private int expectedInvoiceCount;
    private int expectedPartyCount;
    private int expectedProductCount;
}
