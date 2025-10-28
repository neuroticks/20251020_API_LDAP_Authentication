import rateLimit from 'express-rate-limit';
import { logger } from '@/infra/log/logger';
import { messages } from '@/core/messages/messages';

const DEFAULT_WINDOW_MIN = 15;
const DEFAULT_MAX_ATTEMPTS = 5;

export const authRateLimiter = rateLimit({
    windowMs: (Number(process.env.RATE_LIMIT_WINDOW_MIN) || DEFAULT_WINDOW_MIN) * 60 * 1000,
    max: Number(process.env.RATE_LIMIT_MAX_ATTEMPTS) || DEFAULT_MAX_ATTEMPTS,
    standardHeaders: true,   // RateLimit-* headers
    legacyHeaders: false,    // X-RateLimit-* desativado
    handler: (req, res /*, next */) => {
        const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
        logger.warn({ context: 'rate-limit', ip, path: req.originalUrl }, 'Muitas tentativas de requisição.');

        const generic =
            messages.auth.tooManyAttempts ||
            'Muitas tentativas. Tente novamente mais tarde.';

        return res.status(429).json({ message: generic });
    },
    keyGenerator: (req /*, res*/) => {
        // Pode customizar por IP + email, se preferir (cuidado com privacidade)
        return req.ip || 'unknown';
    },
});
