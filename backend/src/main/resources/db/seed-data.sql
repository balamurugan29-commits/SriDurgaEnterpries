-- =============================================================================
-- Sri Durga Enterprises - Seed / Reference Master Data
-- =============================================================================

-- 1. Default Admin User (admin / admin123)
-- BCrypt: $2a$10$7vY8.gH1p4vQ9V3z0eN7/eB5QJ8a7M1v4E7m8K9L0P1Q2R3S4T5U6
-- Note: Replace with appropriate dialect syntax if using outside MSSQL

-- 2. Default Customer Master
INSERT INTO customer_master (serial_number, customer_name, gstin, pan, state_code, phone, address)
VALUES (
    1,
    'M/s, Ocean Sparkle Ltd, Karaikal Port Pvt., Ltd.',
    '34AAACO2519H1ZR',
    'AAACO2519H',
    'PUDUCHERRY (34)',
    '9842492946',
    'Keezhavanjore, Thirumalairajan Pattinam, Karaikal - 609606.'
);

-- 3. Default Item Master (Rate Contract Items)
INSERT INTO item_master (serial_number, item_code, description, quantity, unit, rate, service_charge, amount)
VALUES 
(1, '70.3', 'Supply of RCCB 4P, 63A, 100mA Sensitivity', 4, 'No', 4500.00, 0.00, 18000.00),
(2, '122', 'S&I of 50mm, 3Mtr GI Earth pipe including chamber', 3, 'No', 6200.00, 0.00, 18600.00),
(3, '24.7', 'Supply of 3P Power Contactor - 70A', 1, 'No', 8900.00, 0.00, 8900.00);

-- 4. Sample Sales Ledger Entries
INSERT INTO sales_ledger (serial_number, invoice_no, invoice_date, billed_to_remarks, taxable_amount, igst, sgst, ugst, tax_amount, total_amount, it_tds, gst_tds, passed_amount, passed_date, mode_of_payment)
VALUES 
(1, 'SDE/26-27/001', '2026-08-20', 'M/s, Ocean Sparkle Ltd, Karaikal Port Pvt., Ltd.', 25000.00, 0.00, 2250.00, 2250.00, 4500.00, 29500.00, 500.00, 500.00, 28500.00, '2026-08-25', 'NEFT');

-- 5. Sample Purchase Ledger Entries
INSERT INTO purchase_ledger (serial_number, dealer_store_name, invoice_no, invoice_date, taxable_amount, tax_amount, total_amount, paid_amount, payment_date, mode_of_payment, balance_amount)
VALUES 
(1, 'India Bearing & Mill Stores', 'IB/26-27/012', '2026-08-26', 15000.00, 2700.00, 17700.00, 17700.00, '2026-08-26', 'NEFT', 0.00),
(2, 'Sri Balaji Hardware & Tools', 'SB/984', '2026-08-25', 8500.00, 1530.00, 10030.00, 5000.00, '2026-08-25', 'UPI', 5030.00);
