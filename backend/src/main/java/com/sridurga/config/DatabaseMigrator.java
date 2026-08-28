package com.sridurga.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DatabaseMetaData;

@Component
public class DatabaseMigrator {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private DataSource dataSource;

    @EventListener(ApplicationReadyEvent.class)
    public void migrateDatabaseSchema() {
        boolean isSqlServer = false;
        try (Connection conn = dataSource.getConnection()) {
            DatabaseMetaData metaData = conn.getMetaData();
            String dbProductName = metaData.getDatabaseProductName();
            if (dbProductName != null && dbProductName.toLowerCase().contains("microsoft")) {
                isSqlServer = true;
            }
            System.out.println("Detected Database Engine: " + dbProductName + " (MSSQL specific mode: " + isSqlServer + ")");
        } catch (Exception e) {
            System.out.println("Notice reading database metadata: " + e.getMessage());
        }

        if (isSqlServer) {
            System.out.println("Running MS SQL Server Schema Column Alteration for Unlimited Description Length & Unit Support...");

            try {
                jdbcTemplate.execute("ALTER TABLE item_master ALTER COLUMN description NVARCHAR(MAX)");
            } catch (Exception ignored) {}

            try {
                jdbcTemplate.execute("ALTER TABLE item_master ALTER COLUMN item_code VARCHAR(255)");
            } catch (Exception ignored) {}

            try {
                jdbcTemplate.execute("ALTER TABLE item_master ADD unit VARCHAR(20) DEFAULT 'No'");
            } catch (Exception ignored) {}

            try {
                jdbcTemplate.execute("ALTER TABLE item_master ADD folder_name VARCHAR(255) DEFAULT 'General'");
            } catch (Exception ignored) {}

            try {
                jdbcTemplate.execute("ALTER TABLE challan_items ALTER COLUMN description NVARCHAR(MAX)");
            } catch (Exception ignored) {}

            try {
                jdbcTemplate.execute("ALTER TABLE users ADD permissions NVARCHAR(MAX) DEFAULT 'all'");
            } catch (Exception ignored) {}
        }
    }
}
