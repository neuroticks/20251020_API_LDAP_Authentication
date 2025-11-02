import pino from "pino";
import { requestContext } from "@/infra/http/middlewares/request-context";

export const baseLogger = pino({
    transport:
        process.env.NODE_ENV === "production"
            ? undefined
            : {
                target: "pino-pretty",
                options: { colorize: true, translateTime: "SYS:standard" },
            },
    formatters: {
        level: (label) => ({ level: label.toUpperCase() }),
    },
});

/**
 * Logger global contextualizado.
 * - Injeta automaticamente traceId, userId, path e method do contexto.
 * - Mantém o método `.child()` compatível com o pino original.
 */
export const logger = Object.assign(
    {
        /** Log de informação */
        info(arg1: unknown, arg2?: unknown) {
            const ctx = requestContext.getStore();
            const [obj, msg] =
                typeof arg1 === "string" ? [{}, arg1] : [arg1 ?? {}, arg2 as string];
            baseLogger.info(
                { ...obj, traceId: ctx?.traceId, userId: ctx?.userId, path: ctx?.path, method: ctx?.method },
                msg
            );
        },

        /** Log de aviso */
        warn(arg1: unknown, arg2?: unknown) {
            const ctx = requestContext.getStore();
            const [obj, msg] =
                typeof arg1 === "string" ? [{}, arg1] : [arg1 ?? {}, arg2 as string];
            baseLogger.warn(
                { ...obj, traceId: ctx?.traceId, userId: ctx?.userId, path: ctx?.path, method: ctx?.method },
                msg
            );
        },

        /** Log de erro */
        error(arg1: unknown, arg2?: unknown) {
            const ctx = requestContext.getStore();
            const [obj, msg] =
                typeof arg1 === "string" ? [{}, arg1] : [arg1 ?? {}, arg2 as string];
            baseLogger.error(
                { ...obj, traceId: ctx?.traceId, userId: ctx?.userId, path: ctx?.path, method: ctx?.method },
                msg
            );
        },

        /** Log de depuração */
        debug(arg1: unknown, arg2?: unknown) {
            const ctx = requestContext.getStore();
            const [obj, msg] =
                typeof arg1 === "string" ? [{}, arg1] : [arg1 ?? {}, arg2 as string];
            baseLogger.debug(
                { ...obj, traceId: ctx?.traceId, userId: ctx?.userId, path: ctx?.path, method: ctx?.method },
                msg
            );
        },
    },
    {
        /**
         * Cria um logger filho com contexto fixo.
         * Mantém interface compatível com o pino.
         */
        child(bindings: Record<string, unknown>) {
            const childLogger = baseLogger.child(bindings);

            return {
                info: (arg1: unknown, arg2?: unknown) => {
                    const [obj, msg] =
                        typeof arg1 === "string" ? [{}, arg1] : [arg1 ?? {}, arg2 as string];
                    childLogger.info(obj, msg);
                },
                warn: (arg1: unknown, arg2?: unknown) => {
                    const [obj, msg] =
                        typeof arg1 === "string" ? [{}, arg1] : [arg1 ?? {}, arg2 as string];
                    childLogger.warn(obj, msg);
                },
                error: (arg1: unknown, arg2?: unknown) => {
                    const [obj, msg] =
                        typeof arg1 === "string" ? [{}, arg1] : [arg1 ?? {}, arg2 as string];
                    childLogger.error(obj, msg);
                },
                debug: (arg1: unknown, arg2?: unknown) => {
                    const [obj, msg] =
                        typeof arg1 === "string" ? [{}, arg1] : [arg1 ?? {}, arg2 as string];
                    childLogger.debug(obj, msg);
                },
            };
        },
    }
);
