# Fashion Store Demo

Website bán hàng thời trang dùng:

- Frontend: React, Vite, Tailwind CSS, Zustand
- Backend: Node.js, Express.js, JWT, bcrypt
- Database: MySQL 8.4
- Môi trường chạy: Docker Compose

Tài liệu này hướng dẫn khởi động dự án từ đầu trên Windows.

## 1. Yêu cầu trước khi chạy

Cài đặt:

1. Docker Desktop: https://www.docker.com/products/docker-desktop/
2. Git nếu cần clone source code: https://git-scm.com/downloads

Sau khi cài Docker Desktop:

1. Mở Docker Desktop.
2. Chờ đến khi Docker báo đang chạy.
3. Mở PowerShell.
4. Kiểm tra Docker:

```powershell
docker --version
docker compose version
```

## 2. Mở thư mục dự án

Trong PowerShell, chuyển đến thư mục dự án:

```powershell
cd D:\database_web
```

Kiểm tra các file chính:

```powershell
Get-ChildItem
```

Cấu trúc cơ bản:

```text
database_web/
├── backend/              Express.js API
├── frontend/             React website
├── mysql/init/           Schema, seed và migration MySQL
├── uploads/              Ảnh sản phẩm upload từ admin
├── .env                  Cấu hình MySQL container
├── docker-compose.yml    Cấu hình chạy toàn bộ hệ thống
└── README.md
```

## 3. Khởi động website lần đầu

Tạo file cấu hình local từ file mẫu:

```powershell
Copy-Item .env.example .env
Copy-Item backend\.env.example backend\.env
```

Các file `.env` chỉ dùng trên máy local và không được đẩy lên GitHub.

Đảm bảo Docker Desktop đang chạy, sau đó thực hiện:

```powershell
docker compose up -d --build
```

Lệnh này sẽ:

1. Tải image MySQL nếu máy chưa có.
2. Build frontend và backend.
3. Tạo container MySQL, backend và frontend.
4. Tạo database `fashion_store`.
5. Tự động chạy schema, seed dữ liệu mẫu và các migration trong `mysql/init`.
6. Tạo tài khoản admin mẫu.

Lần đầu có thể mất vài phút.

## 4. Kiểm tra container

Chạy:

```powershell
docker compose ps
```

Kết quả cần có ba service đang chạy:

```text
fashion_mysql       healthy
fashion_backend     Up
fashion_frontend    Up
```

Kiểm tra backend:

```powershell
Invoke-RestMethod http://localhost:8000/health
```

Kết quả:

```text
status
------
ok
```

## 5. Truy cập website

Mở trình duyệt:

| Thành phần | Địa chỉ |
|---|---|
| Website bán hàng | http://localhost:5173 |
| Trang đăng nhập | http://localhost:5173/login |
| Trang admin | http://localhost:5173/admin |
| Backend API | http://localhost:8000 |
| Backend health check | http://localhost:8000/health |

## 6. Tài khoản admin mẫu

```text
Email: admin@yody.demo
Mật khẩu: Admin@123
```

Đăng nhập tại:

```text
http://localhost:5173/login
```

Sau khi đăng nhập, admin được chuyển đến:

```text
http://localhost:5173/admin
```

Admin không có chức năng giỏ hàng hoặc đặt hàng.

## 7. Sử dụng với role user

### Đăng ký

1. Mở http://localhost:5173/register
2. Nhập họ tên, email, số điện thoại và mật khẩu.
3. Đăng nhập bằng tài khoản vừa tạo.

### Mua hàng

1. Chọn sản phẩm từ menu hoặc trang `/products`.
2. Lọc theo danh mục, giới tính, size, màu sắc, thương hiệu và khoảng giá.
3. Mở chi tiết sản phẩm.
4. Chọn biến thể và số lượng.
5. Bấm `Thêm vào giỏ` hoặc `Mua ngay`.
6. Mở giỏ hàng.
7. Thêm địa chỉ giao hàng.
8. Chọn phương thức thanh toán.
9. Xác nhận đơn hàng.

Mã giảm giá mẫu:

```text
WELCOME10   Giảm 10% cho đơn từ 299.000đ
FASHION50   Giảm 50.000đ cho đơn từ 499.000đ
```

### Theo dõi đơn

Sau khi đăng nhập, mở menu tài khoản:

- `Thông tin tài khoản`
- `Địa chỉ giao hàng`
- `Đơn hàng của tôi`

## 8. Sử dụng với role admin

Đăng nhập bằng tài khoản admin mẫu và mở `/admin`.

Các tab quản trị:

