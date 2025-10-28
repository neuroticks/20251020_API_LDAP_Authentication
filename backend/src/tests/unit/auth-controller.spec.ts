import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import { AuthController } from '@/infra/http/controllers/auth.controller';
import { AuthenticateUserUseCase } from '@/use-cases/authenticate-user.use-case';
import { messages } from '@/core/messages/messages';
import { AppError } from '@/core/errors/app-error';
import { fakeUsers } from '../fakes/fake-users';
import { AuthResultDTO } from '@/core/domain/types/auth-result-dto';

describe('AuthController (via Express real)', () => {
  let app: express.Express;
  let useCase: AuthenticateUserUseCase;
  let controller: AuthController;

  beforeEach(() => {
    useCase = new AuthenticateUserUseCase();
    controller = new AuthController(useCase);

    app = express();
    app.use(express.json());
    app.post('/login', (req, res) => controller.login(req, res));
  });

  it('deve autenticar e retornar 200 com token e roles', async () => {
    const mockResult: AuthResultDTO = {
      token: 'jwt-token-mock',
      roles: fakeUsers.chefe.roles,
    };

    vi.spyOn(useCase, 'execute').mockResolvedValueOnce(mockResult);

    const res = await request(app)
      .post('/login')
      .send({ email: fakeUsers.chefe.email, password: fakeUsers.chefe.password });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.roles).toEqual(fakeUsers.chefe.roles);
  });

  it('deve retornar 400 quando o email estiver faltando', async () => {
    const res = await request(app).post('/login').send({ email: '', password: '123' });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe(messages.auth.missingEmail);
  });

  it('deve retornar 400 quando a senha estiver faltando', async () => {
    const res = await request(app).post('/login').send({ email: 'user@dominio.com', password: '' });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe(messages.auth.missingPassword);
  });

  it('deve retornar 401 quando as credenciais forem inválidas', async () => {
    vi.spyOn(useCase, 'execute').mockRejectedValueOnce(
      new AppError(messages.auth.invalidCredentials, 401)
    );

    const res = await request(app)
      .post('/login')
      .send({ email: fakeUsers.chefe.email, password: 'senhaErrada' });

    expect(res.status).toBe(401);
    expect(res.body.message).toContain(messages.auth.invalidCredentials);
  });

  it('deve retornar 503 quando o servidor LDAP estiver fora do ar', async () => {
    vi.spyOn(useCase, 'execute').mockRejectedValueOnce(
      new AppError(messages.auth.ldapError, 503)
    );

    const res = await request(app)
      .post('/login')
      .send({ email: fakeUsers.chefe.email, password: fakeUsers.chefe.password });

    expect(res.status).toBe(503);
    expect(res.body.message).toContain(messages.auth.ldapError);
  });
});
