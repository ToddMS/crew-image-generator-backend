-- Seed data for Crew Management Database
-- Run this after schema.sql to populate with initial data

USE CrewManagement;

-- Insert boat types
INSERT INTO BoatTypes (id, value, seats, name) VALUES
(1, '8+', 8, 'Eight with Coxswain'),
(2, '4+', 4, 'Four with Coxswain'),
(3, '4-', 4, 'Four without Coxswain'),
(4, '2x', 2, 'Double Sculls'),
(5, '1x', 1, 'Single Sculls');

-- Insert sample crews
INSERT INTO Crews (id, name, club_name, race_name, boat_type_id) VALUES
(1, 'Spirit of Cambridge', 'Cambridge University BC', 'Head of the Charles', 1),
(2, 'Lightning Bolt', 'Oxford Rowing Club', 'Henley Royal Regatta', 3),
(3, 'Golden Arrow', 'Harvard Crimson', 'Charles River Classic', 2),
(4, 'Thunder Strike', 'Yale Bulldogs', 'Eastern Sprints', 4),
(5, 'Solo Warrior', 'Boston Rowing Club', 'Head of the Fish', 5);

-- Insert crew members for Spirit of Cambridge (8+)
INSERT INTO CrewMembers (crew_id, name, seat_number) VALUES
(1, 'Sarah Cox', 0),        -- Coxswain
(1, 'Alice Stroke', 1),     -- Stroke seat
(1, 'Bob Seven', 2),        -- 7 seat
(1, 'Charlie Six', 3),      -- 6 seat
(1, 'David Five', 4),       -- 5 seat
(1, 'Eve Four', 5),         -- 4 seat
(1, 'Frank Three', 6),      -- 3 seat
(1, 'Grace Two', 7),        -- 2 seat
(1, 'Henry Bow', 8);        -- Bow seat

-- Insert crew members for Lightning Bolt (4-)
INSERT INTO CrewMembers (crew_id, name, seat_number) VALUES
(2, 'John Stroke', 1),      -- Stroke seat
(2, 'Jane Three', 2),       -- 3 seat
(2, 'Jim Two', 3),          -- 2 seat
(2, 'Jill Bow', 4);         -- Bow seat

-- Insert crew members for Golden Arrow (4+)
INSERT INTO CrewMembers (crew_id, name, seat_number) VALUES
(3, 'Mike Cox', 0),         -- Coxswain
(3, 'Mary Stroke', 1),      -- Stroke seat
(3, 'Mark Three', 2),       -- 3 seat
(3, 'Molly Two', 3),        -- 2 seat
(3, 'Max Bow', 4);          -- Bow seat

-- Insert crew members for Thunder Strike (2x)
INSERT INTO CrewMembers (crew_id, name, seat_number) VALUES
(4, 'Peter Stroke', 1),     -- Stroke seat
(4, 'Paul Bow', 2);         -- Bow seat

-- Insert crew members for Solo Warrior (1x)
INSERT INTO CrewMembers (crew_id, name, seat_number) VALUES
(5, 'Solo Steve', 1);       -- Single sculler