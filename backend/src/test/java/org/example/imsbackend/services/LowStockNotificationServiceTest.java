package org.example.imsbackend.services;

import org.example.imsbackend.dto.LowStockNotificationFilter;
import org.example.imsbackend.enums.Category;
import org.example.imsbackend.models.LowStockNotification;
import org.example.imsbackend.models.Product;
import org.example.imsbackend.models.ProductName;
import org.example.imsbackend.repositories.LowStockNotificationRepository;
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

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.any;
import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
public class LowStockNotificationServiceTest {
    @Mock
    private LowStockNotificationRepository lowStockNotificationRepository;

    @InjectMocks
    private LowStockNotificationService lowStockNotificationService;

    // test objects
    Product normalProduct, lowStockProduct;
    LowStockNotification notification1, notification2;

    Product createTestProduct(String name, Category category, int stock, int minimumStock) {
        Product product = new Product();
        UUID id = UUID.randomUUID();
        product.setId(id);
        product.setName(name);
        product.setCategory(category);
        product.setStock(stock);
        product.setMinimumStock(minimumStock);
        return product;
    }

    LowStockNotification createTestNotification(Product product) {
        LowStockNotification notification = new LowStockNotification();
        notification.setDate(LocalDateTime.now());
        notification.setProduct(new ProductName(product.getId(), product.getName()));
        notification.setCurrentStock(product.getStock());
        notification.setMinimumStock(product.getMinimumStock());
        return notification;
    }

    @BeforeEach
    void setUp() {
        normalProduct = createTestProduct("Normal Stock Item", Category.ELECTRONICS, 100, 10);
        lowStockProduct = createTestProduct("Low Stock Item", Category.ELECTRONICS, 5, 10);
        notification1 = createTestNotification(lowStockProduct);
        notification2 = createTestNotification(createTestProduct("Another Low Item", Category.CLOTHING, 3, 15));
        Mockito.reset(lowStockNotificationRepository);
    }

    @Test
    void save_ValidNotification_ShouldSaveAndReturnNotification() {
        when(lowStockNotificationRepository.save(notification1)).thenReturn(notification1);

        LowStockNotification result = lowStockNotificationService.save(notification1);

        assertEquals(notification1, result);
        verify(lowStockNotificationRepository).save(notification1);
    }

    @Test
    void findAll_ShouldReturnPagedResults() {
        LowStockNotificationFilter filter = new LowStockNotificationFilter();
        filter.setPage(0);
        filter.setSize(10);

        when(lowStockNotificationRepository.findAllByOrderByDateDesc(any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(notification1, notification2)));

        Page<LowStockNotification> result = lowStockNotificationService.findAll(filter);

        assertEquals(2, result.getTotalElements());
        assertTrue(result.getContent().contains(notification1));
        assertTrue(result.getContent().contains(notification2));
    }

    @Test
    void notificationFromProduct_WithNormalStock_ShouldReturnNull() {
        LowStockNotification result = lowStockNotificationService.notificationFromProduct(normalProduct);

        assertNull(result);
    }

    @Test
    void notificationFromProduct_WithLowStock_ShouldCreateNotification() {
        LowStockNotification result = lowStockNotificationService.notificationFromProduct(lowStockProduct);

        assertNotNull(result);
        assertEquals(lowStockProduct.getId(), result.getProduct().getProductId());
        assertEquals(lowStockProduct.getName(), result.getProduct().getName());
        assertEquals(lowStockProduct.getStock(), result.getCurrentStock());
        assertEquals(lowStockProduct.getMinimumStock(), result.getMinimumStock());
        assertNotNull(result.getDate());
    }
}
