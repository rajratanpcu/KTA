package com.kta.erp.controller.transport;

import com.kta.erp.dto.transport.TransportPaymentRequest;
import com.kta.erp.dto.transport.TransportPaymentResponse;
import com.kta.erp.service.transport.TransportPaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/transport/payments")
@RequiredArgsConstructor
public class TransportPaymentController {

    private final TransportPaymentService paymentService;

    @GetMapping
    public ResponseEntity<List<TransportPaymentResponse>> getAllPayments() {
        return ResponseEntity.ok(paymentService.getAllPayments());
    }

    @GetMapping("/transporter/{transporterId}")
    public ResponseEntity<List<TransportPaymentResponse>> getPaymentsByTransporter(@PathVariable Long transporterId) {
        return ResponseEntity.ok(paymentService.getPaymentsByTransporter(transporterId));
    }

    @GetMapping("/date-range")
    public ResponseEntity<List<TransportPaymentResponse>> getPaymentsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(paymentService.getPaymentsByDateRange(startDate, endDate));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TransportPaymentResponse> getPaymentById(@PathVariable Long id) {
        return ResponseEntity.ok(paymentService.getPaymentById(id));
    }

    @GetMapping("/total-paid/{transporterId}")
    public ResponseEntity<BigDecimal> getTotalPaidByTransporter(@PathVariable Long transporterId) {
        return ResponseEntity.ok(paymentService.getTotalPaidByTransporter(transporterId));
    }

    @PostMapping
    public ResponseEntity<TransportPaymentResponse> createPayment(
            @Valid @RequestBody TransportPaymentRequest request,
            @RequestHeader("X-User-Id") Long userId) {
        TransportPaymentResponse created = paymentService.createPayment(request, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePayment(@PathVariable Long id) {
        paymentService.deletePayment(id);
        return ResponseEntity.noContent().build();
    }
}
