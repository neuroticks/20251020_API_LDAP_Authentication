import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { asyncHandler } from '../middlewares/async-handler';
import { authRateLimiter } from '../middlewares/rate-limit';

const router = Router();
const controller = new AuthController();

/**
 * Rota de autenticação de usuários.
 * Inclui limitador de taxa e captura de exceções assíncronas.
 */
router.post(
    '/login',
    authRateLimiter,
    asyncHandler((req, res) => controller.login(req, res))
);

export { router as authRoutes };
