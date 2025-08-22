package org.example.imsbackend.repositories;

import org.example.imsbackend.models.LowStockNotification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.UUID;

public interface LowStockNotificationRepository extends JpaRepository<LowStockNotification, UUID>, JpaSpecificationExecutor<LowStockNotification> {
    Page<LowStockNotification> findAllByOrderByDateDesc(Pageable pageable);
}
