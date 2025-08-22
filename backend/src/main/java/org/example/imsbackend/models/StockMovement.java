package org.example.imsbackend.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.imsbackend.annotations.ValidStockMovementAction;
import org.example.imsbackend.annotations.ValidStockMovementType;
import org.example.imsbackend.enums.StockMovementAction;
import org.example.imsbackend.enums.StockMovementType;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "stock_movements")
@Data
@NoArgsConstructor
public class StockMovement {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotNull(message = "Date cannot be null")
    @Column(nullable = false)
    private LocalDateTime date;

    @NotNull(message = "Type cannot be null")
    @Enumerated(EnumType.STRING)
    @ValidStockMovementType
    @Column(nullable = false)
    private StockMovementType type; // "IN" for stock in, "OUT" for stock out

    @Embedded
    @NotNull(message = "Product name cannot be null")
    private ProductName product;

    @NotNull(message = "Stock quantity cannot be null")
    @Min(value = 0, message = "Stock movement quatity must be greater than or equal to zero")
    @Column(nullable = false)
    private Integer quantity;

    @NotNull(message = "Action cannot be null")
    @Enumerated(EnumType.STRING)
    @ValidStockMovementAction
    @Column(nullable = false)
    private StockMovementAction action;


}
