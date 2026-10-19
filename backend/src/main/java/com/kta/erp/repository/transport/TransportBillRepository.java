package com.kta.erp.repository.transport;

import com.kta.erp.entity.transport.TransportBill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TransportBillRepository extends JpaRepository<TransportBill, Long> {

    Optional<TransportBill> findByBillNumber(String billNumber);

    List<TransportBill> findByTransporterId(Long transporterId);

    List<TransportBill> findByStatus(TransportBill.BillStatus status);

    List<TransportBill> findByNeedsReviewTrue();

    @Query("SELECT b FROM TransportBill b WHERE b.transporter.id = :transporterId AND b.status = :status")
    List<TransportBill> findByTransporterAndStatus(@Param("transporterId") Long transporterId,
                                                     @Param("status") TransportBill.BillStatus status);

    @Query("SELECT b FROM TransportBill b WHERE b.billDate BETWEEN :startDate AND :endDate")
    List<TransportBill> findByDateRange(@Param("startDate") LocalDate startDate,
                                         @Param("endDate") LocalDate endDate);

    @Query("SELECT COALESCE(SUM(b.balanceDue), 0) FROM TransportBill b WHERE b.transporter.id = :transporterId AND b.status != 'PAID'")
    BigDecimal getTotalOutstandingByTransporter(@Param("transporterId") Long transporterId);

    @Query("SELECT b FROM TransportBill b WHERE b.dueDate < :currentDate AND b.status IN ('PENDING', 'PARTIALLY_PAID')")
    List<TransportBill> findOverdueBills(@Param("currentDate") LocalDate currentDate);

    boolean existsByBillNumber(String billNumber);
}
