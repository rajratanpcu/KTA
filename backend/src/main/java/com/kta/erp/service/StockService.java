package com.kta.erp.service;

import com.kta.erp.dto.StockBalanceResponse;
import com.kta.erp.dto.StockMovementRequest;
import com.kta.erp.dto.StockMovementResponse;
import com.kta.erp.dto.StockTransferRequest;
import com.kta.erp.dto.StockTransferResponse;
import com.kta.erp.dto.StockTransferItemResponse;
import com.kta.erp.entity.Godown;
import com.kta.erp.entity.Product;
import com.kta.erp.entity.StockBalance;
import com.kta.erp.entity.StockMovement;
import com.kta.erp.entity.StockTransfer;
import com.kta.erp.entity.StockTransferItem;
import com.kta.erp.entity.User;
import com.kta.erp.repository.GodownRepository;
import com.kta.erp.repository.ProductRepository;
import com.kta.erp.repository.StockBalanceRepository;
import com.kta.erp.repository.StockMovementRepository;
import com.kta.erp.repository.StockTransferRepository;
import com.kta.erp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StockService {

    private final StockBalanceRepository stockBalanceRepository;
    private final StockMovementRepository stockMovementRepository;
    private final StockTransferRepository stockTransferRepository;
    private final ProductRepository productRepository;
    private final GodownRepository godownRepository;
    private final UserRepository userRepository;

    // ===== Stock Balances =====

    public List<StockBalanceResponse> getAllBalances() {
        return stockBalanceRepository.findAll().stream()
                .map(this::toBalanceResponse)
                .collect(Collectors.toList());
    }

    public List<StockBalanceResponse> getBalancesByGodown(Long godownId) {
        return stockBalanceRepository.findByGodownIdWithDetails(godownId).stream()
                .map(this::toBalanceResponse)
                .collect(Collectors.toList());
    }

    public List<StockBalanceResponse> getBalancesByProduct(Long productId) {
        return stockBalanceRepository.findByProductIdWithDetails(productId).stream()
                .map(this::toBalanceResponse)
                .collect(Collectors.toList());
    }

    public List<StockBalanceResponse> getLowStockAlerts() {
        return stockBalanceRepository.findLowStock().stream()
                .map(this::toBalanceResponse)
                .collect(Collectors.toList());
    }

    // ===== Stock Movements =====

    public List<StockMovementResponse> getRecentMovements() {
        return stockMovementRepository.findRecentMovements().stream()
                .map(this::toMovementResponse)
                .collect(Collectors.toList());
    }

    public List<StockMovementResponse> getMovementsByProduct(Long productId) {
        return stockMovementRepository.findByProductId(productId).stream()
                .map(this::toMovementResponse)
                .collect(Collectors.toList());
    }

    public List<StockMovementResponse> getMovementsByGodown(Long godownId) {
        return stockMovementRepository.findByGodownId(godownId).stream()
                .map(this::toMovementResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public StockMovementResponse recordMovement(StockMovementRequest request, Long userId) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + request.getProductId()));
        Godown godown = godownRepository.findById(request.getGodownId())
                .orElseThrow(() -> new RuntimeException("Godown not found with id: " + request.getGodownId()));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        StockMovement.MovementType movementType = StockMovement.MovementType.valueOf(request.getMovementType());
        StockMovement.Direction direction = determineDirection(movementType);

        // Update stock balance
        StockBalance balance = stockBalanceRepository
                .findByProductIdAndGodownId(product.getId(), godown.getId())
                .orElseGet(() -> {
                    StockBalance newBalance = new StockBalance();
                    newBalance.setProduct(product);
                    newBalance.setGodown(godown);
                    newBalance.setAvailableQuantity(BigDecimal.ZERO);
                    newBalance.setReservedQuantity(BigDecimal.ZERO);
                    newBalance.setInTransitQuantity(BigDecimal.ZERO);
                    return newBalance;
                });

        if (direction == StockMovement.Direction.OUT) {
            if (balance.getAvailableQuantity().compareTo(request.getQuantity()) < 0) {
                throw new RuntimeException("Insufficient stock in " + godown.getName() +
                        ". Available: " + balance.getAvailableQuantity() + ", Requested: " + request.getQuantity());
            }
            balance.setAvailableQuantity(balance.getAvailableQuantity().subtract(request.getQuantity()));
        } else {
            balance.setAvailableQuantity(balance.getAvailableQuantity().add(request.getQuantity()));
        }

        stockBalanceRepository.save(balance);

        // Record movement
        StockMovement movement = new StockMovement();
        movement.setMovementNumber("MOV-" + System.currentTimeMillis());
        movement.setMovementType(movementType);
        movement.setProduct(product);
        movement.setGodown(godown);
        movement.setQuantity(request.getQuantity());
        movement.setUnit(request.getUnit());
        movement.setDirection(direction);
        movement.setReferenceType(request.getReferenceType());
        movement.setReferenceId(request.getReferenceId());
        movement.setReferenceNumber(request.getReferenceNumber());
        movement.setBatchNumber(request.getBatchNumber());
        movement.setNotes(request.getNotes());
        movement.setMovementDate(LocalDateTime.now());
        movement.setCreatedBy(user);

        StockMovement saved = stockMovementRepository.save(movement);
        return toMovementResponse(saved);
    }

    // ===== Stock Transfers =====

    public List<StockTransferResponse> getAllTransfers() {
        return stockTransferRepository.findAll().stream()
                .map(this::toTransferResponse)
                .collect(Collectors.toList());
    }

    public StockTransferResponse getTransferById(Long id) {
        StockTransfer transfer = stockTransferRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Stock transfer not found with id: " + id));
        return toTransferResponse(transfer);
    }

    @Transactional
    public StockTransferResponse createTransfer(StockTransferRequest request, Long userId) {
        if (request.getFromGodownId().equals(request.getToGodownId())) {
            throw new RuntimeException("Source and destination godowns must be different");
        }

        Godown fromGodown = godownRepository.findById(request.getFromGodownId())
                .orElseThrow(() -> new RuntimeException("Source godown not found with id: " + request.getFromGodownId()));
        Godown toGodown = godownRepository.findById(request.getToGodownId())
                .orElseThrow(() -> new RuntimeException("Destination godown not found with id: " + request.getToGodownId()));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        StockTransfer transfer = new StockTransfer();
        transfer.setTransferNumber("TRF-" + System.currentTimeMillis());
        transfer.setFromGodown(fromGodown);
        transfer.setToGodown(toGodown);
        transfer.setStatus(StockTransfer.TransferStatus.PENDING);
        transfer.setTransferDate(request.getTransferDate() != null ? request.getTransferDate() : LocalDate.now());
        transfer.setExpectedDelivery(request.getExpectedDelivery());
        transfer.setNotes(request.getNotes());
        transfer.setCreatedBy(user);

        // Reserve stock in source godown and add items
        for (var itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found with id: " + itemReq.getProductId()));

            StockBalance fromBalance = stockBalanceRepository
                    .findByProductIdAndGodownId(product.getId(), fromGodown.getId())
                    .orElseThrow(() -> new RuntimeException("No stock record for " + product.getName() + " in " + fromGodown.getName()));

            if (fromBalance.getAvailableQuantity().compareTo(itemReq.getQuantity()) < 0) {
                throw new RuntimeException("Insufficient stock for " + product.getName() + " in " + fromGodown.getName());
            }

            fromBalance.setAvailableQuantity(fromBalance.getAvailableQuantity().subtract(itemReq.getQuantity()));
            fromBalance.setInTransitQuantity(fromBalance.getInTransitQuantity().add(itemReq.getQuantity()));
            stockBalanceRepository.save(fromBalance);

            StockTransferItem item = new StockTransferItem();
            item.setTransfer(transfer);
            item.setProduct(product);
            item.setQuantity(itemReq.getQuantity());
            item.setUnit(itemReq.getUnit());
            item.setNotes(itemReq.getNotes());
            transfer.getItems().add(item);
        }

        StockTransfer saved = stockTransferRepository.save(transfer);
        return toTransferResponse(saved);
    }

    @Transactional
    public StockTransferResponse receiveTransfer(Long transferId, Long userId) {
        StockTransfer transfer = stockTransferRepository.findById(transferId)
                .orElseThrow(() -> new RuntimeException("Transfer not found with id: " + transferId));

        if (transfer.getStatus() == StockTransfer.TransferStatus.RECEIVED) {
            throw new RuntimeException("Transfer has already been received");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        for (StockTransferItem item : transfer.getItems()) {
            // Deduct in-transit from source
            StockBalance fromBalance = stockBalanceRepository
                    .findByProductIdAndGodownId(item.getProduct().getId(), transfer.getFromGodown().getId())
                    .orElseThrow(() -> new RuntimeException("Source stock balance missing"));
            fromBalance.setInTransitQuantity(fromBalance.getInTransitQuantity().subtract(item.getQuantity()));
            stockBalanceRepository.save(fromBalance);

            // Add available stock to destination
            StockBalance toBalance = stockBalanceRepository
                    .findByProductIdAndGodownId(item.getProduct().getId(), transfer.getToGodown().getId())
                    .orElseGet(() -> {
                        StockBalance nb = new StockBalance();
                        nb.setProduct(item.getProduct());
                        nb.setGodown(transfer.getToGodown());
                        nb.setAvailableQuantity(BigDecimal.ZERO);
                        nb.setReservedQuantity(BigDecimal.ZERO);
                        nb.setInTransitQuantity(BigDecimal.ZERO);
                        return nb;
                    });
            toBalance.setAvailableQuantity(toBalance.getAvailableQuantity().add(item.getQuantity()));
            stockBalanceRepository.save(toBalance);

            item.setReceivedQuantity(item.getQuantity());
        }

        transfer.setStatus(StockTransfer.TransferStatus.RECEIVED);
        transfer.setReceivedDate(LocalDate.now());
        transfer.setReceivedBy(user);

        StockTransfer saved = stockTransferRepository.save(transfer);
        return toTransferResponse(saved);
    }

    private StockMovement.Direction determineDirection(StockMovement.MovementType type) {
        return switch (type) {
            case PURCHASE_IN, TRANSFER_IN, OPENING_BALANCE, RETURN_IN -> StockMovement.Direction.IN;
            case SALES_OUT, TRANSFER_OUT, DAMAGE, EXPIRED, RETURN_OUT, ADJUSTMENT -> StockMovement.Direction.OUT;
        };
    }

    private StockBalanceResponse toBalanceResponse(StockBalance balance) {
        StockBalanceResponse res = new StockBalanceResponse();
        res.setId(balance.getId());
        res.setProductId(balance.getProduct().getId());
        res.setProductName(balance.getProduct().getName());
        res.setProductSku(balance.getProduct().getSku());
        res.setGodownId(balance.getGodown().getId());
        res.setGodownName(balance.getGodown().getName());
        res.setGodownCode(balance.getGodown().getCode());
        res.setAvailableQuantity(balance.getAvailableQuantity());
        res.setReservedQuantity(balance.getReservedQuantity());
        res.setInTransitQuantity(balance.getInTransitQuantity());
        res.setTotalQuantity(balance.getTotalQuantity());
        res.setReorderLevel(balance.getReorderLevel());
        res.setLowStock(balance.getReorderLevel() != null &&
                balance.getAvailableQuantity().compareTo(balance.getReorderLevel()) <= 0);
        res.setUnit(balance.getProduct().getUnit() != null ? balance.getProduct().getUnit().getAbbreviation() : "-");
        res.setLastCountedAt(balance.getLastCountedAt());
        res.setUpdatedAt(balance.getUpdatedAt());
        return res;
    }

    private StockMovementResponse toMovementResponse(StockMovement sm) {
        StockMovementResponse res = new StockMovementResponse();
        res.setId(sm.getId());
        res.setMovementNumber(sm.getMovementNumber());
        res.setMovementType(sm.getMovementType().name());
        res.setProductId(sm.getProduct().getId());
        res.setProductName(sm.getProduct().getName());
        res.setProductSku(sm.getProduct().getSku());
        res.setGodownId(sm.getGodown().getId());
        res.setGodownName(sm.getGodown().getName());
        res.setQuantity(sm.getQuantity());
        res.setUnit(sm.getUnit());
        res.setDirection(sm.getDirection().name());
        res.setReferenceType(sm.getReferenceType());
        res.setReferenceId(sm.getReferenceId());
        res.setReferenceNumber(sm.getReferenceNumber());
        res.setBatchNumber(sm.getBatchNumber());
        res.setNotes(sm.getNotes());
        res.setMovementDate(sm.getMovementDate());
        res.setCreatedById(sm.getCreatedBy().getId());
        res.setCreatedByName(sm.getCreatedBy().getFullName());
        res.setCreatedAt(sm.getCreatedAt());
        return res;
    }

    private StockTransferResponse toTransferResponse(StockTransfer st) {
        StockTransferResponse res = new StockTransferResponse();
        res.setId(st.getId());
        res.setTransferNumber(st.getTransferNumber());
        res.setFromGodownId(st.getFromGodown().getId());
        res.setFromGodownName(st.getFromGodown().getName());
        res.setToGodownId(st.getToGodown().getId());
        res.setToGodownName(st.getToGodown().getName());
        res.setStatus(st.getStatus().name());
        res.setTransferDate(st.getTransferDate());
        res.setExpectedDelivery(st.getExpectedDelivery());
        res.setReceivedDate(st.getReceivedDate());
        res.setNotes(st.getNotes());
        res.setCreatedById(st.getCreatedBy().getId());
        res.setCreatedByName(st.getCreatedBy().getFullName());
        res.setCreatedAt(st.getCreatedAt());
        res.setUpdatedAt(st.getUpdatedAt());

        res.setItems(st.getItems().stream().map(item -> {
            StockTransferItemResponse itemRes = new StockTransferItemResponse();
            itemRes.setId(item.getId());
            itemRes.setProductId(item.getProduct().getId());
            itemRes.setProductName(item.getProduct().getName());
            itemRes.setProductSku(item.getProduct().getSku());
            itemRes.setQuantity(item.getQuantity());
            itemRes.setReceivedQuantity(item.getReceivedQuantity());
            itemRes.setUnit(item.getUnit());
            itemRes.setNotes(item.getNotes());
            return itemRes;
        }).collect(Collectors.toList()));

        return res;
    }
}
