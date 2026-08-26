-- Sri Durga Enterprises - MySQL Database Schema Script
-- Target Database: MySQL Server

CREATE DATABASE IF NOT EXISTS SriDurgaDB;
USE SriDurgaDB;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'USER',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Item Master Table
CREATE TABLE IF NOT EXISTS item_master (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    serial_number INT NOT NULL,
    item_code VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255) NOT NULL,
    quantity DECIMAL(18,2) NOT NULL DEFAULT 0.00,
    rate DECIMAL(18,2) NOT NULL DEFAULT 0.00,
    amount DECIMAL(18,2) NOT NULL DEFAULT 0.00,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_item_code (item_code)
);

-- 3. Delivery Challan Table
CREATE TABLE IF NOT EXISTS delivery_challan (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    challan_number VARCHAR(50) NOT NULL UNIQUE,
    challan_date DATE NOT NULL,
    customer_name VARCHAR(150) NOT NULL,
    customer_address VARCHAR(500),
    customer_phone VARCHAR(20),
    total_amount DECIMAL(18,2) NOT NULL DEFAULT 0.00,
    notes VARCHAR(500),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. Challan Items Table
CREATE TABLE IF NOT EXISTS challan_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    delivery_challan_id BIGINT NOT NULL,
    serial_number INT NOT NULL,
    item_code VARCHAR(50) NOT NULL,
    description VARCHAR(255) NOT NULL,
    quantity DECIMAL(18,2) NOT NULL DEFAULT 0.00,
    rate DECIMAL(18,2) NOT NULL DEFAULT 0.00,
    amount DECIMAL(18,2) NOT NULL DEFAULT 0.00,
    CONSTRAINT FK_Challan_ChallanItems FOREIGN KEY (delivery_challan_id) REFERENCES delivery_challan(id) ON DELETE CASCADE
);
