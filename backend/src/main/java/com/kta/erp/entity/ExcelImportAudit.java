package com.kta.erp.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "excel_import_audit")
public class ExcelImportAudit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "file_name", nullable = false)
    private String fileName;

    @Column(name = "file_size", nullable = false)
    private Long fileSize;

    @Column(name = "imported_by", nullable = false, length = 100)
    private String importedBy;

    @Column(name = "import_mode", nullable = false, length = 50)
    private String importMode; // 'PREVIEW', 'IMPORT_NEW', 'REPLACE_DEMO'

    @Column(name = "invoices_count")
    private Integer invoicesCount = 0;

    @Column(name = "line_items_count")
    private Integer lineItemsCount = 0;

    @Column(name = "payments_count")
    private Integer paymentsCount = 0;

    @Column(name = "parties_count")
    private Integer partiesCount = 0;

    @Column(name = "items_count")
    private Integer itemsCount = 0;

    @Column(nullable = false, length = 50)
    private String status; // 'SUCCESS', 'FAILED', 'PREVIEW_ONLY'

    @Column(name = "summary_notes", columnDefinition = "TEXT")
    private String summaryNotes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
    }
}
