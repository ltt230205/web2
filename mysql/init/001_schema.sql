CREATE DATABASE IF NOT EXISTS fashion_store
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE fashion_store;

-- =========================================================
-- ACCOUNTS / CUSTOMERS
-- =========================================================

CREATE TABLE accounts (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    email VARCHAR(255) NULL,
    phone VARCHAR(30) NULL,
    password_hash VARCHAR(255) NOT NULL,

    full_name VARCHAR(255) NULL,
    avatar_url VARCHAR(500) NULL,

    account_type VARCHAR(30) NOT NULL DEFAULT 'CUSTOMER',
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',

    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
        ON UPDATE CURRENT_TIMESTAMP(6),
    deleted_at DATETIME(6) NULL,

    UNIQUE KEY uq_accounts_email (email),
    UNIQUE KEY uq_accounts_phone (phone),

    CHECK (account_type IN ('CUSTOMER', 'STAFF', 'ADMIN')),
    CHECK (status IN ('ACTIVE', 'LOCKED', 'DISABLED'))
) ENGINE=InnoDB;


CREATE TABLE customers (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    account_id BIGINT UNSIGNED NULL,
    customer_code VARCHAR(100) NOT NULL,

    gender VARCHAR(20) NULL,
    date_of_birth DATE NULL,

    loyalty_point INT NOT NULL DEFAULT 0,
    loyalty_tier VARCHAR(50) NULL,

    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
        ON UPDATE CURRENT_TIMESTAMP(6),

    UNIQUE KEY uq_customers_account (account_id),
    UNIQUE KEY uq_customers_code (customer_code),

    CONSTRAINT fk_customers_account
        FOREIGN KEY (account_id) REFERENCES accounts(id),

    CHECK (gender IN ('MALE', 'FEMALE', 'OTHER'))
) ENGINE=InnoDB;


CREATE TABLE customer_addresses (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    customer_id BIGINT UNSIGNED NOT NULL,

    receiver_name VARCHAR(255) NOT NULL,
    receiver_phone VARCHAR(30) NOT NULL,

    province_name VARCHAR(100) NOT NULL,
    district_name VARCHAR(100) NOT NULL,
    ward_name VARCHAR(100) NOT NULL,
    address_line VARCHAR(500) NOT NULL,

    is_default BOOLEAN NOT NULL DEFAULT FALSE,

    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
        ON UPDATE CURRENT_TIMESTAMP(6),

    CONSTRAINT fk_customer_addresses_customer
        FOREIGN KEY (customer_id) REFERENCES customers(id),

    INDEX idx_customer_addresses_customer (customer_id)
) ENGINE=InnoDB;


-- =========================================================
-- PRODUCT CATALOG
-- =========================================================

CREATE TABLE brands (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    logo_url VARCHAR(500) NULL,
    description TEXT NULL,

    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',

    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
        ON UPDATE CURRENT_TIMESTAMP(6),

    UNIQUE KEY uq_brands_slug (slug),

    CHECK (status IN ('ACTIVE', 'INACTIVE'))
) ENGINE=InnoDB;


CREATE TABLE categories (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    parent_id BIGINT UNSIGNED NULL,

    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    description TEXT NULL,
    image_url VARCHAR(500) NULL,

    sort_order INT NOT NULL DEFAULT 0,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',

    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
        ON UPDATE CURRENT_TIMESTAMP(6),

    UNIQUE KEY uq_categories_slug (slug),

    CONSTRAINT fk_categories_parent
        FOREIGN KEY (parent_id) REFERENCES categories(id),

    INDEX idx_categories_parent (parent_id),

    CHECK (status IN ('ACTIVE', 'INACTIVE'))
) ENGINE=InnoDB;


