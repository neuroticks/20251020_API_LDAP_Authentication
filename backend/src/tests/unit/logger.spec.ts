import { describe, it, expect } from 'vitest';
import { logger } from '@/infra/log/logger';

describe('Logger', () => {
  it('deve registrar mensagens de info e error corretamente', () => {
    expect(() => logger.info('mensagem de teste')).not.toThrow();
    expect(() => logger.error({ context: 'Test' }, 'erro de teste')).not.toThrow();
  });

  it('deve criar child logger com contexto fixo', () => {
    const child = logger.child({ context: 'AuthTest' });
    expect(child).toBeDefined();
    expect(typeof child.info).toBe('function');
  });
});
