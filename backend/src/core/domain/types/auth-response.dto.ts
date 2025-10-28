/**
 * DTO de resposta da autenticação.
 * Facilita a padronização da estrutura retornada pelo controller.
 */
export interface AuthResponseDTO {
  token: string;
  roles: string[];
  message: string;
}
