package org.example.imsbackend.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.example.imsbackend.dto.ProductDTO;
import org.example.imsbackend.dto.ProductFilter;
import org.example.imsbackend.mappers.ProductMapper;
import org.example.imsbackend.models.Product;
import org.example.imsbackend.services.ProductService;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.UUID;

@RestController
@Validated
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class ProductController {
    private final ProductService productService;

    @GetMapping("/search")
    public ResponseEntity<Page<ProductDTO>> getAllProductsWithFilter(@ModelAttribute ProductFilter filter) {
        Page<Product> products = productService.getAllProducts(filter);
        return ResponseEntity.ok(products.map(ProductMapper.INSTANCE::toDto));
    }

    @GetMapping("/{id}/details")
    public ResponseEntity<ProductDTO> getProductById(@PathVariable("id") String id) {
        try {
            Optional<Product> product = productService.getProductById(UUID.fromString(id));
            if (product.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(ProductMapper.INSTANCE.toDto(product.get()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping
    @PreAuthorize("hasRole('role_admin')")
    public ResponseEntity<ProductDTO> createProduct(@Valid @RequestBody ProductDTO product) {
        Product savedProduct = productService.saveProduct(ProductMapper.INSTANCE.toEntity(product));
        return ResponseEntity.status(HttpStatus.CREATED).body(ProductMapper.INSTANCE.toDto(savedProduct));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('role_admin')")
    public ResponseEntity<ProductDTO> updateProduct(@PathVariable("id") String id, @Valid @RequestBody ProductDTO product) {
        try {
            UUID productId = UUID.fromString(id);
            Optional<Product> existingProduct = productService.getProductById(productId);
            if (existingProduct.isPresent()) {
                Product productToUpdate = existingProduct.get();
                productToUpdate.setId(productId);
                Product updatedProduct = productService.saveProduct(productToUpdate);
                return ResponseEntity.ok(ProductMapper.INSTANCE.toDto(updatedProduct));
            }
            return ResponseEntity.notFound().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('role_admin')")
    public ResponseEntity<Void> deleteProduct(@PathVariable("id") String id) {
        try {
            UUID productId = UUID.fromString(id);
            Optional<Product> product = productService.getProductById(productId);
            if (product.isPresent()) {
                productService.deleteProduct(productId);
                return ResponseEntity.noContent().build();
            }
            return ResponseEntity.notFound().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
