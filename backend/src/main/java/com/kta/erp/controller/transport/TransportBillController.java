package com.kta.erp.controller.transport;

import com.kta.erp.dto.transport.TransportBillRequest;
import com.kta.erp.dto.transport.TransportBillResponse;
import com.kta.erp.service.transport.TransportBillService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/transport/bills")
@RequiredArgsConstructor
public class TransportBillController {

    private final TransportBillService billService;

    @GetMapping
    public ResponseEntity<List<TransportBillResponse>> getAllBills() {
        return ResponseEntity.ok(billService.getAllBills());
    }

    @GetMapping("/transporter/{transporterId}")
    public ResponseEntity<List<TransportBillResponse>> getBillsByTransporter(@PathVariable Long transporterId) {
        return ResponseEntity.ok(billService.getBillsByTransporter(transporterId));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<TransportBillResponse>> getBillsByStatus(@PathVariable String status) {
        return ResponseEntity.ok(billService.getBillsByStatus(status));
    }

    @GetMapping("/needs-review")
    public ResponseEntity<List<TransportBillResponse>> getBillsNeedingReview() {
        return ResponseEntity.ok(billService.getBillsNeedingReview());
    }

    @GetMapping("/overdue")
    public ResponseEntity<List<TransportBillResponse>> getOverdueBills() {
        return ResponseEntity.ok(billService.getOverdueBills());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TransportBillResponse> getBillById(@PathVariable Long id) {
        return ResponseEntity.ok(billService.getBillById(id));
    }

    @GetMapping("/outstanding/{transporterId}")
    public ResponseEntity<BigDecimal> getOutstandingBalance(@PathVariable Long transporterId) {
        return ResponseEntity.ok(billService.getOutstandingBalance(transporterId));
    }

    @PostMapping
    public ResponseEntity<TransportBillResponse> createBill(
            @Valid @RequestBody TransportBillRequest request,
            @RequestHeader("X-User-Id") Long userId) {
        TransportBillResponse created = billService.createBill(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TransportBillResponse> updateBill(
            @PathVariable Long id,
            @Valid @RequestBody TransportBillRequest request,
            @RequestHeader("X-User-Id") Long userId) {
        return ResponseEntity.ok(billService.updateBill(id, request, userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBill(@PathVariable Long id) {
        billService.deleteBill(id);
        return ResponseEntity.noContent().build();
    }
}
