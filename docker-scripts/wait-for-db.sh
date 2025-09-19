
#!/bin/bash
set -e

# Wait for PostgreSQL database to be ready
host="$1"
port="$2"
user="$3"
database="$4"

echo "⏳ Waiting for PostgreSQL at $host:$port..."

until pg_isready -h "$host" -p "$port" -U "$user" -d "$database"; do
  echo "💤 Database is unavailable - sleeping"
  sleep 2
done

echo "✅ Database is ready!"
