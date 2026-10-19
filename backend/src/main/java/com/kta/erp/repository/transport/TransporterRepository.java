package com.kta.erp.repository.transport;

import com.kta.erp.entity.transport.Transporter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TransporterRepository extends JpaRepository<Transporter, Long> {

    Optional<Transporter> findByCode(String code);

    List<Transporter> findByActiveTrue();

    boolean existsByCode(String code);
}
