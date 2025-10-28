import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { authRoutes } from './routes/auth.routes';
import { errorHandler } from './middlewares/error-handler';
import { Container } from '@/infra/di/container';
import { logger } from '@/infra/log/logger';

export function createServer(): Application {
    // ✅ Inicializa o IoC container
    Container.init();

    const app = express();

    app.use(helmet());
    app.use(cors());
    app.use(express.json());

    // ✅ Rate limit global básico
    app.use(
        rateLimit({
            windowMs: 60 * 1000,
            max: 30,
            standardHeaders: true,
            legacyHeaders: false,
        })
    );

    // ✅ Rotas
    app.use('/auth', authRoutes);

    // ✅ Middleware global de erros
    app.use(errorHandler);

    // ✅ Healthcheck
    app.get('/health', (_, res) => res.status(200).json({ status: 'ok' }));

    // ✅ Log de inicialização
    logger.info('Servidor Express inicializado com sucesso.');

    return app;
}
