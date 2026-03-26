CREATE TABLE shops(
                      id SERIAL PRIMARY KEY,
                      name VARCHAR(255) NOT NULL UNIQUE,
                      description VARCHAR(500),
                      rating NUMERIC(2, 1) CHECK ( rating >= 1.0 AND rating <= 5.0),
                      image_url VARCHAR(500)
);

CREATE TABLE product_categories(
                                   id SERIAL PRIMARY KEY,
                                   name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE products(
                         id SERIAL PRIMARY KEY,
                         name VARCHAR(255) NOT NULL,
                         shop_id INTEGER REFERENCES shops(id) ON DELETE CASCADE,
                         category_id INTEGER REFERENCES product_categories(id) ON DELETE SET NULL,
                         price NUMERIC(10,2) NOT NULL,
                         description VARCHAR(500),
                         image_url VARCHAR(500)
);

CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_price ON products(price);

CREATE TABLE customers(
                          id SERIAL PRIMARY KEY,
                          name VARCHAR(255) NOT NULL,
                          email VARCHAR(255) NOT NULL,
                          phone VARCHAR(50) NOT NULL,
                          address TEXT NOT NULL
);

CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_phone ON customers(phone);

CREATE TABLE coupons(
                        id SERIAL PRIMARY KEY,
                        name VARCHAR(255) NOT NULL,
                        code VARCHAR(50) NOT NULL UNIQUE,
                        discount_percent INTEGER CHECK(discount_percent>0 AND discount_percent <= 100)
);

CREATE TABLE orders(
                       id SERIAL PRIMARY KEY,
                       customer_id INTEGER REFERENCES customers(id),
                       total_price NUMERIC(10,2) NOT NULL,
                       coupon_id INTEGER REFERENCES coupons(id) ON DELETE SET NULL,
                       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE order_details(
                              id SERIAL PRIMARY KEY,
                              order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
                              product_id INTEGER REFERENCES products(id),
                              quantity INTEGER NOT NULL CHECK ( quantity > 0),
                              price_at_purchase NUMERIC(10,2) NOT NULL
);



