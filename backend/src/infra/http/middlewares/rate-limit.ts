import rateLimit from 'express-rate-limit';

export const authRateLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutos
    max: 3,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        message: 'Muitas tentativas de login. Tente novamente em alguns minutos.',
    },
});
