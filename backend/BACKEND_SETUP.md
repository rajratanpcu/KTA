# KTA ERP - Backend Setup Guide

## Prerequisites

- Java 17 or higher
- Maven 3.6+
- PostgreSQL 15+
- Docker & Docker Compose (optional, for containerized setup)

## Local Development Setup

### 1. Database Setup

Install PostgreSQL and create the database:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database and user
CREATE DATABASE kta_erp;
CREATE USER kta WITH PASSWORD 'changeme';
GRANT ALL PRIVILEGES ON DATABASE kta_erp TO kta;
\q
```

### 2. Build the Application

```bash
cd backend
mvn clean install
```

### 3. Run the Application

```bash
# Using Maven
mvn spring-boot:run

# Or using the JAR
java -jar target/kta-erp-1.0.0.jar
```

The backend will start on `http://localhost:8080`

### 4. Default Credentials

- Username: `admin`
- Password: `admin123`

## Docker Setup

### Run with Docker Compose

From the project root directory:

```bash
# Start all services (database, backend, frontend)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop and remove volumes (clears database)
docker-compose down -v
```

### Services

- Frontend: http://localhost:5173
- Backend API: http://localhost:8080
- PostgreSQL: localhost:5432

## Database Migrations

Flyway migrations run automatically on application startup. Migration files are located in:
```
backend/src/main/resources/db/migration/
```

- `V1__initial_schema.sql` - Core tables (users, products, godowns, etc.)
- `V2__transport_bills_schema.sql` - Transport bills module

## API Endpoints

### Core APIs

- **Products**: `/api/products`
- **Categories**: `/api/categories`
- **Godowns**: `/api/godowns`

### Transport Bills APIs

- **Transporters**: `/api/transport/transporters`
- **Bills**: `/api/transport/bills`
- **Payments**: `/api/transport/payments`

### Example API Calls

```bash
# Get all products
curl http://localhost:8080/api/products

# Create a category
curl -X POST http://localhost:8080/api/categories \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Grains",
    "description": "Rice and wheat products",
    "active": true
  }'

# Get transport bills needing review
curl http://localhost:8080/api/transport/bills/needs-review
```

## Environment Variables

You can override default configuration using environment variables:

```bash
# Database
export DB_PASSWORD=your_db_password
export SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/kta_erp

# Security
export ADMIN_PASSWORD=your_admin_password

# Server
export SERVER_PORT=8080
```

## Development Tools

### Testing the API

Use tools like:
- Postman
- curl
- HTTPie
- Swagger UI (add springdoc-openapi dependency for auto-generated docs)

### IDE Setup

**IntelliJ IDEA:**
1. Open the `backend` folder as a Maven project
2. Enable annotation processing for Lombok (Settings → Build → Compiler → Annotation Processors)
3. Install Lombok plugin

**VS Code:**
1. Install Java Extension Pack
2. Install Lombok Annotations Support

## Troubleshooting

### Port already in use
```bash
# Find process using port 8080
lsof -i :8080

# Kill the process
kill -9 <PID>
```

### Database connection failed
- Check PostgreSQL is running: `pg_isready`
- Verify credentials in `application.properties`
- Ensure database `kta_erp` exists

### Flyway migration failed
```bash
# Drop and recreate database
psql -U postgres -c "DROP DATABASE IF EXISTS kta_erp;"
psql -U postgres -c "CREATE DATABASE kta_erp;"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE kta_erp TO kta;"
```

## Next Steps

1. ✅ Database migrations created
2. ✅ Core domain APIs implemented
3. ✅ Transport Bills module implemented
4. 🔄 Frontend integration with backend APIs (next phase)
5. ⏳ File upload for transport bill scanning
6. ⏳ OCR/AI integration for bill extraction
7. ⏳ Stock management APIs
8. ⏳ Purchase and sales modules

## Notes

- Current security is basic (will be enhanced with JWT in later phases)
- File upload endpoint for scanned documents needs to be added
- OCR integration is planned for Phase 3
- All monetary values use `BigDecimal` for precision
- Timezone: Asia/Kolkata (IST)
- Currency: INR
