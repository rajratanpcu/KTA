package com.kta.erp.repository;

import com.kta.erp.entity.SalesInvoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface SalesInvoiceRepository extends JpaRepository<SalesInvoice, Long> {

    Optional<SalesInvoice> findByInvoiceNumber(String invoiceNumber);

    boolean existsByInvoiceNumber(String invoiceNumber);

    List<SalesInvoice> findAllByOrderByInvoiceDateDesc();

    @Query("SELECT COALESCE(SUM(s.totalAmount), 0) FROM SalesInvoice s")
    BigDecimal sumTotalSales();

    @Query("SELECT COALESCE(SUM(s.paidAmount), 0) FROM SalesInvoice s")
    BigDecimal sumPaidAmount();

    @Query("SELECT COALESCE(SUM(s.balanceDue), 0) FROM SalesInvoice s")
    BigDecimal sumBalanceDue();

    long count();
}
