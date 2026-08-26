package com.sridurga;

import java.sql.*;

public class DbTest {
    public static void main(String[] args) {
        String url = "jdbc:sqlserver://localhost:1433;databaseName=SriDurgaDB;encrypt=true;trustServerCertificate=true;";
        String user = "sa";
        String pass = "YourStrongPass123!";
        try (Connection conn = DriverManager.getConnection(url, user, pass)) {
            System.out.println("CONNECTED!");
            try (Statement stmt = conn.createStatement()) {
                try (ResultSet rs = stmt.executeQuery("SELECT COUNT(*) AS total FROM work_completion_certificates")) {
                    if (rs.next()) {
                        System.out.println("TOTAL_WCC_CERTIFICATES: " + rs.getInt("total"));
                    }
                }
                try (ResultSet rs = stmt.executeQuery("SELECT COUNT(*) AS total FROM work_completion_items")) {
                    if (rs.next()) {
                        System.out.println("TOTAL_WCC_ITEMS: " + rs.getInt("total"));
                    }
                }
                try (ResultSet rs = stmt.executeQuery("SELECT id, certificate_no, created_at FROM work_completion_certificates")) {
                    while (rs.next()) {
                        System.out.println("WCC_RECORD: ID=" + rs.getInt("id") + ", NO=" + rs.getString("certificate_no") + ", CREATED=" + rs.getTimestamp("created_at"));
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
