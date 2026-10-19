package com.kta.erp.controller.transport;

import com.kta.erp.dto.transport.TransporterRequest;
import com.kta.erp.dto.transport.TransporterResponse;
import com.kta.erp.service.transport.TransporterService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transport/transporters")
@RequiredArgsConstructor
public class TransporterController {

    private final TransporterService transporterService;

    @GetMapping
    public ResponseEntity<List<TransporterResponse>> getAllTransporters() {
        return ResponseEntity.ok(transporterService.getAllTransporters());
    }

    @GetMapping("/active")
    public ResponseEntity<List<TransporterResponse>> getActiveTransporters() {
        return ResponseEntity.ok(transporterService.getActiveTransporters());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TransporterResponse> getTransporterById(@PathVariable Long id) {
        return ResponseEntity.ok(transporterService.getTransporterById(id));
    }

    @PostMapping
    public ResponseEntity<TransporterResponse> createTransporter(@Valid @RequestBody TransporterRequest request) {
        TransporterResponse created = transporterService.createTransporter(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TransporterResponse> updateTransporter(
            @PathVariable Long id,
            @Valid @RequestBody TransporterRequest request) {
        return ResponseEntity.ok(transporterService.updateTransporter(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTransporter(@PathVariable Long id) {
        transporterService.deleteTransporter(id);
        return ResponseEntity.noContent().build();
    }
}
