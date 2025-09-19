
#!/bin/sh
set -e

echo "🚀 Starting Classroom Participation Tracker..."

# Wait for database to be ready
echo "⏳ Waiting for database connection..."
npx prisma db push --accept-data-loss || {
    echo "⚠️  Database push failed, retrying in 5 seconds..."
    sleep 5
    npx prisma db push --accept-data-loss
}

# Seed database if needed
echo "🌱 Seeding database..."
npx prisma db seed || echo "⚠️  Database seeding failed or not needed"

echo "✅ Database ready, starting application..."

# Start the Next.js application
exec node server.js
