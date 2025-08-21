package org.example.imsbackend.dto;

import java.util.UUID;

import org.example.imsbackend.annotations.ValidCategory;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ProductDTO(
        UUID id,

        @NotBlank(message = "Product name cannot be blank") @Size(max = 100, message = "Product name must be at most 100 characters long") String name,

        @NotBlank(message = "Description cannot be blank") @Size(max = 500, message = "Description must be at most 500 characters long") String description,

        @NotNull(message = "Price cannot be null") @Min(value = 0, message = "Price must be greater than or equal to zero") Double price,

        @NotNull(message = "Initial stock cannot be null") @Min(value = 0, message = "Initial stock must be greater than or equal to zero") Integer initialStock,

        @NotNull(message = "Minimum stock cannot be null") @Min(value = 0, message = "Minimum stock must be greater than or equal to zero") Integer minimumStock,

        @NotNull(message = "Stock cannot be null") @Min(value = 0, message = "Stock must be greater than or equal to zero") Integer stock,

        @NotNull @ValidCategory String category) {
}
