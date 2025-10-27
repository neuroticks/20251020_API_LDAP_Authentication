import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createServer } from '@/infra/http/server';
import { fakeUsers } from '../fakes/fake-users';
import { Container } from '@/infra/di/container';

describe('Fluxo de autenticação (integração)', () => {
    let app: ReturnType<typeof createServer>;
    beforeAll(() => {
        process.env.NODE_ENV = 'TEST';
        Container.registerDependencies();
        app = createServer();
    });

    it('deve autenticar e retornar token válido com roles do RH', async () => {
        const res = await request(app)
            .post('/auth/login')
            .send({ email: fakeUsers.rh.email, password: fakeUsers.rh.password });

        expect(res.status).toBe(200);

        const decoded = jwt.verify(res.body.token, process.env.JWT_SECRET || 'secret') as any;
        expect(decoded.roles).toEqual(fakeUsers.rh.roles);
    });

    it('deve falhar com senha incorreta', async () => {
        const res = await request(app)
            .post('/auth/login')
            .send({ email: fakeUsers.rh.email, password: 'errada' });

        expect(res.status).toBe(400);
        expect(res.body.message).toContain('Usuário ou senha incorretos');
    });
});