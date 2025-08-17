-- Authentication Tables Schema
-- Run this after the main schema.sql

USE CrewManagement;

-- Users table
CREATE TABLE IF NOT EXISTS Users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    google_id VARCHAR(255) NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    profile_picture VARCHAR(500) NULL,
    club_name VARCHAR(255) NULL,
    password_hash VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_email (email),
    INDEX idx_users_google_id (google_id)
);

-- Sessions table
CREATE TABLE IF NOT EXISTS Sessions (
    id VARCHAR(255) PRIMARY KEY,
    user_id INT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    INDEX idx_sessions_user_id (user_id),
    INDEX idx_sessions_expires (expires_at)
);

-- Club Settings table
CREATE TABLE IF NOT EXISTS ClubSettings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    primary_color VARCHAR(7) DEFAULT '#5E98C2',
    secondary_color VARCHAR(7) DEFAULT '#ffffff',
    logo_filename VARCHAR(255) NULL,
    logo_upload_date TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);

-- Update Crews table to link to Users
ALTER TABLE Crews 
ADD COLUMN user_id INT NULL AFTER id,
ADD FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE SET NULL;

-- Add index for user crews
CREATE INDEX idx_crews_user_id ON Crews(user_id);