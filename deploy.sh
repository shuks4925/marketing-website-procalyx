#!/bin/bash

# PROCALYX Deployment Script for AWS EC2
# Usage: ./deploy.sh

# Configuration - UPDATE THESE VALUES
EC2_USER="ec2-user"                    # Usually 'ec2-user' for Amazon Linux, 'ubuntu' for Ubuntu
EC2_HOST=""                            # Your EC2 public IP or domain
SSH_KEY=""                             # Path to your SSH private key (e.g., ~/.ssh/my-key.pem)
REMOTE_DIR="/var/www/procalyx"         # Remote directory on EC2

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}PROCALYX Deployment Script${NC}"
echo "================================"

# Check if configuration is set
if [ -z "$EC2_HOST" ] || [ -z "$SSH_KEY" ]; then
    echo -e "${RED}Error: Please edit deploy.sh and set EC2_HOST and SSH_KEY${NC}"
    exit 1
fi

# Check if SSH key exists
if [ ! -f "$SSH_KEY" ]; then
    echo -e "${RED}Error: SSH key not found at $SSH_KEY${NC}"
    exit 1
fi

echo -e "${YELLOW}Step 1: Uploading files to EC2...${NC}"
scp -i "$SSH_KEY" -r index.html styles.css script.js Procalyx.png "$EC2_USER@$EC2_HOST:/tmp/procalyx-site/"

if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Failed to upload files${NC}"
    exit 1
fi

echo -e "${YELLOW}Step 2: Setting up files on EC2...${NC}"
ssh -i "$SSH_KEY" "$EC2_USER@$EC2_HOST" << 'ENDSSH'
    # Create directory if it doesn't exist
    sudo mkdir -p /var/www/procalyx
    
    # Copy files
    sudo cp -r /tmp/procalyx-site/* /var/www/procalyx/
    
    # Set permissions (adjust based on your system)
    # For Amazon Linux:
    sudo chown -R nginx:nginx /var/www/procalyx 2>/dev/null || \
    # For Ubuntu:
    sudo chown -R www-data:www-data /var/www/procalyx 2>/dev/null || \
    # Fallback:
    sudo chown -R $USER:$USER /var/www/procalyx
    
    # Set file permissions
    sudo chmod -R 755 /var/www/procalyx
    
    echo "Files deployed successfully!"
ENDSSH

if [ $? -ne 0 ]; then
    echo -e "${RED}Error: Failed to setup files on EC2${NC}"
    exit 1
fi

echo -e "${GREEN}Deployment complete!${NC}"
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Make sure Nginx is installed and running"
echo "2. Configure Nginx to serve from /var/www/procalyx"
echo "3. Update your Security Group to allow HTTP (port 80)"
echo "4. Visit http://$EC2_HOST"

