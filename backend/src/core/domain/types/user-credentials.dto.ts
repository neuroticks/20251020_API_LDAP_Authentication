/**
 * DTO de entrada para autenticação de usuário.
 * Garante que os dados de entrada estejam tipados e consistentes.
 */
export interface UserCredentialsDTO {
    email: string;
    password: string;
}
