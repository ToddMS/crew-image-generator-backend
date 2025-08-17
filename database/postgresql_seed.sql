-- PostgreSQL Seed data for Crew Management Database
-- Run this after postgresql_schema.sql to populate with initial data

-- Insert boat types
INSERT INTO BoatTypes (value, seats, name) VALUES
('8+', 8, 'Eight with Coxswain'),
('4+', 4, 'Four with Coxswain'),
('4-', 4, 'Four without Coxswain'),
('4x', 4, 'Quadruple Sculls'),
('2x', 2, 'Double Sculls'),
('2-', 2, 'Pair without Coxswain'),
('1x', 1, 'Single Sculls')
ON CONFLICT (value) DO NOTHING;

-- Note: Sample crews and crew members can be added after user authentication is set up
-- This ensures proper user_id associations