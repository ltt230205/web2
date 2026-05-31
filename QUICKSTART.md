# Quick Start

## Docker

Start Docker Desktop, then run:

```bash
cd D:\database_web
docker compose up -d --build
docker compose logs -f
```

Open:

- Frontend: http://localhost:5173
- Backend health check: http://localhost:8000/health
- Products API: http://localhost:8000/products?page=1&page_size=20
- Admin page: http://localhost:5173/admin
- MySQL from host: `localhost:3307`

Admin login:

```text
Email: admin@yody.demo
Password: Admin@123
```

If the MySQL volume already existed before the admin seed was added:

```bash
docker compose exec backend npm run seed:admin
```

## Run Backend Locally

Use a reachable MySQL host in `backend/.env`, then:

```bash
cd backend
npm install
npm run dev
```

Useful checks:

```bash
npm run check
docker compose config
```
