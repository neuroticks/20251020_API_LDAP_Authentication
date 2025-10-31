#!/usr/bin/env tsx
/**
 * 🧪 Script de verificação de readiness (produção e CI)
 * ------------------------------------------------------
 * Agora inclui:
 *  - check-env-keys → Valida sincronia entre todos os .env
 *  - check-env-config-mapping → Garante que config/env.ts mapeia todas as variáveis
 */

import { execSync, spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import chalk from 'chalk';
import { ZodError, z } from 'zod';
import http from 'node:http';

// === Flags =========================================================
const isCI = process.argv.includes('--ci');
const log = (...args: any[]) => !isCI && console.log(...args);

// === Helpers =======================================================
function run(cmd: string, label: string) {
    try {
        if (!isCI) console.log(chalk.blue(`\n▶ ${label}`));
        //execSync(cmd, { stdio: isCI ? 'ignore' : 'pipe', encoding: 'utf-8' });
        execSync(cmd, { stdio: 'inherit', encoding: 'utf-8' });
        if (!isCI) console.log(chalk.green(`✓ ${label} OK`));
        return true;
    } catch (err: any) {
        console.error(chalk.red(`✗ ${label} FALHOU`));
        if (!isCI) console.error(err.stdout?.toString() || err.message);
        process.exit(1);
    }
}

// === 1. .env =======================================================
log(chalk.bold('\n🔍 Verificando variáveis de ambiente (.env)'));
const envPath =
    fs.existsSync('.env') ? path.resolve('.env') : fs.existsSync('src/.env') ? path.resolve('src/.env') : null;

if (!envPath) {
    console.error('✗ .env não encontrado (nem na raiz nem em src/)');
    process.exit(1);
}
dotenv.config({ path: envPath });

const envSchema = z.object({
    NODE_ENV: z.string().min(1),
    JWT_SECRET: z.string().min(8),
    LDAP_URL: z.string().min(3),
    LDAP_BASE_DN: z.string().min(3),
    LOG_LEVEL: z.string().default('info'),
    PORT: z.coerce.number().min(1).max(65535),
});

try {
    envSchema.parse(process.env);
    log(chalk.green('✓ Variáveis válidas'));
} catch (err) {
    if (err instanceof ZodError) {
        const fields = err.issues.map(i => i.path.join('.')).join(', ');
        console.error(`✗ Variáveis inválidas detectadas: ${fields}`);
    } else {
        console.error('✗ Erro inesperado ao validar variáveis .env');
    }
    process.exit(1);
}

// === 2. Consistência dos arquivos .env =============================
run('pnpm check:envs', 'check-env-keys (Sincronia entre todos os .env)');

// === 3. Mapeamento .env → config/env.ts ============================
run('pnpm check:env:map', 'check-env-config-mapping (Validação do config/env.ts)');

// === 4. Arquivos essenciais =======================================
log(chalk.bold('\n📂 Verificando arquivos essenciais'));
const required = [
    '.env.example',
    'Dockerfile',
    'tsconfig.json',
    'vitest.config.ts',
    '.eslintrc.json',
];
const missing = required.filter(f => !fs.existsSync(f));
if (missing.length) {
    console.error(`✗ Arquivos ausentes: ${missing.join(', ')}`);
    process.exit(1);
}
log(chalk.green('✓ Arquivos essenciais OK'));

// === 5. Testes / build / lint =====================================
run('pnpm test:coverage --silent', 'Testes com cobertura');
run('pnpm lint --silent', 'Lint');
run('pnpm build --noEmit', 'Compilação TypeScript');

// === 6. Dockerfile ================================================
log(chalk.bold('\n🐳 Verificando Dockerfile'));
const dockerfile = fs.readFileSync('Dockerfile', 'utf-8');
const checks = ['FROM node:', 'RUN pnpm', 'CMD ["node"'];
const fail = checks.filter(c => !dockerfile.includes(c));
if (fail.length) {
    console.error(`✗ Dockerfile faltando instruções: ${fail.join(', ')}`);
    process.exit(1);
}
log(chalk.green('✓ Dockerfile válido'));

// === 7. Servidor e endpoints ======================================
log(chalk.bold('\n🌐 Testando endpoints /health e /metrics'));
const port = process.env.PORT || 8080;
const serverProc = spawn('tsx', ['src/main.ts'], {
    env: { ...process.env, NODE_ENV: 'TEST' },
    stdio: isCI ? 'ignore' : 'pipe',
});

const wait = (ms: number) => new Promise(res => setTimeout(res, ms));
await wait(3000);

async function checkEndpoint(path: string): Promise<boolean> {
    return new Promise(resolve => {
        http.get(`http://localhost:${port}${path}`, res => {
            const ok = res.statusCode === 200;
            if (!isCI)
                console.log(
                    ok ? chalk.green(`✓ ${path} retornou 200`) : chalk.red(`✗ ${path} → ${res.statusCode}`)
                );
            resolve(ok);
        }).on('error', () => {
            if (!isCI) console.error(chalk.red(`✗ Falha ao acessar ${path}`));
            resolve(false);
        });
    });
}

const healthOK = await checkEndpoint('/health');
const metricsOK = await checkEndpoint('/metrics');
serverProc.kill();

if (!healthOK) {
    console.error('✗ Falha no endpoint /health');
    process.exit(1);
}

// === 8. IoC Container =============================================
log(chalk.bold('\n📦 Testando Container IoC'));
try {
    const { Container } = await import(path.resolve('src/infra/di/container.ts'));
    Container.init();
    const tokens = ['ILdapAuthProvider', 'IJwtService', 'ILogger'] as const;
    for (const token of tokens) {
        Container.resolve(token as any);
        if (!isCI) console.log(chalk.green(`✓ ${token} resolvido`));
    }
} catch (err: any) {
    console.error('✗ Falha no Container:', err.message);
    process.exit(1);
}

// === 9. Resumo final ==============================================
if (isCI) {
    console.log('✅ CHECK-READINESS: PASS');
} else {
    console.log(chalk.bold('\n🏁 Readiness check completo!'));
    console.log(chalk.green('✔ Projeto pronto para deploy de produção 🚀'));
}
