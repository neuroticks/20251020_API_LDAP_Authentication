import path from 'path';
import { config } from 'dotenv';
import { Container } from '@/infra/di/container';

// 🧩 Caminho absoluto do .env.test
const envPath = path.resolve(__dirname, '../../.env.test');

// 🔧 Carrega as variáveis antes de tudo
config({ path: envPath });

beforeAll(() => {
  Container.registerDependencies();
});
