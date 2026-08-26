-- MS SQL Server DDL Schema for Sri Durga Enterprises

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'users')
BEGIN
    CREATE TABLE users (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        user_id VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        full_name VARCHAR(100) NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'USER',
        created_at DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE()
    );

    INSERT INTO users (user_id, password, full_name, role)
    VALUES ('admin', '$2a$10$7vY8.gH1p4vQ9V3z0eN7/eB5QJ8a7M1v4E7m8K9L0P1Q2R3S4T5U6', 'Sri Durga Administrator', 'ADMIN');
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'item_master')
BEGIN
    CREATE TABLE item_master (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        serial_number INT NOT NULL,
        item_code VARCHAR(100) NOT NULL UNIQUE,
        description NVARCHAR(MAX) NOT NULL,
        quantity DECIMAL(18,2) NOT NULL DEFAULT 0.00,
        rate DECIMAL(18,2) NOT NULL DEFAULT 0.00,
        service_charge DECIMAL(18,2) DEFAULT 0.00,
        amount DECIMAL(18,2) NOT NULL DEFAULT 0.00,
        created_at DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE()
    );
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'customer_master')
BEGIN
    CREATE TABLE customer_master (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        serial_number INT NOT NULL,
        customer_name VARCHAR(255) NOT NULL,
        gstin VARCHAR(20),
        pan VARCHAR(20),
        state_code VARCHAR(50) DEFAULT 'PUDUCHERRY (34)',
        phone VARCHAR(20),
        address NVARCHAR(MAX),
        created_at DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE()
    );
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'delivery_challan')
BEGIN
    CREATE TABLE delivery_challan (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        challan_number VARCHAR(50) NOT NULL UNIQUE,
        challan_date DATE NOT NULL,
        customer_name VARCHAR(255) NOT NULL,
        customer_address NVARCHAR(MAX),
        customer_phone VARCHAR(20),
        vendor_code VARCHAR(50),
        po_number VARCHAR(50),
        po_date DATE,
        epf_code VARCHAR(50),
        esi_code VARCHAR(50),
        gstin VARCHAR(20),
        pan VARCHAR(20),
        state_code VARCHAR(50),
        customer_pan VARCHAR(20),
        customer_gstin VARCHAR(20),
        customer_state_code VARCHAR(50),
        sac_code VARCHAR(20),
        gst_percent DECIMAL(5,2) DEFAULT 18.00,
        equipment_header VARCHAR(255),
        total_amount DECIMAL(18,2) NOT NULL DEFAULT 0.00,
        created_at DATETIME2 DEFAULT GETDATE(),
        updated_at DATETIME2 DEFAULT GETDATE()
    );
END;

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'challan_items')
BEGIN
    CREATE TABLE challan_items (
        id BIGINT IDENTITY(1,1) PRIMARY KEY,
        challan_id BIGINT NOT NULL FOREIGN KEY REFERENCES delivery_challan(id) ON DELETE CASCADE,
        serial_number INT NOT NULL,
        item_code VARCHAR(100),
        description NVARCHAR(MAX) NOT NULL,
        quantity DECIMAL(18,2) NOT NULL DEFAULT 1.00,
        unit VARCHAR(20) DEFAULT 'No',
        rate DECIMAL(18,2) NOT NULL DEFAULT 0.00,
        amount DECIMAL(18,2) NOT NULL DEFAULT 0.00
    );
END;
