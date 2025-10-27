export const fakeUsers = {
    chefe: {
        email: 'chefe@empresa.gov.br',
        password: 'senha123',
        roles: ['podeAprovarPonto', 'podeRecusarJustificativa', 'podeAceitarJustificativa'],
    },
    funcionario: {
        email: 'funcionario@empresa.gov.br',
        password: 'senha123',
        roles: ['podeCriarJustificativa', 'podeExcluirJustificativa', 'podeFecharPonto'],
    },
    rh: {
        email: 'rh@empresa.gov.br',
        password: 'senha123',
        roles: ['podeIncluirLotacao', 'podeConsultarTodos', 'podeEncerrarPonto', 'podeDevolverPonto'],
    },
};