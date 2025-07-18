-- Crew Management Database Schema
-- Run this script to create the database and tables

-- Create database
CREATE DATABASE IF NOT EXISTS CrewManagement;
USE CrewManagement;

-- Create BoatTypes table
CREATE TABLE IF NOT EXISTS BoatTypes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    value VARCHAR(10) NOT NULL UNIQUE,
    seats INT NOT NULL,
    name VARCHAR(100) NOT NULL
);

-- Create Crews table
CREATE TABLE IF NOT EXISTS Crews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    club_name VARCHAR(255) NOT NULL,
    race_name VARCHAR(255) NOT NULL,
    boat_type_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (boat_type_id) REFERENCES BoatTypes(id) ON DELETE RESTRICT
);

-- Create CrewMembers table
CREATE TABLE IF NOT EXISTS CrewMembers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    crew_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    seat_number INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (crew_id) REFERENCES Crews(id) ON DELETE CASCADE,
    UNIQUE KEY unique_crew_seat (crew_id, seat_number)
);

-- Create indexes for better performance
CREATE INDEX idx_crews_boat_type ON Crews(boat_type_id);
CREATE INDEX idx_crew_members_crew_id ON CrewMembers(crew_id);
CREATE INDEX idx_crew_members_seat ON CrewMembers(crew_id, seat_number);