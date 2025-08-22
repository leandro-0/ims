package org.example.imsbackend.services;


import lombok.RequiredArgsConstructor;
import org.example.imsbackend.dto.StockMovementFilter;
import org.example.imsbackend.enums.StockMovementAction;
import org.example.imsbackend.enums.StockMovementType;
import org.example.imsbackend.models.Product;
import org.example.imsbackend.models.ProductName;
import org.example.imsbackend.models.StockMovement;
import org.example.imsbackend.repositories.StockMovementRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

import java.time.LocalDateTime;
import java.util.Objects;

@Service
@Validated
@RequiredArgsConstructor
public class StockMovementService {
    private final StockMovementRepository stockMovementRepository;

    public StockMovement save(StockMovement stockMovement) {
        return stockMovementRepository.save(stockMovement);
    }

    public Page<StockMovement> getAllStockMovements(StockMovementFilter filter) {
        Pageable pageable = PageRequest.of(filter.getPage(), filter.getSize());
        return stockMovementRepository.findAllByOrderByDateDesc(pageable);
    }

    public static StockMovement calculateStockMovement(Product oldProduct, Product newProduct, StockMovementAction action) {
        if(action == StockMovementAction.UPDATED){
            if (Objects.equals(oldProduct.getStock(), newProduct.getStock())) {
                return null; // No stock movement if stock hasn't changed on update
            }
        }
        StockMovement stockMovement = new StockMovement();
        stockMovement.setProduct(new ProductName(newProduct.getId(), newProduct.getName()));
        stockMovement.setDate(LocalDateTime.now());
        if (action == StockMovementAction.DELETED){
            stockMovement.setType(StockMovementType.OUTGOING);
            stockMovement.setQuantity(oldProduct.getStock());
        }else if(action == StockMovementAction.INSERTED) {
            stockMovement.setType(StockMovementType.INCOMING);
            stockMovement.setQuantity(newProduct.getStock());
        } else{
            stockMovement.setType(newProduct.getStock() > oldProduct.getStock() ? StockMovementType.INCOMING : StockMovementType.OUTGOING);
            stockMovement.setQuantity(Math.abs(newProduct.getStock() - oldProduct.getStock()));
        }
        stockMovement.setAction(action);
        return stockMovement;
    }
}
