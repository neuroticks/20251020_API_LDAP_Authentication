// src/tests/setup/test-server.ts
import express from 'express';
import { AuthController } from '@/infra/http/controllers/auth.controller';
import { requestContext } from './../../infra/http/middlewares/request-context';

export function createTestServer() {
    const app = express();

    // Inclui middlewares globais que também são usados em produção.
    // Importante para que os testes reflitam o comportamento real da aplicação.
    app.use(express.json());
    app.use(requestContext);

    const controller = new AuthController();
    app.post('/auth/login', (req, res) => controller.login(req, res));

    // Healthcheck opcional
    app.get('/health', (_, res) => res.status(200).json({ status: 'ok' }));

    return app;
}
