#!/usr/bin/env tsx
import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import chalk from 'chalk';

const files = ['.env', '.env.test', '.env.example', '.env.production'].filter(f =>
    fs.existsSync(f)
);

if (files.length < 2) {
    console.error(chalk.red('✗ São necessários pelo menos dois arquivos .env para comparar.'));
    process.exit(1);
}

console.log(chalk.bold('\n🔍 Verificando consistência das chaves entre arquivos .env\n'));

// Função para extrair chaves de cada .env
function parseKeys(file: string): Set<string> {
    const content = fs.readFileSync(file, 'utf-8');
    const parsed = dotenv.parse(content);
    return new Set(Object.keys(parsed));
}

// Cria um mapa de chaves por arquivo
const envKeys: Record<string, Set<string>> = {};
for (const file of files) {
    envKeys[file] = parseKeys(file);
}

let hasDiff = false;

// Pega o conjunto base (.env como referência)
const baseFile = '.env';
const baseKeys = envKeys[baseFile];

for (const file of files) {
    if (file === baseFile) continue;

    const current = envKeys[file];

    const missing = [...baseKeys].filter(k => !current.has(k));
    const extras = [...current].filter(k => !baseKeys.has(k));

    if (missing.length || extras.length) {
        hasDiff = true;
        if (missing.length) {
            console.log(chalk.yellow(`⚠️  ${file} está faltando:`), missing.join(', '));
        }
        if (extras.length) {
            console.log(chalk.cyan(`⚠️  ${file} tem variáveis extras:`), extras.join(', '));
        }
        console.log();
    }
}

if (!hasDiff) {
    console.log(chalk.green('✅ Todos os arquivos .env têm as mesmas chaves!'));
    process.exit(0);
} else {
    console.error(chalk.red('✗ Inconsistências encontradas entre arquivos .env.'));
    process.exit(1);
}
