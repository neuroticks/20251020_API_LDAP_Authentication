// src/core/domain/types/auth-response-dto.ts
export interface AuthResponseDTO {
  token: string;
  roles: string[];
  message: string;
}
