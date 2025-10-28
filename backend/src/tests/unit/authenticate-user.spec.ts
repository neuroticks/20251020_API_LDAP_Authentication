// src/tests/unit/authenticate-user.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { makeAuthUseCase } from '../factories/make-auth-usecase';
import { AppError } from '@/core/errors/app-error';
import { messages } from '@/core/messages/messages';
import { fakeUsers } from '../fakes/fake-users';

describe('AuthenticateUserUseCase (unit)', () => {
  let ldap: ReturnType<typeof makeAuthUseCase>['ldap'];
  let jwt: ReturnType<typeof makeAuthUseCase>['jwt'];
  let useCase: ReturnType<typeof makeAuthUseCase>['useCase'];

  beforeEach(() => {
    const factory = makeAuthUseCase();
    ldap = factory.ldap;
    jwt = factory.jwt;
    useCase = factory.useCase;
  });

  it('deve autenticar e gerar token contendo email e roles', async () => {
    const res = await useCase.execute({
      email: fakeUsers.chefe.email,
      password: fakeUsers.chefe.password,
    });

    expect(res.token).toBeDefined();
    expect(res.roles).toEqual(fakeUsers.chefe.roles);

    const decoded = jwt.verify<any>(res.token);
    expect(decoded.email).toBe(fakeUsers.chefe.email);
    expect(decoded.roles).toEqual(fakeUsers.chefe.roles);
  });

  it('deve lançar AppError 401 quando authenticate() retornar falsy', async () => {
    vi.spyOn(ldap, 'authenticate').mockResolvedValueOnce(undefined as any);

    await expect(
      useCase.execute({
        email: fakeUsers.funcionario.email,
        password: 'senhaErrada',
      }),
    ).rejects.toEqual(new AppError(messages.auth.invalidCredentials, 401));
  });

  it('deve lançar AppError 503 quando ocorrer erro de conexão LDAP', async () => {
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
    const signSpy = vi.spyOn(jwt, 'sign').mockReturnValueOnce('fake-jwt-token');

    const res = await useCase.execute({
      email: fakeUsers.funcionario.email,
      password: fakeUsers.funcionario.password,
    });

    expect(signSpy).toHaveBeenCalledWith({
      email: fakeUsers.funcionario.email,
      roles: fakeUsers.funcionario.roles,
    });
    expect(res.token).toBe('fake-jwt-token');
  });
});
