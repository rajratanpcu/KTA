package com.kta.erp.controller;

import com.kta.erp.entity.InvoiceLineItem;
import com.kta.erp.entity.SalesInvoice;
import com.kta.erp.repository.InvoiceLineItemRepository;
import com.kta.erp.repository.SalesInvoiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SalesInvoiceController {

    private final SalesInvoiceRepository salesInvoiceRepository;
    private final InvoiceLineItemRepository invoiceLineItemRepository;

    @GetMapping
    public ResponseEntity<List<SalesInvoice>> getAllInvoices(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "200") int size) {
        Page<SalesInvoice> p = salesInvoiceRepository.findAll(
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "invoiceDate", "id")));
        return ResponseEntity.ok(p.getContent());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SalesInvoice> getInvoiceById(@PathVariable Long id) {
        return salesInvoiceRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/number/{invoiceNumber}")
    public ResponseEntity<SalesInvoice> getByInvoiceNumber(@PathVariable String invoiceNumber) {
        return salesInvoiceRepository.findByInvoiceNumber(invoiceNumber)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/items")
    public ResponseEntity<List<InvoiceLineItem>> getInvoiceItems(@PathVariable Long id) {
        return ResponseEntity.ok(invoiceLineItemRepository.findByInvoiceId(id));
    }
}
