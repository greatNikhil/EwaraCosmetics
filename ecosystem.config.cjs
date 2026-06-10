module.exports = {
  apps: [
    {
      name: "ewara-frontend",
      cwd: ".",
      script: "./node_modules/next/dist/bin/next",
      args: "start -p 3000",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
    },
    {
      name: "ewara-backend",
      cwd: "./backend",
      script: "dist/server.js",
      env: {
        NODE_ENV: "production",
        PORT: 5000,
      },
    },
  ],
};
