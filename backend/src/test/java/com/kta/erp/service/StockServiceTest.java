package com.kta.erp.service;

import com.kta.erp.dto.StockMovementRequest;
import com.kta.erp.dto.StockMovementResponse;
import com.kta.erp.entity.Godown;
import com.kta.erp.entity.Product;
import com.kta.erp.entity.StockBalance;
import com.kta.erp.entity.StockMovement;
import com.kta.erp.entity.User;
import com.kta.erp.repository.GodownRepository;
import com.kta.erp.repository.ProductRepository;
import com.kta.erp.repository.StockBalanceRepository;
import com.kta.erp.repository.StockMovementRepository;
import com.kta.erp.repository.StockTransferRepository;
import com.kta.erp.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StockServiceTest {

    @Mock
    private StockBalanceRepository balanceRepository;

    @Mock
    private StockMovementRepository movementRepository;

    @Mock
    private StockTransferRepository transferRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private GodownRepository godownRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private StockService stockService;

    private Product testProduct;
    private Godown testGodown;
    private User testUser;
    private StockBalance testBalance;

    @BeforeEach
    void setUp() {
        testProduct = new Product();
        testProduct.setId(10L);
        testProduct.setName("Basmati Rice 25kg");
        testProduct.setSku("RICE-BAS-25");

        testGodown = new Godown();
        testGodown.setId(20L);
        testGodown.setName("Central Godown A");
        testGodown.setCode("GDN-A");

        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("admin");
        testUser.setFullName("Admin User");

        testBalance = new StockBalance();
        testBalance.setId(100L);
        testBalance.setProduct(testProduct);
        testBalance.setGodown(testGodown);
        testBalance.setAvailableQuantity(new BigDecimal("50.000"));
        testBalance.setReservedQuantity(BigDecimal.ZERO);
        testBalance.setInTransitQuantity(BigDecimal.ZERO);
    }

    @Test
    @DisplayName("Inward stock movement should increment available stock balance")
    void testInwardStockMovementIncrementsBalance() {
        StockMovementRequest request = new StockMovementRequest();
        request.setProductId(10L);
        request.setGodownId(20L);
        request.setQuantity(new BigDecimal("25.000"));
        request.setUnit("BAGS");
        request.setMovementType("PURCHASE_IN");

        when(productRepository.findById(10L)).thenReturn(Optional.of(testProduct));
        when(godownRepository.findById(20L)).thenReturn(Optional.of(testGodown));
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(balanceRepository.findByProductIdAndGodownId(10L, 20L)).thenReturn(Optional.of(testBalance));

        when(movementRepository.save(any(StockMovement.class))).thenAnswer(invocation -> {
            StockMovement m = invocation.getArgument(0);
            m.setId(1L);
            return m;
        });

        StockMovementResponse response = stockService.recordMovement(request, 1L);

        assertNotNull(response);
        assertEquals(new BigDecimal("25.000"), response.getQuantity());
        assertEquals("IN", response.getDirection());
        assertEquals(new BigDecimal("75.000"), testBalance.getAvailableQuantity());
        verify(balanceRepository).save(testBalance);
    }

    @Test
    @DisplayName("Outward stock movement should fail when insufficient inventory available")
    void testOutwardStockMovementFailsOnInsufficientStock() {
        StockMovementRequest request = new StockMovementRequest();
        request.setProductId(10L);
        request.setGodownId(20L);
        request.setQuantity(new BigDecimal("100.000")); // Balance is only 50
        request.setUnit("BAGS");
        request.setMovementType("SALES_OUT");

        when(productRepository.findById(10L)).thenReturn(Optional.of(testProduct));
        when(godownRepository.findById(20L)).thenReturn(Optional.of(testGodown));
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(balanceRepository.findByProductIdAndGodownId(10L, 20L)).thenReturn(Optional.of(testBalance));

        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            stockService.recordMovement(request, 1L);
        });

        assertTrue(exception.getMessage().contains("Insufficient stock"));
        verify(movementRepository, never()).save(any(StockMovement.class));
    }
}
