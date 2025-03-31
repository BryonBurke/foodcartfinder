module.exports = {
  apps: [{
    name: 'foodcartfinder',
    script: 'server.js',
    instances: 'max',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 80
    }
  }]
}; 