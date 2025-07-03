CREATE TABLE products
(
    id            UUID             NOT NULL,
    name          VARCHAR(100)     NOT NULL,
    description   VARCHAR(500)     NOT NULL,
    price         DOUBLE PRECISION NOT NULL,
    initial_stock INTEGER          NOT NULL,
    stock         INTEGER          NOT NULL,
    category      VARCHAR(255)     NOT NULL,
    CONSTRAINT pk_products PRIMARY KEY (id)
);