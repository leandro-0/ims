package org.example.imsbackend.steps;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.cucumber.datatable.DataTable;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;

import org.example.imsbackend.dto.LowStockNotificationFilter;
import org.example.imsbackend.dto.StockMovementFilter;
import org.example.imsbackend.enums.Category;
import org.example.imsbackend.enums.StockMovementAction;
import org.example.imsbackend.enums.StockMovementType;
import org.example.imsbackend.models.LowStockNotification;
import org.example.imsbackend.models.Product;
import org.example.imsbackend.models.ProductName;
import org.example.imsbackend.models.StockMovement;
import org.example.imsbackend.services.LowStockNotificationService;
import org.example.imsbackend.services.ProductService;
import org.example.imsbackend.services.StockMovementService;
import org.junit.jupiter.api.Assertions;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.*;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.function.Consumer;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Transactional
public class StepDefinitions {

    @LocalServerPort
    private int port;
    private ResponseEntity<String> lastResponse;
    private TestRestTemplate restTemplate = new TestRestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private String currentToken;
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SS");
    // Product elements
    private String baseProductUrl;
    private final ProductService productService;
    private List<Product> createdProducts = new ArrayList<>();
    private Product lastCreatedProduct;
    // LowStockNotification elements
    private String baseLowStockNotificationUrl;
    private final LowStockNotificationService lowStockNotificationService;
    private List<LowStockNotification> createdNotifications = new ArrayList<>();
    private LowStockNotification lastCreatedNotification;
    // StockMovement elements
    private String baseStockMovementUrl;
    private final StockMovementService stockMovementService;
    private List<StockMovement> createdMovements = new ArrayList<>();
    private StockMovement lastCreatedMovement;

    public StepDefinitions(ProductService productService, LowStockNotificationService lowStockNotificationService, StockMovementService stockMovementService) {
        this.productService = productService;
        this.lowStockNotificationService = lowStockNotificationService;
        this.stockMovementService = stockMovementService;
    }
    /* Helper methods */
    // General Helper methods
    private void setIfNotEmpty(Map<String, String> data, String key, Consumer<String> setter) {
        String value = data.get(key);
        if (value != null && !value.trim().isEmpty()) {
            setter.accept(value);
        }
    }

    private Map<String, Object> getResponseMap() {
        try {
            return objectMapper.readValue(lastResponse.getBody(), Map.class);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to parse response", e);
        }
    }
    // Helper product methods
    private Product createProductFromData(Map<String, String> data) {
        Product product = new Product();
    
        setIfNotEmpty(data, "name", product::setName);
        setIfNotEmpty(data, "description", product::setDescription);
        setIfNotEmpty(data, "price", value -> product.setPrice(Double.parseDouble(value)));
        setIfNotEmpty(data, "initialStock", value -> product.setInitialStock(Integer.parseInt(value)));
        setIfNotEmpty(data, "minimumStock", value -> product.setMinimumStock(Integer.parseInt(value)));
        setIfNotEmpty(data, "stock", value -> product.setStock(Integer.parseInt(value)));
        setIfNotEmpty(data, "category", value -> {
            try {
                product.setCategory(Category.valueOf(value));
            } catch (IllegalArgumentException e) {
                // Invalid category - will be handled by validation
            }
        });
    
        return product;
    }

    private Product createValidProduct() {
        Product product = new Product();
        product.setName("Test Product");
        product.setDescription("Test Description");
        product.setPrice(99.99);
        product.setMinimumStock(25);
        product.setInitialStock(50);
        product.setStock(50);
        product.setCategory(Category.ELECTRONICS);
        return product;
    }

