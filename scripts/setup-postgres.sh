#!/bin/bash
# Setup PostgreSQL database locally

echo "Setting up PostgreSQL database..."

# Create database (assumes PostgreSQL is running)
createdb CrewManagement

# Run the schema
psql CrewManagement -f database/postgresql_schema.sql

# Seed with boat types
psql CrewManagement -f database/postgresql_seed.sql

echo "PostgreSQL database setup complete!"
echo "Database: CrewManagement"
echo "Connection: postgresql://localhost:5432/CrewManagement"