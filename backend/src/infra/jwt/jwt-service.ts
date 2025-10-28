import jwt, { VerifyOptions, SignOptions, Algorithm, JwtPayload as LibJwtPayload } from 'jsonwebtoken';
import { logger } from '@/infra/log/logger';
import { messages } from '@/core/messages/messages';
import { env } from '@/infra/config/env';
import { AppError } from '@/core/errors/app-error';

export interface JwtPayload {
  email: string;
  roles: string[];
  iat?: number;
  iss?: string;
}

export class JwtService {
  private readonly secret: string;
  private readonly algorithm: Algorithm;
  private readonly expiresIn: SignOptions['expiresIn'];
  private readonly issuer?: string;

  constructor() {
    this.secret = env.JWT_SECRET;
    if (!this.secret) {
      logger.error({ context: 'JwtService' }, messages.jwt.missingSecret);
      throw new AppError(messages.jwt.missingSecret, 500);
    }

    this.algorithm = 'HS512';
    this.expiresIn = '30m';
    this.issuer = env.JWT_ISSUER || undefined;

  }

  sign(payload: Pick<JwtPayload, 'email' | 'roles'>): string {
    const options: SignOptions = {
      expiresIn: this.expiresIn,
      algorithm: this.algorithm,
      issuer: this.issuer,
    };

    const token = jwt.sign(payload, this.secret, options);

    logger.debug({ context: 'JwtService' }, messages.jwt.created);

    return token;
  }

  verify<T extends LibJwtPayload = JwtPayload>(token: string): T {
    try {
      const options: VerifyOptions = {
        algorithms: [this.algorithm],
        issuer: this.issuer,
      };
      return jwt.verify(token, this.secret, options) as T;
    } catch (err: any) {
      logger.warn({ context: 'JwtService.verify', error: err?.message }, messages.jwt.invalid);
      throw new AppError(messages.jwt.invalid, 401);
    }
  }
}