CREATE TABLE products (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    brand_id BIGINT UNSIGNED NULL,

    product_code VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,

    short_description VARCHAR(1000) NULL,
    description TEXT NULL,

    material VARCHAR(255) NULL,
    care_instruction TEXT NULL,

    gender_target VARCHAR(30) NULL,

    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,

    min_price DECIMAL(15,2) NOT NULL DEFAULT 0,
    max_price DECIMAL(15,2) NOT NULL DEFAULT 0,

    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
        ON UPDATE CURRENT_TIMESTAMP(6),
    deleted_at DATETIME(6) NULL,

    UNIQUE KEY uq_products_code (product_code),
    UNIQUE KEY uq_products_slug (slug),

    CONSTRAINT fk_products_brand
        FOREIGN KEY (brand_id) REFERENCES brands(id),

    INDEX idx_products_brand (brand_id),
    INDEX idx_products_status (status),
    INDEX idx_products_gender (gender_target),
    FULLTEXT KEY ft_products_search (name, short_description, description),

    CHECK (status IN ('DRAFT', 'ACTIVE', 'INACTIVE', 'DISCONTINUED')),
    CHECK (gender_target IN ('MALE', 'FEMALE', 'UNISEX', 'KIDS'))
) ENGINE=InnoDB;


CREATE TABLE product_categories (
    product_id BIGINT UNSIGNED NOT NULL,
    category_id BIGINT UNSIGNED NOT NULL,

    PRIMARY KEY (product_id, category_id),

    CONSTRAINT fk_product_categories_product
        FOREIGN KEY (product_id) REFERENCES products(id),

    CONSTRAINT fk_product_categories_category
        FOREIGN KEY (category_id) REFERENCES categories(id)
) ENGINE=InnoDB;


CREATE TABLE colors (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    hex_code VARCHAR(20) NULL,

    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    UNIQUE KEY uq_colors_slug (slug)
) ENGINE=InnoDB;


CREATE TABLE sizes (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    name VARCHAR(50) NOT NULL,
    size_group VARCHAR(50) NULL,
    sort_order INT NOT NULL DEFAULT 0,

    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    UNIQUE KEY uq_sizes_name_group (name, size_group)
) ENGINE=InnoDB;


CREATE TABLE product_skus (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    product_id BIGINT UNSIGNED NOT NULL,
    color_id BIGINT UNSIGNED NULL,
    size_id BIGINT UNSIGNED NULL,

    sku_code VARCHAR(100) NOT NULL,
    barcode VARCHAR(100) NULL,

    variant_key VARCHAR(255) NOT NULL,
    variant_name VARCHAR(255) NULL,

    price DECIMAL(15,2) NOT NULL,
    compare_at_price DECIMAL(15,2) NULL,
    cost_price DECIMAL(15,2) NULL,

    weight_gram INT NULL,

    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',

    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
        ON UPDATE CURRENT_TIMESTAMP(6),
    deleted_at DATETIME(6) NULL,

    UNIQUE KEY uq_product_skus_code (sku_code),
    UNIQUE KEY uq_product_skus_barcode (barcode),
    UNIQUE KEY uq_product_skus_variant (product_id, variant_key),

    CONSTRAINT fk_product_skus_product
        FOREIGN KEY (product_id) REFERENCES products(id),

    CONSTRAINT fk_product_skus_color
        FOREIGN KEY (color_id) REFERENCES colors(id),

    CONSTRAINT fk_product_skus_size
        FOREIGN KEY (size_id) REFERENCES sizes(id),

    INDEX idx_product_skus_product (product_id),
    INDEX idx_product_skus_status (status),
    INDEX idx_product_skus_price (price),

    CHECK (status IN ('ACTIVE', 'INACTIVE', 'OUT_OF_STOCK')),
    CHECK (price >= 0),
    CHECK (compare_at_price IS NULL OR compare_at_price >= 0),
    CHECK (cost_price IS NULL OR cost_price >= 0)
) ENGINE=InnoDB;


