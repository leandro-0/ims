package org.example.imsbackend.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.example.imsbackend.dto.ProductDTO;
import org.example.imsbackend.dto.ProductFilter;
import org.example.imsbackend.enums.StockMovementAction;
import org.example.imsbackend.mappers.ProductMapper;
import org.example.imsbackend.models.LowStockNotification;
import org.example.imsbackend.models.Product;
import org.example.imsbackend.models.StockMovement;
import org.example.imsbackend.services.LowStockNotificationService;
import org.example.imsbackend.services.ProductService;
import org.example.imsbackend.services.StockMovementService;
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
    private final StockMovementService stockMovementService;
    private final LowStockNotificationService lowStockNotificationService;

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
    @PreAuthorize("hasAnyRole('role_admin', 'role_employee')")
    public ResponseEntity<ProductDTO> createProduct(@Valid @RequestBody ProductDTO product) {
        Product savedProduct = productService.saveProduct(ProductMapper.INSTANCE.toEntity(product));
        // Create stock movement for newly created product
        StockMovement stockMovement = StockMovementService.calculateStockMovement(null, savedProduct, StockMovementAction.INSERTED);
        stockMovementService.save(stockMovement);
        // Check if low stock notification is needed
        LowStockNotification lowStockNotification = lowStockNotificationService.notificationFromProduct(savedProduct);
        if (lowStockNotification != null) {
            lowStockNotificationService.save(lowStockNotification);
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(ProductMapper.INSTANCE.toDto(savedProduct));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('role_admin', 'role_employee')")
    public ResponseEntity<ProductDTO> updateProduct(@PathVariable("id") String id, @Valid @RequestBody ProductDTO product) {
        try {
            UUID productId = UUID.fromString(id);
            Optional<Product> existingProduct = productService.getProductById(productId);
            if (existingProduct.isPresent()) {
                Product productToUpdate = ProductMapper.INSTANCE.toEntity(product);
                productToUpdate.setId(productId);
                //Update stock movement if stock has changed
                StockMovement stockMovement = StockMovementService.calculateStockMovement(existingProduct.get(), productToUpdate, StockMovementAction.UPDATED);
                if(stockMovement != null) {
                    stockMovementService.save(stockMovement);
                }
                Product updatedProduct = productService.saveProduct(productToUpdate);
                // Check if low stock notification is needed after update
                LowStockNotification lowStockNotification = lowStockNotificationService.notificationFromProduct(updatedProduct);
                if (lowStockNotification != null) {
                    lowStockNotificationService.save(lowStockNotification);
                }
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
                // Create stock movement for deleted product
                StockMovement stockMovement = StockMovementService.calculateStockMovement(null, product.get(), StockMovementAction.DELETED);
                if (stockMovement != null) {
                    stockMovementService.save(stockMovement);
                }
                productService.deleteProduct(productId);
                return ResponseEntity.noContent().build();
            }
            return ResponseEntity.notFound().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
