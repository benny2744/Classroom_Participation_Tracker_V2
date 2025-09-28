
#!/bin/bash

# Classroom Participation Tracker - Docker Setup Script
# This script prepares the environment for Docker deployment

set -e

echo "🐳 Setting up Docker environment for Classroom Participation Tracker..."

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_warning "Docker not found. Installing Docker..."
        
        # Detect OS
        if [[ "$OSTYPE" == "linux-gnu"* ]]; then
            # Linux - try to install Docker
            if command -v apt-get &> /dev/null; then
                print_status "Installing Docker on Ubuntu/Debian..."
                sudo apt-get update
                sudo apt-get install -y apt-transport-https ca-certificates curl gnupg lsb-release
                curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
                echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
                sudo apt-get update
                sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
                sudo systemctl start docker
                sudo systemctl enable docker
                sudo usermod -aG docker $USER
                print_status "Docker installed successfully. Please log out and log back in to use Docker."
            elif command -v yum &> /dev/null; then
                print_status "Installing Docker on CentOS/RHEL..."
                sudo yum install -y yum-utils
                sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
                sudo yum install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
                sudo systemctl start docker
                sudo systemctl enable docker
                sudo usermod -aG docker $USER
            else
                print_error "Unsupported Linux distribution. Please install Docker manually."
                exit 1
            fi
        else
            print_error "Please install Docker manually for your operating system:"
            print_error "https://docs.docker.com/get-docker/"
            exit 1
        fi
    else
        print_status "Docker is already installed."
    fi
}

# Check if Docker Compose is available
check_docker_compose() {
    if ! docker compose version &> /dev/null; then
        print_error "Docker Compose is not available. Please install Docker Desktop or Docker Compose plugin."
        exit 1
    else
        print_status "Docker Compose is available."
    fi
}

# Fix yarn.lock symlink issue
fix_yarn_lock() {
    print_status "Checking yarn.lock configuration..."
    
    cd app
    
    if [ -L "yarn.lock" ]; then
        print_warning "yarn.lock is a symlink. Converting to real file..."
        
        # Get the target of the symlink
        YARN_TARGET=$(readlink yarn.lock)
        
        if [ -f "$YARN_TARGET" ]; then
            print_status "Copying yarn.lock from $YARN_TARGET"
            cp "$YARN_TARGET" yarn.lock.temp
            rm yarn.lock
            mv yarn.lock.temp yarn.lock
            print_status "yarn.lock converted to real file successfully."
        else
            print_error "yarn.lock target not found: $YARN_TARGET"
            exit 1
        fi
    elif [ -f "yarn.lock" ]; then
        print_status "yarn.lock is already a real file."
    else
        print_error "yarn.lock not found!"
        exit 1
    fi
    
    cd ..
}

# Create environment file
create_env_file() {
    print_status "Setting up environment configuration..."
    
    if [ ! -f ".env.docker.local" ]; then
        print_status "Creating .env.docker.local file..."
        
        # Generate secure passwords and secrets
        DB_PASSWORD=$(openssl rand -base64 16 | tr -d "=+/" | cut -c1-16)
        NEXTAUTH_SECRET=$(openssl rand -base64 32)
        
        cat > .env.docker.local << EOF
# Database Configuration
DATABASE_URL=postgresql://tracker_user:${DB_PASSWORD}@database:5432/participation_tracker?connect_timeout=15

# Authentication Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=${NEXTAUTH_SECRET}

# PostgreSQL Settings
POSTGRES_DB=participation_tracker
POSTGRES_USER=tracker_user
POSTGRES_PASSWORD=${DB_PASSWORD}

# Application Settings
NODE_ENV=production
PORT=3000

# Optional: Redis (uncomment if using Redis)
# REDIS_URL=redis://redis:6379

# Optional: AWS S3 (uncomment and configure if using file uploads)
# AWS_BUCKET_NAME=your-bucket-name
# AWS_FOLDER_PREFIX=participation-tracker/
EOF
        print_status "Environment file created with secure generated passwords."
        print_warning "You can edit .env.docker.local to customize your configuration."
    else
        print_status ".env.docker.local already exists. Skipping creation."
    fi
}

# Update docker-compose with environment
update_docker_compose() {
    print_status "Updating Docker Compose configuration..."
    
    # Read the password from the env file
    if [ -f ".env.docker.local" ]; then
        DB_PASSWORD=$(grep "POSTGRES_PASSWORD=" .env.docker.local | cut -d'=' -f2)
        NEXTAUTH_SECRET=$(grep "NEXTAUTH_SECRET=" .env.docker.local | cut -d'=' -f2)
        
        # Update docker-compose.yml with the actual password
        sed -i "s/tracker_password_2024/${DB_PASSWORD}/g" docker-compose.yml
        sed -i "s/classroom_participation_tracker_docker_secret_2024/${NEXTAUTH_SECRET}/g" docker-compose.yml
        
        print_status "Docker Compose updated with secure credentials."
    fi
}

# Clean up previous Docker resources
cleanup_docker() {
    print_status "Cleaning up previous Docker resources..."
    
    # Stop and remove containers if they exist
    docker compose down --remove-orphans 2>/dev/null || true
    
    # Remove unused images
    docker image prune -f 2>/dev/null || true
    
    print_status "Docker cleanup completed."
}

# Set up file permissions
setup_permissions() {
    print_status "Setting up file permissions..."
    
    chmod +x docker-entrypoint.sh 2>/dev/null || true
    chmod +x docker-scripts/*.sh 2>/dev/null || true
    
    print_status "File permissions set correctly."
}

# Main setup process
main() {
    print_status "Starting Docker setup for Classroom Participation Tracker..."
    
    # Check prerequisites
    check_docker
    check_docker_compose
    
    # Setup environment
    fix_yarn_lock
    create_env_file
    update_docker_compose
    setup_permissions
    cleanup_docker
    
    print_status "🎉 Docker setup completed successfully!"
    print_status ""
    print_status "Next steps:"
    print_status "1. Review and customize .env.docker.local if needed"
    print_status "2. Run: docker compose up --build -d"
    print_status "3. Access your app at: http://localhost:3000"
    print_status "4. Health check: http://localhost:3000/api/health"
    print_status ""
    print_warning "If you installed Docker for the first time, please log out and log back in."
}

# Run main function
main "$@"
