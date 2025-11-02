import type { Request, Response, NextFunction } from "express";
import { logger } from "@/infra/log/logger";

/**
 * Middleware de log de requisições HTTP.
 * Usa o contexto assíncrono (traceId, userId, path, method)
 * e registra automaticamente status, duração e tamanho da resposta.
 */
export function requestLogger(req: Request, res: Response, next: NextFunction) {
    const start = process.hrtime.bigint();

    res.on("finish", () => {
        const end = process.hrtime.bigint();
        const durationMs = Number(end - start) / 1_000_000; // converte nanosegundos em milissegundos
        const contentLength = res.getHeader("content-length");

        const status = res.statusCode;
        const level =
            status >= 500 ? "error" : status >= 400 ? "warn" : "info";

        const message = `${req.method} ${req.originalUrl} ${status} - ${durationMs.toFixed(
            2
        )}ms`;

        // O logger central já injeta traceId, userId, path, method via AsyncLocalStorage
        logger[level](message, {
            status,
            durationMs: parseFloat(durationMs.toFixed(2)),
            contentLength,
        });
    });

    next();
}
