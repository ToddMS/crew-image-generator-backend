-- PostgreSQL Schema for Crew Management Database
-- This script creates all tables for PostgreSQL (Render deployment)

-- Create BoatTypes table
CREATE TABLE IF NOT EXISTS BoatTypes (
    id SERIAL PRIMARY KEY,
    value VARCHAR(10) NOT NULL UNIQUE,
    seats INTEGER NOT NULL,
    name VARCHAR(100) NOT NULL
);

-- Create Users table
CREATE TABLE IF NOT EXISTS Users (
    id SERIAL PRIMARY KEY,
    google_id VARCHAR(255) UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    profile_picture VARCHAR(500),
    club_name VARCHAR(255),
    password_hash VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Crews table
CREATE TABLE IF NOT EXISTS Crews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES Users(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    club_name VARCHAR(255) NOT NULL,
    race_name VARCHAR(255) NOT NULL,
    boat_type_id INTEGER NOT NULL REFERENCES BoatTypes(id) ON DELETE RESTRICT,
    coach_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create CrewMembers table
CREATE TABLE IF NOT EXISTS CrewMembers (
    id SERIAL PRIMARY KEY,
    crew_id INTEGER NOT NULL REFERENCES Crews(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    seat_number INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(crew_id, seat_number)
);

-- Create Sessions table
CREATE TABLE IF NOT EXISTS Sessions (
    id VARCHAR(255) PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create ClubSettings table
CREATE TABLE IF NOT EXISTS ClubSettings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL UNIQUE REFERENCES Users(id) ON DELETE CASCADE,
    primary_color VARCHAR(7) DEFAULT '#5E98C2',
    secondary_color VARCHAR(7) DEFAULT '#ffffff',
    logo_filename VARCHAR(255),
    logo_upload_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create SavedImages table
CREATE TABLE IF NOT EXISTS SavedImages (
    id SERIAL PRIMARY KEY,
    crew_id INTEGER NOT NULL REFERENCES Crews(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
    image_name VARCHAR(255) NOT NULL,
    template_id VARCHAR(10) NOT NULL,
    primary_color VARCHAR(7),
    secondary_color VARCHAR(7),
    image_filename VARCHAR(255) NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(50) DEFAULT 'image/png',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create ClubPresets table
CREATE TABLE IF NOT EXISTS ClubPresets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
    club_name VARCHAR(255) NOT NULL,
    primary_color VARCHAR(7) NOT NULL DEFAULT '#5E98C2',
    secondary_color VARCHAR(7) NOT NULL DEFAULT '#ffffff',
    logo_filename VARCHAR(255),
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_crews_boat_type ON Crews(boat_type_id);
CREATE INDEX IF NOT EXISTS idx_crews_user_id ON Crews(user_id);
CREATE INDEX IF NOT EXISTS idx_crew_members_crew_id ON CrewMembers(crew_id);
CREATE INDEX IF NOT EXISTS idx_crew_members_seat ON CrewMembers(crew_id, seat_number);
CREATE INDEX IF NOT EXISTS idx_users_email ON Users(email);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON Users(google_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON Sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON Sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_saved_images_crew_id ON SavedImages(crew_id);
CREATE INDEX IF NOT EXISTS idx_saved_images_user_id ON SavedImages(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_images_created_at ON SavedImages(created_at);
CREATE INDEX IF NOT EXISTS idx_club_presets_user_id ON ClubPresets(user_id);
CREATE INDEX IF NOT EXISTS idx_club_presets_default ON ClubPresets(user_id, is_default);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON Users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crews_updated_at BEFORE UPDATE ON Crews 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_club_settings_updated_at BEFORE UPDATE ON ClubSettings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_saved_images_updated_at BEFORE UPDATE ON SavedImages 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_club_presets_updated_at BEFORE UPDATE ON ClubPresets 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();