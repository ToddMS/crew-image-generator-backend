-- Add optional coach field to Crews table
-- Run this script to add the coach column to existing database

USE CrewManagement;

-- Add coach column to Crews table (optional field)
ALTER TABLE Crews 
ADD COLUMN coach_name VARCHAR(255) NULL 
AFTER race_name;

-- Add index for coach searches if needed in the future
CREATE INDEX idx_crews_coach ON Crews(coach_name);