package com.kta.erp.repository;

import com.kta.erp.entity.Unit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UnitRepository extends JpaRepository<Unit, Long> {

    Optional<Unit> findByName(String name);

    Optional<Unit> findByAbbreviation(String abbreviation);

    Optional<Unit> findFirstByAbbreviationIgnoreCase(String abbreviation);
}
