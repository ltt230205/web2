# Sơ đồ toàn bộ hệ thống Fashion Store

Tài liệu này phản ánh code hiện tại trong `frontend`, `backend`, `mysql/init` và
`docker-compose.yml`.

## 1. Kiến trúc triển khai

```mermaid
flowchart LR
    browser["Trình duyệt<br/>Khách hàng / Admin"]

    subgraph host["Máy host"]
        local["localStorage<br/>access_token, refresh_token,<br/>current_user, cart"]
        uploaded["uploads/products<br/>Ảnh admin upload"]
    end

    subgraph docker["Docker Compose - fashion_network"]
        frontend["fashion_frontend<br/>React + Vite + Tailwind + Zustand<br/>:5173"]
        backend["fashion_backend<br/>Node.js + Express<br/>REST API :8000"]
        mysql["fashion_mysql<br/>MySQL 8.4<br/>:3306 nội bộ"]
    end

    volume[("fashion_mysql_data<br/>Docker volume")]
    dbtool["Công cụ quản trị DB<br/>127.0.0.1:3307"]

    browser -->|"HTTP :5173"| frontend
    frontend -->|"Axios REST API<br/>VITE_API_URL=http://localhost:8000"| backend
    browser <-->|"Đọc / ghi"| local
    backend -->|"mysql2 pool<br/>tối đa 10 kết nối"| mysql
    backend <-->|"Lưu và phục vụ /uploads/*"| uploaded
    mysql <-->|"Persist dữ liệu"| volume
    dbtool -->|"Host port 3307 -> container 3306"| mysql
```

## 2. Bản đồ chức năng và API

```mermaid
flowchart TB
    subgraph ui["Frontend React"]
        public["Public Store<br/>/ /products /products/:id"]
        authui["Tài khoản<br/>/login /register /account/*"]
        cartui["Giỏ hàng và checkout<br/>/cart"]
        adminui["Quản trị<br/>/admin"]
        state["Zustand + localStorage<br/>Auth state và cart state"]
    end

    subgraph api["Express REST API"]
        auth["/auth<br/>register, login, me"]
        products["/products<br/>listing, detail, filter metadata"]
        customer["/customer<br/>CRUD địa chỉ giao hàng"]
        orders["/orders<br/>quote, create, list, detail"]
        admin["/admin<br/>dashboard, products, inventory,<br/>categories, orders, customers,<br/>discount codes, upload image"]
        static["/uploads<br/>Static product images"]
        middleware["Middleware<br/>CORS, JSON, JWT auth,<br/>admin role, error handler"]
    end

    subgraph db["MySQL fashion_store"]
        identity["Identity<br/>accounts, customers,<br/>customer_addresses"]
        catalog["Catalog<br/>brands, categories, products,<br/>product_categories, colors,<br/>sizes, product_skus, product_images"]
        stock["Inventory<br/>stock_locations,<br/>inventory_balances"]
        commerce["Commerce<br/>discount_codes, orders,<br/>order_items, payments"]
        unused["Schema dự phòng<br/>carts, cart_items"]
    end

    public --> products
    public --> static
    authui --> auth
    authui --> customer
    authui --> orders
    cartui --> state
    cartui --> customer
    cartui --> orders
    adminui --> admin
    auth --> middleware
    customer --> middleware
    orders --> middleware
    admin --> middleware
    auth --> identity
    products --> catalog
    products --> stock
    customer --> identity
    orders --> identity
    orders --> catalog
    orders --> stock
    orders --> commerce
    admin --> identity
    admin --> catalog
    admin --> stock
    admin --> commerce
```

Ghi chú:

- Giỏ hàng hiện tại được lưu ở `localStorage`, chưa dùng bảng `carts` và
  `cart_items`.
- Backend phát cả access token và refresh token, nhưng hiện chưa có endpoint
  refresh token.
- `COD`, `BANK_TRANSFER`, `MOMO`, `ZALOPAY` hiện chỉ được ghi vào đơn hàng.
  Project chưa tích hợp cổng thanh toán hoặc webhook bên ngoài.

## 3. Luồng checkout và xử lý tồn kho

