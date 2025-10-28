export const messages = {
    auth: {
        start: 'Iniciando autenticação de usuário...',
        success: 'Usuário autenticado com sucesso.',
        failure: 'Falha ao autenticar usuário.',
        invalidCredentials: 'Usuário ou senha incorretos.',
        missingCredentials: 'Usuário e senha obrigatórios.',
        missingEmail: 'O campo email é obrigatório.',
        missingPassword: 'O campo senha é obrigatório.',
        invalidEmailFormat: 'Formato de email inválido.',
        invalidEmailLength: 'Email muito longo.',
        invalidPasswordLength: 'Senha muito longa.',
        ldapError: 'Erro de conexão com o servidor LDAP. Tente novamente mais tarde.',
        logout: 'Usuário desconectado com sucesso.',
        unauthorized: 'Acesso não autorizado. Token ausente ou inválido.',
    },

    jwt: {
        created: 'Token JWT criado com sucesso.',
        verified: 'Token JWT verificado com sucesso.',
        invalid: 'Token JWT inválido ou expirado.',
        missingSecret: 'JWT_SECRET não definido no ambiente.',
        missingToken: 'Token de autenticação não fornecido.',
    },

    server: {
        start: 'Servidor iniciado com sucesso.',
        listening: 'Servidor inicializando rotas e aguardando conexões.',
        error: 'Erro ao iniciar o servidor.',
    },

    user: {
        notFound: 'Usuário não encontrado.',
        alreadyExists: 'Usuário já cadastrado.',
        created: 'Usuário criado com sucesso.',
    },

    roles: {
        insufficient: 'Permissões insuficientes para realizar esta ação.',
    },
};
