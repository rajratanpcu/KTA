# KTA ERP - Retail & Wholesale Management System

A modern ERP system for retail and wholesale businesses, built with React, TypeScript, and Spring Boot.

## Current Status: UI Prototype (Phase 1)

This is a **UI prototype** demonstrating the complete user interface and user experience. All data is simulated and clearly marked as demo data. No backend integration or real transaction processing occurs in this phase.

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first styling
- **React Router** - Client-side routing
- **Recharts** - Data visualization
- **Lucide React** - Icon system
- **React Hook Form** + **Zod** - Form management and validation

### Backend (Future Phase)
- Java with Spring Boot
- PostgreSQL database
- Spring Security for authentication
- RESTful APIs

## Features (Prototype)

### ✅ Implemented Screens

1. **Dashboard** - Key metrics, sales charts, low stock alerts, recent activity
2. **Products** - Full CRUD with search, filter, and category management
3. **Inventory** - Stock balances and movement tracking across godowns
4. **Godowns** - Warehouse/location management
5. **Stock Transfers** - Inter-godown transfer tracking with status workflow
6. **Purchasing** - Purchase order management (placeholder)
7. **Sales / POS** - Point of sale interface (clearly marked as simulated)
8. **Transport** - Shipment and delivery tracking (placeholder)
9. **Customers** - Customer management (placeholder)
10. **Suppliers** - Supplier management (placeholder)
11. **Reports** - Business reports and analytics (placeholder)
12. **Expenses** - Expense tracking (placeholder)
13. **Settings** - System configuration

### Key UI Features
- Responsive layout (desktop-first, mobile-friendly)
- Persistent sidebar navigation
- Search and filter functionality
- Modal dialogs for CRUD operations
- Data tables with sorting capabilities
- Status badges and visual indicators
- Interactive charts and metrics
- Accessible keyboard navigation
- Loading, empty, and error states

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Git

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd KTA

# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Available Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
npm run typecheck  # Run TypeScript checks
```

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── layout/         # Layout components (sidebar, header)
│   │   └── ui/             # Reusable UI components (button, input, table, etc.)
│   ├── pages/              # Page components for each route
│   ├── types/              # TypeScript type definitions
│   ├── data/               # Demo data module
│   ├── utils/              # Utility functions
│   ├── App.tsx             # Main app component with routing
│   ├── main.tsx            # Application entry point
│   └── index.css           # Global styles
├── public/                 # Static assets
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

## Demo Data

All data shown in the prototype is clearly marked as demo/simulated:
- Sample products (rice, oil, pulses, sugar, tea)
- 4 warehouse locations (Mumbai, Delhi, Bangalore, Chennai)
- Stock balances and movements
- Simulated metrics and charts
- **No real backend or database connection**

## Known Limitations (Prototype Phase)

- All data is hardcoded - no persistence
- No authentication or authorization
- No actual API calls
- Form submissions show alert dialogs
- No real payment processing in POS
- No file uploads or exports
- Some screens are placeholders awaiting full implementation

## Next Phases

### Phase 2: Backend Foundation
- Spring Boot setup with PostgreSQL
- Authentication and role-based access control
- Product, godown, and unit management APIs
- Flyway database migrations

### Phase 3: Inventory Ledger
- Transactional stock movements
- Purchase receipts and stock transfers
- Audit logging and concurrency controls

### Phase 4: Sales and Operations
- POS integration with stock deduction
- Customer/supplier management
- Payment tracking and reports

### Phase 5: Transport and Automation
- Delivery tracking
- n8n workflow integration
- Automated notifications

### Phase 6: Production Hardening
- Security review and penetration testing
- Backup/restore procedures
- Deployment configuration
- User acceptance testing

## Contributing

This is a prototype. Before contributing, please review:
1. The implementation plan in `docs/IMPLEMENTATION_PLAN.md`
2. Architecture decisions in `docs/ARCHITECTURE.md`
3. Follow the established code structure and naming conventions

## License

[To be determined]

## Contact

[Add contact information]
