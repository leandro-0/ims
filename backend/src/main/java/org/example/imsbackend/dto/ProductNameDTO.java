package org.example.imsbackend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record ProductNameDTO(
        UUID productId,

        @NotBlank(message = "Product name cannot be blank") @Size(max = 100, message = "Product name must be at most 100 characters long") String name
) {
}
