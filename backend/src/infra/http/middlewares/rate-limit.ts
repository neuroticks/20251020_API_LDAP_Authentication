import rateLimitModule, { ipKeyGenerator, type Options } from "express-rate-limit";
import type { Request, Response, NextFunction } from "express";
import { logger } from "@/infra/log";
import { messages } from "@/core/messages/messages";

// Força compatibilidade ESM/CJS
const rateLimit = (rateLimitModule as any).default ?? rateLimitModule;

/** IP seguro (Express 5: req.ip pode ser undefined). */
function safeIp(req: Request): string {
    return req.ip ?? req.socket?.remoteAddress ?? "unknown";
}

/**
 * Middleware global de limitação de requisições.
 */
export const authRateLimiter = rateLimit({
    windowMs: 60 * 1000,           // 1 minuto
    limit: 10,                     // até 10 requisições por IP
    standardHeaders: true,
    legacyHeaders: false,
    message: messages.auth.tooManyAttempts,

    keyGenerator: (req: Request) => ipKeyGenerator(safeIp(req)),

    handler: (req: Request, res: Response, _next: NextFunction, options: Options) => {
        const ip = ipKeyGenerator(safeIp(req));
        const path = req.originalUrl;
        const janelaSegundos = Math.ceil(options.windowMs / 1000);
        const limitePorJanela = typeof options.limit === "number" ? options.limit : 0;

        logger.warn(messages.auth.tooManyAttempts, {
            ip,
            rota: path,
            janelaSegundos,
            limitePorJanela,
        });

        res.status(options.statusCode ?? 429).json(options.message);
    },
});