```mermaid
sequenceDiagram
    actor Customer as Khách hàng
    participant FE as React /cart
    participant API as Express /orders
    participant DB as MySQL
    actor Admin as Admin /admin

    Customer->>FE: Chọn SKU và số lượng
    FE->>FE: Lưu cart vào localStorage
    Customer->>FE: Áp dụng mã giảm giá
    FE->>API: POST /orders/quote
    API->>DB: Kiểm tra SKU, qty_available, discount_codes
    DB-->>API: Giá, tồn khả dụng, ưu đãi
    API-->>FE: item_total, discount_total, shipping_fee, grand_total

    Customer->>FE: Chọn địa chỉ, payment_method, xác nhận
    FE->>API: POST /orders
    API->>DB: BEGIN TRANSACTION
    API->>DB: Khóa inventory_balances FOR UPDATE
    API->>DB: Tăng qty_reserved theo SKU
    API->>DB: INSERT orders, order_items snapshot, payments
    API->>DB: Tăng discount_codes.used_count nếu có
    API->>DB: COMMIT
    API-->>FE: Đơn hàng đã tạo
    FE->>FE: Xóa cart localStorage

    Admin->>API: PATCH /admin/orders/:id/status action=PICKED_UP
    API->>DB: Chuyển trạng thái SHIPPING

    alt Giao thành công
        Admin->>API: PATCH status action=DELIVERED
        API->>DB: Giảm qty_reserved và qty_on_hand
        API->>DB: Chuyển trạng thái COMPLETED
    else Hủy khi đang chờ xử lý
        Admin->>API: PATCH status action=CANCELLED
        API->>DB: Giảm qty_reserved, giữ nguyên qty_on_hand
        API->>DB: Giảm discount_codes.used_count nếu có
        API->>DB: Chuyển trạng thái CANCELLED
    end
```

## 4. Quan hệ dữ liệu chính

```mermaid
erDiagram
    accounts ||--o| customers : "customer profile"
    customers ||--o{ customer_addresses : has
    customers ||--o{ carts : has
    customers ||--o{ orders : places

    brands ||--o{ products : brands
    categories ||--o{ categories : parent
    products ||--o{ product_categories : classified
    categories ||--o{ product_categories : contains
    products ||--o{ product_skus : variants
    colors ||--o{ product_skus : color
    sizes ||--o{ product_skus : size
    products ||--o{ product_images : images
    product_skus ||--o{ product_images : optional_variant_image

    stock_locations ||--o{ inventory_balances : stores
    product_skus ||--o{ inventory_balances : stocked

    carts ||--o{ cart_items : contains
    product_skus ||--o{ cart_items : selected

    discount_codes ||--o{ orders : applied
    orders ||--o{ order_items : snapshots
    product_skus ||--o{ order_items : source_sku
    orders ||--o{ payments : payments
```

## 5. Nhóm endpoint

| Nhóm | Endpoint chính | Quyền truy cập |
|---|---|---|
| Hệ thống | `GET /`, `GET /health`, `GET /uploads/*` | Public |
| Xác thực | `POST /auth/register`, `POST /auth/login`, `GET /auth/me` | Public / JWT |
| Catalog | `GET /products`, `GET /products/:id`, `GET /products/search/*` | Public |
| Địa chỉ | `GET POST DELETE /customer/addresses...` | Customer có JWT |
| Đơn hàng | `POST /orders/quote`, `POST /orders`, `GET /orders...` | Customer có JWT |
| Admin | `/admin/dashboard`, `/admin/products...`, `/admin/inventory...`, `/admin/categories...`, `/admin/orders...`, `/admin/customers`, `/admin/discount-codes...`, `/admin/uploads/product-image` | Admin có JWT |

## 6. Khởi tạo dữ liệu

Khi MySQL tạo volume mới, các script trong `mysql/init` chạy theo thứ tự:

```text
001_schema.sql
002_seed.sql
003_admin.sql
004_category_names_vi.sql
005_commerce_features.sql
006_repair_vietnamese_text.sql
```

`005_commerce_features.sql` bổ sung `discount_codes` và liên kết
`orders.discount_code_id`.
