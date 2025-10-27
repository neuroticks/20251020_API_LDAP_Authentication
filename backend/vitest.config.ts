import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
    plugins: [tsconfigPaths()],

    test: {
        globals: true,                 // permite usar describe/it/expect sem importar
        environment: 'node',           // ambiente ideal para backend Node.js
        setupFiles: ['./src/tests/setup.ts'], // ✅ executa antes dos testes
        include: ['src/tests/**/*.spec.ts'], // garante busca em subpastas unit/integration
        coverage: {
            provider: 'v8',
            reportsDirectory: './coverage',
            reporter: ['text', 'html', 'json-summary'],
            exclude: [
                'src/tests/**/*',
                'src/main.ts',
                'src/infra/di/container.ts',
            ],
            thresholds: {
                lines: 70,
                functions: 70,
                branches: 70,
                statements: 70,
            },
        },
        clearMocks: true,
        restoreMocks: true,
        mockReset: true,
    },
});
