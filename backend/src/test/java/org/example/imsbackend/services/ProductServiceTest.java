package org.example.imsbackend.services;

import org.example.imsbackend.dto.ProductFilter;
import org.example.imsbackend.dto.StockMovementFilter;
import org.example.imsbackend.enums.Category;
import org.example.imsbackend.models.Product;
import org.example.imsbackend.repositories.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.any;
import static org.junit.jupiter.api.Assertions.*;



@ExtendWith(MockitoExtension.class)
public class ProductServiceTest {
    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private ProductService productService;

    //test products
    Product product1, product2, product3, lowStockProduct, nullProduct;

    Product createTestProduct(String name, Category category, double price, int stock, int minimumStock) {
        Product product = new Product();
        product.setName(name);
        product.setCategory(category);
        product.setPrice(price);
        product.setStock(stock);
        product.setInitialStock(minimumStock);
        product.setMinimumStock(minimumStock);
        return product;
    }

    @BeforeEach
    void setUp() {
        product1 = createTestProduct("Laptop", Category.ELECTRONICS, 999.99, 50, 10);
        product2 = createTestProduct("Jeans", Category.CLOTHING, 49.99, 200, 20);
        product3 = createTestProduct("Apples", Category.FOOD, 2.99, 500, 50);
        lowStockProduct = createTestProduct("Headphones", Category.ELECTRONICS, 199.99, 5, 10);
        nullProduct = null;
        Mockito.reset(productRepository);
    }

    @Test
    void getAllProducts_WithNameFilter_ShouldReturnFilteredProducts() {
        ProductFilter filter = new ProductFilter();
        filter.setName("Laptop");
        filter.setPage(0);
        filter.setSize(10);

        when(productRepository.findAll(any(Specification.class), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(product1)));

        Page<Product> result = productService.getAllProducts(filter);

        assertEquals(1, result.getTotalElements());
        assertEquals(product1, result.getContent().get(0));
    }

    @Test
    void getProductById_ExistingProduct_ShouldReturnProduct() {
        UUID id = UUID.randomUUID();
        when(productRepository.findById(id)).thenReturn(Optional.of(product1));

        Optional<Product> result = productService.getProductById(id);

        assertTrue(result.isPresent());
        assertEquals(product1, result.get());
    }

    @Test
    void saveProduct_ValidProduct_ShouldSaveAndReturnProduct() {
        when(productRepository.save(product1)).thenReturn(product1);

        Product result = productService.saveProduct(product1);

        assertEquals(product1, result);
        verify(productRepository).save(product1);
    }

    @Test
    void deleteProduct_ExistingProduct_ShouldDeleteProduct() {
        UUID id = UUID.randomUUID();
        doNothing().when(productRepository).deleteById(id);

        productService.deleteProduct(id);

        verify(productRepository).deleteById(id);
    }

    @Test
    void totalStock_WithProducts_ShouldReturnCorrectSum() {
        when(productRepository.findAll()).thenReturn(List.of(product1, product2, product3));

        long result = productService.totalStock();

        assertEquals(750, result); // 50 + 200 + 500
    }

    @Test
    void totalInventoryValue_WithProducts_ShouldReturnCorrectSum() {
        when(productRepository.findAll()).thenReturn(List.of(product1, product2, product3));

        double result = productService.totalInventoryValue();

        double expected = (999.99 * 50) + (49.99 * 200) + (2.99 * 500);
        assertEquals(expected, result, 0.01);
    }

    @Test
    void productsBelowMinimumStock_ShouldReturnLowStockProducts() {
        StockMovementFilter filter = new StockMovementFilter();
        filter.setPage(0);
        filter.setSize(10);

        when(productRepository.findProductsBelowMinimumStock(any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(lowStockProduct)));

        Page<Product> result = productService.productsBelowMinimumStock(filter);

        assertEquals(1, result.getTotalElements());
        assertEquals(lowStockProduct, result.getContent().get(0));
    }

    @Test
    void countProductsByCategory_ShouldReturnCorrectCounts() {
        when(productRepository.countByCategory(any())).thenReturn(0L); // For other categories
        when(productRepository.countByCategory(Category.ELECTRONICS)).thenReturn(2L);
        when(productRepository.countByCategory(Category.CLOTHING)).thenReturn(1L);
        when(productRepository.countByCategory(Category.FOOD)).thenReturn(1L);
        Map<Category, Long> result = productService.countProductsByCategory();

        assertEquals(2L, result.get(Category.ELECTRONICS));
        assertEquals(1L, result.get(Category.CLOTHING));
        assertEquals(1L, result.get(Category.FOOD));
    }
}
