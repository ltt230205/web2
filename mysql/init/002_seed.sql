USE fashion_store;
SET NAMES utf8mb4;

-- =========================================================
-- BRAND
-- =========================================================

INSERT INTO brands (id, name, slug, status)
VALUES
(1, 'YODY Demo', 'yody-demo', 'ACTIVE');


-- =========================================================
-- CATEGORY
-- =========================================================

INSERT INTO categories (id, parent_id, name, slug, sort_order, status)
VALUES
(1, NULL, 'Nam', 'nam', 1, 'ACTIVE'),
(2, NULL, 'Nữ', 'nu', 2, 'ACTIVE'),
(3, NULL, 'Trẻ em', 'tre-em', 3, 'ACTIVE'),
(4, NULL, 'Đồng phục', 'dong-phuc', 4, 'ACTIVE'),

(5, 1, 'Áo nam', 'ao-nam', 1, 'ACTIVE'),
(6, 1, 'Quần nam', 'quan-nam', 2, 'ACTIVE'),
(7, 2, 'Áo nữ', 'ao-nu', 1, 'ACTIVE'),
(8, 2, 'Váy nữ', 'vay-nu', 2, 'ACTIVE'),

(9, 5, 'Áo Polo Nam', 'ao-polo-nam', 1, 'ACTIVE'),
(10, 7, 'Áo Polo Nữ', 'ao-polo-nu', 1, 'ACTIVE');


-- =========================================================
-- COLORS
-- =========================================================

INSERT INTO colors (id, name, slug, hex_code)
VALUES
(1, 'Đen', 'den', '#000000'),
(2, 'Trắng', 'trang', '#FFFFFF'),
(3, 'Xanh navy', 'xanh-navy', '#001F3F'),
(4, 'Be', 'be', '#F5F5DC');


-- =========================================================
-- SIZES
-- =========================================================

INSERT INTO sizes (id, name, size_group, sort_order)
VALUES
(1, 'S', 'ADULT', 1),
(2, 'M', 'ADULT', 2),
(3, 'L', 'ADULT', 3),
(4, 'XL', 'ADULT', 4),
(5, 'XXL', 'ADULT', 5);


-- =========================================================
-- PRODUCTS
-- =========================================================

INSERT INTO products (
    id,
    brand_id,
    product_code,
    name,
    slug,
    short_description,
    description,
    material,
    care_instruction,
    gender_target,
    status,
    is_featured,
    min_price,
    max_price
)
VALUES
(
    1,
    1,
    'APOLO_NAM_REGULAR',
    'Áo Polo Nam Regular Cổ Ép Có Xẻ Tà',
    'ao-polo-nam-regular-co-ep-co-xe-ta',
    'Áo polo nam form regular, thiết kế basic, dễ mặc.',
    'Sản phẩm phù hợp mặc đi làm, đi chơi, chất liệu thoáng mát.',
    'Cotton pha',
    'Giặt máy chế độ nhẹ, không dùng chất tẩy mạnh.',
    'MALE',
    'ACTIVE',
    TRUE,
    299000,
    399000
),
(
    2,
    1,
    'APOLO_NU_REGULAR',
    'Áo Polo Nữ Regular Cổ Ép Có Xẻ Tà',
    'ao-polo-nu-regular-co-ep-co-xe-ta',
    'Áo polo nữ form regular, trẻ trung, dễ phối đồ.',
    'Sản phẩm phù hợp mặc hằng ngày, đi làm hoặc đi chơi.',
    'Cotton pha',
    'Giặt máy chế độ nhẹ, không dùng chất tẩy mạnh.',
    'FEMALE',
    'ACTIVE',
    TRUE,
    299000,
    399000
),
(
    3,
    1,
    'APOLO_NAM_SLIM',
    'Áo Polo Nam Slim Có Khóa Kéo',
    'ao-polo-nam-slim-co-khoa-keo',
    'Áo polo nam slim fit, thiết kế khóa kéo hiện đại.',
    'Sản phẩm phù hợp phong cách năng động, lịch sự.',
    'Poly-cotton',
    'Giặt riêng với sản phẩm sáng màu.',
    'MALE',
    'ACTIVE',
    TRUE,
    349000,
    449000
),
(
    4,
    1,
    'VAY_LIEN_CO_DUC',
    'Váy Liền Cổ Đức Đai Eo Xòe Tầng',
    'vay-lien-co-duc-dai-eo-xoe-tang',
    'Váy liền nữ cổ đức, dáng xòe tầng nữ tính.',
    'Sản phẩm phù hợp đi làm, đi chơi, tạo cảm giác thanh lịch.',
    'Vải tổng hợp mềm',
    'Giặt nhẹ, phơi nơi thoáng mát.',
    'FEMALE',
    'ACTIVE',
    TRUE,
    499000,
    599000
);


