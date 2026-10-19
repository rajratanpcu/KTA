-- V2__transport_bills_schema.sql
-- Schema for Transport Bill Scanning and Management

-- Transporters
CREATE TABLE transporters (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    contact_person VARCHAR(100),
    phone VARCHAR(20),
    email VARCHAR(100),
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    pincode VARCHAR(10) NOT NULL,
    gstin VARCHAR(15),
    notes TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Scanned Documents
CREATE TABLE scanned_documents (
    id BIGSERIAL PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size BIGINT NOT NULL,
    file_path TEXT NOT NULL,
    thumbnail_path TEXT,
    uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    uploaded_by BIGINT REFERENCES users(id)
);

-- Transport Bills
CREATE TABLE transport_bills (
    id BIGSERIAL PRIMARY KEY,
    bill_number VARCHAR(50) UNIQUE NOT NULL,
    bill_date DATE NOT NULL,
    due_date DATE,
    transporter_id BIGINT NOT NULL REFERENCES transporters(id),
    consignment_number VARCHAR(50),
    lr_number VARCHAR(50),
    invoice_reference VARCHAR(50),
    vehicle_number VARCHAR(20),
    supplier_name VARCHAR(255),
    destination VARCHAR(255),
    purchase_reference VARCHAR(50),
    payment_terms VARCHAR(100),
    description TEXT,
    remarks TEXT,

    -- Financial details
    freight_charges DECIMAL(15, 2) NOT NULL DEFAULT 0,
    loading_charges DECIMAL(15, 2) NOT NULL DEFAULT 0,
    unloading_charges DECIMAL(15, 2) NOT NULL DEFAULT 0,
    other_charges DECIMAL(15, 2) NOT NULL DEFAULT 0,
    taxable_amount DECIMAL(15, 2) NOT NULL,
    gst_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    gst_rate DECIMAL(5, 2),
    discount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    round_off DECIMAL(15, 2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(15, 2) NOT NULL,
    amount_paid DECIMAL(15, 2) NOT NULL DEFAULT 0,
    balance_due DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'INR',

    -- Status and metadata
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('DRAFT', 'PENDING', 'PARTIALLY_PAID', 'PAID', 'OVERDUE')),
    scanned_document_id BIGINT REFERENCES scanned_documents(id),
    extraction_confidence DECIMAL(3, 2),
    needs_review BOOLEAN NOT NULL DEFAULT false,

    -- Audit
    created_by BIGINT NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT check_total_amount CHECK (total_amount >= 0),
    CONSTRAINT check_balance_due CHECK (balance_due >= 0),
    CONSTRAINT check_amount_paid CHECK (amount_paid >= 0)
);

-- Transport Bill Items
CREATE TABLE transport_bill_items (
    id BIGSERIAL PRIMARY KEY,
    bill_id BIGINT NOT NULL REFERENCES transport_bills(id) ON DELETE CASCADE,
    item_name VARCHAR(255) NOT NULL,
    product_code VARCHAR(50),
    product_id BIGINT REFERENCES products(id),
    quantity DECIMAL(15, 3) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    package_count INTEGER,
    weight DECIMAL(15, 3),
    rate DECIMAL(15, 2),
    amount DECIMAL(15, 2),
    needs_review BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Transport Payments
CREATE TABLE transport_payments (
    id BIGSERIAL PRIMARY KEY,
    payment_number VARCHAR(50) UNIQUE NOT NULL,
    payment_date DATE NOT NULL,
    transporter_id BIGINT NOT NULL REFERENCES transporters(id),
    amount DECIMAL(15, 2) NOT NULL,
    payment_method VARCHAR(20) NOT NULL CHECK (payment_method IN ('CASH', 'BANK_TRANSFER', 'UPI', 'CHEQUE', 'OTHER')),
    transaction_reference VARCHAR(100),
    notes TEXT,
    created_by BIGINT NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT check_payment_amount CHECK (amount > 0)
);

-- Transport Payment Allocations
CREATE TABLE transport_payment_allocations (
    id BIGSERIAL PRIMARY KEY,
    payment_id BIGINT NOT NULL REFERENCES transport_payments(id) ON DELETE CASCADE,
    bill_id BIGINT NOT NULL REFERENCES transport_bills(id),
    allocated_amount DECIMAL(15, 2) NOT NULL,
    allocation_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT check_allocated_amount CHECK (allocated_amount > 0),
    CONSTRAINT unique_payment_bill UNIQUE(payment_id, bill_id)
);

-- Audit Log for Transport Bills
CREATE TABLE transport_bill_audit (
    id BIGSERIAL PRIMARY KEY,
    bill_id BIGINT NOT NULL REFERENCES transport_bills(id),
    action VARCHAR(50) NOT NULL,
    changed_by BIGINT NOT NULL REFERENCES users(id),
    changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    old_values JSONB,
    new_values JSONB,
    notes TEXT
);

-- Indexes for performance
CREATE INDEX idx_transport_bills_transporter ON transport_bills(transporter_id);
CREATE INDEX idx_transport_bills_status ON transport_bills(status);
CREATE INDEX idx_transport_bills_date ON transport_bills(bill_date);
CREATE INDEX idx_transport_bills_number ON transport_bills(bill_number);
CREATE INDEX idx_transport_bill_items_bill ON transport_bill_items(bill_id);
CREATE INDEX idx_transport_bill_items_product ON transport_bill_items(product_id);
CREATE INDEX idx_transport_payments_transporter ON transport_payments(transporter_id);
CREATE INDEX idx_transport_payment_allocations_payment ON transport_payment_allocations(payment_id);
CREATE INDEX idx_transport_payment_allocations_bill ON transport_payment_allocations(bill_id);
CREATE INDEX idx_transporters_active ON transporters(active);

-- Function to update transport bill balance automatically
CREATE OR REPLACE FUNCTION update_transport_bill_balance()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE transport_bills
    SET balance_due = total_amount - COALESCE(
        (SELECT SUM(allocated_amount)
         FROM transport_payment_allocations
         WHERE bill_id = NEW.bill_id), 0
    ),
    status = CASE
        WHEN total_amount <= COALESCE(
            (SELECT SUM(allocated_amount)
             FROM transport_payment_allocations
             WHERE bill_id = NEW.bill_id), 0
        ) THEN 'PAID'
        WHEN COALESCE(
            (SELECT SUM(allocated_amount)
             FROM transport_payment_allocations
             WHERE bill_id = NEW.bill_id), 0
        ) > 0 THEN 'PARTIALLY_PAID'
        ELSE status
    END
    WHERE id = NEW.bill_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update balance when payment allocation is added
CREATE TRIGGER trigger_update_bill_balance_on_payment
AFTER INSERT OR UPDATE OR DELETE ON transport_payment_allocations
FOR EACH ROW
EXECUTE FUNCTION update_transport_bill_balance();
