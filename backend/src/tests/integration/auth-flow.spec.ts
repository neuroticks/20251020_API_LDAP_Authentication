// src/tests/integration/auth-flow.spec.ts
import request from 'supertest';
import { JwtService } from '@/infra/jwt/jwt-service';
import { describe, it, expect, vi } from 'vitest';
import { createServer } from '@/infra/http/server';
import { fakeUsers } from '../fakes/fake-users';
import { Container } from '@/infra/di/container';
import { FakeLdapProvider } from '@/infra/ldap/fake-ldap-provider';
import { messages } from '@/core/messages/messages';

const app = createServer();

describe('Fluxo de autenticação (integração)', () => {
    it('deve autenticar e retornar token válido com roles do RH', async () => {
        const res = await request(app)
            .post('/auth/login')
            .send({ email: fakeUsers.rh.email, password: fakeUsers.rh.password });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty('token');

        const jwt = new JwtService();

        const decoded = jwt.verify(
            res.body.token
        ) as any;

        expect(decoded.roles).toEqual(fakeUsers.rh.roles);
    });

    it('deve falhar com usuário ou senha incorretos', async () => {
        const res = await request(app)
            .post('/auth/login')
            .send({ email: fakeUsers.rh.email, password: 'senhaErrada' });

        expect(res.status).toBe(401);
        expect(res.body.message).toContain(messages.auth.invalidCredentials);
    });

    it('deve retornar erro 503 quando o LDAP estiver fora do ar', async () => {
        // Espiona o FakeLdapProvider para simular falha de conexão
        const ldap = Container.resolve('ILdapAuthProvider') as FakeLdapProvider;
        vi.spyOn(ldap, 'authenticate').mockRejectedValueOnce(
            new Error('Falha de conexão simulada com LDAP')
        );

        const res = await request(app)
            .post('/auth/login')
            .send({ email: fakeUsers.rh.email, password: fakeUsers.rh.password });

        expect(res.status).toBe(503);
        expect(res.body.message).toContain(messages.auth.ldapError);
    });
});
