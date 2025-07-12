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
      PORT: 3000,
      SMTP_PORT: 2525
    }
  }]
}; 