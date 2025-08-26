package org.example.imsbackend.services;

import org.example.imsbackend.enums.Category;
import org.example.imsbackend.enums.StockMovementAction;
import org.example.imsbackend.enums.StockMovementType;
import org.example.imsbackend.models.Product;
import org.example.imsbackend.models.ProductName;
import org.example.imsbackend.models.StockMovement;
import org.example.imsbackend.repositories.StockMovementRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.util.Pair;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.any;
import static org.junit.jupiter.api.Assertions.*;
import org.example.imsbackend.dto.StockMovementFilter;

import org.example.imsbackend.dto.UsernameCount;

@ExtendWith(MockitoExtension.class)
public class StockMovementServiceTest {
    @Mock
    private StockMovementRepository stockMovementRepository;

    @InjectMocks
    private StockMovementService stockMovementService;

    //test objects
    Product product1, product2;
    StockMovement movement1, movement2;
    String testUsername = "testUser";

    Product createTestProduct(String name, Category category, double price, int stock, int minimumStock) {
        Product product = new Product();
        product.setId(UUID.randomUUID());
        product.setName(name);
        product.setCategory(category);
        product.setPrice(price);
        product.setStock(stock);
        product.setInitialStock(minimumStock);
        product.setMinimumStock(minimumStock);
        return product;
    }

    StockMovement createTestMovement(Product product, StockMovementType type, int quantity, StockMovementAction action) {
        StockMovement movement = new StockMovement();
        movement.setProduct(new ProductName(product.getId(), product.getName()));
        movement.setType(type);
        movement.setQuantity(quantity);
        movement.setAction(action);
        movement.setUsername(testUsername);
        movement.setDate(LocalDateTime.now());
        return movement;
    }

    @BeforeEach
    void setUp() {
        product1 = createTestProduct("Laptop", Category.ELECTRONICS, 999.99, 50, 10);
        product2 = createTestProduct("Jeans", Category.CLOTHING, 49.99, 200, 20);
        movement1 = createTestMovement(product1, StockMovementType.INCOMING, 10, StockMovementAction.INSERTED);
        movement2 = createTestMovement(product2, StockMovementType.OUTGOING, 5, StockMovementAction.UPDATED);
        Mockito.reset(stockMovementRepository);
    }

    @Test
    void save_ValidMovement_ShouldSaveAndReturnMovement() {
        when(stockMovementRepository.save(movement1)).thenReturn(movement1);

        StockMovement result = stockMovementService.save(movement1);

        assertEquals(movement1, result);
        verify(stockMovementRepository).save(movement1);
    }

    @Test
    void getAllStockMovements_ShouldReturnPagedResults() {
        StockMovementFilter filter = new StockMovementFilter();
        filter.setPage(0);
        filter.setSize(10);

        when(stockMovementRepository.findAllByOrderByDateDesc(any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(movement1, movement2)));

        Page<StockMovement> result = stockMovementService.getAllStockMovements(filter);

        assertEquals(2, result.getTotalElements());
        assertTrue(result.getContent().contains(movement1));
        assertTrue(result.getContent().contains(movement2));
    }

    @Test
    void calculateStockMovement_Insert_ShouldCreateIncomingMovement() {
        StockMovement result = StockMovementService.calculateStockMovement(
                null, 
                product1, 
                StockMovementAction.INSERTED,
                testUsername
        );

        assertNotNull(result);
        assertEquals(StockMovementType.INCOMING, result.getType());
        assertEquals(product1.getStock(), result.getQuantity());
        assertEquals(testUsername, result.getUsername());
    }

    @Test
    void calculateStockMovement_Delete_ShouldCreateOutgoingMovement() {
        StockMovement result = StockMovementService.calculateStockMovement(
                product1,
                product1,
                StockMovementAction.DELETED,
                testUsername
        );

        assertNotNull(result);
        assertEquals(StockMovementType.OUTGOING, result.getType());
        assertEquals(product1.getStock(), result.getQuantity());
        assertEquals(testUsername, result.getUsername());
    }

    @Test
    void calculateStockMovement_Update_WithIncrease_ShouldCreateIncomingMovement() {
        Product newProduct = createTestProduct("Laptop", Category.ELECTRONICS, 999.99, 60, 10);
        newProduct.setId(product1.getId());

        StockMovement result = StockMovementService.calculateStockMovement(
                product1,
                newProduct,
                StockMovementAction.UPDATED,
                testUsername
        );

        assertNotNull(result);
        assertEquals(StockMovementType.INCOMING, result.getType());
        assertEquals(10, result.getQuantity()); // 60 - 50 = 10
        assertEquals(testUsername, result.getUsername());
    }

    @Test
    void countStockMovementsByTypeInLast24Hours_ShouldReturnCount() {
        LocalDateTime since = LocalDateTime.now().minusHours(24);
        when(stockMovementRepository.countByTypeAndDateAfter(StockMovementType.INCOMING, since))
                .thenReturn(5L);

        long result = stockMovementService.countStockMovementsByTypeInLast24Hours(StockMovementType.INCOMING, since);

        assertEquals(5L, result);
    }

    @Test
    void countStockMovementsByUsernameInLast24Hours_ShouldReturnUserCounts() {
        LocalDateTime since = LocalDateTime.now().minusHours(24);
        List<UsernameCount> expected = List.of(
                new UsernameCountImpl("user1", 5L),
                new UsernameCountImpl("user2", 3L)
        );

        when(stockMovementRepository.countByUsernameAfter(since))
                .thenReturn(expected);

        List<UsernameCount> result = stockMovementService.countStockMovementsByUsernameInLast24Hours(since);

        assertEquals(expected.size(), result.size());
        assertEquals(expected.getFirst().getUsername(), result.getFirst().getUsername());
        assertEquals(expected.getFirst().getCount(), result.getFirst().getCount());
    }

    @Test
    void stockMovementsLast7Days_ShouldReturnDailyCounts() {
        when(stockMovementRepository.countByTypeAndDateBetween(eq(StockMovementType.INCOMING), any(), any()))
                .thenReturn(5L);

        List<Pair<LocalDateTime, Long>> result = stockMovementService.stockMovementsLast7Days(StockMovementType.INCOMING);

        assertEquals(7, result.size());
        result.forEach(pair -> {
            assertNotNull(pair.getFirst());
            assertEquals(5L, pair.getSecond());
        });
    }

    @Test
    void countMovementsByCategory_ShouldReturnCategoryCounts() {
        when(stockMovementRepository.countByProductCategory(any())).thenReturn(0L);
        when(stockMovementRepository.countByProductCategory(Category.ELECTRONICS)).thenReturn(10L);
        when(stockMovementRepository.countByProductCategory(Category.CLOTHING)).thenReturn(5L);

        Map<Category, Long> result = stockMovementService.countMovementsByCategory();

        assertEquals(10L, result.get(Category.ELECTRONICS));
        assertEquals(5L, result.get(Category.CLOTHING));
    }

    public class UsernameCountImpl implements UsernameCount {
        private final String username;
        private final Long count;

        public UsernameCountImpl(String username, Long count) {
            this.username = username;
            this.count = count;
        }

        @Override
        public String getUsername() {
            return username;
        }

        @Override
        public Long getCount() {
            return count;
        }
    }
}
