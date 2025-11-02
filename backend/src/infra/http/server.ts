import "dotenv/config";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import { env } from "@/infra/config/env";
import { routes } from "@/infra/http/routes";
import { errorHandler } from "@/infra/http/middlewares/error-handler";
import { requestContextMiddleware } from "@/infra/http/middlewares/request-context";
import { requestLogger } from "@/infra/http/middlewares/request-logger";
import { authRateLimiter } from "@/infra/http/middlewares/rate-limit";
import { logger } from "@/infra/log";

const app = express();

// ======================================================================
// 🧩 1. Middlewares técnicos básicos
// ======================================================================
app.use(cors());
app.use(helmet());
app.use(express.json());

// ======================================================================
// 🧩 2. Rate limiter (aplicado apenas fora do ambiente de teste)
// ======================================================================
if (process.env.NODE_ENV !== "test") {
    app.use(authRateLimiter);
    logger.info("🛡️ Rate limiter global ativado");
}

// ======================================================================
// 🧩 3. Contexto e log por requisição
// ======================================================================
app.use(requestContextMiddleware);
app.use(requestLogger);

// ======================================================================
// 🧩 4. Rotas principais da aplicação
// ======================================================================
// 🚫 Removido o asyncHandler — `routes` já é um Router
app.use(routes);

// ======================================================================
// 🧩 5. Tratador global de erros (sempre o último middleware)
// ======================================================================
app.use(errorHandler);

// ======================================================================
// 🧩 6. Inicialização do servidor
// ======================================================================
app.listen(env.PORT, () => {
    logger.info(`🚀 Servidor iniciado na PORTA:${env.PORT}`);
});
