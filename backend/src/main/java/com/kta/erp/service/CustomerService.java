package com.kta.erp.service;

import com.kta.erp.dto.CustomerRequest;
import com.kta.erp.dto.CustomerResponse;
import com.kta.erp.entity.Customer;
import com.kta.erp.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CustomerService {

    private final CustomerRepository customerRepository;

    public List<CustomerResponse> getAllCustomers() {
        return customerRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<CustomerResponse> getActiveCustomers() {
        return customerRepository.findByActiveTrue().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public CustomerResponse getCustomerById(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found with id: " + id));
        return toResponse(customer);
    }

    @Transactional
    public CustomerResponse createCustomer(CustomerRequest request) {
        if (customerRepository.existsByCode(request.getCode())) {
            throw new RuntimeException("Customer already exists with code: " + request.getCode());
        }

        Customer customer = new Customer();
        mapRequestToEntity(request, customer);
        Customer saved = customerRepository.save(customer);
        return toResponse(saved);
    }

    @Transactional
    public CustomerResponse updateCustomer(Long id, CustomerRequest request) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Customer not found with id: " + id));

        if (!customer.getCode().equals(request.getCode()) && customerRepository.existsByCode(request.getCode())) {
            throw new RuntimeException("Customer already exists with code: " + request.getCode());
        }

        mapRequestToEntity(request, customer);
        Customer updated = customerRepository.save(customer);
        return toResponse(updated);
    }

    @Transactional
    public void deleteCustomer(Long id) {
        if (!customerRepository.existsById(id)) {
            throw new RuntimeException("Customer not found with id: " + id);
        }
        customerRepository.deleteById(id);
    }

    private void mapRequestToEntity(CustomerRequest request, Customer customer) {
        customer.setCode(request.getCode());
        customer.setName(request.getName());
        customer.setContactPerson(request.getContactPerson());
        customer.setEmail(request.getEmail());
        customer.setPhone(request.getPhone());
        customer.setAddress(request.getAddress());
        customer.setCity(request.getCity());
        customer.setState(request.getState());
        customer.setPincode(request.getPincode());
        customer.setGstNumber(request.getGstNumber());
        if (request.getBalance() != null) {
            customer.setBalance(request.getBalance());
        }
        customer.setActive(request.getActive());
    }

    private CustomerResponse toResponse(Customer customer) {
        CustomerResponse res = new CustomerResponse();
        res.setId(customer.getId());
        res.setCode(customer.getCode());
        res.setName(customer.getName());
        res.setContactPerson(customer.getContactPerson());
        res.setEmail(customer.getEmail());
        res.setPhone(customer.getPhone());
        res.setAddress(customer.getAddress());
        res.setCity(customer.getCity());
        res.setState(customer.getState());
        res.setPincode(customer.getPincode());
        res.setGstNumber(customer.getGstNumber());
        res.setBalance(customer.getBalance());
        res.setActive(customer.getActive());
        res.setCreatedAt(customer.getCreatedAt());
        res.setUpdatedAt(customer.getUpdatedAt());
        return res;
    }
}
