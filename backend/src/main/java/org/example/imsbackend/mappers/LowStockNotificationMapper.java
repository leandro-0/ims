package org.example.imsbackend.mappers;

import org.example.imsbackend.dto.LowStockNotificationDTO;
import org.example.imsbackend.models.LowStockNotification;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface LowStockNotificationMapper {
    LowStockNotificationMapper INSTANCE = Mappers.getMapper(LowStockNotificationMapper.class);

    LowStockNotificationDTO toDto(LowStockNotification lowStockNotification);
//    LowStockNotification toEntity(LowStockNotificationDTO lowStockNotificationDTO);
    Iterable<LowStockNotificationDTO> toDto(Iterable<LowStockNotification> lowStockNotifications);
}
