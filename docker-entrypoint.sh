
#!/bin/sh
set -e

echo "🚀 Starting Classroom Participation Tracker..."

# Wait for database to be ready
echo "⏳ Waiting for database connection..."

# Function to wait for database
wait_for_db() {
    local max_tries=30
    local count=0
    
    while [ $count -lt $max_tries ]; do
        if npx prisma db push --accept-data-loss >/dev/null 2>&1; then
            echo "✅ Database connection established"
            return 0
        fi
        
        count=$((count + 1))
        echo "⏳ Waiting for database... ($count/$max_tries)"
        sleep 3
    done
    
    echo "❌ Failed to connect to database after $max_tries attempts"
    return 1
}

# Wait for database and push schema
if wait_for_db; then
    echo "🌱 Seeding database..."
    npx prisma db seed 2>/dev/null || echo "⚠️  Database seeding skipped (no seed script or already seeded)"
else
    echo "⚠️  Database connection failed, but continuing..."
fi

echo "✅ Database setup complete, starting application..."

# Health check endpoint setup
echo "🩺 Health check available at: http://localhost:3000/api/health"

# Start the Next.js application
exec node server.js
