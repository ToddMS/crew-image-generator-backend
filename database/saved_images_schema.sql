-- Saved Images Table Schema
-- Run this after auth_schema.sql

USE CrewManagement;

-- Create SavedImages table
CREATE TABLE IF NOT EXISTS SavedImages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    crew_id INT NOT NULL,
    user_id INT NOT NULL,
    image_name VARCHAR(255) NOT NULL,
    template_id VARCHAR(10) NOT NULL,
    primary_color VARCHAR(7) NULL,
    secondary_color VARCHAR(7) NULL,
    image_filename VARCHAR(255) NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    file_size INT NULL,
    mime_type VARCHAR(50) DEFAULT 'image/png',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (crew_id) REFERENCES Crews(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    
    INDEX idx_saved_images_crew_id (crew_id),
    INDEX idx_saved_images_user_id (user_id),
    INDEX idx_saved_images_created_at (created_at)
);