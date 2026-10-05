import { createApp } from './app.js';
import { isAiEnabled } from './ai/index.js';
import { connectDatabase, disconnectDatabase } from './config/db.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';

async function bootstrap() {
  const { ephemeral } = await connectDatabase();

  const app = createApp();
  const server = app.listen(env.PORT, () => {
    logger.info(`RESQ API listening on http://localhost:${env.PORT}`);
    logger.info(`Environment: ${env.NODE_ENV} | CORS origin: ${env.FRONTEND_URL}`);
    logger.info(`AI assessment layer: ${isAiEnabled() ? `enabled (${env.AI_MODEL})` : 'disabled — deterministic engine only'}`);
    if (ephemeral) {
      logger.warn('Using the bundled local MongoDB (server/.local-db). Run `npm run seed` for demo data.');
    }
  });

  const shutdown = async (signal: string) => {
    logger.info(`${signal} received — shutting down.`);
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
    // Don't hang forever if a connection refuses to close.
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('unhandledRejection', (reason) => logger.error('Unhandled rejection:', reason));
}

bootstrap().catch((err) => {
  logger.error('Failed to start RESQ API:', err);
  process.exit(1);
});
