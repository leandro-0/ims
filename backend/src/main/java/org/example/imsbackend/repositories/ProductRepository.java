package org.example.imsbackend.repositories;

import org.example.imsbackend.enums.Category;
import org.example.imsbackend.models.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.util.UUID;

public interface ProductRepository extends JpaRepository<Product, UUID>, JpaSpecificationExecutor<Product> {
    @Query("SELECT p FROM Product p WHERE p.stock < p.minimumStock")
    Page<Product> findProductsBelowMinimumStock(Pageable pageable);

    // count products in a category
    @Query("SELECT COUNT(p) FROM Product p WHERE p.category = ?1")
    long countByCategory(Category category);
}
