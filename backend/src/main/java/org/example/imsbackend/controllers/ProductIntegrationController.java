package org.example.imsbackend.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.example.imsbackend.dto.ProductDTO;
import org.example.imsbackend.dto.ProductFilter;
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
    public ResponseEntity<Page<ProductDTO>> getAllProductsWithFilter(@ModelAttribute ProductFilter filter) {
        return productController.getAllProductsWithFilter(filter);
    }

    @GetMapping("/{id}/details")
    public ResponseEntity<ProductDTO> getProductById(@PathVariable("id") String id) {
        return productController.getProductById(id);
    }

    @PostMapping
    public ResponseEntity<ProductDTO> createProduct(@Valid @RequestBody ProductDTO product) {
        return productController.createProduct(product);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductDTO> updateProduct(@PathVariable("id") String id,
            @Valid @RequestBody ProductDTO product) {
        return productController.updateProduct(id, product);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable("id") String id) {
        return productController.deleteProduct(id);
    }
}
