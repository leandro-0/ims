package org.example.imsbackend.services;

import lombok.RequiredArgsConstructor;
import org.example.imsbackend.dto.ProductFilter;
import org.example.imsbackend.dto.StockMovementFilter;
import org.example.imsbackend.enums.Category;
import org.example.imsbackend.models.Product;
import org.example.imsbackend.repositories.ProductRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

import java.util.Arrays;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Validated
@RequiredArgsConstructor
public class ProductService {
    private final ProductRepository productRepository;

    public Page<Product> getAllProducts(ProductFilter filter) {
        Specification<Product> spec = Specification.where(null);

        if (filter.getName() != null && !filter.getName().isEmpty()) {
            spec = spec.and((root, query, cb) ->
                    cb.like(cb.lower(root.get("name")), "%" + filter.getName().toLowerCase() + "%"));
        }

        if (filter.getCategories() != null && !filter.getCategories().isEmpty()) {
            spec = spec.and((root, query, cb) -> root.get("category").in(filter.getCategories()));
        }

        if (filter.getMinPrice() != null) {
            spec = spec.and((root, query, cb) -> cb.greaterThanOrEqualTo(root.get("price"), filter.getMinPrice()));
        }

        if (filter.getMaxPrice() != null) {
            spec = spec.and((root, query, cb) -> cb.lessThanOrEqualTo(root.get("price"), filter.getMaxPrice()));
        }

        Pageable pageable = PageRequest.of(filter.getPage(), filter.getSize());
        return productRepository.findAll(spec, pageable);
    }

    public Optional<Product> getProductById(UUID id) {
        return productRepository.findById(id);
    }

    public Product saveProduct(Product product) {
        return productRepository.save(product);
    }

    public void deleteProduct(UUID id) {
        productRepository.deleteById(id);
    }

    public void deleteAllProducts() {
        productRepository.deleteAll();
    }

    public long countProducts() {
        return productRepository.count();
    }

    public long totalStock() {
        return productRepository.findAll().stream()
                .mapToLong(Product::getStock)
                .sum();
    }

    public double totalInventoryValue() {
        return productRepository.findAll().stream()
                .mapToDouble(product -> product.getPrice() * product.getStock())
                .sum();
    }

    public Page<Product> productsBelowMinimumStock(StockMovementFilter filter) {
        Pageable pageable = PageRequest.of(filter.getPage(), filter.getSize());
        return productRepository.findProductsBelowMinimumStock(pageable);
    }

    public Map<Category, Long> countProductsByCategory() {
        return Arrays.stream(Category.values())
                .collect(Collectors.toMap(
                        category -> category,
                        category -> productRepository.countByCategory(category)
                ));
    }



}