    private HttpEntity<Product> getRequest(Product product) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        return new HttpEntity<>(product, headers);
    }

    private void deleteProduct(UUID productId) {
        String url = baseProductUrl + "/" + productId;
        lastResponse = restTemplate.exchange(url, HttpMethod.DELETE, null, String.class);
    }

    private ResponseEntity<String> updateProduct(Product product, UUID id) {
        final var request = getRequest(product);
        String url = baseProductUrl + "/" + id;
        return restTemplate.exchange(url, HttpMethod.PUT, request, String.class);
    }

    private Product checkProductResponse(ResponseEntity<String> response, boolean addToCreatedProducts) {
        try {
            Product product = objectMapper.readValue(response.getBody(), Product.class);
            if (addToCreatedProducts) createdProducts.add(product);
            return product;
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to parse created product", e);
        }
    }

    private String buildFilterUrl(Map<String, String> filters) {
        List<String> queryParams = new ArrayList<>();
        
        addFilterParam(queryParams, filters, "name", "name");
        addFilterParam(queryParams, filters, "category", "categories");
        addFilterParam(queryParams, filters, "minPrice", "minPrice");
        addFilterParam(queryParams, filters, "maxPrice", "maxPrice");
        

        String filterEndpoint = baseProductUrl + "/search";
        return queryParams.isEmpty() ? filterEndpoint : filterEndpoint + "?" + String.join("&", queryParams);
    }

    private void addFilterParam(List<String> queryParams, Map<String, String> filters, String filterKey, String paramName) {
        if (filters.containsKey(filterKey) && !filters.get(filterKey).isEmpty()) {
            queryParams.add(paramName + "=" + filters.get(filterKey));
        }
    }

    private List<Map<String, Object>> getProductsFromResponse() {
        Map<String, Object> responseMap = getResponseMap();
        return (List<Map<String, Object>>) responseMap.get("content");
    }

    private void validateAllProducts(Consumer<Map<String, Object>> validator) {
        List<Map<String, Object>> products = getProductsFromResponse();
        products.forEach(validator);
    }

    // LowStockNotification Helper methods
    private void createLowStockNotification(Map<String, String> data) {
        LowStockNotification notification = new LowStockNotification();
        notification.setDate(LocalDateTime.parse(data.get("date"), DATE_TIME_FORMATTER));
        notification.setProduct(new ProductName(UUID.randomUUID(), data.get("productName")));
        notification.setCurrentStock(Integer.parseInt(data.get("currentStock")));
        notification.setMinimumStock(Integer.parseInt(data.get("minimumStock")));
        lastCreatedNotification = lowStockNotificationService.save(notification);
        createdNotifications.add(lastCreatedNotification);
    }

    private String buildLowStockNotificationUrl(String path) {
        return String.format(baseLowStockNotificationUrl, port, path);
    }

    // StockMovement Helper methods
    private void createStockMovement(Map<String, String> data) {
        StockMovement movement = new StockMovement();
        movement.setType(StockMovementType.valueOf(data.get("type")));
        movement.setQuantity(Integer.parseInt(data.get("quantity")));
        movement.setAction(StockMovementAction.valueOf(data.get("action")));
        movement.setUsername(data.get("username"));
        movement.setDate(LocalDateTime.parse(data.get("date"), DATE_TIME_FORMATTER));
        movement.setProduct(new ProductName(UUID.randomUUID(), data.get("product")));
        lastCreatedMovement = stockMovementService.save(movement);
        createdMovements.add(lastCreatedMovement);
    }

    private String buildStockMomeventUrl(String path) {
        return String.format(baseStockMovementUrl, port, path);
    }

    /* General Steps */
    //Given steps
    @Given("the system is ready")
    public void theSystemIsReady() {
        baseProductUrl = "http://localhost:" + port + "/api/v1/products";
        baseLowStockNotificationUrl = "http://localhost:" + port + "/api/v1/low-stock-notifications";
        baseStockMovementUrl = "http://localhost:" + port + "/api/v1/stock-movements";
    }

    @Given("I am an anonymous user")
    public void IAmAnAnonymousUser() {
        currentToken = null;
        restTemplate.getRestTemplate().getInterceptors().clear();
    }

    @Given("I am an authenticated user with credentials {string} and {string}")
    public void IAmAnAuthenticatedUserWithCredentials(String username, String password) {
        if (currentToken != null)
            return;

        String authUrl = "http://localhost:7080/realms/ims-realm/protocol/openid-connect/token";
        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("grant_type", "password");
        body.add("username", username);
        body.add("password", password);
        body.add("client_id", "ims");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);
        ResponseEntity<Map> response = restTemplate.postForEntity(authUrl, request, Map.class);

        if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
            currentToken = (String) response.getBody().get("access_token");
            restTemplate.getRestTemplate().getInterceptors().add((request1, body1, execution) -> {
                request1.getHeaders().setBearerAuth(currentToken);
                return execution.execute(request1, body1);
            });
        } else {
            throw new RuntimeException("Failed to authenticate user");
        }
    }
    // When steps

    // Then steps
    @Then("I should receive a {int} response")
    public void iShouldReceiveAResponse(int expectedStatus) {
        Assertions.assertEquals(expectedStatus, lastResponse.getStatusCode().value());
    }

    @Then("the pagination information should indicate page {int}")
    public void thePaginationInformationShouldIndicatePage(int expectedPage) {
        Map<String, Object> responseMap = getResponseMap();
        Integer currentPage = (Integer) responseMap.get("number");
        Assertions.assertEquals(expectedPage, currentPage.intValue());
    }

    @Then("the total elements should be {int}")
    public void theTotalElementsShouldBe(int expectedTotal) {
        Map<String, Object> responseMap = getResponseMap();
        Integer totalElements = (Integer) responseMap.get("totalElements");
        Assertions.assertEquals(expectedTotal, totalElements.intValue());
    }

    /* Product Steps */
    // Given steps

    @Given("the database is clean")
    public void theDatabaseIsClean() {
        // Clean products
        productService.deleteAllProducts();
        createdProducts.clear();
        lastCreatedProduct = null;
        // Clean low stock notifications
        lowStockNotificationService.deleteAll();
        createdNotifications.clear();
        lastCreatedNotification = null;
        // Clean stock movements
        stockMovementService.deleteAll();
        createdMovements.clear();
        lastCreatedMovement = null;
    }

    @When("I create a product with the following details:")
    public void iCreateAProductWithTheFollowingDetails(DataTable dataTable) {
        Map<String, String> productData = dataTable.asMap();
        Product product = createProductFromData(productData);
        final var request = getRequest(product);
        lastResponse = restTemplate.postForEntity(baseProductUrl, request, String.class);
        
        if (lastResponse.getStatusCode().is2xxSuccessful()) {
            lastCreatedProduct = checkProductResponse(lastResponse, true);
        }
    }

    @Given("the following products exist:")
    public void theFollowingProductsExist(DataTable dataTable) {
        IAmAnAuthenticatedUserWithCredentials("admin@example.com", "admin1");
        List<Map<String, String>> productDataList = dataTable.asMaps();
        
        for (Map<String, String> productData : productDataList) {
            Product product = createProductFromData(productData);
            final var request = getRequest(product);
            ResponseEntity<String> response = restTemplate.postForEntity(baseProductUrl, request, String.class);
            
            if (response.getStatusCode().is2xxSuccessful()) {
                checkProductResponse(response, true);
            }
        }

        IAmAnAnonymousUser();
    }

    @Given("a product exists with the following details:")
    public void aProductExistsWithTheFollowingDetails(DataTable dataTable) {
        boolean initiallyAuthenticated = currentToken != null;
        if (!initiallyAuthenticated) {
            IAmAnAuthenticatedUserWithCredentials("admin@example.com", "admin1");
        }
        Map<String, String> productData = dataTable.asMap();
        Product product = createProductFromData(productData);
        
        final var request = getRequest(product);
        ResponseEntity<String> response = restTemplate.postForEntity(baseProductUrl, request, String.class);
        
        if (response.getStatusCode().is2xxSuccessful()) {
            lastCreatedProduct = checkProductResponse(response, true);
        }

        if (!initiallyAuthenticated)
            IAmAnAnonymousUser();
    }

    @Given("{int} products exist in the system")
    public void productsExistInTheSystem(int count) {
        for (int i = 1; i <= count; i++) {
            Product product = createValidProduct();
            product.setName("Product " + i);
            product.setDescription("Description for product " + i);
            product.setPrice(50.0 + (i * 10));
            
            final var request = getRequest(product);
            ResponseEntity<String> response = restTemplate.postForEntity(baseProductUrl, request, String.class);
            
            if (response.getStatusCode().is2xxSuccessful()) {
                checkProductResponse(response, true);
            }
        }
    }

    // When steps
    @When("I retrieve all products")
    public void iRetrieveAllProducts() {
        lastResponse = restTemplate.getForEntity(baseProductUrl + "/search", String.class);
    }

    @When("I filter products by name {string}")
    public void iFilterProductsByName(String name) {
        String url = baseProductUrl + "/search" + "?name=" + name;
        lastResponse = restTemplate.getForEntity(url, String.class);
    }

    @When("I filter products by category {string}")
    public void iFilterProductsByCategory(String category) {
        String url = baseProductUrl + "/search" + "?categories=" + category;
        lastResponse = restTemplate.getForEntity(url, String.class);
    }

    @When("I filter products with price range from {double} to {double}")
    public void iFilterProductsWithPriceRangeFromTo(double minPrice, double maxPrice) {
        String url = baseProductUrl + "/search" + "?minPrice=" + minPrice + "&maxPrice=" + maxPrice;
        lastResponse = restTemplate.getForEntity(url, String.class);
    }

    @When("I retrieve products with page {int} and size {int}")
    public void iRetrieveProductsWithPageAndSize(int page, int size) {
        String url = baseProductUrl + "/search" + "?page=" + page + "&size=" + size;
        lastResponse = restTemplate.getForEntity(url, String.class);
    }

    @When("I filter products with:")
    public void iFilterProductsWith(DataTable dataTable) {
        Map<String, String> filters = dataTable.asMap();
        String url = buildFilterUrl(filters);
        lastResponse = restTemplate.getForEntity(url, String.class);
    }

    @When("I retrieve the product by its ID")
    public void iRetrieveTheProductByItsId() {
        if (lastCreatedProduct == null) {
            throw new IllegalStateException("No product has been created yet to retrieve.");
        }
        String url = baseProductUrl + "/" + lastCreatedProduct.getId() + "/details";
        lastResponse = restTemplate.getForEntity(url, String.class);
    }

    @When("I retrieve a product with a non-existent ID")
    public void iRetrieveAProductWithANonExistentId() {
        String url = baseProductUrl + "/" + UUID.randomUUID() + "/details";
        lastResponse = restTemplate.getForEntity(url, String.class);
    }

    @When("I update the product with the following details:")
    public void iUpdateTheProductWithTheFollowingDetails(DataTable dataTable) {
        if (lastCreatedProduct == null) {
            throw new IllegalStateException("No product has been created yet to update.");
        }

        Map<String, String> productData = dataTable.asMap();
        Product updatedProduct = createProductFromData(productData);
        updatedProduct.setId(lastCreatedProduct.getId());
        
        lastResponse = updateProduct(updatedProduct, lastCreatedProduct.getId());
        
        if (lastResponse.getStatusCode().is2xxSuccessful()) {
            lastCreatedProduct = checkProductResponse(lastResponse, false);
        }
    }

    @When("I update a product with a non-existent ID")
    public void iUpdateAProductWithANonExistentId() {
        Product product = createValidProduct();
        lastResponse = updateProduct(product, UUID.randomUUID());
    }

    @When("I delete the product")
    public void iDeleteTheProduct() {
        if (lastCreatedProduct == null) {
            throw new IllegalStateException("No product has been created yet to delete.");
        }
        deleteProduct(lastCreatedProduct.getId());
    }

    @When("I delete a product with a non-existent ID")
    public void iDeleteAProductWithANonExistentId() {
        deleteProduct(UUID.randomUUID());
    }

    // Then steps
    @Then("I should receive {int} products")
    public void iShouldReceiveProducts(int expectedCount) {
        Map<String, Object> responseMap = getResponseMap();
        int actualCount = responseMap.containsKey("content") 
            ? ((List<Object>) responseMap.get("content")).size()
            : (Integer) responseMap.get("numberOfElements");
            
        Assertions.assertEquals(expectedCount, actualCount);
    }

    @Then("all products should contain {string} in their name")
    public void allProductsShouldContainInTheirName(String expectedText) {
        validateAllProducts(product -> {
            String name = (String) product.get("name");
            Assertions.assertTrue(name.toLowerCase().contains(expectedText.toLowerCase()));
        });
    }

    @Then("all products should have category {string}")
    public void allProductsShouldHaveCategory(String expectedCategory) {
        validateAllProducts(product -> {
            String category = (String) product.get("category");
            Assertions.assertEquals(expectedCategory, category);
        });
    }

    @Then("all products should have price between {double} and {double}")
    public void allProductsShouldHavePriceBetween(double minPrice, double maxPrice) {
        validateAllProducts(product -> {
            Double price = (Double) product.get("price");
            Assertions.assertTrue(price >= minPrice && price <= maxPrice);
        });
    }

    @Then("the product details should match the created product")
    public void theProductDetailsShouldMatchTheCreatedProduct() {
        try {
            Product retrievedProduct = objectMapper.readValue(lastResponse.getBody(), Product.class);
            Assertions.assertEquals(lastCreatedProduct.getId(), retrievedProduct.getId());
            Assertions.assertEquals(lastCreatedProduct.getName(), retrievedProduct.getName());
            Assertions.assertEquals(lastCreatedProduct.getDescription(), retrievedProduct.getDescription());
            Assertions.assertEquals(lastCreatedProduct.getPrice(), retrievedProduct.getPrice());
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to parse response", e);
        }
    }

    /* LowStockNotification  */
    // Given steps
    @Given("the following low stock notifications exist:")
    public void theFollowingLowStockNotificationsExist(DataTable dataTable) {
        baseLowStockNotificationUrl = buildLowStockNotificationUrl("/low-stock-notifications");
        List<Map<String, String>> notifications = dataTable.asMaps();
        notifications.forEach(this::createLowStockNotification);
    }

    // When steps
    @When("I retrieve low stock notifications with page {int} and size {int}")
    public void iRetrieveLowStockNotificationsWithPageAndSize(int page, int size) {
        String url = String.format("%s?page=%d&size=%d", baseLowStockNotificationUrl, page, size);
        lastResponse = restTemplate.getForEntity(url, String.class);
    }

    // Then steps
    @Then("I should receive {int} notifications")
    public void iShouldReceiveNotifications(int expectedCount) {
        assertNotNull(lastResponse);
        assertNotNull(lastResponse.getBody());

        Map<String, Object> responseMap = getResponseMap();
        List<Map<String, Object>> content = (List<Map<String, Object>>) responseMap.get("content");
        assertEquals(expectedCount, content.size());
    }

    @Then("a low stock notification should be created with:")
    public void aLowStockNotificationShouldBeCreatedWith(DataTable dataTable) {
        Map<String, String> expectedData = dataTable.asMap();
        List<LowStockNotification> notifications = lowStockNotificationService.findAll(new LowStockNotificationFilter(0,1)).getContent();

        // Get the latest notification
        LowStockNotification latestNotification = notifications.getFirst();
        // print for debugging
        System.out.println("Latest Notification stock: " + latestNotification.getCurrentStock());
        System.out.println("Expected stock: " + expectedData.get("currentStock"));

        assertEquals(Integer.parseInt(expectedData.get("currentStock")), latestNotification.getCurrentStock());
        assertEquals(Integer.parseInt(expectedData.get("minimumStock")), latestNotification.getMinimumStock());
        assertEquals(expectedData.get("productName"), latestNotification.getProduct().getName());
        assertNotNull(latestNotification.getDate());
    }

    @Then("no low stock notification should be created")
    public void noLowStockNotificationShouldBeCreated() {
        // Store initial notification count
        long initialCount = lowStockNotificationService.count();

        // Wait a small amount of time for any async operations
        try {
            Thread.sleep(100);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        // Verify no new notifications were created
        assertEquals(initialCount, lowStockNotificationService.count());
    }

    /* StockMovement */
    // Given steps
    @Given("the following stock movements exist:")
    public void theFollowingStockMovementsExist(DataTable dataTable) {
        baseStockMovementUrl = buildStockMomeventUrl("/stock-movements");
        List<Map<String, String>> movements = dataTable.asMaps();
        movements.forEach(this::createStockMovement);
    }
    // When steps
    @When("I retrieve stock movements with page {int} and size {int}")
    public void iRetrieveStockMovementsWithPageAndSize(int page, int size) {
        String url = String.format("%s?page=%d&size=%d", baseStockMovementUrl, page, size);
        lastResponse = restTemplate.getForEntity(url, String.class);
    }

    // Then steps
    @Then("I should receive {int} stock movements")
    public void iShouldReceiveStockMovements(int expectedCount) {
        assertNotNull(lastResponse);
        assertNotNull(lastResponse.getBody());

        Map<String, Object> responseMap = getResponseMap();
        List<Map<String, Object>> content = (List<Map<String, Object>>) responseMap.get("content");
        assertEquals(expectedCount, content.size());
    }

    @Then("a stock movement should be created with:")
    public void aStockMovementShouldBeCreatedWith(DataTable dataTable) {
        Map<String, String> expectedData = dataTable.asMap();
        List<StockMovement> movements = stockMovementService.getAllStockMovements(new StockMovementFilter(0, 1)).getContent();

        // Get the latest movement
        StockMovement latestMovement = movements.getFirst();

        assertEquals(StockMovementType.valueOf(expectedData.get("type")), latestMovement.getType());
        assertEquals(Integer.parseInt(expectedData.get("quantity")), latestMovement.getQuantity());
        assertEquals(StockMovementAction.valueOf(expectedData.get("action")), latestMovement.getAction());
        assertEquals(expectedData.get("username"), latestMovement.getUsername());
        assertNotNull(latestMovement.getDate());
    }
}
