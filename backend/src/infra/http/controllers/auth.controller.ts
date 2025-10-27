import { Request, Response } from 'express';
import { AuthenticateUserUseCase } from '@/use-cases/authenticate-user.use-case';
import { Container } from '@/infra/di/container';
import { logger } from '@/infra/log/logger';
import { messages } from '@/core/messages/messages';
import { AppError } from '@/core/errors/app-error';

export class AuthController {
  async login(req: Request, res: Response): Promise<Response> {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError(messages.auth.invalidCredentials, 400);
    }

    const useCase = new AuthenticateUserUseCase(Container.resolve('ILdapAuthProvider'));

    logger.info({ context: 'AuthController', email }, messages.auth.start);

    const { token, roles, email: userEmail } = await useCase.execute(email, password);

    logger.info({ context: 'AuthController', email: userEmail, roles }, messages.auth.success);

    return res.status(200).json({ token, roles, message: messages.auth.success });
  }
}
