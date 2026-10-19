package com.kta.erp.service;

import com.kta.erp.dto.SupplierRequest;
import com.kta.erp.dto.SupplierResponse;
import com.kta.erp.entity.Supplier;
import com.kta.erp.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SupplierService {

    private final SupplierRepository supplierRepository;

    public List<SupplierResponse> getAllSuppliers() {
        return supplierRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<SupplierResponse> getActiveSuppliers() {
        return supplierRepository.findByActiveTrue().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public SupplierResponse getSupplierById(Long id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Supplier not found with id: " + id));
        return toResponse(supplier);
    }

    @Transactional
    public SupplierResponse createSupplier(SupplierRequest request) {
        if (supplierRepository.existsByCode(request.getCode())) {
            throw new RuntimeException("Supplier already exists with code: " + request.getCode());
        }

        Supplier supplier = new Supplier();
        mapRequestToEntity(request, supplier);
        Supplier saved = supplierRepository.save(supplier);
        return toResponse(saved);
    }

    @Transactional
    public SupplierResponse updateSupplier(Long id, SupplierRequest request) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Supplier not found with id: " + id));

        if (!supplier.getCode().equals(request.getCode()) && supplierRepository.existsByCode(request.getCode())) {
            throw new RuntimeException("Supplier already exists with code: " + request.getCode());
        }

        mapRequestToEntity(request, supplier);
        Supplier updated = supplierRepository.save(supplier);
        return toResponse(updated);
    }

    @Transactional
    public void deleteSupplier(Long id) {
        if (!supplierRepository.existsById(id)) {
            throw new RuntimeException("Supplier not found with id: " + id);
        }
        supplierRepository.deleteById(id);
    }

    private void mapRequestToEntity(SupplierRequest request, Supplier supplier) {
        supplier.setCode(request.getCode());
        supplier.setName(request.getName());
        supplier.setContactPerson(request.getContactPerson());
        supplier.setEmail(request.getEmail());
        supplier.setPhone(request.getPhone());
        supplier.setAddress(request.getAddress());
        supplier.setCity(request.getCity());
        supplier.setState(request.getState());
        supplier.setPincode(request.getPincode());
        supplier.setGstNumber(request.getGstNumber());
        if (request.getBalance() != null) {
            supplier.setBalance(request.getBalance());
        }
        supplier.setActive(request.getActive());
    }

    private SupplierResponse toResponse(Supplier supplier) {
        SupplierResponse res = new SupplierResponse();
        res.setId(supplier.getId());
        res.setCode(supplier.getCode());
        res.setName(supplier.getName());
        res.setContactPerson(supplier.getContactPerson());
        res.setEmail(supplier.getEmail());
        res.setPhone(supplier.getPhone());
        res.setAddress(supplier.getAddress());
        res.setCity(supplier.getCity());
        res.setState(supplier.getState());
        res.setPincode(supplier.getPincode());
        res.setGstNumber(supplier.getGstNumber());
        res.setBalance(supplier.getBalance());
        res.setActive(supplier.getActive());
        res.setCreatedAt(supplier.getCreatedAt());
        res.setUpdatedAt(supplier.getUpdatedAt());
        return res;
    }
}
