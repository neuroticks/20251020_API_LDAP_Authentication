import express, { Express } from "express";
import helmet from "helmet";
import cors from "cors";
import { routes } from "@/infra/http/routes";
import { healthRouter } from "@/infra/http/routes/health-check.route";
import { errorHandler } from "@/infra/http/middlewares/error-handler";
import { requestContextMiddleware } from "@/infra/http/middlewares/request-context";
import { requestLogger } from "@/infra/http/middlewares/request-logger";
import { logger } from "@/infra/log";

/**
 * Cria uma instância isolada do servidor Express
 * configurada para uso em testes (Vitest / Supertest).
 * 
 * Inclui middlewares de contexto e logging,
 * para que o comportamento de log nos testes
 * seja idêntico ao do servidor real.
 */
export function createTestServer(): Express {
    const app = express();

    // ======================================================================
    // 🧩 1. Middlewares técnicos básicos
    // ======================================================================
    app.use(cors());
    app.use(helmet());
    app.use(express.json());

    // ======================================================================
    // 🧩 2. Contexto de requisição e logging global
    // ======================================================================
    app.use(requestContextMiddleware);
    app.use(requestLogger);

    // ======================================================================
    // 🧩 3. Rotas reais (com asyncHandler para capturar erros)
    // ======================================================================
    app.use(healthRouter);
    app.use(routes);

    // ======================================================================
    // 🧩 4. Tratador global de erros
    // ======================================================================
    app.use(errorHandler);

    // ======================================================================
    // 🧩 5. Log de inicialização (para debug nos testes)
    // ======================================================================
    logger.debug("🧪 Servidor de teste inicializado com middlewares de contexto e log.");

    return app;
}
