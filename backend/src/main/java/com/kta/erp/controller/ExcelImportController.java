package com.kta.erp.controller;

import com.kta.erp.dto.excel.ExcelImportPreviewResponse;
import com.kta.erp.dto.excel.ExcelImportResultResponse;
import com.kta.erp.service.excel.VyaparDataImportService;
import com.kta.erp.service.excel.VyaparExcelParserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.security.Principal;

@Slf4j
@RestController
@RequestMapping("/api/import/excel")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ExcelImportController {

    private final VyaparExcelParserService parserService;
    private final VyaparDataImportService importService;

    @PostMapping("/preview")
    public ResponseEntity<?> previewWorkbook(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("Uploaded file is empty.");
        }

        String filename = file.getOriginalFilename();
        if (filename == null || (!filename.endsWith(".xlsx") && !filename.endsWith(".xls"))) {
            return ResponseEntity.badRequest().body("Unsupported file format. Please upload a valid .xlsx file.");
        }

        try (InputStream is = file.getInputStream()) {
            VyaparExcelParserService.ParsedWorkbookData parsedData = parserService.parseWorkbook(is, filename, file.getSize());
            ExcelImportPreviewResponse preview = parserService.createPreviewResponse(parsedData);
            return ResponseEntity.ok(preview);
        } catch (Exception ex) {
            log.error("Failed to parse Excel workbook preview: {}", ex.getMessage(), ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to parse Excel workbook: " + ex.getMessage());
        }
    }

    @PostMapping("/execute")
    public ResponseEntity<?> executeImport(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "mode", defaultValue = "IMPORT_NEW") String mode,
            Principal principal) {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("Uploaded file is empty.");
        }

        String user = principal != null ? principal.getName() : "ADMIN";

        try (InputStream is = file.getInputStream()) {
            VyaparExcelParserService.ParsedWorkbookData parsedData = parserService.parseWorkbook(is, file.getOriginalFilename(), file.getSize());
            ExcelImportResultResponse result = importService.executeImport(parsedData, mode, user);
            return ResponseEntity.ok(result);
        } catch (Exception ex) {
            log.error("Failed to execute Excel import: {}", ex.getMessage(), ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Import transaction failed and was rolled back: " + ex.getMessage());
        }
    }
}
