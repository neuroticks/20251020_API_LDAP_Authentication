// src/tests/integration/auth-controller.spec.ts
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createTestServer } from '../setup/test-server';
import { fakeUsers } from '../fakes/fake-users';
import { messages } from '@/core/messages/messages';

describe('AuthController (integração direta)', () => {
  const app = createTestServer();

  it('deve autenticar e retornar 200 com token e roles', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({
        email: fakeUsers.chefe.email,
        password: fakeUsers.chefe.password,
      });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.roles).toEqual(fakeUsers.chefe.roles);
    expect(res.body.message).toBe(messages.auth.success);
  });

  it('deve retornar 400 quando o email estiver faltando', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: '', password: '123' });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe(messages.auth.missingEmail);
  });

  it('deve retornar 400 quando a senha estiver faltando', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'user@dominio.com', password: '' });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe(messages.auth.missingPassword);
  });

  it('deve retornar 401 quando as credenciais forem inválidas', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({
        email: 'user@dominio.com',
        password: 'senhaErrada',
      });

    expect(res.status).toBe(401);
    expect(res.body.message).toContain(messages.auth.invalidCredentials);
  });
});
