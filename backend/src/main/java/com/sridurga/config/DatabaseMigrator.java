package com.sridurga.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabaseMigrator {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @EventListener(ApplicationReadyEvent.class)
    public void migrateDatabaseSchema() {
        System.out.println("Running MS SQL Server Schema Column Alteration for Unlimited Description Length & Unit Support...");
        
        try {
            jdbcTemplate.execute("ALTER TABLE item_master ALTER COLUMN description NVARCHAR(MAX)");
            System.out.println("Successfully updated MS SQL Server column 'item_master.description' to NVARCHAR(MAX)!");
        } catch (Exception e) {
            System.out.println("Column alter notice (item_master description): " + e.getMessage());
        }

        try {
            jdbcTemplate.execute("ALTER TABLE item_master ALTER COLUMN item_code VARCHAR(255)");
            System.out.println("Successfully updated MS SQL Server column 'item_master.item_code' to VARCHAR(255)!");
        } catch (Exception e) {
            System.out.println("Column alter notice (item_master item_code): " + e.getMessage());
        }

        try {
            jdbcTemplate.execute("ALTER TABLE item_master ADD unit VARCHAR(20) DEFAULT 'No'");
            System.out.println("Successfully added MS SQL Server column 'item_master.unit'!");
        } catch (Exception e) {
            System.out.println("Column alter notice (item_master unit): " + e.getMessage());
        }

        try {
            jdbcTemplate.execute("ALTER TABLE challan_items ALTER COLUMN description NVARCHAR(MAX)");
            System.out.println("Successfully updated MS SQL Server column 'challan_items.description' to NVARCHAR(MAX)!");
        } catch (Exception e) {
            System.out.println("Column alter notice (challan_items description): " + e.getMessage());
        }

        // Auto-create sales_ledger table if not exists
        try {
            jdbcTemplate.execute(
                "IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'sales_ledger') " +
                "BEGIN " +
                "    CREATE TABLE sales_ledger ( " +
                "        id BIGINT IDENTITY(1,1) PRIMARY KEY, " +
                "        serial_number INT NULL, " +
                "        invoice_no VARCHAR(100) NOT NULL, " +
                "        invoice_date DATE NOT NULL, " +
                "        billed_to_remarks NVARCHAR(MAX) NULL, " +
                "        taxable_amount DECIMAL(18,2) DEFAULT 0.00, " +
                "        igst DECIMAL(18,2) DEFAULT 0.00, " +
                "        sgst DECIMAL(18,2) DEFAULT 0.00, " +
                "        ugst DECIMAL(18,2) DEFAULT 0.00, " +
                "        tax_amount DECIMAL(18,2) DEFAULT 0.00, " +
                "        total_amount DECIMAL(18,2) DEFAULT 0.00, " +
                "        it_tds DECIMAL(18,2) DEFAULT 0.00, " +
                "        gst_tds DECIMAL(18,2) DEFAULT 0.00, " +
                "        passed_amount DECIMAL(18,2) DEFAULT 0.00, " +
                "        passed_date DATE NULL, " +
                "        mode_of_payment VARCHAR(50) DEFAULT 'NEFT', " +
                "        remarks NVARCHAR(MAX) NULL, " +
                "        created_at DATETIME2 DEFAULT GETDATE(), " +
                "        updated_at DATETIME2 DEFAULT GETDATE() " +
                "    ); " +
                "    CREATE INDEX idx_sales_ledger_inv ON sales_ledger(invoice_no, invoice_date); " +
                "    PRINT 'Auto-created sales_ledger table successfully!'; " +
                "END"
            );
            System.out.println("Verified/Created 'sales_ledger' table in MS SQL Server!");
        } catch (Exception e) {
            System.out.println("Table migration notice (sales_ledger): " + e.getMessage());
        }

        // Auto-create purchase_ledger table if not exists
        try {
            jdbcTemplate.execute(
                "IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'purchase_ledger') " +
                "BEGIN " +
                "    CREATE TABLE purchase_ledger ( " +
                "        id BIGINT IDENTITY(1,1) PRIMARY KEY, " +
                "        serial_number INT NULL, " +
                "        dealer_store_name NVARCHAR(MAX) NULL, " +
                "        invoice_no VARCHAR(100) NOT NULL, " +
                "        invoice_date DATE NOT NULL, " +
                "        taxable_amount DECIMAL(18,2) DEFAULT 0.00, " +
                "        tax_amount DECIMAL(18,2) DEFAULT 0.00, " +
                "        total_amount DECIMAL(18,2) DEFAULT 0.00, " +
                "        paid_amount DECIMAL(18,2) DEFAULT 0.00, " +
                "        payment_date DATE NULL, " +
                "        mode_of_payment VARCHAR(50) DEFAULT 'NEFT', " +
                "        balance_amount DECIMAL(18,2) DEFAULT 0.00, " +
                "        supplier_remarks NVARCHAR(MAX) NULL, " +
                "        remarks NVARCHAR(MAX) NULL, " +
                "        created_at DATETIME2 DEFAULT GETDATE(), " +
                "        updated_at DATETIME2 DEFAULT GETDATE() " +
                "    ); " +
                "    CREATE INDEX idx_purchase_ledger_inv ON purchase_ledger(invoice_no, invoice_date); " +
                "    PRINT 'Auto-created purchase_ledger table successfully!'; " +
                "END"
            );
            System.out.println("Verified/Created 'purchase_ledger' table in MS SQL Server!");
        } catch (Exception e) {
            System.out.println("Table migration notice (purchase_ledger): " + e.getMessage());
        }

        // Auto-create proforma_invoice and proforma_items tables if not exist
        try {
            jdbcTemplate.execute(
                "IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'proforma_invoice') " +
                "BEGIN " +
                "    CREATE TABLE proforma_invoice ( " +
                "        id BIGINT IDENTITY(1,1) PRIMARY KEY, " +
                "        proforma_number VARCHAR(50) NOT NULL UNIQUE, " +
                "        proforma_date DATE NOT NULL, " +
                "        customer_name NVARCHAR(150) NOT NULL, " +
                "        customer_address NVARCHAR(500) NULL, " +
                "        customer_phone VARCHAR(20) NULL, " +
                "        vendor_code VARCHAR(50) NULL, " +
                "        po_number VARCHAR(50) NULL, " +
                "        po_date VARCHAR(50) NULL, " +
                "        epf_code VARCHAR(50) NULL, " +
                "        esi_code VARCHAR(50) NULL, " +
                "        gstin VARCHAR(50) NULL, " +
                "        pan VARCHAR(50) NULL, " +
                "        state_code VARCHAR(50) NULL, " +
                "        customer_pan VARCHAR(50) NULL, " +
                "        customer_gstin VARCHAR(50) NULL, " +
                "        customer_state_code VARCHAR(50) NULL, " +
                "        sac_code VARCHAR(50) NULL, " +
                "        gst_percent DECIMAL(5,2) DEFAULT 18.00, " +
                "        equipment_header NVARCHAR(255) NULL, " +
                "        total_amount DECIMAL(18,2) NOT NULL DEFAULT 0.00, " +
                "        notes NVARCHAR(500) NULL, " +
                "        created_at DATETIME2 DEFAULT GETDATE() " +
                "    ); " +
                "    CREATE INDEX idx_proforma_number ON proforma_invoice(proforma_number); " +
                "    PRINT 'Auto-created proforma_invoice table successfully!'; " +
                "END"
            );
            System.out.println("Verified/Created 'proforma_invoice' table in MS SQL Server!");
        } catch (Exception e) {
            System.out.println("Table migration notice (proforma_invoice): " + e.getMessage());
        }

        try {
            jdbcTemplate.execute(
                "IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'proforma_items') " +
                "BEGIN " +
                "    CREATE TABLE proforma_items ( " +
                "        id BIGINT IDENTITY(1,1) PRIMARY KEY, " +
                "        proforma_invoice_id BIGINT NOT NULL, " +
                "        serial_number INT NOT NULL, " +
                "        item_code VARCHAR(50) NOT NULL, " +
                "        description NVARCHAR(MAX) NOT NULL, " +
                "        unit VARCHAR(20) DEFAULT 'No', " +
                "        quantity DECIMAL(18,2) NOT NULL DEFAULT 0.00, " +
                "        rate DECIMAL(18,2) NOT NULL DEFAULT 0.00, " +
                "        amount DECIMAL(18,2) NOT NULL DEFAULT 0.00, " +
                "        CONSTRAINT FK_Proforma_Items FOREIGN KEY (proforma_invoice_id) REFERENCES proforma_invoice(id) ON DELETE CASCADE " +
                "    ); " +
                "    CREATE INDEX idx_proforma_id ON proforma_items(proforma_invoice_id); " +
                "    PRINT 'Auto-created proforma_items table successfully!'; " +
                "END"
            );
            System.out.println("Verified/Created 'proforma_items' table in MS SQL Server!");
        } catch (Exception e) {
            System.out.println("Table migration notice (proforma_items): " + e.getMessage());
        }
    }
}
