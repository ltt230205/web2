# Setup Notes

The backend uses Express.js and listens on port `8000`.
The store and admin area now use one frontend on port `5173`. Admin users open
`/admin` after login.

Start all services with:

```bash
docker compose up -d --build
```

Check the API:

```bash
curl http://localhost:8000/health
curl "http://localhost:8000/products?page=1&page_size=20"
```

For backend changes, edit files in `backend/src/`. The Docker development
command is `npm run dev`, which uses Node watch mode.
