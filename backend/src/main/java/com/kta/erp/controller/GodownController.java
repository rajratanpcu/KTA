package com.kta.erp.controller;

import com.kta.erp.dto.GodownRequest;
import com.kta.erp.dto.GodownResponse;
import com.kta.erp.service.GodownService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/godowns")
@RequiredArgsConstructor
public class GodownController {

    private final GodownService godownService;

    @GetMapping
    public ResponseEntity<List<GodownResponse>> getAllGodowns() {
        return ResponseEntity.ok(godownService.getAllGodowns());
    }

    @GetMapping("/active")
    public ResponseEntity<List<GodownResponse>> getActiveGodowns() {
        return ResponseEntity.ok(godownService.getActiveGodowns());
    }

    @GetMapping("/{id}")
    public ResponseEntity<GodownResponse> getGodownById(@PathVariable Long id) {
        return ResponseEntity.ok(godownService.getGodownById(id));
    }

    @PostMapping
    public ResponseEntity<GodownResponse> createGodown(@Valid @RequestBody GodownRequest request) {
        GodownResponse created = godownService.createGodown(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<GodownResponse> updateGodown(
            @PathVariable Long id,
            @Valid @RequestBody GodownRequest request) {
        return ResponseEntity.ok(godownService.updateGodown(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGodown(@PathVariable Long id) {
        godownService.deleteGodown(id);
        return ResponseEntity.noContent().build();
    }
}
