package com.kta.erp.repository;

import com.kta.erp.entity.InvoiceLineItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InvoiceLineItemRepository extends JpaRepository<InvoiceLineItem, Long> {

    List<InvoiceLineItem> findByInvoiceNumber(String invoiceNumber);

    List<InvoiceLineItem> findByInvoiceId(Long invoiceId);

    long count();
}
