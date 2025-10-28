import { describe, it, expect } from 'vitest';
import { logger } from '@/infra/log/logger';

describe('Logger', () => {
    it('deve logar mensagem simples', () => {
        expect(() => logger.info('mensagem simples')).not.toThrow();
    });

    it('deve logar com objeto de contexto', () => {
        expect(() => logger.error({ context: 'test' }, 'mensagem de erro')).not.toThrow();
    });
});
