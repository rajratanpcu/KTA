package com.kta.erp.repository.transport;

import com.kta.erp.entity.transport.ScannedDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ScannedDocumentRepository extends JpaRepository<ScannedDocument, Long> {

    Optional<ScannedDocument> findByFilePath(String filePath);

    List<ScannedDocument> findByUploadedById(Long userId);

    List<ScannedDocument> findByFileType(String fileType);
}
