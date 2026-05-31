USE fashion_store;
SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS discount_codes (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    discount_type VARCHAR(20) NOT NULL,
    discount_value DECIMAL(15,2) NOT NULL,
    min_order_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    max_discount_amount DECIMAL(15,2) NULL,
    usage_limit INT NULL,
    used_count INT NOT NULL DEFAULT 0,
    starts_at DATETIME(6) NULL,
    ends_at DATETIME(6) NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
        ON UPDATE CURRENT_TIMESTAMP(6),
    UNIQUE KEY uq_discount_codes_code (code),
    CHECK (discount_type IN ('PERCENT', 'FIXED')),
    CHECK (status IN ('ACTIVE', 'INACTIVE')),
    CHECK (discount_value >= 0),
    CHECK (min_order_amount >= 0),
    CHECK (max_discount_amount IS NULL OR max_discount_amount >= 0),
    CHECK (usage_limit IS NULL OR usage_limit >= 0),
    CHECK (used_count >= 0)
) ENGINE=InnoDB;

ALTER TABLE orders
    ADD COLUMN discount_code_id BIGINT UNSIGNED NULL AFTER customer_id,
    ADD CONSTRAINT fk_orders_discount_code
        FOREIGN KEY (discount_code_id) REFERENCES discount_codes(id),
    ADD INDEX idx_orders_discount_code (discount_code_id);

INSERT IGNORE INTO discount_codes (
    code, name, discount_type, discount_value, min_order_amount,
    max_discount_amount, usage_limit, status
)
VALUES
    ('WELCOME10', 'Giảm 10% cho đơn đầu tiên', 'PERCENT', 10, 299000, 100000, 500, 'ACTIVE'),
    ('FASHION50', 'Giảm 50.000đ cho đơn từ 499.000đ', 'FIXED', 50000, 499000, NULL, 300, 'ACTIVE');

UPDATE colors SET name = 'Đen' WHERE id = 1;
UPDATE colors SET name = 'Trắng' WHERE id = 2;
UPDATE colors SET name = 'Xanh navy' WHERE id = 3;
UPDATE colors SET name = 'Be' WHERE id = 4;

UPDATE product_skus ps
LEFT JOIN colors c ON c.id = ps.color_id
LEFT JOIN sizes s ON s.id = ps.size_id
SET ps.variant_name = CASE
    WHEN c.name IS NOT NULL AND s.name IS NOT NULL THEN CONCAT(c.name, ' / ', s.name)
    WHEN c.name IS NOT NULL THEN c.name
    WHEN s.name IS NOT NULL THEN s.name
    ELSE 'Mặc định'
END;
