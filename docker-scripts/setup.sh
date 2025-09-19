
#!/bin/bash
set -e

echo "🐳 Setting up Classroom Participation Tracker with Docker"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker and Docker Compose first."
    echo "Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    echo "Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

# Create environment file if it doesn't exist
if [ ! -f .env.docker.local ]; then
    echo "📝 Creating .env.docker.local file..."
    cp .env.docker .env.docker.local
    echo "✅ Created .env.docker.local - Please review and update the environment variables as needed"
fi

# Create necessary directories
echo "📁 Creating required directories..."
mkdir -p database/init
mkdir -p logs
mkdir -p uploads

# Set permissions for scripts
echo "🔐 Setting script permissions..."
chmod +x docker-entrypoint.sh
chmod +x docker-scripts/wait-for-db.sh
chmod +x docker-scripts/setup.sh

echo ""
echo "🎉 Docker setup complete!"
echo ""
echo "Next steps:"
echo "1. Review and update .env.docker.local with your settings"
echo "2. Run: docker-compose up --build"
echo "3. Access the application at: http://localhost:3000"
echo ""
echo "For development mode:"
echo "docker-compose -f docker-compose.dev.yml up --build"
echo ""
