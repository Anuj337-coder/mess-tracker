-- ====================================================
-- FoodConnect Database Schema
-- Run this ONLY if spring.jpa.hibernate.ddl-auto=none
-- Otherwise Hibernate auto-creates the tables on startup
-- ====================================================

CREATE DATABASE IF NOT EXISTS foodconnect CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE foodconnect;

-- Users table (all 4 roles)
CREATE TABLE IF NOT EXISTS users (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    email       VARCHAR(100) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    role        ENUM('MESS', 'PARTY', 'INDIVIDUAL', 'NGO') NOT NULL,
    mess_name   VARCHAR(150),
    org_name    VARCHAR(150),
    location    VARCHAR(200),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Daily menu entries (Mess Owners)
CREATE TABLE IF NOT EXISTS mess_menus (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT NOT NULL,
    menu_date       DATE NOT NULL,
    meal_type       ENUM('BREAKFAST', 'LUNCH', 'DINNER', 'SNACKS') NOT NULL,
    items           TEXT NOT NULL,
    servings_planned INT,
    qty_kg          DECIMAL(6,2),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Food waste logs
CREATE TABLE IF NOT EXISTS waste_logs (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT NOT NULL,
    menu_id     BIGINT,
    log_date    DATE NOT NULL,
    meal_type   ENUM('BREAKFAST', 'LUNCH', 'DINNER', 'SNACKS'),
    food_item   VARCHAR(200) NOT NULL,
    cooked_kg   DECIMAL(6,2) NOT NULL,
    wasted_kg   DECIMAL(6,2) NOT NULL,
    notes       VARCHAR(500),
    logged_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (menu_id) REFERENCES mess_menus(id) ON DELETE SET NULL
);

-- NGO profiles
CREATE TABLE IF NOT EXISTS ngo_profiles (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT NOT NULL UNIQUE,
    ngo_name        VARCHAR(150) NOT NULL,
    location        VARCHAR(200),
    accepts         TEXT,
    contact_email   VARCHAR(100),
    contact_phone   VARCHAR(20),
    rating          DECIMAL(3,1) DEFAULT 5.0,
    is_verified     BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Donation requests
CREATE TABLE IF NOT EXISTS donation_requests (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    receipt_code    VARCHAR(20) NOT NULL UNIQUE,
    donor_id        BIGINT NOT NULL,
    ngo_id          BIGINT NOT NULL,
    food_desc       TEXT NOT NULL,
    quantity_kg     DECIMAL(6,2) NOT NULL,
    pickup_note     VARCHAR(500),
    status          ENUM('PENDING', 'ACCEPTED', 'REJECTED') DEFAULT 'PENDING',
    reject_reason   VARCHAR(500),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (donor_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (ngo_id) REFERENCES ngo_profiles(id) ON DELETE CASCADE
);

-- Party food estimates
CREATE TABLE IF NOT EXISTS party_estimates (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT NOT NULL,
    guest_count     INT NOT NULL,
    event_type      ENUM('WEDDING', 'BIRTHDAY', 'CORPORATE', 'CASUAL') NOT NULL,
    meal_type       ENUM('FULL', 'BREAKFAST', 'SNACKS') NOT NULL,
    event_date      DATE,
    suggestions     JSON,
    total_kg        DECIMAL(7,2),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT NOT NULL,
    message     TEXT NOT NULL,
    is_read     BOOLEAN DEFAULT FALSE,
    sent_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