-- BẢNG ẢNH SẢN PHẨM
CREATE TABLE product_images (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    product_id BIGINT UNSIGNED NOT NULL,
    sku_id BIGINT UNSIGNED NULL,

    image_url VARCHAR(1000) NOT NULL,
    alt_text VARCHAR(255) NULL,

    sort_order INT NOT NULL DEFAULT 0,
    is_thumbnail BOOLEAN NOT NULL DEFAULT FALSE,

    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    CONSTRAINT fk_product_images_product
        FOREIGN KEY (product_id) REFERENCES products(id),

    CONSTRAINT fk_product_images_sku
        FOREIGN KEY (sku_id) REFERENCES product_skus(id),

    INDEX idx_product_images_product (product_id),
    INDEX idx_product_images_sku (sku_id)
) ENGINE=InnoDB;


-- =========================================================
-- INVENTORY
-- =========================================================

CREATE TABLE stock_locations (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    location_code VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,

    type VARCHAR(30) NOT NULL,

    province_name VARCHAR(100) NULL,
    district_name VARCHAR(100) NULL,
    ward_name VARCHAR(100) NULL,
    address_line VARCHAR(500) NULL,

    phone VARCHAR(30) NULL,

    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',

    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
        ON UPDATE CURRENT_TIMESTAMP(6),

    UNIQUE KEY uq_stock_locations_code (location_code),

    CHECK (type IN ('WAREHOUSE', 'STORE')),
    CHECK (status IN ('ACTIVE', 'INACTIVE'))
) ENGINE=InnoDB;


CREATE TABLE inventory_balances (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    stock_location_id BIGINT UNSIGNED NOT NULL,
    sku_id BIGINT UNSIGNED NOT NULL,

    qty_on_hand INT NOT NULL DEFAULT 0,
    qty_reserved INT NOT NULL DEFAULT 0,

    qty_available INT
        GENERATED ALWAYS AS (qty_on_hand - qty_reserved) STORED,

    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
        ON UPDATE CURRENT_TIMESTAMP(6),

    UNIQUE KEY uq_inventory_location_sku (stock_location_id, sku_id),

    CONSTRAINT fk_inventory_balances_location
        FOREIGN KEY (stock_location_id) REFERENCES stock_locations(id),

    CONSTRAINT fk_inventory_balances_sku
        FOREIGN KEY (sku_id) REFERENCES product_skus(id),

    INDEX idx_inventory_balances_sku (sku_id),

    CHECK (qty_on_hand >= 0),
    CHECK (qty_reserved >= 0)
) ENGINE=InnoDB;


-- =========================================================
-- CART
-- =========================================================

CREATE TABLE carts (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    customer_id BIGINT UNSIGNED NULL,
    session_id VARCHAR(255) NULL,

    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',

    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
        ON UPDATE CURRENT_TIMESTAMP(6),

    CONSTRAINT fk_carts_customer
        FOREIGN KEY (customer_id) REFERENCES customers(id),

    INDEX idx_carts_customer (customer_id),
    INDEX idx_carts_session (session_id),

    CHECK (status IN ('ACTIVE', 'ORDERED', 'ABANDONED'))
) ENGINE=InnoDB;


CREATE TABLE cart_items (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    cart_id BIGINT UNSIGNED NOT NULL,
    sku_id BIGINT UNSIGNED NOT NULL,

    quantity INT NOT NULL,

    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
        ON UPDATE CURRENT_TIMESTAMP(6),

    CONSTRAINT fk_cart_items_cart
        FOREIGN KEY (cart_id) REFERENCES carts(id),

    CONSTRAINT fk_cart_items_sku
        FOREIGN KEY (sku_id) REFERENCES product_skus(id),

    UNIQUE KEY uq_cart_items_cart_sku (cart_id, sku_id),

    CHECK (quantity > 0)
) ENGINE=InnoDB;


-- =========================================================
-- ORDERS
-- =========================================================

