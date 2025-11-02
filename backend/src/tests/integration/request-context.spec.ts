// src/tests/integration/request-context.spec.ts
import request from 'supertest';
import { describe, it, expect } from 'vitest';
import { createTestServer } from '../setup/test-server';

describe("Middleware de contexto por requisição (integração)", () => {
    const app = createTestServer();

    it("deve gerar um traceId e incluí-lo no header da resposta", async () => {
        const res = await request(app).get("/health");

        // ✅ rota agora existe, e devolve status 200
        expect(res.status).toBe(200);

        // ✅ traceId tem 32 caracteres hexadecimais (não 36)
        expect(res.headers["x-request-id"]).toMatch(/^[0-9a-fA-F]{32}$/);
    });
});

