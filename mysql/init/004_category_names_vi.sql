USE fashion_store;
SET NAMES utf8mb4;

UPDATE categories AS category
JOIN (
    SELECT 1 AS id, 'Nam' AS name
    UNION ALL SELECT 2, 'Nữ'
    UNION ALL SELECT 3, 'Trẻ em'
    UNION ALL SELECT 4, 'Đồng phục'
    UNION ALL SELECT 5, 'Áo nam'
    UNION ALL SELECT 6, 'Quần nam'
    UNION ALL SELECT 7, 'Áo nữ'
    UNION ALL SELECT 8, 'Váy nữ'
    UNION ALL SELECT 9, 'Áo Polo Nam'
    UNION ALL SELECT 10, 'Áo Polo Nữ'
    UNION ALL SELECT 11, 'Ưu đãi'
    UNION ALL SELECT 12, 'Hàng mới về'
    UNION ALL SELECT 13, 'Áo thun nam'
    UNION ALL SELECT 14, 'Áo sơ mi nam'
    UNION ALL SELECT 15, 'Quần nam'
    UNION ALL SELECT 16, 'Áo khoác nam'
    UNION ALL SELECT 17, 'Áo chống nắng nữ'
    UNION ALL SELECT 18, 'Đầm và chân váy'
    UNION ALL SELECT 19, 'Quần nữ'
    UNION ALL SELECT 20, 'Đồ mặc nhà nữ'
    UNION ALL SELECT 21, 'Bé trai'
    UNION ALL SELECT 22, 'Bé gái'
    UNION ALL SELECT 23, 'Đồng phục công ty'
    UNION ALL SELECT 24, 'Đồng phục lớp'
) AS translated ON translated.id = category.id
SET category.name = translated.name;
