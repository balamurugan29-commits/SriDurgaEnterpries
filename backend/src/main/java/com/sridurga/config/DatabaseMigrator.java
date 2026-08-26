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
    }
}
