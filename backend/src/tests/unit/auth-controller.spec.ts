import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthController } from '../../infra/http/controllers/auth.controller';
import { FakeLdapProvider } from '../../infra/ldap/fake-ldap-provider';
import { fakeUsers } from '../fakes/fake-users';

// mocks do Express
const mockRequest = (body = {}) => ({ body } as any);
const mockResponse = () => {
    const res: any = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
};

describe('AuthController', () => {
    let controller: AuthController;

    beforeEach(() => {
        const ldap = new FakeLdapProvider();
        controller = new AuthController(ldap);
    });

    it('deve autenticar o usuário e retornar 200 com o token e roles', async () => {
        const req = mockRequest({
            email: fakeUsers.chefe.email,
            password: fakeUsers.chefe.password,
        });
        const res = mockResponse();

        await controller.login(req, res);

        expect(res.status).toHaveBeenCalledWith(200);
        const jsonResponse = res.json.mock.calls[0][0];

        expect(jsonResponse.token).toBeDefined();
        expect(jsonResponse.roles).toEqual(fakeUsers.chefe.roles);
    });

    it('deve retornar 400 quando o login falhar', async () => {
        const req = mockRequest({
            email: fakeUsers.chefe.email,
            password: 'senhaErrada',
        });
        const res = mockResponse();

        await controller.login(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        const jsonResponse = res.json.mock.calls[0][0];
        expect(jsonResponse.message).toContain('Usuário ou senha incorretos');
    });
});