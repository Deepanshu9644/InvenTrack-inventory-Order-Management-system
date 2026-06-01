# 📦 InvenTrack — Inventory & Order Management System

A production-ready, full-stack inventory and order management system built with **FastAPI**, **React**, **PostgreSQL**, and **Docker**.

![Python](https://img.shields.io/badge/Python-3.12-blue?logo=python&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 🌐 Live Demo

| Service | URL |
|---------|-----|
| **Frontend** | [https://inventory-order-production-5224.up.railway.app](https://inventory-order-production-5224.up.railway.app) |
| **Backend API** | [https://inventrack-inventory-order-management-system-production.up.railway.app](https://inventrack-inventory-order-management-system-production.up.railway.app) |
| **API Docs (Swagger)** | [https://inventrack-inventory-order-management-system-production.up.railway.app/docs](https://inventrack-inventory-order-management-system-production.up.railway.app/docs) |

---

## ✨ Features

- **Product Management** — Full CRUD with unique SKU tracking, price management, and real-time stock levels
- **Customer Management** — Customer registry with email uniqueness enforcement and validation
- **Order Processing** — Transactional order creation with automatic stock decrement, row-level locking, and inventory validation
- **Dashboard** — Real-time metrics with low-stock alerts and summary statistics
- **Client-Side Validation** — Frontend validates stock availability before sending API requests
- **Containerized** — One-command deployment with Docker Compose
- **Cloud Deployed** — Live on Railway with PostgreSQL, auto-deploy on push

---

## 🏗️ Architecture

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│   React +   │────▶│   FastAPI    │────▶│  PostgreSQL  │
│   Vite      │     │   Backend    │     │   Database   │
│  (Port 80)  │     │  (Port 8000) │     │  (Port 5432) │
└─────────────┘     └──────────────┘     └──────────────┘
   Frontend             Backend              Database
   (Nginx)            (Uvicorn)             (Railway)
```

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite, Tailwind CSS, Axios, React Router, React Hot Toast |
| **Backend** | FastAPI, SQLAlchemy 2.0 (async), Pydantic v2, asyncpg |
| **Database** | PostgreSQL 16 |
| **Proxy** | Nginx (serves static frontend in production) |
| **Container** | Docker, Docker Compose |
| **Deployment** | Railway (Backend + Frontend + PostgreSQL) |

---

## 🚀 Quick Start

### Prerequisites

- [Docker](https://www.docker.com/) & Docker Compose
- **OR** Python 3.12+, Node.js 20+, PostgreSQL 16+

### Option 1: Docker Compose (Recommended)

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/inventory-system.git
cd inventory-system

# Build and start all services
docker compose up --build -d

# View logs
docker compose logs -f
```

The application will be available at:

| Service | URL |
|---------|-----|
| **Frontend** | http://localhost |
| **Backend API** | http://localhost:8000 |
| **API Docs** | http://localhost:8000/docs |
| **Database** | localhost:5432 |

**Stop Services:**
```bash
docker compose down

# To also remove persisted data:
docker compose down -v
```

### Option 2: Local Development (Without Docker)

#### 1. Start PostgreSQL

```bash
# Using Docker for just the database
docker run -d --name inventory-pg \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=inventory_db \
  -p 5432:5432 \
  postgres:16-alpine
```

> **Note:** If you have a local PostgreSQL already running on port 5432, use port 5433 instead:
> ```bash
> docker run -d --name inventory-pg \
>   -e POSTGRES_USER=postgres \
>   -e POSTGRES_PASSWORD=postgres \
>   -e POSTGRES_DB=inventory_db \
>   -p 5433:5432 \
>   postgres:16-alpine
> ```

#### 2. Start Backend

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (choose your OS)
source venv/bin/activate        # macOS/Linux
.\venv\Scripts\Activate         # Windows PowerShell

# Install dependencies
pip install -r requirements.txt

# Set environment variable (choose your OS)
export DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/inventory_db        # macOS/Linux
$env:DATABASE_URL="postgresql+asyncpg://postgres:postgres@localhost:5432/inventory_db"        # Windows PowerShell

# Run the server
uvicorn app.main:app --reload --port 8000
```

Backend available at: http://localhost:8000/docs

#### 3. Start Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start dev server (proxies API to localhost:8000)
npm run dev
```

Frontend available at: http://localhost:5173

---

## 📡 API Endpoints

### Products (`/api/products`)

| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| `GET` | `/api/products` | List all products | 200 |
| `POST` | `/api/products` | Create a product | 201 |
| `GET` | `/api/products/{id}` | Get product by ID | 200 / 404 |
| `PUT` | `/api/products/{id}` | Update a product | 200 / 404 |
| `DELETE` | `/api/products/{id}` | Delete a product | 204 / 404 |
| `GET` | `/api/products/low-stock?threshold=5` | Get low-stock products | 200 |

### Customers (`/api/customers`)

| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| `GET` | `/api/customers` | List all customers | 200 |
| `POST` | `/api/customers` | Create a customer | 201 / 400 |
| `GET` | `/api/customers/{id}` | Get customer by ID | 200 / 404 |
| `DELETE` | `/api/customers/{id}` | Delete a customer | 204 / 404 |

### Orders (`/api/orders`)

| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| `GET` | `/api/orders` | List all orders | 200 |
| `POST` | `/api/orders` | Create an order | 201 / 400 |
| `GET` | `/api/orders/{id}` | Get order by ID | 200 / 404 |
| `DELETE` | `/api/orders/{id}` | Delete an order | 204 / 404 |

### Statistics (`/api/stats`)

| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| `GET` | `/api/stats/dashboard` | Dashboard statistics | 200 |

---

## 📁 Project Structure

```
inventory-system/
├── docker-compose.yml          # Orchestrates all services
├── .env                        # Environment variables
├── README.md
│
├── backend/
│   ├── Dockerfile              # Python 3.12 slim image
│   ├── requirements.txt
│   ├── .env
│   └── app/
│       ├── main.py             # FastAPI app with CORS & lifespan
│       ├── config.py           # Pydantic Settings management
│       ├── database.py         # Async SQLAlchemy engine + auto URL conversion
│       ├── models/             # SQLAlchemy ORM models
│       │   ├── __init__.py     # Base declaration
│       │   ├── product.py      # Product with check constraints
│       │   ├── customer.py     # Customer with email uniqueness
│       │   └── order.py        # Order + OrderItem with FK cascades
│       ├── schemas/            # Pydantic validation schemas
│       │   ├── product.py      # ProductCreate, ProductUpdate, ProductResponse
│       │   ├── customer.py     # CustomerCreate, CustomerResponse
│       │   └── order.py        # OrderCreate with items, OrderResponse
│       ├── crud/               # Database operations
│       │   ├── product.py      # CRUD + low stock query + IntegrityError handling
│       │   ├── customer.py     # CRUD + duplicate email handling
│       │   └── order.py        # Transactional order with FOR UPDATE locks
│       └── routers/            # API route handlers
│           ├── products.py     # /api/products endpoints
│           ├── customers.py    # /api/customers endpoints
│           ├── orders.py       # /api/orders endpoints
│           └── stats.py        # /api/stats/dashboard endpoint
│
└── frontend/
    ├── Dockerfile              # Multi-stage (Node build → Nginx serve)
    ├── nginx.conf              # Nginx with SPA fallback + gzip
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── index.html
    └── src/
        ├── main.jsx            # React entry point
        ├── App.jsx             # Router configuration
        ├── index.css           # Tailwind + glassmorphism utilities
        ├── api/                # Axios API layer
        │   ├── axios.js        # Axios instance with error interceptor
        │   ├── products.js     # Product API calls
        │   ├── customers.js    # Customer API calls
        │   ├── orders.js       # Order API calls
        │   └── stats.js        # Dashboard stats API
        ├── components/         # Reusable UI components
        │   ├── Layout.jsx      # Sidebar + main content layout
        │   ├── Modal.jsx       # Reusable modal dialog
        │   └── StatsCard.jsx   # Dashboard stat card
        └── pages/              # Route pages
            ├── Dashboard.jsx   # Overview with stats + low stock alerts
            ├── Products.jsx    # Product CRUD with search & edit modal
            ├── Customers.jsx   # Customer management with search
            └── Orders.jsx      # Order creation with item builder + stock validation
```

---

## 🔒 Business Rules

| Rule | Database Level | Application Level |
|------|---------------|-------------------|
| **Unique SKUs** | `UNIQUE` constraint + index on `products.sku` | `IntegrityError` caught → returns `"SKU already exists"` |
| **Unique Emails** | `UNIQUE` constraint + index on `customers.email` | `IntegrityError` caught → HTTP 400 |
| **Non-negative Stock** | `CHECK (quantity_in_stock >= 0)` constraint | Pydantic `Field(ge=0)` + frontend validation |
| **Non-negative Price** | `CHECK (price >= 0)` constraint | Pydantic `Field(ge=0)` validation |
| **Stock Validation on Order** | Row-level lock via `SELECT ... FOR UPDATE` | Frontend checks stock before submitting |
| **Auto Stock Decrement** | Decremented within same transaction | Automatic on order creation |
| **Price Snapshots** | `unit_price` stored on `OrderItem` | Captures price at time of order |
| **Server-side Totals** | `total_amount` calculated from items | Not trusted from client input |
| **Order Item Quantity** | `CHECK (quantity > 0)` constraint | Pydantic `Field(gt=0)` validation |

---

## 🚢 Deployment (Railway)

This project is deployed on [Railway](https://railway.com) with 3 services:

### Services

| Service | Type | Configuration |
|---------|------|--------------|
| **Backend** | Web Service (Docker) | Root Dir: `backend`, Port: dynamic `$PORT` |
| **Frontend** | Web Service (Docker) | Root Dir: `frontend`, Port: dynamic `$PORT` |
| **Database** | PostgreSQL | Managed by Railway |

### Environment Variables

| Variable | Service | Value |
|----------|---------|-------|
| `DATABASE_URL` | Backend | `postgresql://...` (auto-converted to `postgresql+asyncpg://` by app) |

### Key Deployment Notes

- **Dynamic Port:** Both Dockerfiles use `${PORT}` for Railway's dynamic port assignment
- **Auto URL Conversion:** `database.py` auto-converts `postgresql://` to `postgresql+asyncpg://` — no manual URL editing needed
- **CORS:** Backend allows all origins (`*`) for cross-service communication
- **No Trailing Slash:** API routes use `""` instead of `"/"` to prevent 307 redirect issues in cross-origin setups
- **Auto-deploy:** Pushes to `main` branch trigger automatic redeployment on Railway

### Deploy Your Own

1. Fork this repo
2. Create a Railway project → Add PostgreSQL database
3. Add Backend service (GitHub repo, root: `backend`)
4. Set `DATABASE_URL` from PostgreSQL's connection string
5. Add Frontend service (GitHub repo, root: `frontend`)
6. Generate domains for both services
7. Update `frontend/src/api/axios.js` with your backend URL

---

## 🧪 Testing the API

### Using Swagger UI

Visit the [API Docs](https://inventrack-inventory-order-management-system-production.up.railway.app/docs) for an interactive API explorer.

### Using cURL

```bash
# Health check
curl https://inventrack-inventory-order-management-system-production.up.railway.app/

# Create a product
curl -X POST https://inventrack-inventory-order-management-system-production.up.railway.app/api/products \
  -H "Content-Type: application/json" \
  -d '{"name": "Laptop", "sku": "LAP-001", "price": 999.99, "quantity_in_stock": 50}'

# Create a customer
curl -X POST https://inventrack-inventory-order-management-system-production.up.railway.app/api/customers \
  -H "Content-Type: application/json" \
  -d '{"full_name": "John Doe", "email": "john@example.com", "phone_number": "+1234567890"}'

# Place an order
curl -X POST https://inventrack-inventory-order-management-system-production.up.railway.app/api/orders \
  -H "Content-Type: application/json" \
  -d '{"customer_id": 1, "items": [{"product_id": 1, "quantity": 2}]}'

# Get dashboard stats
curl https://inventrack-inventory-order-management-system-production.up.railway.app/api/stats/dashboard
```

---

## 🛠️ Tech Stack Details

### Backend
- **FastAPI** — High-performance async Python web framework
- **SQLAlchemy 2.0** — Async ORM with `asyncpg` driver
- **Pydantic v2** — Data validation with `ConfigDict(from_attributes=True)`
- **Uvicorn** — ASGI server with hot reload for development
- **asyncpg** — High-performance PostgreSQL driver for asyncio

### Frontend
- **React 18** — Component-based UI library
- **Vite** — Fast build tool with HMR
- **Tailwind CSS 3.4** — Utility-first CSS with custom glassmorphism design
- **Axios** — HTTP client with interceptors for error handling
- **React Router v6** — Client-side routing
- **React Hot Toast** — Toast notifications
- **Heroicons** — SVG icon library

### Infrastructure
- **Docker** — Containerization with multi-stage builds
- **Docker Compose** — Multi-service orchestration
- **Nginx** — Static file serving with SPA fallback and gzip compression
- **Railway** — Cloud deployment platform with auto-deploy

---

## 📄 License

MIT License — feel free to use this project for any purpose.
