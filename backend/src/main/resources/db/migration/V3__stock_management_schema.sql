-- V3__stock_management_schema.sql
-- Stock balances, movements, and transfers

-- Stock Balances (current stock per product per godown)
CREATE TABLE stock_balances (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id),
    godown_id BIGINT NOT NULL REFERENCES godowns(id),
    available_quantity DECIMAL(15, 3) NOT NULL DEFAULT 0,
    reserved_quantity DECIMAL(15, 3) NOT NULL DEFAULT 0,
    in_transit_quantity DECIMAL(15, 3) NOT NULL DEFAULT 0,
    reorder_level DECIMAL(15, 3),
    last_counted_at TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT unique_product_godown UNIQUE(product_id, godown_id),
    CONSTRAINT check_available_qty CHECK (available_quantity >= 0),
    CONSTRAINT check_reserved_qty CHECK (reserved_quantity >= 0),
    CONSTRAINT check_transit_qty CHECK (in_transit_quantity >= 0)
);

-- Stock Movements (every IN/OUT/ADJUST event)
CREATE TABLE stock_movements (
    id BIGSERIAL PRIMARY KEY,
    movement_number VARCHAR(50) UNIQUE NOT NULL,
    movement_type VARCHAR(20) NOT NULL CHECK (movement_type IN (
        'PURCHASE_IN', 'SALES_OUT', 'TRANSFER_OUT', 'TRANSFER_IN',
        'ADJUSTMENT', 'OPENING_BALANCE', 'RETURN_IN', 'RETURN_OUT',
        'DAMAGE', 'EXPIRED'
    )),
    product_id BIGINT NOT NULL REFERENCES products(id),
    godown_id BIGINT NOT NULL REFERENCES godowns(id),
    quantity DECIMAL(15, 3) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    direction VARCHAR(3) NOT NULL CHECK (direction IN ('IN', 'OUT')),
    reference_type VARCHAR(30),
    reference_id BIGINT,
    reference_number VARCHAR(50),
    batch_number VARCHAR(50),
    notes TEXT,
    movement_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT NOT NULL REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT check_movement_qty CHECK (quantity > 0)
);

-- Stock Transfers (between godowns)
CREATE TABLE stock_transfers (
    id BIGSERIAL PRIMARY KEY,
    transfer_number VARCHAR(50) UNIQUE NOT NULL,
    from_godown_id BIGINT NOT NULL REFERENCES godowns(id),
    to_godown_id BIGINT NOT NULL REFERENCES godowns(id),
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT' CHECK (status IN (
        'DRAFT', 'PENDING', 'IN_TRANSIT', 'RECEIVED', 'CANCELLED'
    )),
    transfer_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expected_delivery DATE,
    received_date DATE,
    notes TEXT,
    created_by BIGINT NOT NULL REFERENCES users(id),
    approved_by BIGINT REFERENCES users(id),
    received_by BIGINT REFERENCES users(id),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT check_different_godowns CHECK (from_godown_id != to_godown_id)
);

-- Stock Transfer Items
CREATE TABLE stock_transfer_items (
    id BIGSERIAL PRIMARY KEY,
    transfer_id BIGINT NOT NULL REFERENCES stock_transfers(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products(id),
    quantity DECIMAL(15, 3) NOT NULL,
    received_quantity DECIMAL(15, 3) DEFAULT 0,
    unit VARCHAR(20) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT check_transfer_qty CHECK (quantity > 0),
    CONSTRAINT check_received_qty CHECK (received_quantity >= 0)
);

-- Indexes
CREATE INDEX idx_stock_balances_product ON stock_balances(product_id);
CREATE INDEX idx_stock_balances_godown ON stock_balances(godown_id);
CREATE INDEX idx_stock_movements_product ON stock_movements(product_id);
CREATE INDEX idx_stock_movements_godown ON stock_movements(godown_id);
CREATE INDEX idx_stock_movements_type ON stock_movements(movement_type);
CREATE INDEX idx_stock_movements_date ON stock_movements(movement_date);
CREATE INDEX idx_stock_transfers_from ON stock_transfers(from_godown_id);
CREATE INDEX idx_stock_transfers_to ON stock_transfers(to_godown_id);
CREATE INDEX idx_stock_transfers_status ON stock_transfers(status);
CREATE INDEX idx_stock_transfer_items_transfer ON stock_transfer_items(transfer_id);
CREATE INDEX idx_stock_transfer_items_product ON stock_transfer_items(product_id);

-- Insert sample stock balances
INSERT INTO stock_balances (product_id, godown_id, available_quantity, reserved_quantity, in_transit_quantity) VALUES
(1, 1, 500, 20, 50),
(2, 1, 200, 10, 0),
(3, 1, 150, 0, 30),
(1, 2, 300, 0, 0),
(2, 2, 100, 5, 20),
(4, 1, 400, 15, 10),
(5, 2, 250, 0, 0);
