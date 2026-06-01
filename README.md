# 📦 InvenTrack — Inventory & Order Management System

A production-ready, full-stack inventory and order management system built with **FastAPI**, **React**, **PostgreSQL**, and **Docker**.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.12-green.svg)
![React](https://img.shields.io/badge/react-18-blue.svg)
![Docker](https://img.shields.io/badge/docker-compose-blue.svg)

---

## ✨ Features

- **Product Management** — Full CRUD with SKU tracking, price management, and real-time stock levels
- **Customer Management** — Customer registry with email uniqueness enforcement
- **Order Processing** — Transactional order creation with automatic stock decrement and validation
- **Dashboard** — Real-time metrics with low-stock alerts
- **Containerized** — One-command deployment with Docker Compose

---

## 🏗️ Architecture

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│   React +   │────▶│   FastAPI    │────▶│  PostgreSQL  │
│   Nginx     │     │   Backend    │     │   Database   │
│  (Port 80)  │     │  (Port 8000) │     │  (Port 5432) │
└─────────────┘     └──────────────┘     └──────────────┘
```

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React 18, Vite, Tailwind CSS, Axios |
| Backend   | FastAPI, SQLAlchemy (async), Pydantic v2 |
| Database  | PostgreSQL 16                       |
| Proxy     | Nginx (serves frontend + proxies API) |
| Container | Docker, Docker Compose              |

---

## 🚀 Quick Start

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) & [Docker Compose](https://docs.docker.com/compose/install/)

### Launch the Full Stack

```bash
# Clone and navigate to the project
cd inventory-system

# Build and start all services
docker compose up --build -d

# View logs
docker compose logs -f
```

The application will be available at:

| Service   | URL                          |
|-----------|------------------------------|
| Frontend  | http://localhost              |
| Backend API | http://localhost:8000       |
| API Docs  | http://localhost:8000/docs    |
| Database  | localhost:5432               |

### Stop Services

```bash
docker compose down

# To also remove persisted data:
docker compose down -v
```

---

## 🛠️ Local Development (Without Docker)

### Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variable
export DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/inventory_db

# Run the server
uvicorn app.main:app --reload --port 8000
```

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start dev server (proxies API to localhost:8000)
npm run dev
```

---

## 📡 API Endpoints

### Products (`/api/products`)

| Method | Endpoint                | Description            |
|--------|------------------------|------------------------|
| GET    | `/api/products`        | List all products      |
| POST   | `/api/products`        | Create a product       |
| GET    | `/api/products/{id}`   | Get product by ID      |
| PUT    | `/api/products/{id}`   | Update a product       |
| DELETE | `/api/products/{id}`   | Delete a product       |
| GET    | `/api/products/low-stock` | Get low-stock products |

### Customers (`/api/customers`)

| Method | Endpoint                  | Description           |
|--------|---------------------------|-----------------------|
| GET    | `/api/customers`          | List all customers    |
| POST   | `/api/customers`          | Create a customer     |
| GET    | `/api/customers/{id}`     | Get customer by ID    |
| DELETE | `/api/customers/{id}`     | Delete a customer     |

### Orders (`/api/orders`)

| Method | Endpoint              | Description          |
|--------|-----------------------|----------------------|
| GET    | `/api/orders`         | List all orders      |
| POST   | `/api/orders`         | Create an order      |
| GET    | `/api/orders/{id}`    | Get order by ID      |
| DELETE | `/api/orders/{id}`    | Delete an order      |

### Statistics (`/api/stats`)

| Method | Endpoint              | Description          |
|--------|-----------------------|----------------------|
| GET    | `/api/stats/dashboard`| Dashboard statistics |

---

## 📁 Project Structure

```
inventory-system/
├── docker-compose.yml          # Orchestrates all services
├── .env                        # Environment variables
├── README.md
│
├── backend/
│   ├── Dockerfile              # Python slim image
│   ├── requirements.txt
│   ├── .env
│   └── app/
│       ├── main.py             # FastAPI app entry point
│       ├── config.py           # Settings management
│       ├── database.py         # Async SQLAlchemy engine
│       ├── models/             # SQLAlchemy ORM models
│       │   ├── product.py
│       │   ├── customer.py
│       │   └── order.py
│       ├── schemas/            # Pydantic validation schemas
│       │   ├── product.py
│       │   ├── customer.py
│       │   └── order.py
│       ├── crud/               # Database operations
│       │   ├── product.py
│       │   ├── customer.py
│       │   └── order.py
│       └── routers/            # API route handlers
│           ├── products.py
│           ├── customers.py
│           ├── orders.py
│           └── stats.py
│
└── frontend/
    ├── Dockerfile              # Multi-stage (Node build → Nginx)
    ├── nginx.conf              # Nginx config with API proxy
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css           # Tailwind + custom utilities
        ├── api/                # Axios API layer
        │   ├── axios.js
        │   ├── products.js
        │   ├── customers.js
        │   ├── orders.js
        │   └── stats.js
        ├── components/         # Reusable UI components
        │   ├── Layout.jsx
        │   ├── Modal.jsx
        │   └── StatsCard.jsx
        └── pages/              # Route pages
            ├── Dashboard.jsx
            ├── Products.jsx
            ├── Customers.jsx
            └── Orders.jsx
```

---

## 🔒 Business Rules

1. **Stock Validation**: Product stock cannot go negative (enforced at database AND application level)
2. **Transactional Orders**: Orders are processed in database transactions with row-level locks
3. **Automatic Stock Decrement**: Stock is reduced when orders are placed
4. **Price Snapshots**: Order items capture the product price at time of order
5. **Email Uniqueness**: Customer emails must be unique (enforced at database AND application level)
6. **Total Calculation**: Order totals are calculated server-side, not trusted from client

---

## 📄 License

MIT License — feel free to use this project for any purpose.