-- =========================================================
-- PRODUCT CATEGORIES
-- =========================================================

INSERT INTO product_categories (product_id, category_id)
VALUES
(1, 9),
(2, 10),
(3, 9),
(4, 8);


-- =========================================================
-- PRODUCT SKUS
-- =========================================================

INSERT INTO product_skus (
    id,
    product_id,
    color_id,
    size_id,
    sku_code,
    barcode,
    variant_key,
    variant_name,
    price,
    compare_at_price,
    cost_price,
    weight_gram,
    status
)
VALUES
-- Product 1: Áo Polo Nam Regular
(1, 1, 1, 2, 'APOLO-NAM-REG-DEN-M', '893000000001', 'DEN-M', 'Đen / M', 299000, 399000, 150000, 300, 'ACTIVE'),
(2, 1, 1, 3, 'APOLO-NAM-REG-DEN-L', '893000000002', 'DEN-L', 'Đen / L', 299000, 399000, 150000, 300, 'ACTIVE'),
(3, 1, 2, 2, 'APOLO-NAM-REG-TRANG-M', '893000000003', 'TRANG-M', 'Trắng / M', 299000, 399000, 150000, 300, 'ACTIVE'),
(4, 1, 2, 3, 'APOLO-NAM-REG-TRANG-L', '893000000004', 'TRANG-L', 'Trắng / L', 299000, 399000, 150000, 300, 'ACTIVE'),

-- Product 2: Áo Polo Nữ Regular
(5, 2, 2, 1, 'APOLO-NU-REG-TRANG-S', '893000000005', 'TRANG-S', 'Trắng / S', 299000, 399000, 140000, 250, 'ACTIVE'),
(6, 2, 2, 2, 'APOLO-NU-REG-TRANG-M', '893000000006', 'TRANG-M', 'Trắng / M', 299000, 399000, 140000, 250, 'ACTIVE'),
(7, 2, 4, 1, 'APOLO-NU-REG-BE-S', '893000000007', 'BE-S', 'Be / S', 299000, 399000, 140000, 250, 'ACTIVE'),
(8, 2, 4, 2, 'APOLO-NU-REG-BE-M', '893000000008', 'BE-M', 'Be / M', 299000, 399000, 140000, 250, 'ACTIVE'),

-- Product 3: Áo Polo Nam Slim
(9, 3, 3, 2, 'APOLO-NAM-SLIM-NAVY-M', '893000000009', 'NAVY-M', 'Xanh navy / M', 349000, 449000, 180000, 300, 'ACTIVE'),
(10, 3, 3, 3, 'APOLO-NAM-SLIM-NAVY-L', '893000000010', 'NAVY-L', 'Xanh navy / L', 349000, 449000, 180000, 300, 'ACTIVE'),

-- Product 4: Váy Liền
(11, 4, 4, 1, 'VAY-CO-DUC-BE-S', '893000000011', 'BE-S', 'Be / S', 499000, 599000, 250000, 400, 'ACTIVE'),
(12, 4, 4, 2, 'VAY-CO-DUC-BE-M', '893000000012', 'BE-M', 'Be / M', 499000, 599000, 250000, 400, 'ACTIVE');


-- =========================================================
-- PRODUCT IMAGES
-- Cách này dùng đường dẫn local.
-- Backend/frontend của bạn sau này sẽ serve thư mục /uploads/products.
-- =========================================================

INSERT INTO product_images (
    product_id,
    sku_id,
    image_url,
    alt_text,
    sort_order,
    is_thumbnail
)
VALUES
-- Product 1
(1, NULL, '/uploads/products/ao-polo-nam-regular.webp', 'Áo Polo Nam Regular Cổ Ép Có Xẻ Tà', 1, TRUE),
(1, NULL, '/uploads/products/ao-polo-nam-regular-2.webp', 'Ảnh phụ Áo Polo Nam Regular', 2, FALSE),

-- Product 2
(2, NULL, '/uploads/products/ao-polo-nu-regular.webp', 'Áo Polo Nữ Regular Cổ Ép Có Xẻ Tà', 1, TRUE),
(2, NULL, '/uploads/products/ao-polo-nu-regular-2.webp', 'Ảnh phụ Áo Polo Nữ Regular', 2, FALSE),

-- Product 3
(3, NULL, '/uploads/products/ao-polo-nam-slim.webp', 'Áo Polo Nam Slim Có Khóa Kéo', 1, TRUE),
(3, NULL, '/uploads/products/ao-polo-nam-slim-2.webp', 'Ảnh phụ Áo Polo Nam Slim', 2, FALSE),

