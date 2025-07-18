-- Update boat types to include all standard rowing boat classes
-- Run this to add the missing boat types

USE CrewManagement;

-- Update existing boat types and add new ones
INSERT INTO BoatTypes (id, value, seats, name) VALUES
(6, '4x', 4, 'Quad Sculls'),
(7, '2-', 2, 'Coxless Pair')
ON DUPLICATE KEY UPDATE
value = VALUES(value),
seats = VALUES(seats),
name = VALUES(name);

-- Update the existing records to have better descriptions
UPDATE BoatTypes SET name = 'Eight with Coxswain' WHERE value = '8+';
UPDATE BoatTypes SET name = 'Four with Coxswain' WHERE value = '4+';
UPDATE BoatTypes SET name = 'Four without Coxswain' WHERE value = '4-';
UPDATE BoatTypes SET name = 'Double Sculls' WHERE value = '2x';
UPDATE BoatTypes SET name = 'Single Sculls' WHERE value = '1x';

-- Verify all boat types
SELECT * FROM BoatTypes ORDER BY seats DESC, value;