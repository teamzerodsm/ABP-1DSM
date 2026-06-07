const pool = require("../database/db");
const { randomBytes } = require("crypto")
const { hashPassword, verifyPassword } = require("../utils/password")
const { sanitizeCpf } = require("../utils/cpf")

//Função inserir usuário no banco de dados | é chamada pelo método createUsuario
async function insertUsuario(client, nome, email, cpf, senha) {
    const certificado_hash = randomBytes(24).toString("hex")
    const senhaCodificada = hashPassword(senha)
    const cpfLimpo = sanitizeCpf(cpf)

    const result = await client.query(
        `INSERT INTO usuarios (nome, email, cpf, senha, certificado_hash)
        VALUES ($1, $2,$3, $4, $5)
        RETURNING id_usuario, nome, email, cpf, certificado_hash`,
        [nome, email, cpfLimpo, senhaCodificada, certificado_hash]
    )
    if (result && result.rowCount == 1) {
        return result.rows[0];
    }
    return result.rows[0] || null
}

//Função para selecionar o primeiro módulo que o usuário irá realizar
async function findPrimeiroModuloid(client) {
    const result = await client.query(
        `SELECT id_modulo FROM modulos ORDER BY id_modulo LIMIT 1`)
    if (result && result.rows.length == 1) {
        return result.rows[0]
    }
    return result.rows[0] || null
}

//Seleciona um grupo de questões aleatório
async function findGrupoAleatorio(client, idModulo) {
    const result = await client.query(
        `SELECT grupo 
        FROM questoes
        WHERE id_modulo=$1 AND grupo IS NOT NULL
        GROUP BY grupo
        ORDER BY RANDOM()
        LIMIT 1`,
        [idModulo]
    )
    return result.rows[0] || null
}

// Insere um novo exame, com o id do módulo, do usuário que vai realizar, o grupo de questões e a tentativa
async function insertExame(client, idModulo, idUsuario, grupo, tentativa) {
    const result = await client.query(
        `INSERT INTO exames (id_modulo, id_usuario, grupo, tentativa)
        VALUES ($1, $2,$3, $4)
        RETURNING id_exame`,
        [idModulo, idUsuario, grupo, tentativa]
    )
}

// Método principal para cadastro de um novo usuário, utiliza dos métodos acima
async function createUsuario(nome, email, cpf, senha) {
    const client = await pool.connect()
    try {
        await client.query("BEGIN")

        const usuario = await insertUsuario(client, nome, email, cpf, senha)

        const modulo = await findPrimeiroModuloid(client)
        if (!modulo) {
            throw new Error("Nenhum módulo cadastrado para inicializar exame do usuário")
        }
        const grupo = await findGrupoAleatorio(client, modulo.id_modulo)
        if (!grupo) {
            throw new Error("Nenhum grupo cadastrado para inicializar exame do usuário")
        }

        await insertExame(
            client,
            modulo.id_modulo,
            usuario.id_usuario,
            grupo.grupo,
            1)

        await client.query("COMMIT")

        return { id_usuario: usuario.id_usuario, nome: usuario.nome, email: usuario.email, cpf: usuario.cpf }
    } catch (e) {
        await client.query("ROLLBACK")
        throw e
    } finally {
        client.release()
    }
}

//Atualiza CPF de usuário
async function updateUsuarioCpf(idUsuario, cpf) {
    const cpfLimpo = sanitizeCpf(cpf)
    const result = await pool.query(`
        UPDATE usuarios
        SET cpf = $1
        WHERE id_usuario = $2
        RETURNING id_usuario`,
        [cpfLimpo, idUsuario]
    )

    return result.rows[0] || null
}

//Atualiza NOME de usuário
async function updateUsuarioNome(idUsuario, nome) {
    const result = await pool.query(`
        UPDATE usuarios
        SET nome = $1
        WHERE id_usuario = $2
        RETURNING id_usuario`,
        [nome, idUsuario]
    )

    return result.rows[0] || null
}

//Atualiza EMAIL de usuário
async function updateUsuarioEmail(idUsuario, email) {
    const result = await pool.query(`
        UPDATE usuarios
        SET email = $1
        WHERE id_usuario = $2
        RETURNING id_usuario`,
        [email, idUsuario]
    )

    return result.rows[0] || null
}

//Atualiza SENHA de usuário
async function updateUsuarioSenha(idUsuario, senha) {
    const senhaCodificada = hashPassword(senha)
    const result = await pool.query(`
        UPDATE usuarios
        SET senha = $1
        WHERE id_usuario = $2
        RETURNING id_usuario`,
        [senhaCodificada, idUsuario]
    )

    return result.rows[0] || null
}

//Encontra o usuário pelo ID e retorna seu id, nome email e cpf
async function findUsuarioById(idUsuario) {
    const result = await pool.query(`
        SELECT id_usuario, nome, email, cpf
        FROM usuarios
        WHERE id_usuario = $1`,
        [idUsuario]
    )
    return result.rows[0] || null
}

async function findUsuarioSenhaById(idUsuario) {
    const result = await pool.query(`
        SELECT senha
        FROM usuarios
        WHERE id_usuario = $1`,
        [idUsuario]
    )
    return result.rows[0] || null
}

async function verifyUsuarioSenha(idUsuario, senha) {
    const usuario = await findUsuarioSenhaById(idUsuario)
    if (!usuario) {
        return false
    }
    return verifyPassword(senha, usuario.senha)
}

//Encontra o usuário pelo CPF e SENHA e retorna seu id, nome email e cpf
async function findUsuarioByCpfAndSenha(cpf, senha) {
    const cpfLimpo = sanitizeCpf(cpf)
    const result = await pool.query(`
        SELECT id_usuario, nome, email, cpf,senha
        FROM usuarios
        WHERE cpf = $1`,
        [cpfLimpo]
    )
    usuario = result.rows[0]
    if (!result.rows[0]) {
        throw new Error("Usuário não encontrado")
    }
    const senhaValida = verifyPassword(senha, usuario.senha)
    if (!senhaValida) {
        throw new Error("Senha inválida")
    }
    return {
        id_usuario: usuario.id_usuario,
        nome: usuario.nome,
        email: usuario.email,
        cpf: usuario.cpf
    }

}

module.exports = {
    createUsuario,
    updateUsuarioCpf,
    updateUsuarioNome,
    updateUsuarioEmail,
    updateUsuarioSenha,
    findUsuarioById,
    findUsuarioByCpfAndSenha,
    verifyUsuarioSenha
}