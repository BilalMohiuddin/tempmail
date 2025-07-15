module.exports = {
  apps: [{
    name: 'temp-mail',
    script: 'server.js',
    cwd: '/var/www/temp-mail',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',

    env: {
      NODE_ENV: 'production',
      PORT: 443,
      SMTP_PORT: 25,
      SSL_KEY_PATH: '/etc/letsencrypt/live/tempiemail.com/privkey.pem',
      SSL_CERT_PATH: '/etc/letsencrypt/live/tempiemail.com/fullchain.pem'
    }
  }]
}; 
