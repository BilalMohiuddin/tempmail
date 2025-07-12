#!/bin/bash

# Temp Mail Service Deployment Script
# Run this script on your VPS/cloud server

set -e

echo "🚀 Starting Temp Mail Service Deployment..."

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js and npm
echo "📦 Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
echo "📦 Installing PM2..."
sudo npm install -g pm2

# Install Nginx
echo "📦 Installing Nginx..."
sudo apt install -y nginx

# Install Certbot for SSL
echo "📦 Installing Certbot..."
sudo apt install -y certbot python3-certbot-nginx

# Create application directory
echo "📁 Creating application directory..."
sudo mkdir -p /var/www/temp-mail
sudo chown $USER:$USER /var/www/temp-mail

# Copy application files (you'll need to upload your files)
echo "📁 Please upload your application files to /var/www/temp-mail"

# Install dependencies
echo "📦 Installing dependencies..."
cd /var/www/temp-mail
npm install
cd client && npm install && npm run build && cd ..

# Configure Nginx
echo "🔧 Configuring Nginx..."
sudo cp nginx.conf /etc/nginx/sites-available/temp-mail
sudo ln -sf /etc/nginx/sites-available/temp-mail /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

# Configure firewall
echo "🔥 Configuring firewall..."
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 2525
sudo ufw --force enable

# Start application with PM2
echo "🚀 Starting application..."
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup

# Setup SSL certificate
echo "🔒 Setting up SSL certificate..."
echo "Please run: sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com"

# Setup DNS records
echo "🌐 DNS Configuration Required:"
echo "Add these DNS records to your domain:"
echo "A     @     YOUR_SERVER_IP"
echo "A     www   YOUR_SERVER_IP"
echo "MX    @     yourdomain.com (priority 10)"

# Setup mail server DNS records
echo "📧 Mail Server DNS Records:"
echo "Add these records for proper mail delivery:"
echo "A     mail  YOUR_SERVER_IP"
echo "MX    @     mail.yourdomain.com (priority 10)"
echo "TXT   @     v=spf1 mx a ip4:YOUR_SERVER_IP ~all"
echo "TXT   _dmarc v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com"

echo "✅ Deployment completed!"
echo "🌐 Your Temp Mail Service should be available at: https://yourdomain.com"
echo "📧 SMTP server available at: yourdomain.com:2525" 