package org.example.imsbackend.steps;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.cucumber.datatable.DataTable;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;

import org.example.imsbackend.enums.Category;
import org.example.imsbackend.models.Product;
import org.example.imsbackend.services.ProductService;
import org.junit.jupiter.api.Assertions;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.http.*;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

import java.util.*;
import java.util.function.Consumer;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Transactional
public class ProductStepDefinitions {

    @LocalServerPort
    private int port;

    private TestRestTemplate restTemplate = new TestRestTemplate();
    private ObjectMapper objectMapper = new ObjectMapper();

    private final ProductService productService;

    private ResponseEntity<String> lastResponse;
    private List<Product> createdProducts = new ArrayList<>();
    private Product lastCreatedProduct;
    private String baseUrl;
    private String currentToken;

    public ProductStepDefinitions(ProductService productService) {
        this.productService = productService;
    }

    // region Helpers methods
    private void setIfNotEmpty(Map<String, String> data, String key, Consumer<String> setter) {
        String value = data.get(key);
        if (value != null && !value.trim().isEmpty()) {
            setter.accept(value);
        }
    }

    private Product createProductFromData(Map<String, String> data) {
        Product product = new Product();
    
        setIfNotEmpty(data, "name", product::setName);
        setIfNotEmpty(data, "description", product::setDescription);
        setIfNotEmpty(data, "price", value -> product.setPrice(Double.parseDouble(value)));
        setIfNotEmpty(data, "initialStock", value -> product.setInitialStock(Integer.parseInt(value)));
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
        String url = baseUrl + "/" + productId;
        lastResponse = restTemplate.exchange(url, HttpMethod.DELETE, null, String.class);
    }

    private ResponseEntity<String> updateProduct(Product product, UUID id) {
        final var request = getRequest(product);
        String url = baseUrl + "/" + id;
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
        

        String filterEndpoint = baseUrl + "/search";
        return queryParams.isEmpty() ? filterEndpoint : filterEndpoint + "?" + String.join("&", queryParams);
    }

    private void addFilterParam(List<String> queryParams, Map<String, String> filters, String filterKey, String paramName) {
        if (filters.containsKey(filterKey) && !filters.get(filterKey).isEmpty()) {
            queryParams.add(paramName + "=" + filters.get(filterKey));
        }
    }

    private Map<String, Object> getResponseMap() {
        try {
            return objectMapper.readValue(lastResponse.getBody(), Map.class);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to parse response", e);
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
    // endregion

    @Given("the system is ready")
    public void theSystemIsReady() {
        baseUrl = "http://localhost:" + port + "/api/v1/products";
    }

    @Given("the database is clean")
    public void theDatabaseIsClean() {
        productService.deleteAllProducts();
        createdProducts.clear();
        lastCreatedProduct = null;
    }

    @When("I create a product with the following details:")
    public void iCreateAProductWithTheFollowingDetails(DataTable dataTable) {
        Map<String, String> productData = dataTable.asMap();
        Product product = createProductFromData(productData);
        final var request = getRequest(product);
        lastResponse = restTemplate.postForEntity(baseUrl, request, String.class);
        
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
            ResponseEntity<String> response = restTemplate.postForEntity(baseUrl, request, String.class);
            
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
        ResponseEntity<String> response = restTemplate.postForEntity(baseUrl, request, String.class);
        
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
            ResponseEntity<String> response = restTemplate.postForEntity(baseUrl, request, String.class);
            
            if (response.getStatusCode().is2xxSuccessful()) {
                checkProductResponse(response, true);
            }
        }
    }

    @When("I retrieve all products")
    public void iRetrieveAllProducts() {
        lastResponse = restTemplate.getForEntity(baseUrl + "/search", String.class);
    }

    @When("I filter products by name {string}")
    public void iFilterProductsByName(String name) {
        String url = baseUrl + "/search" + "?name=" + name;
        lastResponse = restTemplate.getForEntity(url, String.class);
    }

    @When("I filter products by category {string}")
    public void iFilterProductsByCategory(String category) {
        String url = baseUrl + "/search" + "?categories=" + category;
        lastResponse = restTemplate.getForEntity(url, String.class);
    }

    @When("I filter products with price range from {double} to {double}")
    public void iFilterProductsWithPriceRangeFromTo(double minPrice, double maxPrice) {
        String url = baseUrl + "/search" + "?minPrice=" + minPrice + "&maxPrice=" + maxPrice;
        lastResponse = restTemplate.getForEntity(url, String.class);
    }

    @When("I retrieve products with page {int} and size {int}")
    public void iRetrieveProductsWithPageAndSize(int page, int size) {
        String url = baseUrl + "/search" + "?page=" + page + "&size=" + size;
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
        String url = baseUrl + "/" + lastCreatedProduct.getId() + "/details";
        lastResponse = restTemplate.getForEntity(url, String.class);
    }

    @When("I retrieve a product with a non-existent ID")
    public void iRetrieveAProductWithANonExistentId() {
        String url = baseUrl + "/" + UUID.randomUUID().toString() + "/details";
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

    @Then("I should receive a {int} response")
    public void iShouldReceiveAResponse(int expectedStatus) {
        Assertions.assertEquals(expectedStatus, lastResponse.getStatusCode().value());
    }

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
}
