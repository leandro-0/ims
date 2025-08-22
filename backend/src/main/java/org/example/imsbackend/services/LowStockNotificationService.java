package org.example.imsbackend.services;

import lombok.RequiredArgsConstructor;
import org.example.imsbackend.dto.LowStockNotificationFilter;
import org.example.imsbackend.models.LowStockNotification;
import org.example.imsbackend.models.Product;
import org.example.imsbackend.models.ProductName;
import org.example.imsbackend.repositories.LowStockNotificationRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

import java.time.LocalDateTime;

@Service
@Validated
@RequiredArgsConstructor
public class LowStockNotificationService {
    private final LowStockNotificationRepository lowStockNotificationRepository;

    public LowStockNotification save(final LowStockNotification lowStockNotification) {
        return lowStockNotificationRepository.save(lowStockNotification);
    }

    public Page<LowStockNotification> findAll(final LowStockNotificationFilter filter) {
        Pageable pageable = PageRequest.of(filter.getPage(), filter.getSize());
        return lowStockNotificationRepository.findAllByOrderByDateDesc(pageable);
    }

    public LowStockNotification notificationFromProduct(Product product) {
        if(product.getStock() >= product.getMinimumStock()) {
            return null; // No notification needed if stock is above minimum
        }
        LowStockNotification notification = new LowStockNotification();
        notification.setDate(LocalDateTime.now());
        notification.setProduct(new ProductName(product.getId(), product.getName()));
        notification.setCurrentStock(product.getStock());
        notification.setMinimumStock(product.getMinimumStock());
        return notification;
    }
}
