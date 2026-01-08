# E-Commerce Microservices (Step-1 & Step-2)

Foundation setup with Auth Service, Product Service, API Gateway, and Dockerized local development.

## Prerequisites
- Docker Desktop (Windows/macOS/Linux)
- (Optional) Node.js 18+ for local scripts

## Structure
- **api-gateway**: Public entry point, proxies to services
- **auth-service**: JWT-based authentication (register, login, verify)
- **product-service**: Product catalog management (admin & public)
- **mongodb**: Database for auth-service and product-service

## Configuration
1. Create a root `.env` from example:
   ```bash
   copy .env.example .env
   # Edit .env and set a strong JWT_SECRET
   ```
   On macOS/Linux:
   ```bash
   cp .env.example .env
   ```
2. Optional: edit service `.env.example` files for defaults.

## Run (Docker Compose)
```powershell
cd "c:\Users\user\Desktop\project 1\ecommerce-microservices"
docker-compose up -d --build
```

- Gateway: http://localhost:3000
- Auth Service (internal): http://auth-service:4000
- Product Service (internal): http://product-service:5000
- MongoDB: mongodb://mongodb:27017

## Health Checks
```powershell
Invoke-RestMethod -Method GET -Uri http://localhost:3000/health
```

## Auth API via Gateway
### Register
```powershell
$body = @{ email = "alice@example.com"; password = "Password123!"; role = "user" } | ConvertTo-Json
Invoke-RestMethod -Method POST -Uri http://localhost:3000/auth/register -ContentType "application/json" -Body $body
```

### Login
```powershell
$body = @{ email = "alice@example.com"; password = "Password123!" } | ConvertTo-Json
$login = Invoke-RestMethod -Method POST -Uri http://localhost:3000/auth/login -ContentType "application/json" -Body $body
$token = $login.token
$token
```

### Verify
```powershell
Invoke-RestMethod -Method GET -Uri http://localhost:3000/auth/verify -Headers @{ Authorization = "Bearer $token" }
```

## Product API via Gateway

### List Products (Public)
```powershell
# Get all active products
Invoke-RestMethod -Method GET -Uri http://localhost:3000/products

# Filter by category
Invoke-RestMethod -Method GET -Uri http://localhost:3000/products?category=Electronics

# Pagination
Invoke-RestMethod -Method GET -Uri "http://localhost:3000/products?limit=10&skip=0"
```

### Get Product by ID (Public)
```powershell
$productId = "65a7f8b9c1234567890abcde"
Invoke-RestMethod -Method GET -Uri "http://localhost:3000/products/$productId"
```

### Create Product (Admin Only)
```powershell
# Login as admin first
$adminBody = @{ email = "admin@example.com"; password = "AdminPass999!" } | ConvertTo-Json
$adminLogin = Invoke-RestMethod -Method POST -Uri http://localhost:3000/auth/login -ContentType "application/json" -Body $adminBody
$adminToken = $adminLogin.token

# Create product
$productData = @{
  name = "Premium Laptop"
  description = "High-performance laptop for professionals"
  price = 1299.99
  category = "Electronics"
  images = @("https://example.com/laptop1.jpg", "https://example.com/laptop2.jpg")
} | ConvertTo-Json

Invoke-RestMethod -Method POST -Uri http://localhost:3000/products -ContentType "application/json" -Body $productData -Headers @{ Authorization = "Bearer $adminToken" }
```

### Update Product (Admin Only)
```powershell
$productId = "65a7f8b9c1234567890abcde"
$updateData = @{
  price = 1199.99
  description = "Updated description"
} | ConvertTo-Json

Invoke-RestMethod -Method PUT -Uri "http://localhost:3000/products/$productId" -ContentType "application/json" -Body $updateData -Headers @{ Authorization = "Bearer $adminToken" }
```

### Soft Delete Product (Admin Only)
```powershell
$productId = "65a7f8b9c1234567890abcde"
Invoke-RestMethod -Method DELETE -Uri "http://localhost:3000/products/$productId" -Headers @{ Authorization = "Bearer $adminToken" }
```

## Authorization Rules
- **Public endpoints** (no auth required):
  - `GET /products` - List active products
  - `GET /products/:id` - Get product details
- **Admin-only endpoints** (requires JWT with role=admin):
  - `POST /products` - Create product
  - `PUT /products/:id` - Update product
  - `DELETE /products/:id` - Soft delete product
- **Regular users cannot**:
  - Create, update, or delete products
  - Access admin-only endpoints (returns 403)

## Notes
- JWT expiry: 1 hour
- Passwords hashed with bcrypt
- Centralized error handling and meaningful logs
- Services communicate via service names (no localhost inside containers)
- Soft delete: Products marked `isActive: false` are hidden from public listings
- User info forwarded from API Gateway to services via headers (`x-user-id`, `x-user-email`, `x-user-role`)

## Troubleshooting
- Ensure Docker Desktop is running.
- If Mongo connection fails, restart stack:
  ```powershell
  docker-compose down -v
  docker-compose up -d --build
  ```
- Check logs:
  ```powershell
  docker-compose logs -f api-gateway
  docker-compose logs -f auth-service
  docker-compose logs -f mongodb
  ```
