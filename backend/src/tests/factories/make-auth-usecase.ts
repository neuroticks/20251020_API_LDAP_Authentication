// src/tests/factories/make-auth-usecase.ts
import { AuthenticateUserUseCase } from '@/use-cases/authenticate-user.use-case';
import { FakeLdapProvider } from '@/infra/ldap/fake-ldap-provider';
import { JwtService } from '@/infra/jwt/jwt-service';

/**
 * Factory para criar instâncias prontas do AuthenticateUserUseCase
 * com dependências injetadas (FakeLdapProvider + JwtService).
 *
 * Pode ser usada em testes unitários e de integração leve.
 */
export function makeAuthUseCase() {
    const ldap = new FakeLdapProvider();
    const jwt = new JwtService();
    const useCase = new AuthenticateUserUseCase(ldap, jwt);

    return { useCase, ldap, jwt };
}
