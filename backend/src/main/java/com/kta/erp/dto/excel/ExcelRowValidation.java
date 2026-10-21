package com.kta.erp.dto.excel;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExcelRowValidation {
    private String sheetName;
    private int rowNumber;
    private String field;
    private String value;
    private String message;
    private String severity; // "ERROR", "WARNING"
}
