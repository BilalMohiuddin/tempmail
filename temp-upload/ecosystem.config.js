module.exports = {
  apps: [{
    name: 'temp-mail-service',
    script: 'server/index.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development',
      PORT: 5000,
      SMTP_PORT: 2525
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000,
      SMTP_PORT: 2525,
      DOMAIN: 'tempiemail.com',
      SSL_KEY_PATH: '/etc/letsencrypt/live/tempiemail.com/privkey.pem',
      SSL_CERT_PATH: '/etc/letsencrypt/live/tempiemail.com/fullchain.pem'
    }
  }]
}; 