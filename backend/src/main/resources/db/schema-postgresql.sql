-- =============================================================================
-- Sri Durga Enterprises - PostgreSQL Database Migration & Schema Script
-- Dialect: PostgreSQL (14 / 15 / 16 / 17)
-- Database: sridurgadb
-- =============================================================================

-- 1. USERS TABLE (Authentication & Access Control)
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'USER',
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. ITEM MASTER TABLE (Rate Contract Items & Pricing)
CREATE TABLE IF NOT EXISTS item_master (
    id BIGSERIAL PRIMARY KEY,
    serial_number INT NOT NULL,
    item_code VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    quantity NUMERIC(18,2) NOT NULL DEFAULT 0.00,
    unit VARCHAR(20) DEFAULT 'No',
    rate NUMERIC(18,2) NOT NULL DEFAULT 0.00,
    service_charge NUMERIC(18,2) DEFAULT 0.00,
    amount NUMERIC(18,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_item_code ON item_master(item_code);

-- 3. CUSTOMER MASTER TABLE (Clients, GSTIN, PAN, Address)
CREATE TABLE IF NOT EXISTS customer_master (
    id BIGSERIAL PRIMARY KEY,
    serial_number INT NOT NULL,
    customer_name VARCHAR(200) NOT NULL,
    gstin VARCHAR(50),
    pan VARCHAR(50),
    state_code VARCHAR(50) DEFAULT 'PUDUCHERRY (34)',
    phone VARCHAR(50),
    address TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_customer_name ON customer_master(customer_name);

-- 4. DELIVERY CHALLAN / TAX INVOICE TABLE
CREATE TABLE IF NOT EXISTS delivery_challan (
    id BIGSERIAL PRIMARY KEY,
    challan_number VARCHAR(50) NOT NULL UNIQUE,
    challan_date DATE NOT NULL,
    customer_name VARCHAR(150) NOT NULL,
    customer_address TEXT,
    customer_phone VARCHAR(20),
    vendor_code VARCHAR(50),
    po_number VARCHAR(50),
    po_date VARCHAR(50),
    epf_code VARCHAR(50),
    esi_code VARCHAR(50),
    gstin VARCHAR(50),
    pan VARCHAR(50),
    state_code VARCHAR(50),
    customer_pan VARCHAR(50),
    customer_gstin VARCHAR(50),
    customer_state_code VARCHAR(50),
    sac_code VARCHAR(50),
    gst_percent NUMERIC(5,2) DEFAULT 18.00,
    equipment_header VARCHAR(255),
    total_amount NUMERIC(18,2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_challan_number ON delivery_challan(challan_number);

-- 5. CHALLAN LINE ITEMS TABLE
CREATE TABLE IF NOT EXISTS challan_items (
    id BIGSERIAL PRIMARY KEY,
    delivery_challan_id BIGINT NOT NULL,
    serial_number INT NOT NULL,
    item_code VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    quantity NUMERIC(18,2) NOT NULL DEFAULT 0.00,
    rate NUMERIC(18,2) NOT NULL DEFAULT 0.00,
    amount NUMERIC(18,2) NOT NULL DEFAULT 0.00,
    CONSTRAINT fk_challan_items FOREIGN KEY (delivery_challan_id) REFERENCES delivery_challan(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_challan_items_delivery_id ON challan_items(delivery_challan_id);

-- 6. MOTOR OVERHAULING & REWINDING JOB CARD TABLE
CREATE TABLE IF NOT EXISTS job_card (
    id BIGSERIAL PRIMARY KEY,
    job_no VARCHAR(50) NOT NULL UNIQUE,
    g_pass VARCHAR(50),
    job_date DATE,
    customer_name VARCHAR(150),
    site VARCHAR(150),
    make VARCHAR(100),
    equipment VARCHAR(150),
    sl_no VARCHAR(100),
    delivered_on VARCHAR(50),
    others VARCHAR(255),
    
    -- Nameplate & Specifications
    rating_hp VARCHAR(50),
    rating_kw VARCHAR(50),
    rating_kva VARCHAR(50),
    volt VARCHAR(50),
    current VARCHAR(50),
    frame_size VARCHAR(50),
    type VARCHAR(50),
    bearing_de VARCHAR(50),
    bearing_nde VARCHAR(50),
    cooling_fan_id VARCHAR(50),
    cooling_fan_od VARCHAR(50),
    fan_cover_circumference VARCHAR(50),
    fan_cover_height VARCHAR(50),
    fan_cover_dia VARCHAR(50),
    speed VARCHAR(50),
    terminal_box VARCHAR(50),
    connection VARCHAR(50),
    
    -- Main / Running Winding Details
    pitch VARCHAR(500),
    turns VARCHAR(500),
    bobbin VARCHAR(500),
    core_length VARCHAR(50),
    swg VARCHAR(50),
    coil_weight_1set VARCHAR(50),
    coil_weight_total VARCHAR(50),
    set_of_coil VARCHAR(50),
    no_of_slots VARCHAR(50),
    total_no_coil VARCHAR(50),
    job_carried TEXT,
    pitch_count VARCHAR(50),
    turns_count VARCHAR(50),
    bobbin_count VARCHAR(50),
    
    -- Starting Winding Details (Single Phase 220V)
    sc_pitch VARCHAR(500),
    sc_turns VARCHAR(500),
    sc_bobbin VARCHAR(500),
    sc_core_length VARCHAR(50),
    sc_swg VARCHAR(50),
    sc_coil_weight_1set VARCHAR(50),
    sc_coil_weight_total VARCHAR(50),
    sc_set_of_coil VARCHAR(50),
    sc_no_of_slots VARCHAR(50),
    sc_total_no_coil VARCHAR(50),
    sc_job_carried TEXT,
    sc_pitch_count VARCHAR(50),
    sc_turns_count VARCHAR(50),
    sc_bobbin_count VARCHAR(50),
    
    -- Testing Details & Sign-offs
    test_ww_resistance VARCHAR(50),
    test_wb_resistance VARCHAR(50),
    test_no_load_current VARCHAR(50),
    test_rpm VARCHAR(50),
    remarks TEXT,
    dismantled_by VARCHAR(100),
    coil_dismantled_by VARCHAR(100),
    winding_by VARCHAR(100),
    assembled_by VARCHAR(100),
    tested_by VARCHAR(100),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_job_no ON job_card(job_no);

-- 7. WORK COMPLETION CERTIFICATES TABLE
CREATE TABLE IF NOT EXISTS work_completion_certificates (
    id BIGSERIAL PRIMARY KEY,
    certificate_no VARCHAR(50) NOT NULL UNIQUE,
    certificate_date DATE,
    agency VARCHAR(255) DEFAULT 'SRI DURGA ENTERPRISES, # 10 V.G. Nagar, Kovilpathu, Karaikal',
    rate_contract_ref VARCHAR(255) DEFAULT 'KKL/CAU-ASSET/SUPPORT/2023/1240914/SDE/9010038288',
    equipment_description VARCHAR(150) DEFAULT 'Material',
    equipment VARCHAR(150),
    location VARCHAR(100) DEFAULT 'RMD#GCS',
    make VARCHAR(100) DEFAULT '-',
    sl_no VARCHAR(100) DEFAULT '-',
    capacity VARCHAR(100) DEFAULT '-',
    type_model VARCHAR(100) DEFAULT '-',
    completion_time VARCHAR(50) DEFAULT '5 Day(s)',
    date_handing_over VARCHAR(50),
    date_completion VARCHAR(50),
    delay_in_completion VARCHAR(100) DEFAULT 'NIL',
    performance_of_machines VARCHAR(100) DEFAULT 'OK',
    defective_spares_returned VARCHAR(100) DEFAULT 'NA',
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_cert_no ON work_completion_certificates(certificate_no);

-- 8. WORK COMPLETION LINE ITEMS TABLE
CREATE TABLE IF NOT EXISTS work_completion_items (
    id BIGSERIAL PRIMARY KEY,
    certificate_id BIGINT NOT NULL,
    serial_number INT,
    rc_item_no VARCHAR(50),
    description TEXT,
    quantity DOUBLE PRECISION DEFAULT 1.0,
    unit VARCHAR(20) DEFAULT 'No',
    item_type VARCHAR(50) DEFAULT 'MATERIAL',
    CONSTRAINT fk_cert_items FOREIGN KEY (certificate_id) REFERENCES work_completion_certificates(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_cert_items_cert_id ON work_completion_items(certificate_id);

-- 9. IN / OUT GATE PASS TABLE
CREATE TABLE IF NOT EXISTS gate_pass (
    id BIGSERIAL PRIMARY KEY,
    gate_pass_no VARCHAR(50) NOT NULL UNIQUE,
    gate_pass_date DATE,
    receiver_name VARCHAR(255),
    pass_type VARCHAR(10) DEFAULT 'OUT',
    site_name VARCHAR(255),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_gate_pass_no ON gate_pass(gate_pass_no);

-- 10. GATE PASS LINE ITEMS TABLE
CREATE TABLE IF NOT EXISTS gate_pass_items (
    id BIGSERIAL PRIMARY KEY,
    gate_pass_id BIGINT NOT NULL,
    serial_number INT,
    description TEXT,
    quantity VARCHAR(100),
    remarks VARCHAR(255),
    CONSTRAINT fk_gate_pass_items FOREIGN KEY (gate_pass_id) REFERENCES gate_pass(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_gp_items_pass_id ON gate_pass_items(gate_pass_id);

-- 11. SALES LEDGER TABLE (GSTR-1 Sales Register & Passing Records)
CREATE TABLE IF NOT EXISTS sales_ledger (
    id BIGSERIAL PRIMARY KEY,
    serial_number INT,
    invoice_no VARCHAR(100) NOT NULL,
    invoice_date DATE NOT NULL,
    billed_to_remarks TEXT,
    taxable_amount NUMERIC(18,2) DEFAULT 0.00,
    igst NUMERIC(18,2) DEFAULT 0.00,
    sgst NUMERIC(18,2) DEFAULT 0.00,
    ugst NUMERIC(18,2) DEFAULT 0.00,
    tax_amount NUMERIC(18,2) DEFAULT 0.00,
    total_amount NUMERIC(18,2) DEFAULT 0.00,
    it_tds NUMERIC(18,2) DEFAULT 0.00,
    gst_tds NUMERIC(18,2) DEFAULT 0.00,
    passed_amount NUMERIC(18,2) DEFAULT 0.00,
    passed_date DATE,
    mode_of_payment VARCHAR(50) DEFAULT 'NEFT',
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_sales_ledger_inv ON sales_ledger(invoice_no, invoice_date);

-- 12. PURCHASE LEDGER TABLE (GSTR-2 Purchase & Dealer Expenses)
CREATE TABLE IF NOT EXISTS purchase_ledger (
    id BIGSERIAL PRIMARY KEY,
    serial_number INT,
    dealer_store_name TEXT,
    invoice_no VARCHAR(100) NOT NULL,
    invoice_date DATE NOT NULL,
    taxable_amount NUMERIC(18,2) DEFAULT 0.00,
    tax_amount NUMERIC(18,2) DEFAULT 0.00,
    total_amount NUMERIC(18,2) DEFAULT 0.00,
    paid_amount NUMERIC(18,2) DEFAULT 0.00,
    payment_date DATE,
    mode_of_payment VARCHAR(50) DEFAULT 'NEFT',
    balance_amount NUMERIC(18,2) DEFAULT 0.00,
    supplier_remarks TEXT,
    remarks TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_purchase_ledger_inv ON purchase_ledger(invoice_no, invoice_date);

-- =============================================================================
-- SEED DATA
-- =============================================================================
INSERT INTO users (user_id, password, full_name, role)
VALUES ('admin', '$2a$10$7vY8.gH1p4vQ9V3z0eN7/eB5QJ8a7M1v4E7m8K9L0P1Q2R3S4T5U6', 'Sri Durga Administrator', 'ADMIN')
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO customer_master (serial_number, customer_name, gstin, pan, state_code, phone, address)
VALUES (
    1,
    'M/s, Ocean Sparkle Ltd, Karaikal Port Pvt., Ltd.',
    '34AAACO2519H1ZR',
    'AAACO2519H',
    'PUDUCHERRY (34)',
    '9842492946',
    'Keezhavanjore, Thirumalairajan Pattinam, Karaikal - 609606.'
)
ON CONFLICT DO NOTHING;

INSERT INTO item_master (serial_number, item_code, description, quantity, unit, rate, service_charge, amount)
VALUES 
(1, '70.3', 'Supply of RCCB 4P, 63A, 100mA Sensitivity', 4, 'No', 4500.00, 0.00, 18000.00),
(2, '122', 'S&I of 50mm, 3Mtr GI Earth pipe including chamber', 3, 'No', 6200.00, 0.00, 18600.00),
(3, '24.7', 'Supply of 3P Power Contactor - 70A', 1, 'No', 8900.00, 0.00, 8900.00)
ON CONFLICT (item_code) DO NOTHING;
