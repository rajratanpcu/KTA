package com.kta.erp.service;

import com.kta.erp.dto.GodownRequest;
import com.kta.erp.dto.GodownResponse;
import com.kta.erp.entity.Godown;
import com.kta.erp.repository.GodownRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class GodownService {

    private final GodownRepository godownRepository;

    public List<GodownResponse> getAllGodowns() {
        return godownRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<GodownResponse> getActiveGodowns() {
        return godownRepository.findByActiveTrue().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public GodownResponse getGodownById(Long id) {
        Godown godown = godownRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Godown not found with id: " + id));
        return toResponse(godown);
    }

    @Transactional
    public GodownResponse createGodown(GodownRequest request) {
        if (godownRepository.existsByCode(request.getCode())) {
            throw new RuntimeException("Godown already exists with code: " + request.getCode());
        }

        Godown godown = new Godown();
        mapRequestToEntity(request, godown);

        Godown savedGodown = godownRepository.save(godown);
        return toResponse(savedGodown);
    }

    @Transactional
    public GodownResponse updateGodown(Long id, GodownRequest request) {
        Godown godown = godownRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Godown not found with id: " + id));

        if (!godown.getCode().equals(request.getCode()) && godownRepository.existsByCode(request.getCode())) {
            throw new RuntimeException("Godown already exists with code: " + request.getCode());
        }

        mapRequestToEntity(request, godown);
        Godown updatedGodown = godownRepository.save(godown);
        return toResponse(updatedGodown);
    }

    @Transactional
    public void deleteGodown(Long id) {
        if (!godownRepository.existsById(id)) {
            throw new RuntimeException("Godown not found with id: " + id);
        }
        godownRepository.deleteById(id);
    }

    private void mapRequestToEntity(GodownRequest request, Godown godown) {
        godown.setCode(request.getCode());
        godown.setName(request.getName());
        godown.setAddress(request.getAddress());
        godown.setCity(request.getCity());
        godown.setState(request.getState());
        godown.setPincode(request.getPincode());
        godown.setContactPerson(request.getContactPerson());
        godown.setContactPhone(request.getContactPhone());
        godown.setActive(request.getActive());
    }

    private GodownResponse toResponse(Godown godown) {
        GodownResponse response = new GodownResponse();
        response.setId(godown.getId());
        response.setCode(godown.getCode());
        response.setName(godown.getName());
        response.setAddress(godown.getAddress());
        response.setCity(godown.getCity());
        response.setState(godown.getState());
        response.setPincode(godown.getPincode());
        response.setContactPerson(godown.getContactPerson());
        response.setContactPhone(godown.getContactPhone());
        response.setActive(godown.getActive());
        response.setCreatedAt(godown.getCreatedAt());
        response.setUpdatedAt(godown.getUpdatedAt());
        return response;
    }
}
