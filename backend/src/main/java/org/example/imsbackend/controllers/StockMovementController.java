package org.example.imsbackend.controllers;

import lombok.RequiredArgsConstructor;
import org.example.imsbackend.dto.StockMovementFilter;
import org.example.imsbackend.models.StockMovement;
import org.example.imsbackend.services.StockMovementService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Validated
@RequestMapping("/api/v1/stock-movements")
@RequiredArgsConstructor
public class StockMovementController {
    private final StockMovementService stockMovementService;

    @GetMapping("/")
    public ResponseEntity<Page<StockMovement>> getAllStockMovements(@ModelAttribute StockMovementFilter filter) {
        Page<StockMovement> stockMovements = stockMovementService.getAllStockMovements(filter);
        return ResponseEntity.ok(stockMovements);
    }
}
