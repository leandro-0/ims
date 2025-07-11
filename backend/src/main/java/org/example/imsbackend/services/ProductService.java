package org.example.imsbackend.services;

import lombok.RequiredArgsConstructor;
import org.example.imsbackend.dto.ProductFilter;
import org.example.imsbackend.models.Product;
import org.example.imsbackend.repositories.ProductRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

import java.util.Optional;
import java.util.UUID;

@Service
@Validated
@RequiredArgsConstructor
public class ProductService {
    private final ProductRepository productRepository;

    public Page<Product> getAllProducts(ProductFilter filter) {
        Specification<Product> spec = null;

        if (filter.getName() != null && !filter.getName().isEmpty()) {
            spec = (root, query, cb) ->
                    cb.like(cb.lower(root.get("name")), "%" + filter.getName().toLowerCase() + "%");
        }

        if (filter.getCategories() != null && !filter.getCategories().isEmpty()) {
            Specification<Product> categorySpec = (root, query, cb) -> root.get("category").in(filter.getCategories());
            spec = spec == null ? categorySpec : spec.and(categorySpec);
        }

        if (filter.getMinPrice() != null) {
            Specification<Product> minPriceSpec = (root, query, cb) -> cb.greaterThanOrEqualTo(root.get("price"), filter.getMinPrice());
            spec = spec == null ? minPriceSpec : spec.and(minPriceSpec);
        }

        if (filter.getMaxPrice() != null) {
            Specification<Product> maxPriceSpec = (root, query, cb) -> cb.lessThanOrEqualTo(root.get("price"), filter.getMaxPrice());
            spec = spec == null ? maxPriceSpec : spec.and(maxPriceSpec);
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
}
