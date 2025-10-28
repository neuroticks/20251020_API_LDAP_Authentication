import { Request, Response } from 'express';
import { AuthenticateUserUseCase } from '@/use-cases/authenticate-user.use-case';
import { Container } from '@/infra/di/container';
import { logger } from '@/infra/log/logger';
import { messages } from '@/core/messages/messages';
import { AppError } from '@/core/errors/app-error';
import { AuthResponseDTO } from '@/core/domain/types/auth-response.dto';
import { AuthSchema } from '@/core/domain/validation/auth.schema';

/**
 * Controller responsável pelo fluxo de autenticação de usuários.
 * Agora utiliza Zod para validação de entrada tipada e segura.
 */
export class AuthController {
  async login(req: Request, res: Response): Promise<Response> {
    // ✅ Validação e parsing com Zod
    const parsed = AuthSchema.safeParse(req.body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message ?? messages.auth.invalidCredentials;
      logger.warn({ context: 'AuthController', errors: parsed.error.issues }, firstError);
      throw new AppError(firstError, 400);
    }

    const { email, password } = parsed.data;

    const ldapProvider = Container.resolve('ILdapAuthProvider');
    const useCase = new AuthenticateUserUseCase(ldapProvider);

    logger.info({ context: 'AuthController', email }, messages.auth.start);

    const { token, roles, email: userEmail } = await useCase.execute(email, password);

    logger.info(
      { context: 'AuthController', email: userEmail, roles },
      messages.auth.success
    );

    const response: AuthResponseDTO = {
      token,
      roles,
      message: messages.auth.success,
    };

    return res.status(200).json(response);
  }
}
