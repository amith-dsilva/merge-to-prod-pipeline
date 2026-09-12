CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price NUMERIC(12, 2) NOT NULL CHECK (price > 0),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO products (
    name,
    price,
    stock
)
VALUES
    ('MacBook Pro', 150000.00, 5),
    ('iPhone 16', 79999.00, 10),
    ('Samsung Galaxy S25', 74999.00, 8),
    ('Sony Headphones', 24999.00, 15),
    ('Mechanical Keyboard', 8999.00, 20);