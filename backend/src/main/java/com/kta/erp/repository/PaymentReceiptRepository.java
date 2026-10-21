package com.kta.erp.repository;

import com.kta.erp.entity.PaymentReceipt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface PaymentReceiptRepository extends JpaRepository<PaymentReceipt, Long> {

    List<PaymentReceipt> findAllByOrderByVoucherDateDesc();

    List<PaymentReceipt> findByPartyName(String partyName);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM PaymentReceipt p WHERE p.voucherType LIKE '%In%' OR p.voucherType LIKE '%Receipt%'")
    BigDecimal sumTotalReceipts();

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM PaymentReceipt p WHERE p.voucherType LIKE '%Out%'")
    BigDecimal sumTotalPaymentsOut();

    long count();
}
