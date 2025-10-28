import { ILdapAuthProvider } from '@/core/ports/ldap-auth-provider';
import { JwtService } from '@/infra/jwt/jwt-service';
import { AppError } from '@/core/errors/app-error';
import { messages } from '@/core/messages/messages';
import { Container } from '@/infra/di/container';
import { AuthResultDTO } from '@/core/domain/types/auth-result-dto';
import { AuthRequestDTO } from '@/core/domain/types/auth-request-dto';

export class AuthenticateUserUseCase {
  constructor(
    private ldapAuthProvider: ILdapAuthProvider = Container.resolve('ILdapAuthProvider'),
    private jwtService: JwtService = Container.resolve('JwtService')
  ) { }

  async execute({ email, password }: AuthRequestDTO): Promise<AuthResultDTO> {
    try {
      const user = await this.ldapAuthProvider.authenticate(email, password);

      if (!user) {
        throw new AppError(messages.auth.invalidCredentials, 401);
      }

      const token = this.jwtService.sign({
        email: user.email,
        roles: user.roles,
      });

      return { token, roles: user.roles };
    } catch (error: any) {
      const msg = String(error.message || '').toLowerCase();

      if (msg.includes('ldap') || msg.includes('conexão')) {
        throw new AppError(messages.auth.ldapError, 503);
      }

      throw new AppError(messages.auth.invalidCredentials, 401);
    }
  }
}
