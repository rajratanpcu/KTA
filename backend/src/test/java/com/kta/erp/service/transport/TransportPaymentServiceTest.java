package com.kta.erp.service.transport;

import com.kta.erp.dto.transport.PaymentAllocationRequest;
import com.kta.erp.dto.transport.TransportPaymentRequest;
import com.kta.erp.dto.transport.TransportPaymentResponse;
import com.kta.erp.entity.User;
import com.kta.erp.entity.transport.TransportBill;
import com.kta.erp.entity.transport.TransportPayment;
import com.kta.erp.entity.transport.TransportPaymentAllocation;
import com.kta.erp.entity.transport.Transporter;
import com.kta.erp.repository.UserRepository;
import com.kta.erp.repository.transport.TransportBillRepository;
import com.kta.erp.repository.transport.TransportPaymentAllocationRepository;
import com.kta.erp.repository.transport.TransportPaymentRepository;
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
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TransportPaymentServiceTest {

    @Mock
    private TransportPaymentRepository paymentRepository;

    @Mock
    private TransporterRepository transporterRepository;

    @Mock
    private TransportBillRepository billRepository;

    @Mock
    private TransportPaymentAllocationRepository allocationRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private TransportPaymentService paymentService;

    private Transporter testTransporter;
    private TransportBill testBill1;
    private TransportBill testBill2;
    private User testUser;

    @BeforeEach
    void setUp() {
        testTransporter = new Transporter();
        testTransporter.setId(1L);
        testTransporter.setCompanyName("Fast Cargo Movers");
        testTransporter.setCode("TRP-001");

        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("admin");
        testUser.setFullName("System Administrator");

        testBill1 = new TransportBill();
        testBill1.setId(101L);
        testBill1.setBillNumber("TB-2026-001");
        testBill1.setTotalAmount(new BigDecimal("15000.00"));
        testBill1.setBalanceDue(new BigDecimal("15000.00"));
        testBill1.setStatus(TransportBill.BillStatus.PENDING);
        testBill1.setTransporter(testTransporter);

        testBill2 = new TransportBill();
        testBill2.setId(102L);
        testBill2.setBillNumber("TB-2026-002");
        testBill2.setTotalAmount(new BigDecimal("25000.00"));
        testBill2.setBalanceDue(new BigDecimal("25000.00"));
        testBill2.setStatus(TransportBill.BillStatus.PENDING);
        testBill2.setTransporter(testTransporter);
    }

    @Test
    @DisplayName("Should create payment and allocate across multiple bills")
    void testCreatePaymentWithMultiBillAllocations() {
        TransportPaymentRequest request = new TransportPaymentRequest();
        request.setPaymentNumber("PAY-TRP-2026-001");
        request.setTransporterId(1L);
        request.setPaymentDate(LocalDate.now());
        request.setPaymentMethod(TransportPayment.PaymentMethod.BANK_TRANSFER.name());
        request.setAmount(new BigDecimal("30000.00"));
        request.setAllocations(new ArrayList<>());

        PaymentAllocationRequest alloc1 = new PaymentAllocationRequest();
        alloc1.setBillId(101L);
        alloc1.setAllocatedAmount(new BigDecimal("15000.00"));
        request.getAllocations().add(alloc1);

        PaymentAllocationRequest alloc2 = new PaymentAllocationRequest();
        alloc2.setBillId(102L);
        alloc2.setAllocatedAmount(new BigDecimal("15000.00"));
        request.getAllocations().add(alloc2);

        when(paymentRepository.existsByPaymentNumber("PAY-TRP-2026-001")).thenReturn(false);
        when(transporterRepository.findById(1L)).thenReturn(Optional.of(testTransporter));
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(billRepository.findById(101L)).thenReturn(Optional.of(testBill1));
        when(billRepository.findById(102L)).thenReturn(Optional.of(testBill2));

        when(paymentRepository.save(any(TransportPayment.class))).thenAnswer(invocation -> {
            TransportPayment p = invocation.getArgument(0);
            p.setId(501L);
            return p;
        });

        TransportPaymentResponse response = paymentService.createPayment(request, 1L);

        assertNotNull(response);
        assertEquals(new BigDecimal("30000.00"), response.getAmount());
        assertEquals("PAY-TRP-2026-001", response.getPaymentNumber());
        verify(allocationRepository, times(2)).save(any(TransportPaymentAllocation.class));
    }

    @Test
    @DisplayName("Should throw exception when allocations exceed total payment amount")
    void testFailWhenAllocationsExceedPaymentAmount() {
        TransportPaymentRequest request = new TransportPaymentRequest();
        request.setPaymentNumber("PAY-ERR-001");
        request.setTransporterId(1L);
        request.setAmount(new BigDecimal("10000.00"));
        request.setAllocations(new ArrayList<>());

        PaymentAllocationRequest alloc = new PaymentAllocationRequest();
        alloc.setBillId(101L);
        alloc.setAllocatedAmount(new BigDecimal("12000.00")); // Exceeds 10,000
        request.getAllocations().add(alloc);

        when(paymentRepository.existsByPaymentNumber("PAY-ERR-001")).thenReturn(false);

        RuntimeException ex = assertThrows(RuntimeException.class, () -> {
            paymentService.createPayment(request, 1L);
        });

        assertTrue(ex.getMessage().contains("Total allocated amount cannot exceed payment amount"));
        verify(paymentRepository, never()).save(any(TransportPayment.class));
    }

    @Test
    @DisplayName("Should reject duplicate payment numbers (idempotency)")
    void testRejectDuplicatePaymentNumber() {
        TransportPaymentRequest request = new TransportPaymentRequest();
        request.setPaymentNumber("PAY-DUP-001");
        request.setTransporterId(1L);
        request.setAmount(new BigDecimal("5000.00"));

        when(paymentRepository.existsByPaymentNumber("PAY-DUP-001")).thenReturn(true);

        assertThrows(RuntimeException.class, () -> {
            paymentService.createPayment(request, 1L);
        });
    }
}
