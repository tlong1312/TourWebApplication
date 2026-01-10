package com.longne.tourapplication.repository;

import com.longne.tourapplication.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    Optional<Category> findByName(String name);

    List<Category> findByIsActive(Boolean isActive);
    Category findById(long id);
    boolean existsByName(String name);
}
