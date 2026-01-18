module.exports = {
  apps: [
    {
      name: 'lovezs-backend',
      script: './dist/server.js',
      instances: 1,
      exec_mode: 'cluster',
      watch: false,
      env: {
        NODE_ENV: 'production',
      }
    }
  ]
};

