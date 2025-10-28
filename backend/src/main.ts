import '@/types/express';
import dotenv from 'dotenv';
import { createServer } from '@/infra/http/server';

dotenv.config();
createServer();
