package com.kta.erp.service.transport;

import com.kta.erp.dto.transport.*;
import com.kta.erp.entity.User;
import com.kta.erp.entity.transport.*;
import com.kta.erp.repository.UserRepository;
import com.kta.erp.repository.transport.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TransportPaymentService {

    private final TransportPaymentRepository paymentRepository;
    private final TransporterRepository transporterRepository;
    private final TransportBillRepository billRepository;
    private final TransportPaymentAllocationRepository allocationRepository;
    private final UserRepository userRepository;

    public List<TransportPaymentResponse> getAllPayments() {
        return paymentRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<TransportPaymentResponse> getPaymentsByTransporter(Long transporterId) {
        return paymentRepository.findByTransporterId(transporterId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<TransportPaymentResponse> getPaymentsByDateRange(LocalDate startDate, LocalDate endDate) {
        return paymentRepository.findByDateRange(startDate, endDate).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public TransportPaymentResponse getPaymentById(Long id) {
        TransportPayment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Payment not found with id: " + id));
        return toResponse(payment);
    }

    public BigDecimal getTotalPaidByTransporter(Long transporterId) {
        return paymentRepository.getTotalPaidByTransporter(transporterId);
    }

    @Transactional
    public TransportPaymentResponse createPayment(TransportPaymentRequest request, Long userId) {
        if (paymentRepository.existsByPaymentNumber(request.getPaymentNumber())) {
            throw new RuntimeException("Payment already exists with number: " + request.getPaymentNumber());
        }

        if (request.getAllocations() == null) {
            throw new RuntimeException("Allocations must not be null");
        }

        // Validate allocations
        BigDecimal totalAllocated = request.getAllocations().stream()
                .map(PaymentAllocationRequest::getAllocatedAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (totalAllocated.compareTo(request.getAmount()) > 0) {
            throw new RuntimeException("Total allocated amount cannot exceed payment amount");
        }

        for (PaymentAllocationRequest allocationRequest : request.getAllocations()) {
            TransportBill bill = billRepository.findById(allocationRequest.getBillId())
                    .orElseThrow(() -> new RuntimeException("Bill not found with id: " + allocationRequest.getBillId()));
            if (bill.getTransporter() == null
                    || !bill.getTransporter().getId().equals(request.getTransporterId())) {
                throw new RuntimeException("Payment allocation belongs to a different transporter");
            }
            if (bill.getBalanceDue() != null
                    && allocationRequest.getAllocatedAmount().compareTo(bill.getBalanceDue()) > 0) {
                throw new RuntimeException("Allocation exceeds the bill balance due");
            }
        }

        TransportPayment payment = new TransportPayment();
        mapRequestToEntity(request, payment, userId);

        TransportPayment saved = paymentRepository.save(payment);

        // Create allocations and update bill balances
        for (PaymentAllocationRequest allocReq : request.getAllocations()) {
            TransportPaymentAllocation allocation = new TransportPaymentAllocation();
            allocation.setPayment(saved);

            TransportBill bill = billRepository.findById(allocReq.getBillId())
                    .orElseThrow(() -> new RuntimeException("Bill not found with id: " + allocReq.getBillId()));
            allocation.setBill(bill);
            allocation.setAllocatedAmount(allocReq.getAllocatedAmount());

            allocationRepository.save(allocation);
        }

        return toResponse(saved);
    }

    @Transactional
    public void deletePayment(Long id) {
        if (!paymentRepository.existsById(id)) {
            throw new RuntimeException("Payment not found with id: " + id);
        }
        // Allocations will be deleted by cascade
        paymentRepository.deleteById(id);
    }

    private void mapRequestToEntity(TransportPaymentRequest request, TransportPayment payment, Long userId) {
        payment.setPaymentNumber(request.getPaymentNumber());
        payment.setPaymentDate(request.getPaymentDate());
        payment.setAmount(request.getAmount());
        payment.setPaymentMethod(TransportPayment.PaymentMethod.valueOf(request.getPaymentMethod()));
        payment.setTransactionReference(request.getTransactionReference());
        payment.setNotes(request.getNotes());

        Transporter transporter = transporterRepository.findById(request.getTransporterId())
                .orElseThrow(() -> new RuntimeException("Transporter not found with id: " + request.getTransporterId()));
        payment.setTransporter(transporter);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        payment.setCreatedBy(user);
    }

    private TransportPaymentResponse toResponse(TransportPayment payment) {
        TransportPaymentResponse response = new TransportPaymentResponse();
        response.setId(payment.getId());
        response.setPaymentNumber(payment.getPaymentNumber());
        response.setPaymentDate(payment.getPaymentDate());
        response.setTransporterId(payment.getTransporter().getId());
        response.setTransporterName(payment.getTransporter().getCompanyName());
        response.setAmount(payment.getAmount());
        response.setPaymentMethod(payment.getPaymentMethod().name());
        response.setTransactionReference(payment.getTransactionReference());
        response.setNotes(payment.getNotes());

        response.setAllocations(payment.getAllocations().stream()
                .map(this::toAllocationResponse)
                .collect(Collectors.toList()));

        response.setCreatedById(payment.getCreatedBy().getId());
        response.setCreatedByName(payment.getCreatedBy().getFullName());
        response.setCreatedAt(payment.getCreatedAt());

        return response;
    }

    private PaymentAllocationResponse toAllocationResponse(TransportPaymentAllocation allocation) {
        PaymentAllocationResponse response = new PaymentAllocationResponse();
        response.setId(allocation.getId());
        response.setPaymentId(allocation.getPayment().getId());
        response.setBillId(allocation.getBill().getId());
        response.setBillNumber(allocation.getBill().getBillNumber());
        response.setAllocatedAmount(allocation.getAllocatedAmount());
        response.setAllocationDate(allocation.getAllocationDate());
        return response;
    }
}
