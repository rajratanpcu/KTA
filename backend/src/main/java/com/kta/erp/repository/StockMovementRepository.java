package com.kta.erp.repository;

import com.kta.erp.entity.StockMovement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface StockMovementRepository extends JpaRepository<StockMovement, Long> {

    List<StockMovement> findByProductId(Long productId);

    List<StockMovement> findByGodownId(Long godownId);

    List<StockMovement> findByMovementType(StockMovement.MovementType type);

    @Query("SELECT sm FROM StockMovement sm WHERE sm.movementDate BETWEEN :start AND :end ORDER BY sm.movementDate DESC")
    List<StockMovement> findByDateRange(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT sm FROM StockMovement sm WHERE sm.product.id = :productId AND sm.godown.id = :godownId ORDER BY sm.movementDate DESC")
    List<StockMovement> findByProductAndGodown(@Param("productId") Long productId, @Param("godownId") Long godownId);

    @Query("SELECT sm FROM StockMovement sm ORDER BY sm.movementDate DESC")
    List<StockMovement> findRecentMovements();

    boolean existsByMovementNumber(String movementNumber);
}
