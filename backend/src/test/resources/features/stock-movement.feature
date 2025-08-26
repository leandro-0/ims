Feature: Stock Movement Management

  Background:
    Given the system is ready
    And the database is clean

  Scenario: Track stock movement on product creation
    Given I am an authenticated user with credentials "admin@example.com" and "admin1"
    When I create a product with the following details:
      | name         | New Product     |
      | description  | Description     |
      | price        |         100.00  |
      | initialStock |             50  |
      | stock        |             50  |
      | minimumStock |             10  |
      | category     | ELECTRONICS     |
    Then I should receive a 201 response
    And a stock movement should be created with:
      | type     | INCOMING  |
      | quantity |       50  |
      | action   | INSERTED  |
      | username | admin@example.com     |

  Scenario: Track stock movement on product update
    Given I am an authenticated user with credentials "admin@example.com" and "admin1"
    And a product exists with the following details:
      | name         | Original Product  |
      | description  | Description       |
      | price        |           100.00  |
      | initialStock |               50  |
      | stock        |               50  |
      | minimumStock |               10  |
      | category     | ELECTRONICS       |
    When I update the product with the following details:
      | name         | Updated Product   |
      | description  | Description       |
      | price        |           100.00  |
      | initialStock |               50  |
      | stock        |               60  |
      | minimumStock |               10  |
      | category     | ELECTRONICS       |
    Then I should receive a 200 response
    And a stock movement should be created with:
      | type     | INCOMING  |
      | quantity |       10  |
      | action   | UPDATED   |
      | username | admin@example.com     |

  Scenario: Track stock movement on product deletion
    Given I am an authenticated user with credentials "admin@example.com" and "admin1"
    And a product exists with the following details:
      | name         | Product to Delete  |
      | description  | Description        |
      | price        |           100.00   |
      | initialStock |               50   |
      | stock        |               50   |
      | minimumStock |               10   |
      | category     | ELECTRONICS        |
    When I delete the product
    Then I should receive a 204 response
    And a stock movement should be created with:
      | type     | OUTGOING  |
      | quantity |       50  |
      | action   | DELETED   |
      | username | admin@example.com     |

  Scenario: Retrieve stock movements with pagination
    Given I am an authenticated user with credentials "admin@example.com" and "admin1"
    And the following stock movements exist:
      | type     | quantity | action   | username | product   | date                    |
      | INCOMING |       50 | INSERTED | admin    | Product A | 2025-08-25T10:00:00.00 |
      | INCOMING |       20 | UPDATED  | admin    | Product A | 2025-08-25T10:30:00.00 |
      | OUTGOING |       10 | UPDATED  | admin    | Product B | 2025-08-25T11:00:00.00 |
      | OUTGOING |       60 | DELETED  | admin    | Product C | 2025-08-25T11:30:00.00 |
      | INCOMING |       30 | INSERTED | admin    | Product D | 2025-08-25T12:00:00.00 |
      | OUTGOING |       15 | UPDATED  | admin    | Product D | 2025-08-25T12:30:00.00 |
    When I retrieve stock movements with page 0 and size 5
    Then I should receive a 200 response
    And I should receive 5 stock movements
    And the pagination information should indicate page 0
    And the total elements should be 6
