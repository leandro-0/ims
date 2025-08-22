package org.example.imsbackend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record LowStockNotificationDTO(
        UUID id,

        @NotNull(message = "Date cannot be null") String date,

        @NotNull(message = "Product name cannot be null") ProductNameDTO product,

        @NotNull(message = "Current stock cannot be null") @Min(value = 0, message = "Current stock must be greater than or equal to zero") Integer currentStock,

        @NotNull(message = "Minimum stock cannot be null") @Min(value = 0, message = "Minimum stock must be greater than or equal to zero") Integer minimumStock) {
}
