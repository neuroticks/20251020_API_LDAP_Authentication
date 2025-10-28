// src/tests/setup/setup.ts
import { beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { Container } from '@/infra/di/container';
import { makeAuthUseCase } from '../factories/make-auth-usecase';

beforeAll(() => {
  Container.init();
});

beforeEach(() => {
  vi.clearAllMocks();
});

afterAll(() => {
  // Teardown global se necessário
});

export { makeAuthUseCase };

