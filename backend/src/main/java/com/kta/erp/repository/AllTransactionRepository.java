package com.kta.erp.repository;

import com.kta.erp.entity.AllTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AllTransactionRepository extends JpaRepository<AllTransaction, Long> {

    List<AllTransaction> findAllByOrderByTxnDateDesc();

    long count();
}
