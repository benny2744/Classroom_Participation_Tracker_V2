
-- Initialize PostgreSQL database for Classroom Participation Tracker
-- This script runs automatically when the database container starts

-- Create database extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create database user if not exists (this is handled by environment variables)
-- The POSTGRES_USER and POSTGRES_PASSWORD environment variables automatically create the user

-- Set timezone
SET timezone = 'UTC';

-- Create schemas if needed for multi-tenancy (future enhancement)
-- CREATE SCHEMA IF NOT EXISTS public;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE participation_tracker TO tracker_user;

-- Log successful initialization
SELECT 'Database initialized successfully for Classroom Participation Tracker' AS status;
