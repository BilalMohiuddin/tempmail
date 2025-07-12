# 🚀 Temp Mail Service Deployment Guide

This guide covers multiple deployment options for your Temp Mail Service.

## 📋 Prerequisites

- A domain name (e.g., `tempmail.com`)
- A VPS/cloud server (Ubuntu 20.04+ recommended)
- Basic knowledge of Linux commands

## 🌐 Option 1: VPS Deployment (Recommended)

### Step 1: Server Setup

1. **Get a VPS** from providers like:
   - DigitalOcean ($5-10/month)
   - Linode ($5-10/month)
   - Vultr ($5-10/month)
   - AWS EC2 (t3.micro - free tier eligible)

2. **Connect to your server**:
   ```bash
   ssh root@your-server-ip
   ```

3. **Run the deployment script**:
   ```bash
   # Upload your project files to the server
   scp -r . root@your-server-ip:/var/www/temp-mail/
   
   # SSH into server and run deployment
   ssh root@your-server-ip
   cd /var/www/temp-mail
   chmod +x deploy.sh
   ./deploy.sh
   ```

### Step 2: Domain Configuration

1. **Point your domain to your server**:
   - Add A record: `@` → `YOUR_SERVER_IP`
   - Add A record: `www` → `YOUR_SERVER_IP`

2. **Setup SSL certificate**:
   ```bash
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
   ```

3. **Configure mail DNS records**:
   ```
   A     mail  YOUR_SERVER_IP
   MX    @     mail.yourdomain.com (priority 10)
   TXT   @     v=spf1 mx a ip4:YOUR_SERVER_IP ~all
   TXT   _dmarc v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com
   ```

## 🐳 Option 2: Docker Deployment

### Step 1: Install Docker

```bash
# Install Docker and Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
sudo systemctl enable docker
sudo systemctl start docker
```

### Step 2: Deploy with Docker Compose

1. **Update configuration**:
   - Edit `docker-compose.yml` with your domain
   - Edit `nginx.conf` with your domain

2. **Deploy**:
   ```bash
   docker-compose up -d
   ```

3. **Setup SSL**:
   ```bash
   docker-compose run --rm certbot certonly --webroot --webroot-path=/var/www/html --email your-email@example.com --agree-tos --no-eff-email -d yourdomain.com
   ```

## ☁️ Option 3: Cloud Platform Deployment

### Heroku

1. **Install Heroku CLI**
2. **Create Heroku app**:
   ```bash
   heroku create your-temp-mail-app
   ```

3. **Deploy**:
   ```bash
   git push heroku main
   ```

4. **Add custom domain**:
   ```bash
   heroku domains:add yourdomain.com
   ```

### Railway

1. **Connect your GitHub repo**
2. **Set environment variables**:
   - `NODE_ENV=production`
   - `PORT=5000`

3. **Deploy automatically**

### Render

1. **Connect your GitHub repo**
2. **Configure build settings**:
   - Build Command: `npm run build`
   - Start Command: `npm start`

## 🔧 Configuration

### Environment Variables

Create a `.env` file:

```env
NODE_ENV=production
PORT=5000
SMTP_PORT=2525
DOMAIN=yourdomain.com
SSL_KEY_PATH=/etc/letsencrypt/live/yourdomain.com/privkey.pem
SSL_CERT_PATH=/etc/letsencrypt/live/yourdomain.com/fullchain.pem
```

### Update Domain Configuration

1. **Edit `ecosystem.config.js`**:
   ```javascript
   env_production: {
     NODE_ENV: 'production',
     PORT: 5000,
     SMTP_PORT: 2525,
     DOMAIN: 'yourdomain.com', // Change this
     SSL_KEY_PATH: '/etc/letsencrypt/live/yourdomain.com/privkey.pem',
     SSL_CERT_PATH: '/etc/letsencrypt/live/yourdomain.com/fullchain.pem'
   }
   ```

2. **Edit `nginx.conf`**:
   ```nginx
   server_name yourdomain.com www.yourdomain.com; # Change this
   ```

3. **Edit `client/src/contexts/SocketContext.js`**:
   ```javascript
   const newSocket = io(process.env.REACT_APP_SOCKET_URL || 'https://yourdomain.com', {
   ```

## 📧 Mail Server Configuration

### SMTP Settings

Your SMTP server will be available at:
- **Server**: `yourdomain.com`
- **Port**: `2525`
- **Security**: None (or SSL if configured)

### Testing Email Delivery

1. **Send a test email** to your generated address
2. **Check the web interface** for real-time delivery
3. **Verify SMTP logs** in the server console

## 🔒 Security Considerations

### Rate Limiting

The service includes built-in rate limiting:
- 1000 requests per 15 minutes (general)
- 10 address generations per minute
- 50 emails per hour per address

### Firewall Configuration

```bash
# Allow only necessary ports
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw allow 2525  # SMTP
sudo ufw enable
```

### SSL/TLS

- Automatic SSL with Let's Encrypt
- HSTS headers enabled
- Secure cipher configuration

## 📊 Monitoring

### PM2 Monitoring

```bash
# View logs
pm2 logs temp-mail-service

# Monitor resources
pm2 monit

# Restart service
pm2 restart temp-mail-service
```

### Nginx Monitoring

```bash
# Check Nginx status
sudo systemctl status nginx

# View access logs
sudo tail -f /var/log/nginx/access.log

# View error logs
sudo tail -f /var/log/nginx/error.log
```

## 🔄 Updates and Maintenance

### Updating the Application

```bash
# Pull latest changes
git pull origin main

# Install dependencies
npm install
cd client && npm install && npm run build && cd ..

# Restart service
pm2 restart temp-mail-service
```

### SSL Certificate Renewal

```bash
# Test renewal
sudo certbot renew --dry-run

# Set up automatic renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 🆘 Troubleshooting

### Common Issues

1. **Port 2525 blocked**: Check firewall settings
2. **SSL certificate issues**: Verify domain DNS settings
3. **Email not receiving**: Check SMTP server logs
4. **Rate limiting**: Wait and retry, or increase limits

### Log Locations

- **Application logs**: `pm2 logs temp-mail-service`
- **Nginx logs**: `/var/log/nginx/`
- **System logs**: `journalctl -u nginx`

## 📞 Support

If you encounter issues:
1. Check the logs for error messages
2. Verify DNS configuration
3. Test SMTP connectivity
4. Review firewall settings

Your Temp Mail Service should now be live at `https://yourdomain.com`! 🎉 