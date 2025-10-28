// src/tests/unit/authenticate-user.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthenticateUserUseCase } from '@/use-cases/authenticate-user.use-case';
import { AppError } from '@/core/errors/app-error';
import { messages } from '@/core/messages/messages';
import type { ILdapAuthProvider } from '@/core/ports/ldap-auth-provider';
import { JwtService } from '@/infra/jwt/jwt-service';
import { fakeUsers } from '../fakes/fake-users';

describe('AuthenticateUserUseCase (unit)', () => {
  let ldap: ILdapAuthProvider;
  let jwt: JwtService;
  let useCase: AuthenticateUserUseCase;

  beforeEach(() => {
    // cria stubs estritamente com os métodos que o use case usa
    ldap = {
      authenticate: vi.fn(), // (email: string, password: string) => Promise<{ email: string; roles: string[] } | undefined>
    } as unknown as ILdapAuthProvider;

    jwt = new JwtService(); // podemos usar real ou mockar .sign quando necessário
    useCase = new AuthenticateUserUseCase(ldap, jwt);
  });

  it('deve autenticar e gerar token contendo email e roles', async () => {
    // arrange
    const user = { email: fakeUsers.chefe.email, roles: fakeUsers.chefe.roles };
    vi.spyOn(ldap, 'authenticate').mockResolvedValueOnce(user);

    // opcional: usar JwtService real e verificar com .verify
    const res = await useCase.execute({
      email: fakeUsers.chefe.email,
      password: fakeUsers.chefe.password,
    });

    expect(res.token).toBeDefined();
    expect(res.roles).toEqual(fakeUsers.chefe.roles);

    // valida o payload do token
    const decoded = jwt.verify<any>(res.token);
    expect(decoded.email).toBe(fakeUsers.chefe.email);
    expect(decoded.roles).toEqual(fakeUsers.chefe.roles);

    // garante chamada correta ao provider
    expect(ldap.authenticate).toHaveBeenCalledWith(
      fakeUsers.chefe.email,
      fakeUsers.chefe.password,
    );
  });

  it('deve lançar AppError 401 quando authenticate() retornar falsy', async () => {
    // Força o caminho do if (!user)
    vi.spyOn(ldap, 'authenticate').mockResolvedValueOnce(undefined as any);

    await expect(
      useCase.execute({
        email: fakeUsers.funcionario.email,
        password: 'senhaErrada',
      }),
    ).rejects.toEqual(new AppError(messages.auth.invalidCredentials, 401));
  });

  it('deve lançar AppError 503 quando ocorrer erro de conexão LDAP', async () => {
    // Mensagem contém "conexão" para cair no branch 503 do catch
    vi.spyOn(ldap, 'authenticate').mockRejectedValueOnce(
      new Error('Falha de conexão com LDAP'),
    );

    await expect(
      useCase.execute({
        email: fakeUsers.rh.email,
        password: fakeUsers.rh.password,
      }),
    ).rejects.toEqual(new AppError(messages.auth.ldapError, 503));
  });

  it('deve mapear qualquer outro erro para AppError 401 (credenciais inválidas)', async () => {
    vi.spyOn(ldap, 'authenticate').mockRejectedValueOnce(
      new Error('QUALQUER_OUTRO_ERRO'),
    );

    await expect(
      useCase.execute({
        email: fakeUsers.funcionario.email,
        password: fakeUsers.funcionario.password,
      }),
    ).rejects.toEqual(new AppError(messages.auth.invalidCredentials, 401));
  });

  it('pode mockar JwtService.sign quando quisermos assertar o argumento exato', async () => {
    const user = { email: fakeUsers.funcionario.email, roles: fakeUsers.funcionario.roles };
    vi.spyOn(ldap, 'authenticate').mockResolvedValueOnce(user);

    const signSpy = vi.spyOn(jwt, 'sign').mockReturnValueOnce('fake-jwt-token');

    const res = await useCase.execute({
      email: user.email,
      password: fakeUsers.funcionario.password,
    });

    expect(signSpy).toHaveBeenCalledWith({
      email: user.email,
      roles: user.roles,
    });
    expect(res.token).toBe('fake-jwt-token');
    expect(res.roles).toEqual(user.roles);
  });
});