-- Product 4
(4, NULL, '/uploads/products/vay-lien-co-duc.webp', 'Váy Liền Cổ Đức Đai Eo Xòe Tầng', 1, TRUE),
(4, NULL, '/uploads/products/vay-lien-co-duc-2.webp', 'Ảnh phụ Váy Liền Cổ Đức', 2, FALSE);


-- =========================================================
-- STOCK LOCATIONS
-- =========================================================

INSERT INTO stock_locations (
    id,
    location_code,
    name,
    type,
    province_name,
    district_name,
    ward_name,
    address_line,
    phone,
    status
)
VALUES
(1, 'WH_HN', 'Kho Hà Nội', 'WAREHOUSE', 'Hà Nội', 'Nam Từ Liêm', 'Mỹ Đình', 'Số 1 đường Demo', '0240000000', 'ACTIVE'),
(2, 'STORE_HD', 'Cửa hàng Hải Dương', 'STORE', 'Hải Dương', 'TP Hải Dương', 'Phường Demo', 'Số 2 đường Demo', '0220000000', 'ACTIVE');


-- =========================================================
-- INVENTORY
-- =========================================================

INSERT INTO inventory_balances (
    stock_location_id,
    sku_id,
    qty_on_hand,
    qty_reserved
)
VALUES
(1, 1, 100, 0),
(1, 2, 100, 0),
(1, 3, 100, 0),
(1, 4, 100, 0),
(1, 5, 100, 0),
(1, 6, 100, 0),
(1, 7, 100, 0),
(1, 8, 100, 0),
(1, 9, 100, 0),
(1, 10, 100, 0),
(1, 11, 100, 0),
(1, 12, 100, 0),

(2, 1, 20, 0),
(2, 2, 20, 0),
(2, 3, 20, 0),
(2, 4, 20, 0);


-- =========================================================
-- EXTENDED DEMO CATALOG: 30 PRODUCTS FOR MENU FILTERING
-- =========================================================

INSERT IGNORE INTO categories (id, parent_id, name, slug, sort_order, status)
VALUES
(11, NULL, 'Ưu đãi', 'uu-dai', 5, 'ACTIVE'),
(12, NULL, 'Hàng mới về', 'hang-moi-ve', 6, 'ACTIVE'),
(13, 5, 'Áo thun nam', 'ao-thun-nam', 2, 'ACTIVE'),
(14, 5, 'Áo sơ mi nam', 'ao-so-mi-nam', 3, 'ACTIVE'),
(15, 1, 'Quần nam', 'quan-nam-demo', 4, 'ACTIVE'),
(16, 5, 'Áo khoác nam', 'ao-khoac-nam', 5, 'ACTIVE'),
(17, 7, 'Áo chống nắng nữ', 'ao-chong-nang-nu', 2, 'ACTIVE'),
(18, 2, 'Đầm và chân váy', 'dam-va-chan-vay', 3, 'ACTIVE'),
(19, 2, 'Quần nữ', 'quan-nu', 4, 'ACTIVE'),
(20, 2, 'Đồ mặc nhà nữ', 'do-mac-nha-nu', 5, 'ACTIVE'),
(21, 3, 'Bé trai', 'be-trai', 1, 'ACTIVE'),
(22, 3, 'Bé gái', 'be-gai', 2, 'ACTIVE'),
(23, 4, 'Đồng phục công ty', 'dong-phuc-cong-ty', 1, 'ACTIVE'),
(24, 4, 'Đồng phục lớp', 'dong-phuc-lop', 2, 'ACTIVE');

INSERT IGNORE INTO product_categories (product_id, category_id)
VALUES
(1, 1), (2, 2), (3, 1), (4, 2);

