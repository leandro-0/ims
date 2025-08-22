package org.example.imsbackend.controllers;

import lombok.RequiredArgsConstructor;
import org.example.imsbackend.dto.LowStockNotificationDTO;
import org.example.imsbackend.dto.LowStockNotificationFilter;
import org.example.imsbackend.mappers.LowStockNotificationMapper;
import org.example.imsbackend.models.LowStockNotification;
import org.example.imsbackend.services.LowStockNotificationService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Validated
@RequestMapping("/api/v1/low-stock-notifications")
@RequiredArgsConstructor
public class LowStockNotificationController {
    private final LowStockNotificationService lowStockNotificationService;

    @GetMapping
    @PreAuthorize("hasAnyRole('role_admin', 'role_employee')")
    public ResponseEntity<Page<LowStockNotificationDTO>> getAllLowStockNotifications(@ModelAttribute final LowStockNotificationFilter filter) {
        Page<LowStockNotification> lowStockNotifications = lowStockNotificationService.findAll(filter);
        return ResponseEntity.ok(lowStockNotifications.map(LowStockNotificationMapper.INSTANCE::toDto));
    }
}
