# PROCALYX Coming Soon Page

A lightweight, responsive "Coming Soon" page with email collection functionality.

## Features

- ✅ Pixel-perfect design matching the PROCALYX brand
- ✅ Fully responsive (mobile, tablet, desktop)
- ✅ Email form with public API integration
- ✅ Timestamp recording for each submission
- ✅ Lightweight and fast loading
- ✅ Social media links
- ✅ Modern gradient background with branded logo

## Setup

1. **Get a Web3Forms Access Key** (Recommended):
   - Visit [https://web3forms.com](https://web3forms.com)
   - Sign up for a free account
   - Get your access key
   - Replace `YOUR_ACCESS_KEY_HERE` in `script.js` with your actual key

2. **Alternative API Options**:
   - The code includes a fallback to localStorage if the API fails
   - You can modify `script.js` to use any public API endpoint
   - Example alternatives: Formspree, EmailJS, or your own backend API

## File Structure

```
procalyx-coming-soon/
├── index.html      # Main HTML structure
├── styles.css      # All styling (pixel-perfect design)
├── script.js       # Form submission and API integration
└── README.md       # This file
```

## Usage

1. Open `index.html` in a web browser
2. Enter an email address in the form
3. Click "Notify Me"
4. The email and timestamp will be recorded via the API

## API Integration

The page uses Web3Forms API by default, which:
- Records email addresses
- Includes timestamps automatically
- Sends email notifications (optional)
- Provides a free tier

To use a different API, modify the `API_ENDPOINT` and form submission logic in `script.js`.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

## AWS EC2 Deployment

### Option 1: Using Docker (Recommended - Easiest)

Docker makes deployment simple and consistent across environments.

#### Quick Start:

1. **Edit `deploy-docker.sh`** with your EC2 details:
   ```bash
   EC2_HOST="your-ec2-ip"
   SSH_KEY="~/.ssh/your-key.pem"
   ```

2. **Run the deployment script:**
   ```bash
   chmod +x deploy-docker.sh
   ./deploy-docker.sh
   ```

   The script will:
   - Upload all files to EC2
   - Install Docker (if not installed)
   - Build and start the container
   - Configure everything automatically

#### Manual Docker Deployment:

1. **SSH into your EC2 instance:**
   ```bash
   ssh -i your-key.pem ec2-user@your-ec2-ip
   ```

2. **Install Docker (if not installed):**
   ```bash
   # Amazon Linux 2
   sudo yum update -y
   sudo yum install docker -y
   sudo systemctl start docker
   sudo systemctl enable docker
   sudo usermod -aG docker ec2-user
   
   # Ubuntu
   sudo apt-get update
   sudo apt-get install -y docker.io docker-compose
   sudo systemctl start docker
   sudo systemctl enable docker
   sudo usermod -aG docker ubuntu
   ```

3. **Install docker-compose (if needed):**
   ```bash
   sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

4. **Upload files to EC2:**
   ```bash
   # From your local machine:
   scp -i your-key.pem Dockerfile docker-compose.yml nginx.conf index.html styles.css script.js Procalyx.png ec2-user@your-ec2-ip:~/procalyx-site/
   ```

5. **Build and run the container:**
   ```bash
   # SSH into EC2, then:
   cd ~/procalyx-site
   docker-compose up -d --build
   ```

6. **Configure Security Group:**
   - Allow inbound HTTP (port 80) from anywhere (0.0.0.0/0)

7. **Access your site:**
   - Visit `http://your-ec2-public-ip`

#### Docker Commands:

```bash
# View logs
docker-compose logs -f

# Stop the container
docker-compose down

# Restart the container
docker-compose restart

# Rebuild after changes
docker-compose up -d --build

# Check container status
docker-compose ps
```

### Option 2: Using Nginx (Traditional Method)

1. **SSH into your EC2 instance:**
   ```bash
   ssh -i your-key.pem ec2-user@your-ec2-ip
   ```

2. **Update system packages:**
   ```bash
   sudo yum update -y  # For Amazon Linux
   # OR
   sudo apt update && sudo apt upgrade -y  # For Ubuntu
   ```

3. **Install Nginx:**
   ```bash
   # Amazon Linux
   sudo yum install nginx -y
   
   # Ubuntu/Debian
   sudo apt install nginx -y
   ```

4. **Upload files to EC2:**
   ```bash
   # From your local machine, use SCP:
   scp -i your-key.pem -r * ec2-user@your-ec2-ip:/tmp/procalyx-site/
   
   # OR use git (if you have a repo):
   git clone your-repo-url
   ```

5. **Move files to web directory:**
   ```bash
   # SSH into EC2, then:
   sudo mkdir -p /var/www/procalyx
   sudo cp -r /tmp/procalyx-site/* /var/www/procalyx/
   sudo chown -R nginx:nginx /var/www/procalyx  # Amazon Linux
   # OR
   sudo chown -R www-data:www-data /var/www/procalyx  # Ubuntu
   ```

6. **Configure Nginx:**
   ```bash
   sudo nano /etc/nginx/conf.d/procalyx.conf
   ```
   
   Add this configuration:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com www.your-domain.com;  # Replace with your domain or EC2 IP
       
       root /var/www/procalyx;
       index index.html;
       
       location / {
           try_files $uri $uri/ =404;
       }
       
       # Enable gzip compression
       gzip on;
       gzip_types text/css application/javascript image/svg+xml;
   }
   ```

7. **Start and enable Nginx:**
   ```bash
   sudo systemctl start nginx
   sudo systemctl enable nginx
   sudo systemctl status nginx
   ```

8. **Configure Security Group:**
   - Go to AWS Console → EC2 → Security Groups
   - Add inbound rule: HTTP (port 80) from anywhere (0.0.0.0/0)
   - For HTTPS, add port 443 and set up SSL certificate

9. **Access your site:**
   - Visit `http://your-ec2-public-ip` or `http://your-domain.com`

### Option 2: Using Python HTTP Server (Quick Testing)

1. **SSH into EC2:**
   ```bash
   ssh -i your-key.pem ec2-user@your-ec2-ip
   ```

2. **Upload files:**
   ```bash
   # From local machine:
   scp -i your-key.pem -r * ec2-user@your-ec2-ip:~/procalyx-site/
   ```

3. **Start Python server:**
   ```bash
   cd ~/procalyx-site
   python3 -m http.server 8000
   # OR for Python 2:
   python -m SimpleHTTPServer 8000
   ```

4. **Configure Security Group:**
   - Add inbound rule: Custom TCP (port 8000) from your IP

5. **Access:** `http://your-ec2-ip:8000`

### Option 3: Using Node.js http-server

1. **Install Node.js on EC2:**
   ```bash
   curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
   sudo yum install -y nodejs
   ```

2. **Install http-server globally:**
   ```bash
   sudo npm install -g http-server
   ```

3. **Upload files and start server:**
   ```bash
   cd ~/procalyx-site
   http-server -p 80 -a 0.0.0.0
   ```

### Setting up HTTPS (Optional but Recommended)

1. **Install Certbot:**
   ```bash
   sudo yum install certbot python3-certbot-nginx -y
   ```

2. **Get SSL certificate:**
   ```bash
   sudo certbot --nginx -d your-domain.com -d www.your-domain.com
   ```

3. **Auto-renewal (already configured):**
   ```bash
   sudo certbot renew --dry-run
   ```

### Quick Deployment Script

A deployment script is included (`deploy.sh`). To use it:

1. Make it executable: `chmod +x deploy.sh`
2. Edit the script with your EC2 details
3. Run: `./deploy.sh`

## License

© 2025 PROCALYX. All rights reserved.

