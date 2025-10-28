// src/tests/setup/test-server.ts
import express from 'express';
import { AuthController } from '@/infra/http/controllers/auth.controller';

export function createTestServer() {
    const app = express();
    app.use(express.json());

    const controller = new AuthController();
    app.post('/auth/login', (req, res) => controller.login(req, res));

    // Healthcheck opcional
    app.get('/health', (_, res) => res.status(200).json({ status: 'ok' }));

    return app;
}
