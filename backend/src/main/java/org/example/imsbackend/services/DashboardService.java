package org.example.imsbackend.services;

import lombok.RequiredArgsConstructor;
import org.example.imsbackend.dto.StatsData;
import org.example.imsbackend.dto.StockMovementFilter;
import org.example.imsbackend.dto.UsernameCount;
import org.example.imsbackend.enums.StockMovementType;
import org.example.imsbackend.models.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.util.Pair;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@RequiredArgsConstructor
@Service
public class DashboardService {
    private final StockMovementService stockMovementService;
    private final ProductService productService;

    public StatsData getStats() {
        StatsData statsData = new StatsData();
        statsData.setSummary(getSummary());
        statsData.setCategoriesDistribution(getCategoriesDistribution());
        statsData.setCategoriesMovement(getCategoriesMovement());
        statsData.setMovementsLast24Hours(getStockMovementLast24Hours());
        statsData.setMovementsLast7Days(getStockMovementLast7Days());
        return statsData;
    }

    // products bellow min stock
    public Page<Product> getProductsBelowMinStock(StockMovementFilter filter) {
        return productService.productsBelowMinimumStock(filter);
    }

    //Summary
    private StatsData.Summary getSummary(){
        long totalProducts = productService.countProducts();
        long totalStock = productService.totalStock();
        double totalValue = productService.totalInventoryValue();
        return new StatsData.Summary(totalProducts, totalStock, totalValue);
    }

    //Categories distribution
    private List<StatsData.ObjectCount> getCategoriesDistribution(){
        return productService.countProductsByCategory().entrySet().stream()
                .map(entry -> new StatsData.ObjectCount(entry.getKey().getDisplayName(), entry.getValue()))
                .toList();
    }

    //Categories movement
    private List<StatsData.ObjectCount> getCategoriesMovement(){
        return stockMovementService.countMovementsByCategory().entrySet().stream()
                .map(entry -> new StatsData.ObjectCount(entry.getKey().getDisplayName(), entry.getValue()))
                .toList();
    }

    // Movements last 24 hours
    private StatsData.MovementsLast24Hours getStockMovementLast24Hours(){
        long in = stockMovementService.countStockMovementsByTypeInLast24Hours(StockMovementType.INCOMING, LocalDateTime.now());
        long out = stockMovementService.countStockMovementsByTypeInLast24Hours(StockMovementType.OUTGOING, LocalDateTime.now());
        List<UsernameCount> usernameCounts = stockMovementService.countStockMovementsByUsernameInLast24Hours(LocalDateTime.now());
        //just top 3
        if (usernameCounts.size() > 3) {
            usernameCounts = usernameCounts.subList(0, 3);
        }
        List<StatsData.ObjectCount> topUsers = usernameCounts.stream()
                .map(uc -> new StatsData.ObjectCount(uc.getUsername(), uc.getCount()))
                .toList();
        return new StatsData.MovementsLast24Hours(in, out, topUsers);
    }

    // Movements last 7 days
    private StatsData.MovementsLast7Days getStockMovementLast7Days(){
        List<Pair<LocalDateTime, Long>> in = stockMovementService.stockMovementsLast7Days(StockMovementType.INCOMING);
        List<Pair<LocalDateTime, Long>> out = stockMovementService.stockMovementsLast7Days(StockMovementType.OUTGOING);
        List<StatsData.MovementCount> inCounts = in.stream()
                .map(pair -> new StatsData.MovementCount(pair.getFirst(), pair.getSecond()))
                .toList();
        List<StatsData.MovementCount> outCounts = out.stream()
                .map(pair -> new StatsData.MovementCount(pair.getFirst(), pair.getSecond()))
                .toList();
        return new StatsData.MovementsLast7Days(inCounts, outCounts);
    }
}