INSERT IGNORE INTO products (
    id, brand_id, product_code, name, slug, short_description, description,
    material, care_instruction, gender_target, status, is_featured, min_price, max_price
)
VALUES
(5, 1, 'AO_THUN_NAM_BASIC', 'Áo Thun Nam Cotton Basic', 'ao-thun-nam-cotton-basic', 'Áo thun nam cotton mềm, dễ mặc hằng ngày.', 'Thiết kế basic, phù hợp đi làm, đi chơi và phối lớp.', 'Cotton', 'Giặt máy chế độ nhẹ.', 'MALE', 'ACTIVE', TRUE, 159000, 249000),
(6, 1, 'AO_SO_MI_NAM_OXFORD', 'Áo Sơ Mi Nam Oxford Dài Tay', 'ao-so-mi-nam-oxford-dai-tay', 'Áo sơ mi nam phom gọn, chất oxford đứng dáng.', 'Phù hợp môi trường công sở và gặp gỡ khách hàng.', 'Oxford cotton', 'Ủi nhiệt độ vừa.', 'MALE', 'ACTIVE', FALSE, 329000, 429000),
(7, 1, 'QUAN_KAKI_NAM_SLIM', 'Quần Kaki Nam Slim Co Giãn', 'quan-kaki-nam-slim-co-gian', 'Quần kaki nam dáng slim, co giãn nhẹ.', 'Màu trung tính, dễ phối áo polo và sơ mi.', 'Kaki stretch', 'Giặt riêng sản phẩm tối màu.', 'MALE', 'ACTIVE', FALSE, 399000, 499000),
(8, 1, 'QUAN_JEAN_NAM_STRAIGHT', 'Quần Jean Nam Straight Xanh Đậm', 'quan-jean-nam-straight-xanh-dam', 'Jean nam dáng đứng, bền màu và dễ mặc.', 'Phù hợp phong cách năng động hằng ngày.', 'Denim', 'Lộn trái khi giặt.', 'MALE', 'ACTIVE', FALSE, 449000, 549000),
(9, 1, 'AO_KHOAC_NAM_GIO', 'Áo Khoác Nam Gió Chống Nhăn', 'ao-khoac-nam-gio-chong-nhan', 'Áo khoác gió nhẹ, tiện mang theo.', 'Lớp ngoài cản gió nhẹ, hợp đi làm và du lịch.', 'Polyester', 'Không sấy nhiệt cao.', 'MALE', 'ACTIVE', TRUE, 499000, 649000),
(10, 1, 'AO_POLO_NAM_CAFE', 'Áo Polo Nam Cafe Khử Mùi', 'ao-polo-nam-cafe-khu-mui', 'Polo nam chất cafe thoáng khí.', 'Dòng sản phẩm mới, mềm và thoải mái.', 'Cafe fabric', 'Giặt nhẹ, phơi nơi thoáng mát.', 'MALE', 'ACTIVE', TRUE, 349000, 449000),
(11, 1, 'AO_THUN_NAM_ACTIVE', 'Áo Thun Nam Active Thấm Hút', 'ao-thun-nam-active-tham-hut', 'Áo thun vận động nhẹ, nhanh khô.', 'Tối ưu cho đi bộ, thể thao nhẹ và mặc nhà.', 'Poly-cotton', 'Không dùng chất tẩy mạnh.', 'MALE', 'ACTIVE', FALSE, 129000, 229000),
(12, 1, 'QUAN_SHORT_NAM_BASIC', 'Quần Short Nam Basic Túi Chéo', 'quan-short-nam-basic-tui-cheo', 'Short nam thoải mái cho ngày hè.', 'Thiết kế tối giản, dễ phối áo thun.', 'Kaki mỏng', 'Giặt máy chế độ nhẹ.', 'MALE', 'ACTIVE', FALSE, 249000, 329000),
(13, 1, 'AO_POLO_NU_AIRYCOOL', 'Áo Polo Nữ Airycool Mềm Mát', 'ao-polo-nu-airycool-mem-mat', 'Polo nữ chất mát, phom thanh lịch.', 'Phù hợp mặc đi làm, đi chơi.', 'Airycool', 'Giặt nhẹ.', 'FEMALE', 'ACTIVE', TRUE, 299000, 399000),
(14, 1, 'AO_CHONG_NANG_NU_UV', 'Áo Chống Nắng Nữ UV Zip Cao Cổ', 'ao-chong-nang-nu-uv-zip-cao-co', 'Áo chống nắng nữ che phủ tốt.', 'Thiết kế zip tiện lợi, chất vải nhẹ.', 'Polyester UV', 'Không là trực tiếp.', 'FEMALE', 'ACTIVE', TRUE, 399000, 499000),
(15, 1, 'DAM_SUONG_NU_CONG_SO', 'Đầm Suông Nữ Công Sở Cổ Tròn', 'dam-suong-nu-cong-so-co-tron', 'Đầm suông nữ thanh lịch.', 'Phù hợp đi làm và gặp gỡ cuối tuần.', 'Vải tổng hợp mềm', 'Giặt nhẹ.', 'FEMALE', 'ACTIVE', FALSE, 459000, 559000),
(16, 1, 'CHAN_VAY_CHU_A', 'Chân Váy Chữ A Cạp Cao', 'chan-vay-chu-a-cap-cao', 'Chân váy chữ A dễ phối.', 'Tôn dáng, hợp sơ mi và áo thun.', 'Twill', 'Ủi nhiệt độ thấp.', 'FEMALE', 'ACTIVE', FALSE, 329000, 429000),
(17, 1, 'QUAN_JEAN_NU_ONG_DUNG', 'Quần Jean Nữ Ống Đứng', 'quan-jean-nu-ong-dung', 'Jean nữ ống đứng, dáng hiện đại.', 'Dễ mặc với áo polo, áo thun hoặc sơ mi.', 'Denim stretch', 'Lộn trái khi giặt.', 'FEMALE', 'ACTIVE', FALSE, 449000, 549000),
(18, 1, 'AO_SO_MI_NU_LUA', 'Áo Sơ Mi Nữ Lụa Mềm', 'ao-so-mi-nu-lua-mem', 'Sơ mi nữ mềm, rủ nhẹ.', 'Phong cách công sở nhẹ nhàng.', 'Lụa pha', 'Giặt tay khuyến nghị.', 'FEMALE', 'ACTIVE', FALSE, 359000, 459000),
(19, 1, 'DO_BO_MAC_NHA_NU', 'Đồ Bộ Mặc Nhà Nữ Cotton', 'do-bo-mac-nha-nu-cotton', 'Set mặc nhà nữ thoải mái.', 'Chất cotton mềm, phù hợp sinh hoạt hằng ngày.', 'Cotton', 'Giặt máy chế độ nhẹ.', 'FEMALE', 'ACTIVE', FALSE, 299000, 399000),
(20, 1, 'VAY_CONG_SO_SALE', 'Váy Công Sở Dáng Xòe Sale', 'vay-cong-so-dang-xoe-sale', 'Váy công sở đang ưu đãi.', 'Dáng xòe nhẹ, thanh lịch.', 'Tổng hợp mềm', 'Giặt nhẹ.', 'FEMALE', 'ACTIVE', FALSE, 299000, 499000),
(21, 1, 'AO_POLO_BE_TRAI', 'Áo Polo Bé Trai Năng Động', 'ao-polo-be-trai-nang-dong', 'Polo bé trai mềm, dễ vận động.', 'Phù hợp đi học và đi chơi.', 'Cotton pha', 'Giặt nhẹ.', 'KIDS', 'ACTIVE', TRUE, 169000, 249000),
(22, 1, 'AO_THUN_BE_TRAI', 'Áo Thun Bé Trai In Nhỏ', 'ao-thun-be-trai-in-nho', 'Áo thun bé trai nhẹ mát.', 'Thiết kế vui tươi, dễ phối quần short.', 'Cotton', 'Giặt máy nhẹ.', 'KIDS', 'ACTIVE', FALSE, 119000, 179000),
(23, 1, 'QUAN_SHORT_BE_TRAI', 'Quần Short Bé Trai Kaki', 'quan-short-be-trai-kaki', 'Short bé trai bền, thoải mái.', 'Phù hợp vận động ngoài trời.', 'Kaki', 'Giặt nhẹ.', 'KIDS', 'ACTIVE', FALSE, 149000, 219000),
(24, 1, 'DAM_BE_GAI_XOE', 'Đầm Bé Gái Dáng Xòe', 'dam-be-gai-dang-xoe', 'Đầm bé gái xinh xắn.', 'Dáng xòe nhẹ, phù hợp đi chơi.', 'Cotton pha', 'Giặt tay khuyến nghị.', 'KIDS', 'ACTIVE', TRUE, 229000, 329000),
(25, 1, 'AO_THUN_BE_GAI', 'Áo Thun Bé Gái Tay Bồng', 'ao-thun-be-gai-tay-bong', 'Áo thun bé gái mềm mại.', 'Tay bồng nhẹ, phối chân váy hoặc quần short.', 'Cotton', 'Giặt nhẹ.', 'KIDS', 'ACTIVE', FALSE, 129000, 199000),
(26, 1, 'DO_BO_TRE_EM', 'Đồ Bộ Trẻ Em Cotton Mềm', 'do-bo-tre-em-cotton-mem', 'Set đồ bộ trẻ em thoải mái.', 'Dễ mặc ở nhà và đi chơi.', 'Cotton', 'Giặt máy nhẹ.', 'KIDS', 'ACTIVE', FALSE, 199000, 279000),
(27, 1, 'AO_KHOAC_TRE_EM', 'Áo Khoác Trẻ Em Chống Gió', 'ao-khoac-tre-em-chong-gio', 'Áo khoác trẻ em nhẹ, gọn.', 'Phù hợp ngày se lạnh.', 'Polyester', 'Không sấy nhiệt cao.', 'KIDS', 'ACTIVE', FALSE, 299000, 399000),
(28, 1, 'DONG_PHUC_POLO_CONG_TY', 'Đồng Phục Polo Công Ty', 'dong-phuc-polo-cong-ty', 'Polo đồng phục công ty dễ nhận diện.', 'Có thể in thêu logo theo yêu cầu.', 'Cotton pique', 'Giặt nhẹ.', 'UNISEX', 'ACTIVE', TRUE, 189000, 289000),
(29, 1, 'DONG_PHUC_SO_MI_CONG_TY', 'Đồng Phục Sơ Mi Công Ty', 'dong-phuc-so-mi-cong-ty', 'Sơ mi đồng phục lịch sự.', 'Phù hợp văn phòng và sự kiện.', 'Oxford cotton', 'Ủi nhiệt độ vừa.', 'UNISEX', 'ACTIVE', FALSE, 269000, 369000),
(30, 1, 'DONG_PHUC_LOP_POLO', 'Đồng Phục Lớp Polo Phối Màu', 'dong-phuc-lop-polo-phoi-mau', 'Polo đồng phục lớp trẻ trung.', 'Dễ phối màu theo tập thể.', 'Cotton pha', 'Giặt nhẹ.', 'UNISEX', 'ACTIVE', FALSE, 179000, 259000),
(31, 1, 'AO_KHOAC_DONG_PHUC', 'Áo Khoác Đồng Phục Nhẹ', 'ao-khoac-dong-phuc-nhe', 'Áo khoác đồng phục cho đội nhóm.', 'Thiết kế tối giản, dễ in logo.', 'Polyester', 'Không sấy nhiệt cao.', 'UNISEX', 'ACTIVE', FALSE, 349000, 449000),
(32, 1, 'COMBO_DONG_PHUC_SU_KIEN', 'Combo Đồng Phục Sự Kiện', 'combo-dong-phuc-su-kien', 'Combo đồng phục số lượng lớn.', 'Phù hợp sự kiện, hội nhóm và doanh nghiệp.', 'Cotton pha', 'Giặt nhẹ.', 'UNISEX', 'ACTIVE', FALSE, 159000, 299000),
(33, 1, 'AO_POLO_NAM_PREMIUM_NEW', 'Áo Polo Nam Premium Hàng Mới', 'ao-polo-nam-premium-hang-moi', 'Polo nam premium mới về.', 'Chất vải mềm, giữ phom tốt.', 'Cotton premium', 'Giặt nhẹ.', 'MALE', 'ACTIVE', TRUE, 399000, 499000),
(34, 1, 'VAY_LIEN_NU_NEW', 'Váy Liền Nữ Hàng Mới', 'vay-lien-nu-hang-moi', 'Váy liền nữ mới về.', 'Dáng thanh lịch, dễ mặc đi làm.', 'Tổng hợp mềm', 'Giặt nhẹ.', 'FEMALE', 'ACTIVE', TRUE, 529000, 629000);

