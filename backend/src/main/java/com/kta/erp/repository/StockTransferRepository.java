package com.kta.erp.repository;

import com.kta.erp.entity.StockTransfer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StockTransferRepository extends JpaRepository<StockTransfer, Long> {

    Optional<StockTransfer> findByTransferNumber(String transferNumber);

    List<StockTransfer> findByStatus(StockTransfer.TransferStatus status);

    List<StockTransfer> findByFromGodownId(Long fromGodownId);

    List<StockTransfer> findByToGodownId(Long toGodownId);

    @Query("SELECT st FROM StockTransfer st WHERE st.fromGodown.id = :godownId OR st.toGodown.id = :godownId ORDER BY st.createdAt DESC")
    List<StockTransfer> findByGodown(@Param("godownId") Long godownId);

    boolean existsByTransferNumber(String transferNumber);
}
