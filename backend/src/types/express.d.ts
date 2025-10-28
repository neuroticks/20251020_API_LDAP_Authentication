import type { Logger } from 'pino';

declare global {
    namespace Express {
        // Payload que você já usa no JWT/middleware
        interface UserPayload {
            email: string;
            roles: string[];
        }

        interface Request {
            // 🔹 já existia no seu projeto (mantido)
            user?: UserPayload;

            // 🔹 adicionados para o contexto por requisição
            requestId?: string;
            logger?: Logger;
        }

        interface Response {
            // 🔹 logger contextualizado disponível no response também
            logger?: Logger;
        }
    }
}

export { };
