package org.example.imsbackend.repositories;

import jakarta.validation.constraints.NotNull;
import org.example.imsbackend.dto.UsernameCount;
import org.example.imsbackend.enums.Category;
import org.example.imsbackend.enums.StockMovementType;
import org.example.imsbackend.models.StockMovement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface StockMovementRepository extends JpaRepository<StockMovement, UUID>, JpaSpecificationExecutor<StockMovement> {
    //Find all stock movements on descending date
    Page<StockMovement> findAllByOrderByDateDesc(Pageable pageable);

    //Movement count after a specific date separated by type
    long countByTypeAndDateAfter(@NotNull(message = "Type cannot be null") StockMovementType type, @NotNull(message = "Date cannot be null") LocalDateTime date);
    //Movement count between 2 specific dates by type
    long countByTypeAndDateBetween(@NotNull(message = "Type cannot be null") StockMovementType type, @NotNull(message = "Date cannot be null") LocalDateTime date, @NotNull(message = "Date cannot be null") LocalDateTime date2);
    // Movement count grouped by username after a specific date
    @Query("SELECT sm.username AS username, COUNT(sm) AS count FROM StockMovement sm WHERE sm.date > ?1 GROUP BY sm.username ORDER BY count DESC")
    List<UsernameCount> countByUsernameAfter(LocalDateTime date);
    @Query("SELECT COUNT(sm) FROM StockMovement sm JOIN Product p ON sm.product.productId = p.id WHERE p.category = ?1")
    long countByProductCategory(Category category);
}
