package com.kta.erp.repository;

import com.kta.erp.entity.StockBalance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StockBalanceRepository extends JpaRepository<StockBalance, Long> {

    Optional<StockBalance> findByProductIdAndGodownId(Long productId, Long godownId);

    List<StockBalance> findByGodownId(Long godownId);

    List<StockBalance> findByProductId(Long productId);

    @Query("SELECT sb FROM StockBalance sb WHERE sb.availableQuantity <= sb.reorderLevel AND sb.reorderLevel IS NOT NULL")
    List<StockBalance> findLowStock();

    @Query("SELECT sb FROM StockBalance sb WHERE sb.godown.id = :godownId AND sb.availableQuantity > 0")
    List<StockBalance> findAvailableStockByGodown(@Param("godownId") Long godownId);

    @Query("SELECT sb FROM StockBalance sb JOIN FETCH sb.product JOIN FETCH sb.godown WHERE sb.product.id = :productId")
    List<StockBalance> findByProductIdWithDetails(@Param("productId") Long productId);

    @Query("SELECT sb FROM StockBalance sb JOIN FETCH sb.product JOIN FETCH sb.godown WHERE sb.godown.id = :godownId")
    List<StockBalance> findByGodownIdWithDetails(@Param("godownId") Long godownId);
}
