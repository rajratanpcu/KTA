package com.kta.erp.service.excel;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

public class VyaparExcelParserServiceTest {

    private final VyaparExcelParserService parserService = new VyaparExcelParserService();

    @Test
    @DisplayName("Should detect 7 sheets and parse Kushwaha Tent Agency workbook accurately")
    void testParseVyaparWorkbook() throws Exception {
        File excelFile = new File("../data/Kushwaha_Tent_Agency_Vyapar_Data.xlsx");
        if (!excelFile.exists()) {
            excelFile = new File("data/Kushwaha_Tent_Agency_Vyapar_Data.xlsx");
        }

        if (!excelFile.exists()) {
            System.out.println("Workbook file path not found relative to test runner, skipping integration check.");
            return;
        }

        try (InputStream is = new FileInputStream(excelFile)) {
            VyaparExcelParserService.ParsedWorkbookData data = parserService.parseWorkbook(is, excelFile.getName(), excelFile.length());

            assertNotNull(data);
            assertEquals(178, data.getInvoices().size(), "Should parse exactly 178 sales invoices");
            assertEquals(620, data.getLineItems().size(), "Should parse exactly 620 invoice line items");
            assertEquals(211, data.getPayments().size(), "Should parse exactly 211 payment/receipt vouchers");
            assertEquals(37, data.getParties().size(), "Should parse exactly 37 parties ledger accounts");
            assertEquals(107, data.getItems().size(), "Should parse exactly 107 products");
            assertEquals(391, data.getTransactions().size(), "Should parse exactly 391 register transactions");

            // Verify totals
            BigDecimal totalSales = data.getInvoices().stream()
                    .map(VyaparExcelParserService.ParsedInvoice::getTotalAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            assertTrue(totalSales.compareTo(new BigDecimal("15000000")) > 0, "Total sales should exceed 1.5 Crore");
        }
    }
}
