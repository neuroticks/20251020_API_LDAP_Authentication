#!/usr/bin/env tsx
import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import chalk from 'chalk';

const ENV_PATH = path.resolve('.env');
const CONFIG_PATH = path.resolve('src/infra/config/env.ts');

if (!fs.existsSync(ENV_PATH)) {
    console.error(chalk.red('✗ Arquivo .env não encontrado.'));
    process.exit(1);
}
if (!fs.existsSync(CONFIG_PATH)) {
    console.error(chalk.red('✗ Arquivo src/config/env.ts não encontrado.'));
    process.exit(1);
}

console.log(chalk.bold('\n🔍 Verificando correspondência entre .env e config/env.ts\n'));

// 1️⃣ Carrega variáveis do .env
const envContent = fs.readFileSync(ENV_PATH, 'utf-8');
const envParsed = dotenv.parse(envContent);
const envKeys = new Set(Object.keys(envParsed));

// 2️⃣ Lê config/env.ts
const configSource = fs.readFileSync(CONFIG_PATH, 'utf-8');

// Extrai variáveis referenciadas como process.env.X
const regexProcessEnv = /process\.env\.([A-Z0-9_]+)/g;
const usedKeys = new Set([...configSource.matchAll(regexProcessEnv)].map(m => m[1]));

// Se existir Zod schema, extrai chaves internas também (por segurança)
const regexZodKeys = /z\.string\(\{?\s*required_error:\s*['"`](.+?)['"`]/g;
for (const match of configSource.matchAll(regexZodKeys)) {
    usedKeys.add(match[1]);
}

// 3️⃣ Comparação
const missingInEnv = [...usedKeys].filter(k => !envKeys.has(k));
const unusedInCode = [...envKeys].filter(k => !usedKeys.has(k));

let hasDiff = false;
if (missingInEnv.length > 0) {
    hasDiff = true;
    console.log(chalk.red(`✗ Variáveis usadas em env.ts mas ausentes no .env:`));
    console.log('  ', missingInEnv.join(', '), '\n');
}
if (unusedInCode.length > 0) {
    hasDiff = true;
    console.log(chalk.yellow(`⚠️ Variáveis definidas em .env mas não usadas no código:`));
    console.log('  ', unusedInCode.join(', '), '\n');
}

if (!hasDiff) {
    console.log(chalk.green('✅ Todas as variáveis do .env estão mapeadas corretamente em env.ts!'));
    process.exit(0);
} else {
    console.error(chalk.red('✗ Inconsistências detectadas entre .env e config/env.ts.'));
    process.exit(1);
}
