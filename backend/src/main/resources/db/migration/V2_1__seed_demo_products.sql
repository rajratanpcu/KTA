-- Seed the demo products required by V3 stock balances.
-- This is development/staging data; production databases should provision real products separately.
INSERT INTO godowns (id, code, name, address, city, state, pincode, active)
VALUES
    (1, 'GDN-MUM', 'Mumbai Central Godown', 'Warehouse Road', 'Mumbai', 'Maharashtra', '400001', true),
    (2, 'GDN-DEL', 'Delhi Distribution Godown', 'Industrial Area', 'Delhi', 'Delhi', '110001', true)
ON CONFLICT (id) DO NOTHING;

SELECT setval(
    'godowns_id_seq',
    GREATEST((SELECT COALESCE(MAX(id), 1) FROM godowns), 1),
    true
);

INSERT INTO products (id, sku, name, purchase_price, selling_price, gst_rate, min_stock_level, active, category_id, unit_id)
VALUES
    (1, 'RICE-BAS-1121', '1121 Basmati Rice', 85.00, 105.00, 5.00, 100, true, 1, 1),
    (2, 'OIL-SUN-001', 'Sunflower Oil', 110.00, 135.00, 5.00, 50, true, 2, 2),
    (3, 'PULSE-MAS-001', 'Masoor Dal', 90.00, 115.00, 5.00, 50, true, 3, 1),
    (4, 'SALT-IOD-001', 'Iodized Salt', 18.00, 25.00, 5.00, 40, true, 4, 1),
    (5, 'TEA-ASS-001', 'Assam Tea', 180.00, 230.00, 5.00, 25, true, 5, 1)
ON CONFLICT (id) DO NOTHING;

SELECT setval(
    'products_id_seq',
    GREATEST((SELECT COALESCE(MAX(id), 1) FROM products), 1),
    true
);
