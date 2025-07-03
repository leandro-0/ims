package org.example.imsbackend.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.imsbackend.dto.ProductFilter;
import org.example.imsbackend.models.Product;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@Validated
@RequestMapping("/integration/v1/products")
@RequiredArgsConstructor
@PreAuthorize("hasRole('role_admin')")
public class ProductIntegrationController {
    private final ProductController productController;    

    @GetMapping("/search")
    public ResponseEntity<Page<Product>> getAllProductsWithFilter(@ModelAttribute ProductFilter filter) {
        return productController.getAllProductsWithFilter(filter);
    }

    @GetMapping("/{id}/details")
    public ResponseEntity<Product> getProductById(@PathVariable("id") String id) {
        return productController.getProductById(id);
    }

    @PostMapping
    public ResponseEntity<Product> createProduct(@Valid @RequestBody Product product) {
        return productController.createProduct(product);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable("id") String id, @Valid @RequestBody Product product) {
        return productController.updateProduct(id, product);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable("id") String id) {
        return productController.deleteProduct(id);
    }
}
