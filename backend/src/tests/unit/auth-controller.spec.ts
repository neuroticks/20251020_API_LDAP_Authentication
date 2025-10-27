import request from 'supertest';
import express from 'express';
import { describe, it, beforeEach, expect, vi } from 'vitest';
import { AuthController } from '../../infra/http/controllers/auth.controller';
import { asyncHandler } from '../../infra/http/middlewares/async-handler';
import { errorHandler } from '../../infra/http/middlewares/error-handler';
import { authRateLimiter } from '../../infra/http/middlewares/rate-limit';
import { FakeLdapProvider } from '../../infra/ldap/fake-ldap-provider';
import { Container } from '../../infra/di/container';
import { fakeUsers } from '../fakes/fake-users';
import { messages } from '@/core/messages/messages';

// cria app express real, mas só com /login
function createTestApp(controller: AuthController) {
    const app = express();
    app.use(express.json());
    app.post('/login', authRateLimiter, asyncHandler((req, res) => controller.login(req, res)));
    app.use(errorHandler);
    return app;
}

describe('AuthController (via Express real)', () => {
    let app: express.Express;
    let controller: AuthController;
    let ldap: FakeLdapProvider;

    beforeEach(() => {
        ldap = new FakeLdapProvider();
        vi.spyOn(Container, 'resolve').mockReturnValue(ldap);
        controller = new AuthController();
        app = createTestApp(controller);
    });

    it('deve autenticar e retornar 200 com token e roles', async () => {
        const res = await request(app)
            .post('/login')
            .send({ email: fakeUsers.chefe.email, password: fakeUsers.chefe.password });

        expect(res.status).toBe(200);
        expect(res.body.token).toBeDefined();
        expect(res.body.roles).toEqual(fakeUsers.chefe.roles);
    });

    it('deve retornar 401 quando o login falhar por credenciais inválidas', async () => {
        const res = await request(app)
            .post('/login')
            .send({ email: fakeUsers.chefe.email, password: 'senhaErrada' });

        expect(res.status).toBe(401);
        expect(res.body.message).toContain('Usuário ou senha incorretos');
    });

    it('deve retornar 503 quando o LDAP estiver fora do ar', async () => {
        vi.spyOn(ldap, 'authenticate').mockRejectedValueOnce(new Error('LDAP_CONNECTION_ERROR'));

        const res = await request(app)
            .post('/login')
            .send({ email: fakeUsers.chefe.email, password: fakeUsers.chefe.password });

        expect(res.status).toBe(503);
        expect(res.body.message).toContain(messages.auth.ldapError);
    });
});
