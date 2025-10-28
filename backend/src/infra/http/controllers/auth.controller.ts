import { Request, Response } from 'express';
import { AuthenticateUserUseCase } from '@/use-cases/authenticate-user.use-case';
import { AppError } from '@/core/errors/app-error';
import { logger } from '@/infra/log/logger';
import { messages } from '@/core/messages/messages';
import { AuthSchema } from '@/core/domain/validation/auth.schema';
import { AuthResponseDTO } from '@/core/domain/types/auth-response.dto';
import { AuthRequestDTO } from '@/core/domain/types/auth-request-dto';


/**
 * Controller responsável pelo fluxo de autenticação de usuários.
 * Agora utiliza Zod para validação de entrada tipada e segura.
 */
export class AuthController {
  private useCase: AuthenticateUserUseCase;

  constructor(useCase?: AuthenticateUserUseCase) {
    // Se não for passado (em testes ou mocks), resolve pelo container
    this.useCase = useCase ?? new AuthenticateUserUseCase();
  }

  async login(req: Request, res: Response): Promise<Response> {
    // ✅ Validação e parsing com Zod
    const parsed = AuthSchema.safeParse(req.body);

    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? messages.auth.invalidCredentials;

      logger.warn({ context: 'AuthController', errors: parsed.error.issues }, message);

      return res.status(400).json({ message });
    }

    const { email, password } = parsed.data as AuthRequestDTO;

    try {
      const result = await this.useCase.execute({ email, password });

      logger.info({ context: 'AuthController', email }, messages.auth.start);

      const response: AuthResponseDTO = {
        token: result.token,
        roles: (result as any).roles ?? [],
        message: messages.auth.success,
      };

      logger.info(`[AuthController] Autenticação bem-sucedida para ${email}`);

      return res.status(200).json(response);

    } catch (error: any) {
      const status = error instanceof AppError ? error.statusCode : 500;
      const message = error.message || messages.server.error;

      //logger.error(`[AuthController] ${message}`, { email, status });
      return res.status(status).json({ message });
    }
  }
}
