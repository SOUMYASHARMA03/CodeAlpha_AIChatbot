require('dotenv').config();
const app = require('./app');
const { connectDB, disconnectDB } = require('./config/db');

const PORT = process.env.PORT || 5000;

async function startServer() {
  // Attempt Cloud Database connection
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log('\x1b[36m%s\x1b[0m', '==================================================');
    console.log('\x1b[36m%s\x1b[0m', '🛡️  CloudGuard — Data Redundancy Removal System');
    console.log('\x1b[36m%s\x1b[0m', '    CodeAlpha Cloud Computing Task 1 Backend API');
    console.log('\x1b[36m%s\x1b[0m', `    Server running on: http://localhost:${PORT}`);
    console.log('\x1b[36m%s\x1b[0m', `    Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('\x1b[36m%s\x1b[0m', '==================================================');
  });

  // Graceful termination handling
  const shutdown = async (signal) => {
    console.log(`\n[CloudGuard] Received ${signal}. Shutting down gracefully...`);
    server.close(async () => {
      await disconnectDB();
      console.log('[CloudGuard] Cloud database disconnected. Server exited cleanly.');
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

startServer();
