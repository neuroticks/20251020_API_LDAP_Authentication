/**
 * Classe base para todos os erros da aplicação.
 * Permite definir status HTTP e mensagens padronizadas.
 */
export class AppError extends Error {
    public readonly statusCode: number;

    constructor(message: string, statusCode = 400) {
        super(message);
        this.name = 'AppError';
        this.statusCode = statusCode;

        // Mantém stack trace original (sem poluir logs)
        Error.captureStackTrace(this, this.constructor);
    }
}
