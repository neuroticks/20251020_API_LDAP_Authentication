import { describe, it, expect, beforeEach } from 'vitest';
import jwt from 'jsonwebtoken';
import { AuthenticateUserUseCase } from '../../use-cases/authenticate-user.use-case';
import { FakeLdapProvider } from '../../infra/ldap/fake-ldap-provider';
import { fakeUsers } from '../fakes/fake-users';

let useCase: AuthenticateUserUseCase;

describe('AuthenticateUserUseCase', () => {
    beforeEach(() => {
        const ldap = new FakeLdapProvider();
        useCase = new AuthenticateUserUseCase(ldap);
    });

    it('deve autenticar CHEFE e gerar JWT com roles corretas', async () => {
        const { token, roles } = await useCase.execute(fakeUsers.chefe.email, fakeUsers.chefe.password);
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;

        expect(decoded.roles).toEqual(fakeUsers.chefe.roles);
        expect(roles).toEqual(fakeUsers.chefe.roles);
    });

    it('deve lançar erro para usuário ou senha incorretos', async () => {
        await expect(useCase.execute(fakeUsers.chefe.email, 'senhaErrada'))
            .rejects.toThrow('Usuário ou senha incorretos.');
    });
});