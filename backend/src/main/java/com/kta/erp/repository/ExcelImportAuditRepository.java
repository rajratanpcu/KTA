package com.kta.erp.repository;

import com.kta.erp.entity.ExcelImportAudit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExcelImportAuditRepository extends JpaRepository<ExcelImportAudit, Long> {

    List<ExcelImportAudit> findAllByOrderByCreatedAtDesc();
}
