package com.kta.erp.service.transport;

import com.kta.erp.dto.transport.TransportBillItemRequest;
import com.kta.erp.dto.transport.TransportBillRequest;
import com.kta.erp.dto.transport.TransportBillResponse;
import com.kta.erp.entity.Product;
import com.kta.erp.entity.User;
import com.kta.erp.entity.transport.TransportBill;
import com.kta.erp.entity.transport.Transporter;
import com.kta.erp.repository.ProductRepository;
import com.kta.erp.repository.UserRepository;
import com.kta.erp.repository.transport.ScannedDocumentRepository;
import com.kta.erp.repository.transport.TransportBillItemRepository;
import com.kta.erp.repository.transport.TransportBillRepository;
import com.kta.erp.repository.transport.TransportPaymentAllocationRepository;
import com.kta.erp.repository.transport.TransporterRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TransportBillServiceTest {

    @Mock
    private TransportBillRepository billRepository;

    @Mock
    private TransporterRepository transporterRepository;

    @Mock
    private TransportBillItemRepository itemRepository;

    @Mock
    private ScannedDocumentRepository documentRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private TransportPaymentAllocationRepository allocationRepository;

    @InjectMocks
    private TransportBillService billService;

    private Transporter testTransporter;
    private User testUser;
    private Product testProduct;

    @BeforeEach
    void setUp() {
        testTransporter = new Transporter();
        testTransporter.setId(1L);
        testTransporter.setName("Speedy Logistics");
        testTransporter.setCode("SPL-01");

        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("admin");

        testProduct = new Product();
        testProduct.setId(10L);
        testProduct.setName("Refined Sunflower Oil 15L");
    }

    @Test
    @DisplayName("Create transport bill calculates freight charges, taxes, and sets balance due correctly without affecting stock")
    void testCreateTransportBillCalculations() {
        TransportBillRequest request = new TransportBillRequest();
        request.setBillNumber("LR-2026-9901");
        request.setTransporterId(1L);
        request.setBillDate(LocalDate.now());
        request.setFreightCharges(new BigDecimal("10000.00"));
        request.setLoadingCharges(new BigDecimal("500.00"));
        request.setUnloadingCharges(new BigDecimal("500.00"));
        request.setGstAmount(new BigDecimal("550.00"));
        request.setTdsDeducted(new BigDecimal("200.00"));
        request.setAdvancePaid(new BigDecimal("1000.00"));
        request.setItems(new ArrayList<>());

        TransportBillItemRequest itemReq = new TransportBillItemRequest();
        itemReq.setItemDescription("Sunflower Oil Tins");
        itemReq.setQuantity(new BigDecimal("100.000"));
        itemReq.setWeightKg(new BigDecimal("1500.000"));
        itemReq.setRate(new BigDecimal("100.00"));
        itemReq.setAmount(new BigDecimal("10000.00"));
        request.getItems().add(itemReq);

        when(billRepository.existsByBillNumber("LR-2026-9901")).thenReturn(false);
        when(transporterRepository.findById(1L)).thenReturn(Optional.of(testTransporter));
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));

        when(billRepository.save(any(TransportBill.class))).thenAnswer(invocation -> {
            TransportBill b = invocation.getArgument(0);
            b.setId(88L);
            return b;
        });

        TransportBillResponse response = billService.createBill(request, 1L);

        assertNotNull(response);
        assertEquals("LR-2026-9901", response.getBillNumber());
        // Expected total = 10000 (freight) + 500 (loading) + 500 (unloading) + 550 (gst) - 200 (tds) = 11350.00
        assertEquals(new BigDecimal("11350.00"), response.getTotalAmount());
        // Expected balance = 11350 - 1000 (advance) = 10350.00
        assertEquals(new BigDecimal("10350.00"), response.getBalanceDue());

        // Zero interaction with inventory/stock repository confirms transport bills do NOT touch warehouse quantities
        verifyNoInteractions(productRepository);
    }
}
