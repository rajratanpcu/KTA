package com.kta.erp.dto.excel;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExcelSheetSummary {
    private String sheetName;
    private int detectedHeaderRow;
    private int totalRows;
    private int validRecords;
    private int skippedSummaryRows;
    private List<String> headers;
    private List<Map<String, Object>> previewRows;
}
