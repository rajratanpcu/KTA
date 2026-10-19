package com.kta.erp.controller.transport;

import com.kta.erp.entity.transport.ScannedDocument;
import com.kta.erp.repository.transport.ScannedDocumentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/transport/documents")
@RequiredArgsConstructor
@Slf4j
public class DocumentUploadController {

    private final ScannedDocumentRepository documentRepository;

    @Value("${kta.storage.upload-dir:/tmp/kta-uploads}")
    private String uploadDirectory;

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("jpg", "jpeg", "png", "pdf");
    private static final Set<String> ALLOWED_MIME_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "application/pdf"
    );
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "documentType", defaultValue = "TRANSPORT_BILL") String documentType,
            @RequestHeader(value = "X-User-Id", defaultValue = "1") Long userId) {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "File is required and cannot be empty"));
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
                    .body(Map.of("error", "File size exceeds the 10MB limit"));
        }

        // Validate MIME type
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_MIME_TYPES.contains(contentType.toLowerCase())) {
            return ResponseEntity.status(HttpStatus.UNSUPPORTED_MEDIA_TYPE)
                    .body(Map.of("error", "Only JPG, PNG, and PDF documents are allowed"));
        }

        // Validate extension to prevent path traversal
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.contains("..")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid filename"));
        }

        String extension = getFileExtension(originalFilename);
        if (!ALLOWED_EXTENSIONS.contains(extension.toLowerCase())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Unsupported file extension: " + extension));
        }

        try {
            // Ensure directory exists
            Path uploadPath = Paths.get(uploadDirectory);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Generate UUID-based secure filename
            String storageFileName = UUID.randomUUID().toString() + "." + extension.toLowerCase();
            Path targetLocation = uploadPath.resolve(storageFileName);

            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            // Record document in database
            ScannedDocument doc = new ScannedDocument();
            doc.setOriginalFilename(originalFilename);
            doc.setStoredFilename(storageFileName);
            doc.setFileUrl("/api/transport/documents/download/" + storageFileName);
            doc.setMimeType(contentType);
            doc.setFileSize(file.getSize());
            doc.setDocumentType(ScannedDocument.DocumentType.TRANSPORT_BILL);
            doc.setOcrStatus(ScannedDocument.OcrStatus.PENDING);
            doc.setCreatedAt(LocalDateTime.now());

            ScannedDocument saved = documentRepository.save(doc);

            Map<String, Object> response = new HashMap<>();
            response.put("documentId", saved.getId());
            response.put("originalFilename", saved.getOriginalFilename());
            response.put("fileUrl", saved.getFileUrl());
            response.put("fileSize", saved.getFileSize());
            response.put("ocrStatus", saved.getOcrStatus());
            response.put("message", "Document uploaded successfully");

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (IOException ex) {
            log.error("Failed to store uploaded transport document", ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Storage operation failed: " + ex.getMessage()));
        }
    }

    @GetMapping("/download/{filename:.+}")
    public ResponseEntity<?> downloadDocument(@PathVariable String filename) {
        // Prevent path traversal
        if (filename.contains("..") || filename.contains("/") || filename.contains("\\")) {
            return ResponseEntity.badRequest().body("Invalid document request");
        }

        try {
            Path filePath = Paths.get(uploadDirectory).resolve(filename).normalize();
            File file = filePath.toFile();

            if (!file.exists() || !file.canRead()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Document not found");
            }

            byte[] content = Files.readAllBytes(filePath);
            String probeType = Files.probeContentType(filePath);
            MediaType mediaType = probeType != null ? MediaType.parseMediaType(probeType) : MediaType.APPLICATION_OCTET_STREAM;

            return ResponseEntity.ok()
                    .contentType(mediaType)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + file.getName() + "\"")
                    .body(content);

        } catch (IOException ex) {
            log.error("Error retrieving stored document", ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    private String getFileExtension(String filename) {
        int dotIndex = filename.lastIndexOf('.');
        return (dotIndex == -1) ? "" : filename.substring(dotIndex + 1);
    }
}
