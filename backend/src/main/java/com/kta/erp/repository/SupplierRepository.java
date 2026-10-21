package com.kta.erp.repository;

import com.kta.erp.entity.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Long> {

    Optional<Supplier> findByCode(String code);

    Optional<Supplier> findFirstByNameIgnoreCase(String name);

    List<Supplier> findByActiveTrue();

    boolean existsByCode(String code);
}
