package org.example.imsbackend.models;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductName {
    @NotNull(message = "Product ID cannot be null")
    private UUID productId;

    @NotBlank(message = "Product name cannot be blank")
    @Column(nullable = false)
    private String name;
}
