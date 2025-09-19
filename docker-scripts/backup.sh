
#!/bin/bash
set -e

# Backup script for Classroom Participation Tracker Docker deployment

BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="participation_tracker_backup_$TIMESTAMP"

echo "🗃️  Creating backup: $BACKUP_NAME"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Backup database
echo "📊 Backing up database..."
docker-compose exec -T database pg_dump -U tracker_user -d participation_tracker > "$BACKUP_DIR/${BACKUP_NAME}_database.sql"

# Backup uploaded files (if any)
if [ -d "uploads" ]; then
    echo "📁 Backing up uploaded files..."
    tar -czf "$BACKUP_DIR/${BACKUP_NAME}_uploads.tar.gz" uploads/
fi

# Backup configuration
echo "⚙️  Backing up configuration..."
cp .env.docker.local "$BACKUP_DIR/${BACKUP_NAME}_env.backup" 2>/dev/null || echo "No .env.docker.local found"
cp docker-compose.yml "$BACKUP_DIR/${BACKUP_NAME}_docker-compose.yml"

echo "✅ Backup completed: $BACKUP_DIR/$BACKUP_NAME"
echo ""
echo "To restore:"
echo "1. Database: docker-compose exec -T database psql -U tracker_user -d participation_tracker < $BACKUP_DIR/${BACKUP_NAME}_database.sql"
echo "2. Files: tar -xzf $BACKUP_DIR/${BACKUP_NAME}_uploads.tar.gz"
echo "3. Config: cp $BACKUP_DIR/${BACKUP_NAME}_env.backup .env.docker.local"
