package org.example.imsbackend.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "low_stock_notifications")
@Data
@NoArgsConstructor
public class LowStockNotification {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotNull(message = "Date cannot be null")
    @Column(nullable = false)
    private LocalDateTime date;

    @Embedded
    @NotNull(message = "Product name cannot be null")
    private ProductName product;

    @NotNull(message = "Current stock cannot be null")
    @Min(value = 0, message = "Current quatity must be greater than or equal to zero")
    @Column(nullable = false)
    private Integer currentStock;

    @NotNull(message = "Minimum stock cannot be null")
    @Min(value = 0, message = "Minimum stock must be greater than or equal to zero")
    @Column(nullable = false)
    private Integer minimumStock;
}
