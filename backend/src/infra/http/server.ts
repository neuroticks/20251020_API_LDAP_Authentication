import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { routes } from './routes';
import { env } from '@/infra/config/env';
import { logger } from '@/infra/log/logger';
import { messages } from '@/core/messages/messages';
import { Container } from '@/infra/di/container';
import { errorHandler } from './middlewares/error-handler';

export function createServer(): Application {
    // Inicializa dependências (IoC)
    Container.registerDependencies();

    const app = express();

    // Middlewares globais
    app.use(express.json());
    app.use(helmet());
    app.use(cors());

    // Rotas da aplicação
    app.use(routes);

    // Healthcheck padrão
    app.get('/healthz', (_, res) => {
        res.status(200).json({ status: 'ok', env: env.NODE_ENV });
    });

    // Middleware global de tratamento de erros
    app.use(errorHandler);

    return app;
}

// Inicialização do servidor (somente fora de testes)
if (env.NODE_ENV !== 'TEST') {
    const app = createServer();
    const port = env.PORT || 3000;

    app
        .listen(port, () => {
            logger.info({ context: 'Server', port, env: env.NODE_ENV }, messages.server.start);
        })
        .on('error', (error) => {
            logger.error({ context: 'Server', error: error.message }, messages.server.error);
        });
}
