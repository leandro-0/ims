package org.example.imsbackend.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.imsbackend.annotations.ValidCategory;
import org.example.imsbackend.enums.Category;

import java.util.UUID;

@Entity
@Table(name = "products")
@Data
@NoArgsConstructor
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotBlank(message = "Product name cannot be blank")
    @Column(nullable = false)
    @Size(max = 100, message = "Product name must be at most 100 characters long")
    private String name;

    @NotBlank(message = "Description cannot be blank")
    @Size(max = 500, message = "Description must be at most 500 characters long")
    @Column(nullable = false)
    private String description;

    @NotNull(message = "Price cannot be null")
    @Min(value = 0, message = "Price must be greater than or equal to zero")
    @Column(nullable = false)
    private double price;

    @NotNull(message = "Initial stock cannot be null")
    @Min(value = 0, message = "Initial stock must be greater than or equal to zero")
    @Column(nullable = false)
    private int initialStock;

    @NotNull(message = "Stock cannot be null")
    @Min(value = 0, message = "Stock must be greater than or equal to zero")
    @Column(nullable = false)
    private int stock;

    @NotNull
    @Enumerated(EnumType.STRING)
    @ValidCategory(useDisplayName = true)
    @Column(nullable = false)
    private Category category;
}