| Tab | Chức năng |
|---|---|
| Tổng quan | Xem doanh thu, số đơn, khách hàng và sản phẩm bán chạy |
| Sản phẩm | Thêm, sửa, xóa và upload ảnh sản phẩm |
| Tồn kho | Cập nhật tồn kho theo SKU |
| Danh mục | Thêm, sửa và ẩn danh mục |
| Đơn hàng | Xác nhận lấy hàng, giao thành công hoặc hủy đơn |
| Khách hàng | Xem tài khoản và chi tiêu của khách |
| Mã giảm giá | Tạo, sửa và tắt mã ưu đãi |

## 9. Kết nối database bằng công cụ quản lý DB

Chọn loại database `MySQL`, sau đó nhập:

```text
Name: Fashion Store Local
Host: 127.0.0.1
Port: 3307
Username: root
Password: root
Database: fashion_store
SSL: Off
```

Lưu ý:

- MySQL chạy bên trong Docker ở cổng `3306`.
- Máy Windows truy cập MySQL qua cổng `3307`.

Có thể kiểm tra database bằng terminal:

```powershell
docker compose exec -T -e MYSQL_PWD=root mysql mysql -uroot fashion_store -e "SHOW TABLES;"
```

## 10. Xem log

Xem log toàn bộ hệ thống:

```powershell
docker compose logs -f
```

Xem riêng backend:

```powershell
docker compose logs -f backend
```

Xem riêng frontend:

```powershell
docker compose logs -f frontend
```

Thoát chế độ xem log bằng `Ctrl + C`.

## 11. Dừng và chạy lại website

Dừng container:

```powershell
docker compose stop
```

Chạy lại:

```powershell
docker compose start
```

Dừng và xóa container nhưng giữ dữ liệu database:

```powershell
docker compose down
```

Chạy lại sau khi sửa source code hoặc dependency:

```powershell
docker compose up -d --build
```

## 12. Reset database từ đầu

Cảnh báo: thao tác này xóa toàn bộ tài khoản user, đơn hàng và dữ liệu đã nhập.

Chạy:

```powershell
docker compose down -v
docker compose up -d --build
```

MySQL sẽ tạo database mới và tự động chạy:

```text
mysql/init/001_schema.sql
mysql/init/002_seed.sql
mysql/init/003_admin.sql
mysql/init/004_category_names_vi.sql
mysql/init/005_commerce_features.sql
mysql/init/006_repair_vietnamese_text.sql
```

## 13. Chạy migration với database cũ

Chỉ dùng phần này nếu bạn đã có volume MySQL cũ và không muốn reset database.

```powershell
docker compose exec -T -e MYSQL_PWD=root mysql mysql --default-character-set=utf8mb4 -uroot fashion_store -e "source /docker-entrypoint-initdb.d/004_category_names_vi.sql"
docker compose exec -T -e MYSQL_PWD=root mysql mysql --default-character-set=utf8mb4 -uroot fashion_store -e "source /docker-entrypoint-initdb.d/005_commerce_features.sql"
docker compose exec -T -e MYSQL_PWD=root mysql mysql --default-character-set=utf8mb4 -uroot fashion_store -e "source /docker-entrypoint-initdb.d/006_repair_vietnamese_text.sql"
```

Lưu ý:

- Không chạy lại `005_commerce_features.sql` nếu bảng `discount_codes` đã tồn tại.
- `006_repair_vietnamese_text.sql` có thể chạy lại để sửa dữ liệu tiếng Việt bị lỗi encoding.

## 14. Xử lý lỗi thường gặp

### Docker chưa chạy

Lỗi thường gặp:

```text
Cannot connect to the Docker daemon
```

Cách xử lý: mở Docker Desktop và chờ Docker khởi động xong.

### Cổng đã được sử dụng

Website dùng các cổng:

```text
5173   Frontend
8000   Backend
3307   MySQL từ máy host
```

Kiểm tra cổng trên Windows:

```powershell
Get-NetTCPConnection -State Listen | Where-Object LocalPort -in 5173,8000,3307
```

### Frontend chưa cập nhật giao diện

1. Tải lại trình duyệt bằng `Ctrl + F5`.
2. Nếu vẫn chưa cập nhật:

```powershell
docker compose up -d --force-recreate frontend
```

### Backend thiếu dependency

Rebuild backend và làm mới volume dependency:

```powershell
docker compose up -d --build --force-recreate --renew-anon-volumes backend
```

### Kiểm tra backend có hoạt động hay không

```powershell
Invoke-RestMethod http://localhost:8000/health
```

### Kiểm tra lỗi backend

```powershell
docker compose logs --tail 100 backend
```

## 15. Upload ảnh sản phẩm

Ảnh upload từ trang admin được lưu tại:

```text
uploads/products
```

URL ảnh được phục vụ theo dạng:

```text
/uploads/products/<ten-file>
```

## 16. Ghi chú thanh toán

Các phương thức COD, chuyển khoản, MoMo và ZaloPay hiện được lưu vào đơn hàng.

Để thu tiền thật qua ví điện tử cần bổ sung API key, secret key và callback URL từ nhà cung cấp thanh toán.
