import '@/types/express';
import dotenv from 'dotenv';
import { Container } from '@/infra/di/container';
import { startServer } from '@/infra/http/server';

dotenv.config();
Container.registerDependencies();
startServer();
