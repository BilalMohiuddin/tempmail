# ⚡ Quick Setup Checklist

## 🎯 Choose Your Deployment Method

### Option A: VPS (Recommended - $5-10/month)
1. **Get a VPS** from DigitalOcean/Linode/Vultr
2. **Upload files**: `scp -r . root@YOUR_IP:/var/www/temp-mail/`
3. **Run deployment**: `./deploy.sh`
4. **Setup domain**: Point DNS to your server IP
5. **Get SSL**: `sudo certbot --nginx -d yourdomain.com`

### Option B: Docker (Easy containerized deployment)
1. **Install Docker**: `curl -fsSL https://get.docker.com | sh`
2. **Update configs**: Edit domain names in files
3. **Deploy**: `docker-compose up -d`
4. **Setup SSL**: Run certbot container

### Option C: Cloud Platforms (Free/Paid)
- **Railway**: Connect GitHub repo, auto-deploy
- **Render**: Connect GitHub repo, auto-deploy
- **Heroku**: `git push heroku main`

## 🔧 Required Configuration Changes

### 1. Update Domain Names
Replace `yourdomain.com` with your actual domain in:
- `ecosystem.config.js`
- `nginx.conf`
- `docker-compose.yml` (if using Docker)

### 2. DNS Records to Add
```
A     @     YOUR_SERVER_IP
A     www   YOUR_SERVER_IP
A     mail  YOUR_SERVER_IP
MX    @     mail.yourdomain.com (priority 10)
TXT   @     v=spf1 mx a ip4:YOUR_SERVER_IP ~all
TXT   _dmarc v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com
```

### 3. Environment Variables
```env
NODE_ENV=production
PORT=5000
SMTP_PORT=2525
DOMAIN=yourdomain.com
```

## 🚀 Deployment Steps

### VPS Deployment (5 minutes)
```bash
# 1. Upload files
scp -r . root@YOUR_SERVER_IP:/var/www/temp-mail/

# 2. SSH and deploy
ssh root@YOUR_SERVER_IP
cd /var/www/temp-mail
./deploy.sh

# 3. Setup SSL
sudo certbot --nginx -d yourdomain.com
```

### Docker Deployment (3 minutes)
```bash
# 1. Update domain in configs
# 2. Deploy
docker-compose up -d

# 3. Setup SSL
docker-compose run --rm certbot certonly --webroot --webroot-path=/var/www/html --email your-email@example.com --agree-tos --no-eff-email -d yourdomain.com
```

## ✅ Verification Checklist

- [ ] Website loads at `https://yourdomain.com`
- [ ] Email address generation works
- [ ] SMTP server accepts connections on port 2525
- [ ] SSL certificate is valid
- [ ] Real-time email updates work
- [ ] Mobile responsive design works

## 🔍 Quick Test

1. **Generate email address** on your website
2. **Send test email** to the generated address
3. **Check real-time delivery** in the web interface
4. **Test mobile view** on your phone

## 📞 Need Help?

- Check logs: `pm2 logs temp-mail-service`
- Verify DNS: `nslookup yourdomain.com`
- Test SMTP: `telnet yourdomain.com 2525`
- Check SSL: `curl -I https://yourdomain.com`

Your Temp Mail Service will be live in minutes! 🎉 