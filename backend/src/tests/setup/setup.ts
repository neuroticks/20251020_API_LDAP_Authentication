// src/tests/setup.ts
import { beforeAll, afterAll, beforeEach } from 'vitest';
import { Container } from '@/infra/di/container';
import { env } from '@/infra/config/env';
import { logger } from '@/infra/log/logger';

// ⚙️ Configuração global de testes
beforeAll(() => {
  // Força ambiente de teste
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = env.JWT_SECRET || 'test-secret';
  process.env.JWT_ALGORITHM = 'HS512';
  process.env.JWT_EXPIRES_IN = '30m';

  // Registra dependências no container
  Container.init();

  logger.info('[SETUP] Ambiente de teste inicializado.');
});

beforeEach(() => {
  vi.clearAllMocks();
});

// 🧹 Limpeza global
afterAll(() => {
  logger.info('[TEARDOWN] Finalizando ambiente de teste.');
});
