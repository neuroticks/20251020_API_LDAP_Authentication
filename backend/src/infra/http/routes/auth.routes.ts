import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { Container } from '@/infra/di/container';
import { authRateLimiter } from '../middlewares/rate-limit';

const router = Router();

router.post('/login', authRateLimiter, (req, res) => {
    const ldapProvider = Container.resolve('ILdapAuthProvider');
    const controller = new AuthController(ldapProvider);
    controller.login(req, res);
});


export { router as authRoutes };
