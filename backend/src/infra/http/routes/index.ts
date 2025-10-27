import { Router } from 'express';
import { authRoutes } from './auth.routes';
import { logger } from '@/infra/log/logger';
import { messages } from '@/core/messages/messages';

const routes = Router();

routes.use('/auth', authRoutes);

// Loga sempre que rotas forem inicializadas (útil no startup)
logger.debug({ context: 'Routes' }, messages.server.listening);

export { routes };
