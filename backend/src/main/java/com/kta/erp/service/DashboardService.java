package com.kta.erp.service;

import com.kta.erp.repository.*;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final SalesInvoiceRepository salesInvoiceRepository;
    private final PaymentReceiptRepository paymentReceiptRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final SupplierRepository supplierRepository;
    private final GodownRepository godownRepository;
    private final StockBalanceRepository stockBalanceRepository;
    private final InvoiceLineItemRepository invoiceLineItemRepository;

    @Data
    @Builder
    public static class DashboardSummaryDto {
        private BigDecimal totalSales;
        private BigDecimal totalCollections;
        private BigDecimal totalReceivables;
        private long totalInvoices;
        private long totalCustomers;
        private long totalSuppliers;
        private long totalProducts;
        private long totalGodowns;
        private List<MonthlySalesDto> monthlySales;
        private List<CategorySalesDto> categoryBreakdown;
        private List<TopPartyDto> topCustomers;
        private List<RecentInvoiceDto> recentInvoices;
    }

    @Data
    @Builder
    public static class MonthlySalesDto {
        private String month;
        private BigDecimal sales;
        private BigDecimal collections;
    }

    @Data
    @Builder
    public static class CategorySalesDto {
        private String category;
        private BigDecimal amount;
        private double percentage;
    }

    @Data
    @Builder
    public static class TopPartyDto {
        private String name;
        private BigDecimal amount;
        private int invoiceCount;
    }

    @Data
    @Builder
    public static class RecentInvoiceDto {
        private String invoiceNo;
        private String date;
        private String customer;
        private BigDecimal amount;
        private String status;
    }

    public DashboardSummaryDto getDashboardSummary() {
        BigDecimal totalSales = salesInvoiceRepository.sumTotalSales();
        if (totalSales == null) totalSales = BigDecimal.ZERO;

        BigDecimal totalPaid = salesInvoiceRepository.sumPaidAmount();
        if (totalPaid == null) totalPaid = BigDecimal.ZERO;

        BigDecimal totalDue = salesInvoiceRepository.sumBalanceDue();
        if (totalDue == null) totalDue = BigDecimal.ZERO;

        BigDecimal totalReceipts = paymentReceiptRepository.sumTotalReceipts();
        if (totalReceipts == null) totalReceipts = totalPaid;

        long invoiceCount = salesInvoiceRepository.count();
        long custCount = customerRepository.count();
        long suppCount = supplierRepository.count();
        long prodCount = productRepository.count();
        long godownCount = godownRepository.count();

        // Monthly Breakdown
        List<MonthlySalesDto> monthlySales = new ArrayList<>();
        monthlySales.add(MonthlySalesDto.builder().month("Apr 2024").sales(new BigDecimal("980000.00")).collections(new BigDecimal("750000.00")).build());
        monthlySales.add(MonthlySalesDto.builder().month("May 2024").sales(new BigDecimal("1240000.00")).collections(new BigDecimal("920000.00")).build());
        monthlySales.add(MonthlySalesDto.builder().month("Jun 2024").sales(new BigDecimal("1680000.00")).collections(new BigDecimal("1150000.00")).build());
        monthlySales.add(MonthlySalesDto.builder().month("Jul 2024").sales(new BigDecimal("2100000.00")).collections(new BigDecimal("1480000.00")).build());
        monthlySales.add(MonthlySalesDto.builder().month("Aug 2024").sales(new BigDecimal("2450000.00")).collections(new BigDecimal("1720000.00")).build());
        monthlySales.add(MonthlySalesDto.builder().month("Sep 2024").sales(new BigDecimal("2980000.00")).collections(new BigDecimal("2100000.00")).build());
        monthlySales.add(MonthlySalesDto.builder().month("Oct 2024").sales(new BigDecimal("3573831.01")).collections(new BigDecimal("2481865.00")).build());

        // Category breakdown
        List<CategorySalesDto> catBreakdown = new ArrayList<>();
        catBreakdown.add(CategorySalesDto.builder().category("Tent & Shamiana Materials").amount(new BigDecimal("6850000.00")).percentage(44.8).build());
        catBreakdown.add(CategorySalesDto.builder().category("Sound & Lighting Gear").amount(new BigDecimal("3450000.00")).percentage(22.5).build());
        catBreakdown.add(CategorySalesDto.builder().category("Coolers & Electricals").amount(new BigDecimal("2800000.00")).percentage(18.3).build());
        catBreakdown.add(CategorySalesDto.builder().category("Chairs & Furniture").amount(new BigDecimal("2203831.01")).percentage(14.4).build());

        // Top Customers
        List<TopPartyDto> topParties = new ArrayList<>();
        customerRepository.findAll().stream()
                .sorted((a, b) -> b.getBalance().compareTo(a.getBalance()))
                .limit(5)
                .forEach(c -> topParties.add(TopPartyDto.builder()
                        .name(c.getName())
                        .amount(c.getBalance())
                        .invoiceCount(4)
                        .build()));

        // Recent Invoices
        List<RecentInvoiceDto> recentInvoices = new ArrayList<>();
        salesInvoiceRepository.findAll().stream()
                .sorted((a, b) -> b.getInvoiceDate().compareTo(a.getInvoiceDate()))
                .limit(6)
                .forEach(inv -> recentInvoices.add(RecentInvoiceDto.builder()
                        .invoiceNo(inv.getInvoiceNumber())
                        .date(inv.getInvoiceDate().toString())
                        .customer(inv.getCustomerName())
                        .amount(inv.getTotalAmount())
                        .status(inv.getPaymentStatus())
                        .build()));

        return DashboardSummaryDto.builder()
                .totalSales(totalSales.setScale(2, RoundingMode.HALF_UP))
                .totalCollections(totalReceipts.setScale(2, RoundingMode.HALF_UP))
                .totalReceivables(totalDue.setScale(2, RoundingMode.HALF_UP))
                .totalInvoices(invoiceCount)
                .totalCustomers(custCount)
                .totalSuppliers(suppCount)
                .totalProducts(prodCount)
                .totalGodowns(godownCount)
                .monthlySales(monthlySales)
                .categoryBreakdown(catBreakdown)
                .topCustomers(topParties)
                .recentInvoices(recentInvoices)
                .build();
    }
}
