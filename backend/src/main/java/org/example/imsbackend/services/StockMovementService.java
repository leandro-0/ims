package org.example.imsbackend.services;


import lombok.RequiredArgsConstructor;
import org.example.imsbackend.dto.StockMovementFilter;
import org.example.imsbackend.dto.UsernameCount;
import org.example.imsbackend.enums.Category;
import org.example.imsbackend.enums.StockMovementAction;
import org.example.imsbackend.enums.StockMovementType;
import org.example.imsbackend.models.Product;
import org.example.imsbackend.models.ProductName;
import org.example.imsbackend.models.StockMovement;
import org.example.imsbackend.repositories.StockMovementRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.util.Pair;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
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

    public static StockMovement calculateStockMovement(Product oldProduct, Product newProduct, StockMovementAction action, String username) {
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
            stockMovement.setQuantity(newProduct.getStock());
        }else if(action == StockMovementAction.INSERTED) {
            stockMovement.setType(StockMovementType.INCOMING);
            stockMovement.setQuantity(newProduct.getStock());
        } else{
            stockMovement.setType(newProduct.getStock() > oldProduct.getStock() ? StockMovementType.INCOMING : StockMovementType.OUTGOING);
            stockMovement.setQuantity(Math.abs(newProduct.getStock() - oldProduct.getStock()));
        }
        stockMovement.setUsername(username);
        stockMovement.setAction(action);
        return stockMovement;
    }

    // Dashboard methods
    // Count of stock movements by type in the last 24 hours
    public long countStockMovementsByTypeInLast24Hours(StockMovementType type, LocalDateTime since) {
        return stockMovementRepository.countByTypeAndDateAfter(type, since);
    }

    // Count of stock movements grouped by username in the last 24 hours
    public List<UsernameCount> countStockMovementsByUsernameInLast24Hours(LocalDateTime since) {
        return stockMovementRepository.countByUsernameAfter(since);
    }

    // Stock movements in the last 7 days grouped by day
    public List<Pair<LocalDateTime, Long>> stockMovementsLast7Days(StockMovementType type) {
        LocalDateTime now = LocalDateTime.now();
        return Arrays.stream(new int[]{6,5,4,3,2,1,0})
                .mapToObj(i -> {
                    LocalDateTime start = now.minusDays(i).withHour(0).withMinute(0).withSecond(0).withNano(0);
                    LocalDateTime end = start.plusDays(1);
                    return Pair.of(start,stockMovementRepository.countByTypeAndDateBetween(type, start, end));
                })
                .toList();
    }

    public Map<Category, Long> countMovementsByCategory() {
        return Arrays.stream(Category.values())
                .collect(java.util.stream.Collectors.toMap(
                        category -> category,
                        category -> stockMovementRepository.countByProductCategory(category)
                ));
    }

    public long count(){ return stockMovementRepository.count(); }

    public void deleteAll(){ stockMovementRepository.deleteAll(); }
}
