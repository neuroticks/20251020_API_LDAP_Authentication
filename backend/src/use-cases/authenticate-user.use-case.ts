import { ILdapAuthProvider } from '@/core/ports/ldap-auth-provider';
import { JwtService } from '@/infra/jwt/jwt-service';
import { UserPayload } from '@/core/domain/types/user-payload';
import { logger } from '@/infra/log/logger';
import { messages } from '@/core/messages/messages';
import { AppError } from '@/core/errors/app-error';

interface AuthResponse extends UserPayload {
  token: string;
}

export class AuthenticateUserUseCase {
  constructor(private ldapProvider: ILdapAuthProvider) { }

  async execute(email: string, password: string): Promise<AuthResponse> {
    logger.debug({ context: 'AuthenticateUserUseCase', email }, messages.auth.start);

    let user;
    try {
      user = await this.ldapProvider.authenticate(email, password);
    } catch (err: any) {
      if (err.message === 'LDAP_CONNECTION_ERROR') {
        throw new AppError(messages.auth.ldapError, 503); // Serviço temporariamente indisponível
      }
      throw new AppError(messages.auth.invalidCredentials, 401);
    }

    const payload: UserPayload = { email: user.email, roles: user.roles };
    const token = JwtService.sign(payload);

    logger.info({ context: 'AuthenticateUserUseCase', email, roles: user.roles }, messages.jwt.created);

    return { token, ...payload };
  }
}
