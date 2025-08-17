# Database Setup Guide

## Prerequisites
- MySQL 8.0+ or MariaDB 10.3+
- MySQL client or phpMyAdmin or similar tool

## Quick Setup

### 1. Install MySQL (if not installed)

**macOS (using Homebrew):**
```bash
brew install mysql
brew services start mysql
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql
```

**Windows:**
Download from [MySQL Downloads](https://dev.mysql.com/downloads/mysql/)

### 2. Create Database and Tables

**Option A: Using MySQL Command Line**
```bash
# Connect to MySQL
mysql -u root -p

# Run the schema script
source /path/to/your/backend/database/schema.sql;

# Run the seed data script
source /path/to/your/backend/database/seed.sql;
```

**Option B: Using MySQL Workbench or phpMyAdmin**
1. Open your MySQL client
2. Copy and paste the contents of `schema.sql` and execute
3. Copy and paste the contents of `seed.sql` and execute

### 3. Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cd backend
   cp .env.example .env
   ```

2. Edit `.env` with your database credentials:
   ```
   DB_HOST=127.0.0.1
   DB_USER=root
   DB_PASS=
   DB_NAME=CrewManagement
   ```

### 4. Test Connection

Start your backend server:
```bash
cd backend
npm run dev
```

If successful, you should see:
```
Server running on http://localhost:8080
```

And your frontend should load crews from the database!

## Database Schema

### Tables Created:

1. **BoatTypes** - Defines different types of rowing boats
   - `id` (Primary Key)
   - `value` (8+, 4+, 4-, 2x, 1x)
   - `seats` (number of rowers)
   - `name` (descriptive name)

2. **Crews** - Main crew information
   - `id` (Primary Key)
   - `name` (boat name)
   - `club_name` (rowing club)
   - `race_name` (competition name)
   - `boat_type_id` (Foreign Key to BoatTypes)
   - `created_at`, `updated_at` (timestamps)

3. **CrewMembers** - Individual rowers in each crew
   - `id` (Primary Key)
   - `crew_id` (Foreign Key to Crews)
   - `name` (rower name)
   - `seat_number` (position in boat: 0=cox, 1=stroke, etc.)

### Sample Data Includes:
- 5 different boat types (8+, 4+, 4-, 2x, 1x)
- 5 sample crews with complete lineups
- Various rowing clubs and races

## Switching Between Database and Memory

In `backend/src/controllers/crew.controller.ts`:

**Use Database:**
```typescript
import CrewService from "../services/crew.service.js";
```

**Use Memory (no database needed):**
```typescript
import CrewService from "../services/crew.service.memory.js";
```

## Troubleshooting

**Connection Refused Error:**
- Make sure MySQL is running: `brew services start mysql` (macOS)
- Check credentials in `.env` file
- Verify database exists: `SHOW DATABASES;`

**Permission Errors:**
- Ensure MySQL user has proper privileges
- Try: `GRANT ALL PRIVILEGES ON CrewManagement.* TO 'root'@'localhost';`

**Port Conflicts:**
- Default MySQL port is 3306
- Default backend port is 8080
- Change in `.env` if needed