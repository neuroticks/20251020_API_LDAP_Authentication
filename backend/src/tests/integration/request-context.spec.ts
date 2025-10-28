// src/tests/integration/request-context.spec.ts
import request from 'supertest';
import { describe, it, expect } from 'vitest';
import { createTestServer } from '../setup/test-server';

describe('Middleware de contexto por requisição (integração)', () => {
    const app = createTestServer();

    it('deve gerar um requestId e incluí-lo no header da resposta', async () => {
        const res = await request(app).get('/health');
        expect(res.status).toBe(200);
        expect(res.headers['x-request-id']).toMatch(/^[0-9a-fA-F-]{36}$/);
    });
});