INSERT IGNORE INTO product_categories (product_id, category_id)
VALUES
(5,1),(5,5),(5,13),(6,1),(6,5),(6,14),(7,1),(7,6),(7,15),(8,1),(8,6),(8,15),(9,1),(9,5),(9,16),(10,1),(10,9),(10,12),(11,1),(11,13),(11,11),(12,1),(12,6),(12,15),
(13,2),(13,10),(13,12),(14,2),(14,7),(14,17),(15,2),(15,8),(15,18),(16,2),(16,18),(17,2),(17,19),(18,2),(18,7),(19,2),(19,20),(20,2),(20,8),(20,18),(20,11),
(21,3),(21,21),(22,3),(22,21),(23,3),(23,21),(24,3),(24,22),(25,3),(25,22),(26,3),(26,21),(26,22),(27,3),(27,21),(27,22),
(28,4),(28,23),(29,4),(29,23),(30,4),(30,24),(31,4),(31,23),(32,4),(32,23),(32,11),(33,1),(33,9),(33,12),(34,2),(34,8),(34,12);

INSERT IGNORE INTO product_skus (
    id, product_id, color_id, size_id, sku_code, barcode, variant_key, variant_name,
    price, compare_at_price, cost_price, weight_gram, status
)
VALUES
(13,5,2,2,'AO-THUN-NAM-BASIC-M','893000000013','TRANG-M','Trắng / M',159000,249000,80000,220,'ACTIVE'),
(14,6,3,3,'AO-SO-MI-NAM-OXFORD-L','893000000014','NAVY-L','Xanh navy / L',329000,429000,160000,280,'ACTIVE'),
(15,7,1,3,'QUAN-KAKI-NAM-SLIM-L','893000000015','DEN-L','Đen / L',399000,499000,190000,420,'ACTIVE'),
(16,8,3,3,'QUAN-JEAN-NAM-STRAIGHT-L','893000000016','NAVY-L','Xanh navy / L',449000,549000,220000,520,'ACTIVE'),
(17,9,1,3,'AO-KHOAC-NAM-GIO-L','893000000017','DEN-L','Đen / L',499000,649000,250000,360,'ACTIVE'),
(18,10,3,2,'AO-POLO-NAM-CAFE-M','893000000018','NAVY-M','Xanh navy / M',349000,449000,170000,280,'ACTIVE'),
(19,11,2,2,'AO-THUN-NAM-ACTIVE-M','893000000019','TRANG-M','Trắng / M',129000,229000,65000,210,'ACTIVE'),
(20,12,4,3,'QUAN-SHORT-NAM-BASIC-L','893000000020','BE-L','Be / L',249000,329000,120000,300,'ACTIVE'),
(21,13,2,1,'AO-POLO-NU-AIRYCOOL-S','893000000021','TRANG-S','Trắng / S',299000,399000,140000,240,'ACTIVE'),
(22,14,4,2,'AO-CHONG-NANG-NU-UV-M','893000000022','BE-M','Be / M',399000,499000,190000,300,'ACTIVE'),
(23,15,4,2,'DAM-SUONG-NU-CONG-SO-M','893000000023','BE-M','Be / M',459000,559000,220000,360,'ACTIVE'),
(24,16,1,2,'CHAN-VAY-CHU-A-M','893000000024','DEN-M','Đen / M',329000,429000,160000,300,'ACTIVE'),
(25,17,3,2,'QUAN-JEAN-NU-ONG-DUNG-M','893000000025','NAVY-M','Xanh navy / M',449000,549000,220000,480,'ACTIVE'),
(26,18,2,1,'AO-SO-MI-NU-LUA-S','893000000026','TRANG-S','Trắng / S',359000,459000,170000,220,'ACTIVE'),
(27,19,4,2,'DO-BO-MAC-NHA-NU-M','893000000027','BE-M','Be / M',299000,399000,140000,350,'ACTIVE'),
(28,20,4,2,'VAY-CONG-SO-SALE-M','893000000028','BE-M','Be / M',299000,499000,160000,360,'ACTIVE'),
(29,21,3,1,'AO-POLO-BE-TRAI-S','893000000029','NAVY-S','Xanh navy / S',169000,249000,85000,180,'ACTIVE'),
(30,22,2,1,'AO-THUN-BE-TRAI-S','893000000030','TRANG-S','Trắng / S',119000,179000,60000,160,'ACTIVE'),
(31,23,4,1,'QUAN-SHORT-BE-TRAI-S','893000000031','BE-S','Be / S',149000,219000,75000,200,'ACTIVE'),
(32,24,4,1,'DAM-BE-GAI-S','893000000032','BE-S','Be / S',229000,329000,110000,220,'ACTIVE'),
(33,25,2,1,'AO-THUN-BE-GAI-S','893000000033','TRANG-S','Trắng / S',129000,199000,65000,160,'ACTIVE'),
(34,26,2,1,'DO-BO-TRE-EM-S','893000000034','TRANG-S','Trắng / S',199000,279000,95000,240,'ACTIVE'),
(35,27,3,1,'AO-KHOAC-TRE-EM-S','893000000035','NAVY-S','Xanh navy / S',299000,399000,145000,260,'ACTIVE'),
(36,28,3,2,'DONG-PHUC-POLO-CONG-TY-M','893000000036','NAVY-M','Xanh navy / M',189000,289000,90000,260,'ACTIVE'),
(37,29,2,2,'DONG-PHUC-SO-MI-CONG-TY-M','893000000037','TRANG-M','Trắng / M',269000,369000,130000,280,'ACTIVE'),
(38,30,3,2,'DONG-PHUC-LOP-POLO-M','893000000038','NAVY-M','Xanh navy / M',179000,259000,85000,250,'ACTIVE'),
(39,31,1,3,'AO-KHOAC-DONG-PHUC-L','893000000039','DEN-L','Đen / L',349000,449000,170000,340,'ACTIVE'),
(40,32,2,2,'COMBO-DONG-PHUC-SU-KIEN-M','893000000040','TRANG-M','Trắng / M',159000,299000,80000,250,'ACTIVE'),
(41,33,3,2,'AO-POLO-NAM-PREMIUM-NEW-M','893000000041','NAVY-M','Xanh navy / M',399000,499000,190000,280,'ACTIVE'),
(42,34,4,2,'VAY-LIEN-NU-NEW-M','893000000042','BE-M','Be / M',529000,629000,260000,380,'ACTIVE');

