package org.example.imsbackend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.example.imsbackend.annotations.ValidStockMovementAction;
import org.example.imsbackend.annotations.ValidStockMovementType;

import java.util.UUID;

public record StockMovementDTO(
        UUID id,

        @NotNull(message = "Date cannot be null") String date,

        @NotNull(message = "Type cannot be null") @ValidStockMovementType String type,

        @NotNull(message = "Product name cannot be null") ProductNameDTO product,

        @NotNull(message = "Username cannot be null") @Size(max = 50, message = "Username must be at most 50 characters long") String username,

        @NotNull(message = "Stock quantity cannot be null") @Min(value = 0, message = "Stock movement quatity must be greater than or equal to zero")Integer quantity,

        @NotNull(message = "Action cannot be null") @ValidStockMovementAction String action){

}
