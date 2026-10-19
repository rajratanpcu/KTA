package com.kta.erp.repository.transport;

import com.kta.erp.entity.transport.TransportPaymentAllocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface TransportPaymentAllocationRepository extends JpaRepository<TransportPaymentAllocation, Long> {

    List<TransportPaymentAllocation> findByPaymentId(Long paymentId);

    List<TransportPaymentAllocation> findByBillId(Long billId);

    @Query("SELECT COALESCE(SUM(a.allocatedAmount), 0) FROM TransportPaymentAllocation a WHERE a.bill.id = :billId")
    BigDecimal getTotalAllocatedToBill(@Param("billId") Long billId);

    @Query("SELECT COALESCE(SUM(a.allocatedAmount), 0) FROM TransportPaymentAllocation a WHERE a.payment.id = :paymentId")
    BigDecimal getTotalAllocatedFromPayment(@Param("paymentId") Long paymentId);
}
