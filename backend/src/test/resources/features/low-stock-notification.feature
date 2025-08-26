Feature: Low Stock Notification Management

  Background:
    Given the system is ready
    And the database is clean

  Scenario: Generate low stock notification when stock falls below minimum
    Given I am an authenticated user with credentials "admin@example.com" and "admin1"
    And a product exists with the following details:
      | name         | Test Product     |
      | description  | Test Description |
      | price        |            99.99 |
      | initialStock |               50 |
      | stock        |               50 |
      | minimumStock |               40 |
      | category     | ELECTRONICS      |
    When I update the product with the following details:
      | name         | Test Product     |
      | description  | Test Description |
      | price        |            99.99 |
      | initialStock |               50 |
      | stock        |               35 |
      | minimumStock |               40 |
      | category     | ELECTRONICS      |
    Then I should receive a 200 response
    And a low stock notification should be created with:
      | currentStock  | 35 |
      | minimumStock  | 40 |
      | productName   | Test Product |

  Scenario: Retrieve low stock notifications with pagination
    Given I am an authenticated user with credentials "admin@example.com" and "admin1"
    And the following low stock notifications exist:
      | productName    | currentStock | minimumStock | date                    |
      | Product A      |           15 |           20 | 2025-08-25T10:00:00.00 |
      | Product B      |            8 |           10 | 2025-08-25T10:30:00.00 |
      | Product C      |            3 |            5 | 2025-08-25T11:00:00.00 |
      | Product D      |            2 |            5 | 2025-08-25T11:30:00.00 |
      | Product E      |            4 |            8 | 2025-08-25T12:00:00.00 |
      | Product F      |            1 |            3 | 2025-08-25T12:30:00.00 |
    When I retrieve low stock notifications with page 0 and size 5
    Then I should receive a 200 response
    And I should receive 5 notifications
    And the pagination information should indicate page 0
    And the total elements should be 6

  Scenario: No low stock notification when stock is above minimum
    Given I am an authenticated user with credentials "admin@example.com" and "admin1"
    And a product exists with the following details:
      | name         | Test Product     |
      | description  | Test Description |
      | price        |            99.99 |
      | initialStock |               50 |
      | stock        |               45 |
      | minimumStock |               40 |
      | category     | ELECTRONICS      |
    When I update the product with the following details:
      | name         | Test Product     |
      | description  | Test Description |
      | price        |            99.99 |
      | initialStock |               50 |
      | stock        |               42 |
      | minimumStock |               40 |
      | category     | ELECTRONICS      |
    Then I should receive a 200 response
    And no low stock notification should be created

  Scenario: Multiple low stock notifications for the same product
    Given I am an authenticated user with credentials "admin@example.com" and "admin1"
    And a product exists with the following details:
      | name         | Test Product     |
      | description  | Test Description |
      | price        |            99.99 |
      | initialStock |               50 |
      | stock        |               45 |
      | minimumStock |               40 |
      | category     | ELECTRONICS      |
    When I update the product with the following details:
      | name         | Test Product     |
      | description  | Test Description |
      | price        |            99.99 |
      | initialStock |               50 |
      | stock        |               35 |
      | minimumStock |               40 |
      | category     | ELECTRONICS      |
    Then I should receive a 200 response
    And a low stock notification should be created with:
      | currentStock  | 35 |
      | minimumStock  | 40 |
      | productName   | Test Product |
    When I update the product with the following details:
      | name         | Test Product     |
      | description  | Test Description |
      | price        |            99.99 |
      | initialStock |               50 |
      | stock        |               30 |
      | minimumStock |               40 |
      | category     | ELECTRONICS      |
    Then I should receive a 200 response
    And a low stock notification should be created with:
      | currentStock  | 30 |
      | minimumStock  | 40 |
      | productName   | Test Product |
