import { z } from 'zod';

/**
 * Esquema de validação de credenciais compatível com Zod v4.1.12+.
 * Usa refinements em vez de mensagens diretas nos métodos preteridos.
 */
export const AuthSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'O campo email é obrigatório.')
    .max(150, 'Email muito longo.')
    .refine((val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), {
      message: 'Formato de email inválido.',
    }),
  password: z
    .string()
    .trim()
    .min(1, 'O campo senha é obrigatório.')
    .max(150, 'Senha muito longa.'),
});

export type AuthSchemaType = z.infer<typeof AuthSchema>;
