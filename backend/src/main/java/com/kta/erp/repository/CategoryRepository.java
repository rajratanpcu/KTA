package com.kta.erp.repository;

import com.kta.erp.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    Optional<Category> findByName(String name);

    Optional<Category> findFirstByNameIgnoreCase(String name);

    List<Category> findByActiveTrue();

    boolean existsByName(String name);
}
