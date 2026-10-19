package com.kta.erp.repository.transport;

import com.kta.erp.entity.transport.TransportPayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TransportPaymentRepository extends JpaRepository<TransportPayment, Long> {

    Optional<TransportPayment> findByPaymentNumber(String paymentNumber);

    List<TransportPayment> findByTransporterId(Long transporterId);

    @Query("SELECT p FROM TransportPayment p WHERE p.paymentDate BETWEEN :startDate AND :endDate")
    List<TransportPayment> findByDateRange(@Param("startDate") LocalDate startDate,
                                            @Param("endDate") LocalDate endDate);

    @Query("SELECT COALESCE(SUM(p.amount), 0) FROM TransportPayment p WHERE p.transporter.id = :transporterId")
    BigDecimal getTotalPaidByTransporter(@Param("transporterId") Long transporterId);

    boolean existsByPaymentNumber(String paymentNumber);
}