CREATE TABLE orders (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    order_number VARCHAR(100) NOT NULL,

    customer_id BIGINT UNSIGNED NULL,

    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    payment_status VARCHAR(50) NOT NULL DEFAULT 'UNPAID',
    shipping_status VARCHAR(50) NOT NULL DEFAULT 'NOT_SHIPPED',

    source_channel VARCHAR(50) NOT NULL DEFAULT 'WEB',

    receiver_name VARCHAR(255) NOT NULL,
    receiver_phone VARCHAR(30) NOT NULL,

    shipping_province_name VARCHAR(100) NOT NULL,
    shipping_district_name VARCHAR(100) NOT NULL,
    shipping_ward_name VARCHAR(100) NOT NULL,
    shipping_address_line VARCHAR(500) NOT NULL,

    item_total DECIMAL(15,2) NOT NULL DEFAULT 0,
    discount_total DECIMAL(15,2) NOT NULL DEFAULT 0,
    shipping_fee DECIMAL(15,2) NOT NULL DEFAULT 0,
    grand_total DECIMAL(15,2) NOT NULL DEFAULT 0,

    customer_note VARCHAR(1000) NULL,
    admin_note VARCHAR(1000) NULL,

    placed_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    confirmed_at DATETIME(6) NULL,
    cancelled_at DATETIME(6) NULL,
    completed_at DATETIME(6) NULL,

    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
        ON UPDATE CURRENT_TIMESTAMP(6),

    UNIQUE KEY uq_orders_number (order_number),

    CONSTRAINT fk_orders_customer
        FOREIGN KEY (customer_id) REFERENCES customers(id),

    INDEX idx_orders_customer (customer_id),
    INDEX idx_orders_status (status),

    CHECK (
        status IN (
            'PENDING',
            'CONFIRMED',
            'PACKING',
            'SHIPPING',
            'COMPLETED',
            'CANCELLED',
            'RETURNED'
        )
    ),

    CHECK (
        payment_status IN (
            'UNPAID',
            'PAID',
            'PARTIALLY_REFUNDED',
            'REFUNDED',
            'FAILED'
        )
    ),

    CHECK (
        shipping_status IN (
            'NOT_SHIPPED',
            'READY_TO_SHIP',
            'SHIPPING',
            'DELIVERED',
            'FAILED'
        )
    )
) ENGINE=InnoDB;


CREATE TABLE order_items (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    order_id BIGINT UNSIGNED NOT NULL,
    sku_id BIGINT UNSIGNED NULL,

    sku_code VARCHAR(100) NOT NULL,

    product_name VARCHAR(255) NOT NULL,
    variant_name VARCHAR(255) NULL,
    color_name VARCHAR(100) NULL,
    size_name VARCHAR(50) NULL,
    image_url VARCHAR(1000) NULL,

    quantity INT NOT NULL,

    unit_price DECIMAL(15,2) NOT NULL,
    compare_at_price DECIMAL(15,2) NULL,
    discount_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(15,2) NOT NULL,

    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),

    CONSTRAINT fk_order_items_order
        FOREIGN KEY (order_id) REFERENCES orders(id),

    CONSTRAINT fk_order_items_sku
        FOREIGN KEY (sku_id) REFERENCES product_skus(id),

    INDEX idx_order_items_order (order_id),
    INDEX idx_order_items_sku (sku_id),

    CHECK (quantity > 0)
) ENGINE=InnoDB;


CREATE TABLE payments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    order_id BIGINT UNSIGNED NOT NULL,

    payment_method VARCHAR(50) NOT NULL,
    amount DECIMAL(15,2) NOT NULL,

    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',

    paid_at DATETIME(6) NULL,

    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
        ON UPDATE CURRENT_TIMESTAMP(6),

    CONSTRAINT fk_payments_order
        FOREIGN KEY (order_id) REFERENCES orders(id),

    INDEX idx_payments_order (order_id),

    CHECK (payment_method IN ('COD', 'BANK_TRANSFER', 'VNPAY', 'MOMO', 'ZALOPAY')),
    CHECK (status IN ('PENDING', 'SUCCESS', 'FAILED', 'CANCELLED', 'REFUNDED'))
) ENGINE=InnoDB;