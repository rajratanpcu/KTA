-- V8__vyapar_business_data_schema.sql
-- Schema extensions for Kushwaha Tent Agency Vyapar Excel Data Import

-- 1. Relax non-negative check on stock_balances to preserve negative stock from Vyapar
ALTER TABLE stock_balances DROP CONSTRAINT IF EXISTS check_available_qty;

-- 2. Add Kushwaha Tent Agency primary godown
INSERT INTO godowns (code, name, address, city, state, pincode, active)
VALUES ('GDN-HAJIPUR', 'Kushwaha Tent Agency - Central Godown', 'Umesh Cinema Road', 'Hajipur', 'Bihar', '844101', true)
ON CONFLICT (code) DO NOTHING;

-- 3. Sales Invoices
CREATE TABLE IF NOT EXISTS sales_invoices (
    id BIGSERIAL PRIMARY KEY,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    invoice_date DATE NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_id BIGINT REFERENCES customers(id),
    total_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    paid_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    balance_due DECIMAL(15, 2) NOT NULL DEFAULT 0,
    payment_status VARCHAR(50) NOT NULL,
    payment_mode VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sales_invoices_number ON sales_invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_sales_invoices_date ON sales_invoices(invoice_date);
CREATE INDEX IF NOT EXISTS idx_sales_invoices_customer ON sales_invoices(customer_name);

-- 4. Invoice Line Items
CREATE TABLE IF NOT EXISTS invoice_line_items (
    id BIGSERIAL PRIMARY KEY,
    invoice_id BIGINT REFERENCES sales_invoices(id) ON DELETE CASCADE,
    invoice_number VARCHAR(50) NOT NULL,
    line_number INTEGER,
    item_date DATE,
    customer_name VARCHAR(255),
    item_name VARCHAR(255) NOT NULL,
    product_id BIGINT REFERENCES products(id),
    category VARCHAR(100),
    quantity DECIMAL(15, 3) NOT NULL DEFAULT 0,
    unit VARCHAR(50),
    unit_price DECIMAL(15, 2) NOT NULL DEFAULT 0,
    discount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    tax DECIMAL(15, 2) NOT NULL DEFAULT 0,
    line_total DECIMAL(15, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_line_items_inv_no ON invoice_line_items(invoice_number);
CREATE INDEX IF NOT EXISTS idx_line_items_item_name ON invoice_line_items(item_name);

-- 5. Payments & Receipts
CREATE TABLE IF NOT EXISTS payment_receipts (
    id BIGSERIAL PRIMARY KEY,
    voucher_number VARCHAR(100) NOT NULL,
    voucher_date DATE NOT NULL,
    voucher_type VARCHAR(50) NOT NULL, -- 'Payment In (Receipt)', 'Payment Out'
    party_name VARCHAR(255) NOT NULL,
    customer_id BIGINT REFERENCES customers(id),
    supplier_id BIGINT REFERENCES suppliers(id),
    amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    payment_mode VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_payments_voucher ON payment_receipts(voucher_number);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payment_receipts(voucher_date);
CREATE INDEX IF NOT EXISTS idx_payments_party ON payment_receipts(party_name);

-- 6. All Transactions Register
CREATE TABLE IF NOT EXISTS all_transactions (
    id BIGSERIAL PRIMARY KEY,
    txn_id BIGINT,
    txn_date DATE NOT NULL,
    voucher_type VARCHAR(50) NOT NULL,
    ref_inv_number VARCHAR(100),
    party_name VARCHAR(255) NOT NULL,
    inflow_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    outflow_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    balance_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    payment_mode VARCHAR(50),
    remarks TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_all_txns_id ON all_transactions(txn_id);
CREATE INDEX IF NOT EXISTS idx_all_txns_date ON all_transactions(txn_date);
CREATE INDEX IF NOT EXISTS idx_all_txns_party ON all_transactions(party_name);

-- 7. Excel Import Audit Log
CREATE TABLE IF NOT EXISTS excel_import_audit (
    id BIGSERIAL PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    imported_by VARCHAR(100) NOT NULL,
    import_mode VARCHAR(50) NOT NULL, -- 'PREVIEW', 'IMPORT_NEW', 'REPLACE_DEMO'
    invoices_count INTEGER DEFAULT 0,
    line_items_count INTEGER DEFAULT 0,
    payments_count INTEGER DEFAULT 0,
    parties_count INTEGER DEFAULT 0,
    items_count INTEGER DEFAULT 0,
    status VARCHAR(50) NOT NULL, -- 'SUCCESS', 'FAILED', 'PREVIEW_ONLY'
    summary_notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
