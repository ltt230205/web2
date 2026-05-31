USE fashion_store;
SET NAMES utf8mb4;

-- Repair text imported with UTF-8 bytes interpreted as latin1.
UPDATE products
SET
    name = IF(BINARY name REGEXP BINARY 'Ã|Ä|Æ|áº|á»', CONVERT(CAST(CONVERT(name USING latin1) AS BINARY) USING utf8mb4), name),
    short_description = IF(BINARY short_description REGEXP BINARY 'Ã|Ä|Æ|áº|á»', CONVERT(CAST(CONVERT(short_description USING latin1) AS BINARY) USING utf8mb4), short_description),
    description = IF(BINARY description REGEXP BINARY 'Ã|Ä|Æ|áº|á»', CONVERT(CAST(CONVERT(description USING latin1) AS BINARY) USING utf8mb4), description),
    material = IF(BINARY material REGEXP BINARY 'Ã|Ä|Æ|áº|á»', CONVERT(CAST(CONVERT(material USING latin1) AS BINARY) USING utf8mb4), material),
    care_instruction = IF(BINARY care_instruction REGEXP BINARY 'Ã|Ä|Æ|áº|á»', CONVERT(CAST(CONVERT(care_instruction USING latin1) AS BINARY) USING utf8mb4), care_instruction);

UPDATE product_images
SET alt_text = IF(BINARY alt_text REGEXP BINARY 'Ã|Ä|Æ|áº|á»', CONVERT(CAST(CONVERT(alt_text USING latin1) AS BINARY) USING utf8mb4), alt_text);

UPDATE order_items
SET
    product_name = IF(BINARY product_name REGEXP BINARY 'Ã|Ä|Æ|áº|á»', CONVERT(CAST(CONVERT(product_name USING latin1) AS BINARY) USING utf8mb4), product_name),
    variant_name = IF(BINARY variant_name REGEXP BINARY 'Ã|Ä|Æ|áº|á»', CONVERT(CAST(CONVERT(variant_name USING latin1) AS BINARY) USING utf8mb4), variant_name),
    color_name = IF(BINARY color_name REGEXP BINARY 'Ã|Ä|Æ|áº|á»', CONVERT(CAST(CONVERT(color_name USING latin1) AS BINARY) USING utf8mb4), color_name),
    size_name = IF(BINARY size_name REGEXP BINARY 'Ã|Ä|Æ|áº|á»', CONVERT(CAST(CONVERT(size_name USING latin1) AS BINARY) USING utf8mb4), size_name);

UPDATE orders
SET
    receiver_name = IF(BINARY receiver_name REGEXP BINARY 'Ã|Ä|Æ|áº|á»', CONVERT(CAST(CONVERT(receiver_name USING latin1) AS BINARY) USING utf8mb4), receiver_name),
    shipping_province_name = IF(BINARY shipping_province_name REGEXP BINARY 'Ã|Ä|Æ|áº|á»', CONVERT(CAST(CONVERT(shipping_province_name USING latin1) AS BINARY) USING utf8mb4), shipping_province_name),
    shipping_district_name = IF(BINARY shipping_district_name REGEXP BINARY 'Ã|Ä|Æ|áº|á»', CONVERT(CAST(CONVERT(shipping_district_name USING latin1) AS BINARY) USING utf8mb4), shipping_district_name),
    shipping_ward_name = IF(BINARY shipping_ward_name REGEXP BINARY 'Ã|Ä|Æ|áº|á»', CONVERT(CAST(CONVERT(shipping_ward_name USING latin1) AS BINARY) USING utf8mb4), shipping_ward_name),
    shipping_address_line = IF(BINARY shipping_address_line REGEXP BINARY 'Ã|Ä|Æ|áº|á»', CONVERT(CAST(CONVERT(shipping_address_line USING latin1) AS BINARY) USING utf8mb4), shipping_address_line),
    customer_note = IF(BINARY customer_note REGEXP BINARY 'Ã|Ä|Æ|áº|á»', CONVERT(CAST(CONVERT(customer_note USING latin1) AS BINARY) USING utf8mb4), customer_note),
    admin_note = IF(BINARY admin_note REGEXP BINARY 'Ã|Ä|Æ|áº|á»', CONVERT(CAST(CONVERT(admin_note USING latin1) AS BINARY) USING utf8mb4), admin_note);
