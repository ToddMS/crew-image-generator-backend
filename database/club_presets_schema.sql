-- Club Presets Schema
-- Run this after auth_schema.sql

USE CrewManagement;

-- Club Presets table for user-defined color schemes and logos
CREATE TABLE IF NOT EXISTS ClubPresets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    club_name VARCHAR(255) NOT NULL,
    primary_color VARCHAR(7) NOT NULL DEFAULT '#5E98C2',
    secondary_color VARCHAR(7) NOT NULL DEFAULT '#ffffff',
    logo_filename VARCHAR(255) NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    INDEX idx_club_presets_user_id (user_id),
    INDEX idx_club_presets_default (user_id, is_default)
);

-- Create uploads directory structure in the file system
-- This will be handled by the backend application