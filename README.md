# KTA ERP - Complete Setup Guide

## Project Structure

```
KTA/
├── frontend/              # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Main application pages
│   │   ├── types/        # TypeScript interfaces
│   │   └── data/         # Demo data (to be replaced with API calls)
│   └── package.json
├── backend/              # Spring Boot + PostgreSQL
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/kta/erp/
│   │   │   │   ├── controller/    # REST controllers
│   │   │   │   ├── service/       # Business logic
│   │   │   │   ├── repository/    # Data access
│   │   │   │   ├── entity/        # JPA entities
│   │   │   │   ├── dto/           # Request/Response DTOs
│   │   │   │   └── config/        # Configuration
│   │   │   └── resources/
│   │   │       └── db/migration/  # Flyway SQL migrations
│   └── pom.xml
└── docker-compose.yml    # Docker orchestration

```

## Quick Start

### Option 1: Docker (Recommended)

```bash
# From project root
docker-compose up -d

# Wait for services to start (1-2 minutes)
# Frontend: http://localhost:5173
# Backend:  http://localhost:8080
```

### Option 2: Local Development

**Terminal 1 - Database:**
```bash
# Start PostgreSQL (if not using Docker)
# Create database 'kta_erp' with user 'kta'
```

**Terminal 2 - Backend:**
```bash
cd backend
mvn clean install
mvn spring-boot:run
```

**Terminal 3 - Frontend:**
```bash
cd frontend
npm install
npm run dev
```

## What's Implemented

### Phase 1: UI Prototype ✅
- 13 screens with complete UI
- Product management with CRUD operations
- Inventory tracking with dual view
- Transport bills with scan interface
- Godowns with stock details
- Dashboard with charts and metrics

### Phase 2: Backend Foundation ✅
- Spring Boot 3.1.5 application
- PostgreSQL database with Flyway migrations
- JPA entities for all core modules
- REST APIs for:
  - Products, Categories, Units
  - Godowns (warehouses)
  - Transporters
  - Transport Bills with items
  - Transport Payments with allocations
- Input validation and error handling
- Docker setup for all services

### Database Schema

**Core Tables:**
- `users` - User accounts with roles
- `categories` - Product categories
- `units` - Units of measurement
- `products` - Product catalog
- `godowns` - Warehouse locations
- `suppliers` - Supplier master
- `customers` - Customer master

**Transport Bills Tables:**
- `transporters` - Transporter companies
- `scanned_documents` - Uploaded bill images
- `transport_bills` - Bill header with financial details
- `transport_bill_items` - Line items with product details
- `transport_payments` - Payment records
- `transport_payment_allocations` - Payment to bill mapping
- `transport_bill_audit` - Audit trail

## API Documentation

See [BACKEND_SETUP.md](backend/BACKEND_SETUP.md) for detailed API documentation.

### Key Endpoints

```
GET    /api/products                    # All products
POST   /api/products                    # Create product
GET    /api/products/search?query=rice  # Search products

GET    /api/godowns                     # All warehouses
POST   /api/godowns                     # Create warehouse

GET    /api/transport/transporters      # All transporters
POST   /api/transport/transporters      # Create transporter

GET    /api/transport/bills             # All transport bills
POST   /api/transport/bills             # Create bill
GET    /api/transport/bills/needs-review # Bills needing review
GET    /api/transport/bills/overdue     # Overdue bills

POST   /api/transport/payments          # Record payment
```

## Next Steps (Phase 3)

1. **Frontend-Backend Integration**
   - Replace demo data with API calls
   - Implement API service layer in frontend
   - Add authentication state management
   - Handle loading and error states

2. **File Upload & OCR**
   - Add file upload endpoint for scanned bills
   - Integrate OCR library (Tesseract/Cloud Vision)
   - Implement AI extraction for bill fields
   - Create review interface for extracted data

3. **Stock Management**
   - Stock balance tracking
   - Stock movements (IN/OUT/TRANSFER)
   - Opening balances
   - Stock adjustments

4. **Purchase & Sales**
   - Purchase orders and GRN
   - Sales orders and invoices
   - POS interface
   - Payment tracking

## Configuration

### Backend Configuration
Edit `backend/src/main/resources/application.properties`:
```properties
server.port=8080
spring.datasource.url=jdbc:postgresql://localhost:5432/kta_erp
spring.datasource.username=kta
spring.datasource.password=changeme
```

### Frontend Configuration
Edit `frontend/.env`:
```
VITE_API_BASE_URL=http://localhost:8080
```

### Docker Configuration
Edit `docker-compose.yml` to change ports, passwords, or resource limits.

## Default Credentials

**Admin User:**
- Username: `admin`
- Password: `admin123`

**Database:**
- Database: `kta_erp`
- User: `kta`
- Password: `changeme`

## Technology Stack

**Frontend:**
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS + shadcn/ui
- React Router v6
- React Query (for API state)
- Recharts (for charts)

**Backend:**
- Spring Boot 3.1.5
- Spring Data JPA
- Spring Security
- PostgreSQL 15
- Flyway (migrations)
- Lombok
- Jakarta Validation

**DevOps:**
- Docker & Docker Compose
- Maven (backend build)
- npm (frontend build)

## Development Tips

1. **Hot Reload**: Both frontend and backend support hot reload during development
2. **Database Changes**: Add new migrations as `V3__description.sql`, never modify existing ones
3. **API Testing**: Use tools like Postman or curl to test endpoints
4. **Logs**: Check `docker-compose logs -f backend` for backend errors
5. **Reset Database**: `docker-compose down -v` removes all data

## Troubleshooting

See [BACKEND_SETUP.md](backend/BACKEND_SETUP.md) for detailed troubleshooting guide.

**Common Issues:**
- Port conflicts: Change ports in docker-compose.yml
- Database connection: Check PostgreSQL is running
- Build failures: Clear Maven cache: `mvn clean`
- Frontend errors: Delete node_modules and reinstall

## Support

For issues or questions:
1. Check the logs: `docker-compose logs -f [service-name]`
2. Verify all services are running: `docker-compose ps`
3. Review the setup guides in backend/ and frontend/ directories
