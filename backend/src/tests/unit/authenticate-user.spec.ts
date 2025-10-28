import { describe, it, expect, vi } from 'vitest';
import { AuthenticateUserUseCase } from '@/use-cases/authenticate-user.use-case';
import { FakeLdapProvider } from '@/infra/ldap/fake-ldap-provider';
import { JwtService } from '@/infra/jwt/jwt-service';
import { fakeUsers } from '../fakes/fake-users';
import { AppError } from '@/core/errors/app-error';
import { messages } from '@/core/messages/messages';
import { AuthRequestDTO } from '@/core/domain/types/auth-request-dto';

describe('AuthenticateUserUseCase', () => {
  const jwt = new JwtService();

  it('deve autenticar CHEFE e gerar JWT com roles corretas', async () => {
    const ldap = new FakeLdapProvider();
    const useCase = new AuthenticateUserUseCase(ldap, jwt);

    const payload: AuthRequestDTO = {
      email: fakeUsers.chefe.email,
      password: fakeUsers.chefe.password,
    };

    const result = await useCase.execute(payload);
    const decoded = jwt.verify(result.token);

    expect(decoded.roles).toEqual(fakeUsers.chefe.roles);
  });

  it('deve lançar erro 401 para usuário ou senha incorretos', async () => {
    const ldap = new FakeLdapProvider();
    const useCase = new AuthenticateUserUseCase(ldap, jwt);

    await expect(
      useCase.execute({ email: fakeUsers.chefe.email, password: 'senhaErrada' })
    ).rejects.toEqual(new AppError(messages.auth.invalidCredentials, 401));
  });

  it('deve lançar erro 503 quando o servidor LDAP estiver inacessível', async () => {
    const ldap = new FakeLdapProvider();
    vi.spyOn(ldap, 'authenticate').mockRejectedValueOnce(
      new Error('Falha de conexão simulada com LDAP')
    );

    const useCase = new AuthenticateUserUseCase(ldap, jwt);

    await expect(
      useCase.execute({ email: fakeUsers.chefe.email, password: fakeUsers.chefe.password })
    ).rejects.toEqual(new AppError(messages.auth.ldapError, 503));
  });
});
