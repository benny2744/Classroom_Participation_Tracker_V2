
#!/bin/bash
set -e

# Restore script for Classroom Participation Tracker Docker deployment

if [ $# -eq 0 ]; then
    echo "❌ Usage: $0 <backup_timestamp>"
    echo "Example: $0 20240919_143000"
    echo ""
    echo "Available backups:"
    ls -1 backups/ | grep -E "_[0-9]{8}_[0-9]{6}_" | sort -r | head -10
    exit 1
fi

BACKUP_TIMESTAMP="$1"
BACKUP_DIR="./backups"
BACKUP_NAME="participation_tracker_backup_$BACKUP_TIMESTAMP"

echo "🔄 Restoring from backup: $BACKUP_NAME"

# Check if backup files exist
if [ ! -f "$BACKUP_DIR/${BACKUP_NAME}_database.sql" ]; then
    echo "❌ Database backup file not found: $BACKUP_DIR/${BACKUP_NAME}_database.sql"
    exit 1
fi

# Confirm restoration
read -p "⚠️  This will replace current data. Continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Restoration cancelled"
    exit 1
fi

# Stop services
echo "🛑 Stopping services..."
docker-compose down

# Restore database
echo "📊 Restoring database..."
docker-compose up -d database
sleep 10  # Wait for database to be ready

# Drop and recreate database
docker-compose exec database psql -U tracker_user -d postgres -c "DROP DATABASE IF EXISTS participation_tracker;"
docker-compose exec database psql -U tracker_user -d postgres -c "CREATE DATABASE participation_tracker;"

# Restore database backup
docker-compose exec -T database psql -U tracker_user -d participation_tracker < "$BACKUP_DIR/${BACKUP_NAME}_database.sql"

# Restore uploaded files
if [ -f "$BACKUP_DIR/${BACKUP_NAME}_uploads.tar.gz" ]; then
    echo "📁 Restoring uploaded files..."
    tar -xzf "$BACKUP_DIR/${BACKUP_NAME}_uploads.tar.gz"
fi

# Restore configuration
if [ -f "$BACKUP_DIR/${BACKUP_NAME}_env.backup" ]; then
    echo "⚙️  Restoring configuration..."
    cp "$BACKUP_DIR/${BACKUP_NAME}_env.backup" .env.docker.local
fi

# Start all services
echo "🚀 Starting all services..."
docker-compose up -d

echo "✅ Restoration completed successfully!"
echo "🌐 Application should be available at: http://localhost:3000"
