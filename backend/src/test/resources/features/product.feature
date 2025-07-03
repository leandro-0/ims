Feature: Product Management

  Background:
    Given the system is ready
    And the database is clean

  Scenario: Retrieve products with pagination
    Given the following products exist:
      | name      | description   | price | initialStock | stock | category    |
      | Product A | Description A |    50 |          100 |    90 | ELECTRONICS |
      | Product B | Description B |   150 |           50 |    45 | ELECTRONICS |
      | Product C | Description C |   250 |           30 |    25 | ELECTRONICS |
      | Product D | Description D |   250 |           30 |    25 | ELECTRONICS |
      | Product E | Description E |   250 |           30 |    25 | ELECTRONICS |
      | Product F | Description F |   250 |           30 |    25 | ELECTRONICS |
      | Product X | Description X |   250 |           30 |    25 | ELECTRONICS |
      | Product Y | Description Y |   250 |           30 |    25 | ELECTRONICS |
    When I retrieve products with page 1 and size 5
    Then I should receive a 200 response
    And I should receive 3 products
    And the pagination information should indicate page 1
    And the total elements should be 8

  Scenario: Create a new product successfully
    When I create a product with the following details:
      | name         | Electronics Widget             |
      | description  | High-quality electronic device |
      | price        |                         299.99 |
      | initialStock |                            100 |
      | stock        |                            100 |
      | category     | ELECTRONICS                    |
    Then I should receive a 201 response

  Scenario: Create a product with blank name
    When I create a product with the following details:
      | name         |                   |
      | description  | Valid description |
      | price        |             99.99 |
      | initialStock |                50 |
      | stock        |                50 |
      | category     | ELECTRONICS       |
    Then I should receive a 400 response

  Scenario: Create a product with blank description
    When I create a product with the following details:
      | name         | Valid Product Name |
      | description  |                    |
      | price        |              99.99 |
      | initialStock |                 50 |
      | stock        |                 50 |
      | category     | ELECTRONICS        |
    Then I should receive a 400 response

  Scenario: Create a product with negative price
    When I create a product with the following details:
      | name         | Valid Product Name |
      | description  | Valid description  |
      | price        |             -10.50 |
      | initialStock |                 50 |
      | stock        |                 50 |
      | category     | ELECTRONICS        |
    Then I should receive a 400 response

  Scenario: Create a product with null price
    When I create a product with the following details:
      | name         | Valid Product Name |
      | description  | Valid description  |
      | price        |                    |
      | initialStock |                 50 |
      | stock        |                 50 |
      | category     | ELECTRONICS        |
    Then I should receive a 400 response

  Scenario: Create a product with negative initial stock
    When I create a product with the following details:
      | name         | Valid Product Name |
      | description  | Valid description  |
      | price        |              99.99 |
      | initialStock |                 -5 |
      | stock        |                 50 |
      | category     | ELECTRONICS        |
    Then I should receive a 400 response

  Scenario: Create a product with null initial stock
    When I create a product with the following details:
      | name         | Valid Product Name |
      | description  | Valid description  |
      | price        |              99.99 |
      | initialStock |                    |
      | stock        |                 50 |
      | category     | ELECTRONICS        |
    Then I should receive a 400 response

  Scenario: Create a product with negative stock
    When I create a product with the following details:
      | name         | Valid Product Name |
      | description  | Valid description  |
      | price        |              99.99 |
      | initialStock |                 50 |
      | stock        |                -10 |
      | category     | ELECTRONICS        |
    Then I should receive a 400 response

  Scenario: Create a product with null stock
    When I create a product with the following details:
      | name         | Valid Product Name |
      | description  | Valid description  |
      | price        |              99.99 |
      | initialStock |                 50 |
      | stock        |                    |
      | category     | ELECTRONICS        |
    Then I should receive a 400 response

  Scenario: Create a product with invalid category
    When I create a product with the following details:
      | name         | Valid Product Name |
      | description  | Valid description  |
      | price        |              99.99 |
      | initialStock |                 50 |
      | stock        |                 50 |
      | category     | INVALID_CATEGORY   |
    Then I should receive a 400 response

  Scenario: Create a product with null category
    When I create a product with the following details:
      | name         | Valid Product Name |
      | description  | Valid description  |
      | price        |              99.99 |
      | initialStock |                 50 |
      | stock        |                 50 |
      | category     |                    |
    Then I should receive a 400 response

  Scenario: Retrieve all products without filters
    Given the following products exist:
      | name      | description   | price | initialStock | stock | category    |
      | Product 1 | Description 1 |   100 |           50 |    45 | ELECTRONICS |
      | Product 2 | Description 2 |   200 |           30 |    25 | CLOTHING    |
      | Product 3 | Description 3 |   150 |           40 |    35 | TOYS        |
    When I retrieve all products
    Then I should receive a 200 response
    And I should receive 3 products

  Scenario: Retrieve products with name filter
    Given the following products exist:
      | name           | description     | price | initialStock | stock | category    |
      | Laptop Pro     | High-end laptop |  1200 |           10 |     8 | ELECTRONICS |
      | Laptop Basic   | Entry laptop    |   600 |           20 |    15 | ELECTRONICS |
      | Mouse Wireless | Wireless mouse  |    50 |          100 |    95 | ELECTRONICS |
    When I filter products by name "laptop"
    Then I should receive a 200 response
    And I should receive 2 products
    And all products should contain "laptop" in their name

  Scenario: Retrieve products with category filter
    Given the following products exist:
      | name    | description    | price | initialStock | stock | category |
      | T-Shirt | Cotton t-shirt |    25 |          100 |    90 | CLOTHING |
      | Jeans   | Denim jeans    |    60 |           50 |    45 | CLOTHING |
      | Novel   | Fiction book   |    15 |           30 |    28 | TOYS     |
    When I filter products by category "CLOTHING"
    Then I should receive a 200 response
    And I should receive 2 products
    And all products should have category "CLOTHING"

  Scenario: Retrieve products with price range filter
    Given the following products exist:
      | name      | description   | price | initialStock | stock | category    |
      | Product A | Description A |    50 |          100 |    90 | ELECTRONICS |
      | Product B | Description B |   150 |           50 |    45 | ELECTRONICS |
      | Product C | Description C |   250 |           30 |    25 | ELECTRONICS |
    When I filter products with price range from 100 to 200
    Then I should receive a 200 response
    And I should receive 1 products
    And all products should have price between 100 and 200

  Scenario: Retrieve a specific product by ID
    Given a product exists with the following details:
      | name         | Test Product     |
      | description  | Test Description |
      | price        |            99.99 |
      | initialStock |               50 |
      | stock        |               45 |
      | category     | ELECTRONICS      |
    When I retrieve the product by its ID
    Then I should receive a 200 response
    And the product details should match the created product

  Scenario: Retrieve a non-existent product by ID
    When I retrieve a product with a non-existent ID
    Then I should receive a 404 response

  Scenario: Update an existing product
    Given a product exists with the following details:
      | name         | Original Product     |
      | description  | Original Description |
      | price        |               100.00 |
      | initialStock |                   50 |
      | stock        |                   45 |
      | category     | ELECTRONICS          |
    When I update the product with the following details:
      | name         | Updated Product     |
      | description  | Updated Description |
      | price        |              120.00 |
      | initialStock |                  60 |
      | stock        |                  55 |
      | category     | TOYS                |
    Then I should receive a 200 response

  Scenario: Update a non-existent product
    When I update a product with a non-existent ID
    Then I should receive a 404 response

  Scenario: Delete an existing product
    Given a product exists with the following details:
      | name         | Product to Delete |
      | description  | Will be deleted   |
      | price        |             50.00 |
      | initialStock |                20 |
      | stock        |                15 |
      | category     | ELECTRONICS       |
    When I delete the product
    And I should receive a 204 response

  Scenario: Delete a non-existent product
    When I delete a product with a non-existent ID
    Then I should receive a 404 response

  Scenario: Complex filtering with multiple criteria
    Given the following products exist:
      | name          | description      | price | initialStock | stock | category    |
      | Gaming Laptop | High-end gaming  |  1500 |            5 |     3 | ELECTRONICS |
      | Office Laptop | Business laptop  |   800 |           15 |    12 | ELECTRONICS |
      | Gaming Mouse  | RGB gaming mouse |    80 |           50 |    45 | ELECTRONICS |
      | Office Chair  | Ergonomic chair  |   200 |           20 |    18 | HOME        |
    When I filter products with:
      | name     | gaming      |
      | category | ELECTRONICS |
      | minPrice |          50 |
      | maxPrice |        2000 |
    Then I should receive a 200 response
    And I should receive 2 products
    And all products should contain "gaming" in their name
    And all products should have category "ELECTRONICS"
    And all products should have price between 50 and 2000
