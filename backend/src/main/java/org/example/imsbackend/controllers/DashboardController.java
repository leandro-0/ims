package org.example.imsbackend.controllers;

import lombok.RequiredArgsConstructor;
import org.example.imsbackend.dto.ProductDTO;
import org.example.imsbackend.dto.StatsData;
import org.example.imsbackend.dto.StockMovementFilter;
import org.example.imsbackend.mappers.ProductMapper;
import org.example.imsbackend.models.Product;
import org.example.imsbackend.services.DashboardService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Validated
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController {
    private final DashboardService dashboardService;

    @GetMapping("/stats")
    public ResponseEntity<StatsData> getStats() {
        return ResponseEntity.ok(dashboardService.getStats());
    }

    @GetMapping("/bellow-minimum-stock")
    public  ResponseEntity<Page<ProductDTO>> getProductsBelowMinStock(StockMovementFilter filter) {
        Page<Product> products = dashboardService.getProductsBelowMinStock(filter);
        return ResponseEntity.ok(products.map(ProductMapper.INSTANCE::toDto));
    }
}