INSERT IGNORE INTO product_images (product_id, sku_id, image_url, alt_text, sort_order, is_thumbnail)
VALUES
(5,NULL,'/uploads/products/ao-polo-nam-regular.webp','Áo Thun Nam Cotton Basic',1,TRUE),
(6,NULL,'/uploads/products/ao-polo-nam-slim.webp','Áo Sơ Mi Nam Oxford Dài Tay',1,TRUE),
(7,NULL,'/uploads/products/ao-polo-nam-regular-2.webp','Quần Kaki Nam Slim Co Giãn',1,TRUE),
(8,NULL,'/uploads/products/ao-polo-nam-slim-2.webp','Quần Jean Nam Straight Xanh Đậm',1,TRUE),
(9,NULL,'/uploads/products/ao-polo-nam-slim.webp','Áo Khoác Nam Gió Chống Nhăn',1,TRUE),
(10,NULL,'/uploads/products/ao-polo-nam-regular.webp','Áo Polo Nam Cafe Khử Mùi',1,TRUE),
(11,NULL,'/uploads/products/ao-polo-nam-regular-2.webp','Áo Thun Nam Active Thấm Hút',1,TRUE),
(12,NULL,'/uploads/products/ao-polo-nam-slim-2.webp','Quần Short Nam Basic Túi Chéo',1,TRUE),
(13,NULL,'/uploads/products/ao-polo-nu-regular.webp','Áo Polo Nữ Airycool Mềm Mát',1,TRUE),
(14,NULL,'/uploads/products/ao-polo-nu-regular-2.webp','Áo Chống Nắng Nữ UV Zip Cao Cổ',1,TRUE),
(15,NULL,'/uploads/products/vay-lien-co-duc.webp','Đầm Suông Nữ Công Sở Cổ Tròn',1,TRUE),
(16,NULL,'/uploads/products/vay-lien-co-duc-2.webp','Chân Váy Chữ A Cạp Cao',1,TRUE),
(17,NULL,'/uploads/products/ao-polo-nu-regular.webp','Quần Jean Nữ Ống Đứng',1,TRUE),
(18,NULL,'/uploads/products/ao-polo-nu-regular-2.webp','Áo Sơ Mi Nữ Lụa Mềm',1,TRUE),
(19,NULL,'/uploads/products/vay-lien-co-duc-2.webp','Đồ Bộ Mặc Nhà Nữ Cotton',1,TRUE),
(20,NULL,'/uploads/products/vay-lien-co-duc.webp','Váy Công Sở Dáng Xòe Sale',1,TRUE),
(21,NULL,'/uploads/products/ao-polo-nam-regular.webp','Áo Polo Bé Trai Năng Động',1,TRUE),
(22,NULL,'/uploads/products/ao-polo-nam-slim.webp','Áo Thun Bé Trai In Nhỏ',1,TRUE),
(23,NULL,'/uploads/products/ao-polo-nam-regular-2.webp','Quần Short Bé Trai Kaki',1,TRUE),
(24,NULL,'/uploads/products/vay-lien-co-duc.webp','Đầm Bé Gái Dáng Xòe',1,TRUE),
(25,NULL,'/uploads/products/ao-polo-nu-regular.webp','Áo Thun Bé Gái Tay Bồng',1,TRUE),
(26,NULL,'/uploads/products/ao-polo-nu-regular-2.webp','Đồ Bộ Trẻ Em Cotton Mềm',1,TRUE),
(27,NULL,'/uploads/products/ao-polo-nam-slim-2.webp','Áo Khoác Trẻ Em Chống Gió',1,TRUE),
(28,NULL,'/uploads/products/ao-polo-nam-regular.webp','Đồng Phục Polo Công Ty',1,TRUE),
(29,NULL,'/uploads/products/ao-polo-nam-slim.webp','Đồng Phục Sơ Mi Công Ty',1,TRUE),
(30,NULL,'/uploads/products/ao-polo-nu-regular.webp','Đồng Phục Lớp Polo Phối Màu',1,TRUE),
(31,NULL,'/uploads/products/ao-polo-nam-slim-2.webp','Áo Khoác Đồng Phục Nhẹ',1,TRUE),
(32,NULL,'/uploads/products/ao-polo-nam-regular-2.webp','Combo Đồng Phục Sự Kiện',1,TRUE),
(33,NULL,'/uploads/products/ao-polo-nam-regular.webp','Áo Polo Nam Premium Hàng Mới',1,TRUE),
(34,NULL,'/uploads/products/vay-lien-co-duc.webp','Váy Liền Nữ Hàng Mới',1,TRUE);

INSERT IGNORE INTO inventory_balances (stock_location_id, sku_id, qty_on_hand, qty_reserved)
VALUES
(1,13,80,0),(1,14,80,0),(1,15,80,0),(1,16,80,0),(1,17,80,0),(1,18,80,0),(1,19,80,0),(1,20,80,0),(1,21,80,0),(1,22,80,0),
(1,23,80,0),(1,24,80,0),(1,25,80,0),(1,26,80,0),(1,27,80,0),(1,28,80,0),(1,29,80,0),(1,30,80,0),(1,31,80,0),(1,32,80,0),
(1,33,80,0),(1,34,80,0),(1,35,80,0),(1,36,80,0),(1,37,80,0),(1,38,80,0),(1,39,80,0),(1,40,80,0),(1,41,80,0),(1,42,80,0);
