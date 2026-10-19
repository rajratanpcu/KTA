package com.kta.erp.service.transport;

import com.kta.erp.dto.transport.TransporterRequest;
import com.kta.erp.dto.transport.TransporterResponse;
import com.kta.erp.entity.transport.Transporter;
import com.kta.erp.repository.transport.TransporterRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TransporterService {

    private final TransporterRepository transporterRepository;

    public List<TransporterResponse> getAllTransporters() {
        return transporterRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<TransporterResponse> getActiveTransporters() {
        return transporterRepository.findByActiveTrue().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public TransporterResponse getTransporterById(Long id) {
        Transporter transporter = transporterRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transporter not found with id: " + id));
        return toResponse(transporter);
    }

    @Transactional
    public TransporterResponse createTransporter(TransporterRequest request) {
        if (transporterRepository.existsByCode(request.getCode())) {
            throw new RuntimeException("Transporter already exists with code: " + request.getCode());
        }

        Transporter transporter = new Transporter();
        mapRequestToEntity(request, transporter);

        Transporter saved = transporterRepository.save(transporter);
        return toResponse(saved);
    }

    @Transactional
    public TransporterResponse updateTransporter(Long id, TransporterRequest request) {
        Transporter transporter = transporterRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transporter not found with id: " + id));

        if (!transporter.getCode().equals(request.getCode()) &&
            transporterRepository.existsByCode(request.getCode())) {
            throw new RuntimeException("Transporter already exists with code: " + request.getCode());
        }

        mapRequestToEntity(request, transporter);
        Transporter updated = transporterRepository.save(transporter);
        return toResponse(updated);
    }

    @Transactional
    public void deleteTransporter(Long id) {
        if (!transporterRepository.existsById(id)) {
            throw new RuntimeException("Transporter not found with id: " + id);
        }
        transporterRepository.deleteById(id);
    }

    private void mapRequestToEntity(TransporterRequest request, Transporter transporter) {
        transporter.setCode(request.getCode());
        transporter.setCompanyName(request.getCompanyName());
        transporter.setContactPerson(request.getContactPerson());
        transporter.setPhone(request.getPhone());
        transporter.setEmail(request.getEmail());
        transporter.setAddress(request.getAddress());
        transporter.setCity(request.getCity());
        transporter.setState(request.getState());
        transporter.setPincode(request.getPincode());
        transporter.setGstin(request.getGstin());
        transporter.setNotes(request.getNotes());
        transporter.setActive(request.getActive());
    }

    private TransporterResponse toResponse(Transporter transporter) {
        TransporterResponse response = new TransporterResponse();
        response.setId(transporter.getId());
        response.setCode(transporter.getCode());
        response.setCompanyName(transporter.getCompanyName());
        response.setContactPerson(transporter.getContactPerson());
        response.setPhone(transporter.getPhone());
        response.setEmail(transporter.getEmail());
        response.setAddress(transporter.getAddress());
        response.setCity(transporter.getCity());
        response.setState(transporter.getState());
        response.setPincode(transporter.getPincode());
        response.setGstin(transporter.getGstin());
        response.setNotes(transporter.getNotes());
        response.setActive(transporter.getActive());
        response.setCreatedAt(transporter.getCreatedAt());
        response.setUpdatedAt(transporter.getUpdatedAt());
        return response;
    }
}
