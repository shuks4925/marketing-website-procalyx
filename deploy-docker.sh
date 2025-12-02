#!/bin/bash

# PROCALYX Docker Deployment Script for AWS EC2
# Usage: ./deploy-docker.sh

# Configuration - UPDATE THESE VALUES
EC2_USER="ec2-user"                    # Usually 'ec2-user' for Amazon Linux, 'ubuntu' for Ubuntu
EC2_HOST=""                            # Your EC2 public IP or domain
SSH_KEY=""                             # Path to your SSH private key (e.g., ~/.ssh/my-key.pem)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}PROCALYX Docker Deployment Script${NC}"
echo "======================================"

# Check if configuration is set
if [ -z "$EC2_HOST" ] || [ -z "$SSH_KEY" ]; then
    echo -e "${RED}Error: Please edit deploy-docker.sh and set EC2_HOST and SSH_KEY${NC}"
    exit 1
fi

# Check if SSH key exists
if [ ! -f "$SSH_KEY" ]; then
    echo -e "${RED}Error: SSH key not found at $SSH_KEY${NC}"
    exit 1
fi

echo -e "${YELLOW}Step 1: Uploading files to EC2...${NC}"
scp -i "$SSH_KEY" -r Dockerfile docker-compose.yml nginx.conf index.html styles.css script.js Procalyx.png "$EC2_USER@$EC2_HOST:~/procalyx-site/"

if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Failed to upload files${NC}"
    exit 1
fi

echo -e "${YELLOW}Step 2: Installing Docker on EC2 (if not installed)...${NC}"
ssh -i "$SSH_KEY" "$EC2_USER@$EC2_HOST" << 'ENDSSH'
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        echo "Installing Docker..."
        # Amazon Linux 2
        if [ -f /etc/os-release ] && grep -q "Amazon Linux" /etc/os-release; then
            sudo yum update -y
            sudo yum install docker -y
            sudo systemctl start docker
            sudo systemctl enable docker
            sudo usermod -aG docker $USER
        # Ubuntu
        elif [ -f /etc/os-release ] && grep -q "Ubuntu" /etc/os-release; then
            sudo apt-get update
            sudo apt-get install -y docker.io docker-compose
            sudo systemctl start docker
            sudo systemctl enable docker
            sudo usermod -aG docker $USER
        else
            echo "Please install Docker manually"
            exit 1
        fi
    fi
    
    # Check if docker-compose is installed
    if ! command -v docker-compose &> /dev/null; then
        echo "Installing docker-compose..."
        sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        sudo chmod +x /usr/local/bin/docker-compose
    fi
    
    echo "Docker is ready!"
ENDSSH

echo -e "${YELLOW}Step 3: Building and starting Docker container...${NC}"
ssh -i "$SSH_KEY" "$EC2_USER@$EC2_HOST" << 'ENDSSH'
    cd ~/procalyx-site
    
    # Stop and remove existing container if it exists
    docker-compose down 2>/dev/null || true
    
    # Build and start the container
    docker-compose up -d --build
    
    # Show container status
    docker-compose ps
    
    echo ""
    echo "Deployment complete!"
    echo "Container is running on port 80"
ENDSSH

if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Failed to deploy Docker container${NC}"
    exit 1
fi

echo -e "${GREEN}Deployment complete!${NC}"
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Make sure your EC2 Security Group allows inbound traffic on port 80"
echo "2. Visit http://$EC2_HOST"
echo ""
echo -e "${YELLOW}Useful commands:${NC}"
echo "  View logs: ssh $EC2_USER@$EC2_HOST 'cd ~/procalyx-site && docker-compose logs -f'"
echo "  Stop: ssh $EC2_USER@$EC2_HOST 'cd ~/procalyx-site && docker-compose down'"
echo "  Restart: ssh $EC2_USER@$EC2_HOST 'cd ~/procalyx-site && docker-compose restart'"

