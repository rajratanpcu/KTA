package com.kta.erp.controller;

import com.kta.erp.dto.StockBalanceResponse;
import com.kta.erp.dto.StockMovementRequest;
import com.kta.erp.dto.StockMovementResponse;
import com.kta.erp.dto.StockTransferRequest;
import com.kta.erp.dto.StockTransferResponse;
import com.kta.erp.service.StockService;
import com.kta.erp.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.security.Principal;

@RestController
@RequestMapping("/api/stock")
@RequiredArgsConstructor
public class StockController {

    private final StockService stockService;
    private final UserRepository userRepository;

    // ===== Balances =====

    @GetMapping("/balances")
    public ResponseEntity<List<StockBalanceResponse>> getAllBalances() {
        return ResponseEntity.ok(stockService.getAllBalances());
    }

    @GetMapping("/balances/godown/{godownId}")
    public ResponseEntity<List<StockBalanceResponse>> getBalancesByGodown(@PathVariable Long godownId) {
        return ResponseEntity.ok(stockService.getBalancesByGodown(godownId));
    }

    @GetMapping("/balances/product/{productId}")
    public ResponseEntity<List<StockBalanceResponse>> getBalancesByProduct(@PathVariable Long productId) {
        return ResponseEntity.ok(stockService.getBalancesByProduct(productId));
    }

    @GetMapping("/balances/low-stock")
    public ResponseEntity<List<StockBalanceResponse>> getLowStockAlerts() {
        return ResponseEntity.ok(stockService.getLowStockAlerts());
    }

    // ===== Movements =====

    @GetMapping("/movements")
    public ResponseEntity<List<StockMovementResponse>> getRecentMovements() {
        return ResponseEntity.ok(stockService.getRecentMovements());
    }

    @GetMapping("/movements/product/{productId}")
    public ResponseEntity<List<StockMovementResponse>> getMovementsByProduct(@PathVariable Long productId) {
        return ResponseEntity.ok(stockService.getMovementsByProduct(productId));
    }

    @GetMapping("/movements/godown/{godownId}")
    public ResponseEntity<List<StockMovementResponse>> getMovementsByGodown(@PathVariable Long godownId) {
        return ResponseEntity.ok(stockService.getMovementsByGodown(godownId));
    }

    @PostMapping("/movements")
    public ResponseEntity<StockMovementResponse> recordMovement(
            @Valid @RequestBody StockMovementRequest request,
            Principal principal) {
        StockMovementResponse created = stockService.recordMovement(request, getUserId(principal));
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    // ===== Transfers =====

    @GetMapping("/transfers")
    public ResponseEntity<List<StockTransferResponse>> getAllTransfers() {
        return ResponseEntity.ok(stockService.getAllTransfers());
    }

    @GetMapping("/transfers/{id}")
    public ResponseEntity<StockTransferResponse> getTransferById(@PathVariable Long id) {
        return ResponseEntity.ok(stockService.getTransferById(id));
    }

    @PostMapping("/transfers")
    public ResponseEntity<StockTransferResponse> createTransfer(
            @Valid @RequestBody StockTransferRequest request,
            Principal principal) {
        StockTransferResponse created = stockService.createTransfer(request, getUserId(principal));
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PostMapping("/transfers/{id}/receive")
    public ResponseEntity<StockTransferResponse> receiveTransfer(
            @PathVariable Long id,
            Principal principal) {
        StockTransferResponse received = stockService.receiveTransfer(id, getUserId(principal));
        return ResponseEntity.ok(received);
    }

    private Long getUserId(Principal principal) {
        return userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new IllegalStateException("Authenticated user was not found"))
                .getId();
    }
}
