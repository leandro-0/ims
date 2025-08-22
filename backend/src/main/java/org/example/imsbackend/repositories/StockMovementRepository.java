package org.example.imsbackend.repositories;

import org.example.imsbackend.models.StockMovement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.UUID;

public interface StockMovementRepository extends JpaRepository<StockMovement, UUID>, JpaSpecificationExecutor<StockMovement> {
    //Find all stock movements on descending date
    Page<StockMovement> findAllByOrderByDateDesc(Pageable pageable);
}
