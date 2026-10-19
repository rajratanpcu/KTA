package com.kta.erp.repository.transport;

import com.kta.erp.entity.transport.TransportBillItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransportBillItemRepository extends JpaRepository<TransportBillItem, Long> {

    List<TransportBillItem> findByBillId(Long billId);

    List<TransportBillItem> findByProductId(Long productId);

    List<TransportBillItem> findByNeedsReviewTrue();

    @Query("SELECT i FROM TransportBillItem i WHERE i.bill.id = :billId AND i.needsReview = true")
    List<TransportBillItem> findItemsNeedingReviewByBill(@Param("billId") Long billId);
}
