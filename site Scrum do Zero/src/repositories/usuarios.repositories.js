const pool = require("../database/db");
const { randomBytes } = require("crypto")
const { hashPassword, verifyPassword } = require("../utils/password")

async function insertUsuario(client, nome, email, cpf, senha) {
    const certificado_hash = randomBytes(24).toString("hex")
    const senhaCodificada = hashPassword(senha)

    const result = await client.query(
        `INSERT INTO usuarios (nome, email, cpf, senha, certificado_hash)
        VALUES ($1, $2,$3, $4, $5)
        RETURNING id_usuario, nome, email, cpf, certificado_hash`,
        [nome, email, cpf, senhaCodificada, certificado_hash]
    )
    if (result && result.rowCount == 1) {
        return result.rows[0];
    }
    return result.rows[0] || null
}

async function findPrimeiroModuloid(client) {
    const result = await client.query(
        `SELECT id_modulo FROM modulos ORDER BY id_modulo LIMIT 1`)
    if (result && result.rows.length == 1) {
        return result.rows[0]
    }
    return result.rows[0] || null
}

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

async function insertExame(client, idModulo, idUsuario, grupo, tentativa) {
    const result = await client.query(
        `INSERT INTO exames (id_modulo, id_usuario, grupo, tentativa)
        VALUES ($1, $2,$3, $4)
        RETURNING id_exame`,
        [idModulo, idUsuario, grupo, tentativa]
    )
}

async function createUsuario(nome, email, cpf, senha) {
    const client = await pool.connect()
    try {
        await client.query("BEGIN")

        const usuario = await insertUsuario(client, nome, email, cpf, senha)

        const modulo = await findPrimeiroModuloid(client)
        if (!modulo) {
            throw new error("Nenhum módulo cadastrado para inicializar exame do usuário")
        }
        const grupo = await findGrupoAleatorio(client, modulo.id_modulo)
        if (!grupo) {
            throw new error("Nenhum grupo cadastrado para inicializar exame do usuário")
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
        client.query("ROLLBACK")
        throw e;
    } finally {
        client.release()
    }
}

async function updateUsuarioCpf(idUsuario, cpf) {
    const result = await pool.query(`
        UPDATE usuarios
        SET cpf = $1
        WHERE id_usuario = $2
        RETURNING id_usuario`,
        [cpf, idUsuario]
    )

    return result.rows[0] || null
}

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

async function findUsuarioById(idUsuario) {
    const result = await pool.query(`
        SELECT id_usuario, nome, email, cpf
        FROM usuarios
        WHERE id_usuario = $1`,
        [idUsuario]
    )
    return result.rows[0] || null
}

async function findUsuarioByCpfAndSenha(cpf, senha) {
    const result = await pool.query(`
        SELECT id_usuario, nome, email, cpf,senha
        FROM usuarios
        WHERE cpf = $1`,
        [cpf]
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

async function findProximaQuestaoByUsuario(idUsuario) {
    const result = await pool.query(
        ` 
 WITH exame_atual AS ( 
SELECT id_exame, id_modulo, grupo 
FROM exames 
WHERE id_usuario = $1 
ORDER BY id_exame DESC 
LIMIT 1 
) 
SELECT 
e.id_exame, 
q.id_questao, 
q.id_modulo, 
q.grupo, 
q.numero, 
q.dificuldade, 
q.enunciado, 
q.alternativa_a, 
q.alternativa_b, 
q.alternativa_c, 
q.alternativa_d, 
q.imagem 
FROM exame_atual e 
INNER JOIN questoes q 
ON q.id_modulo = e.id_modulo 
AND q.grupo IS NOT DISTINCT FROM e.grupo 
WHERE NOT EXISTS ( 
SELECT 1 
FROM respostas r 
WHERE r.id_exame = e.id_exame 
AND r.id_questao = q.id_questao 
) 
ORDER BY q.numero ASC NULLS LAST, q.id_questao ASC 
LIMIT 1`,
        [idUsuario],
    );
    return result.rows[0] || null;
}

module.exports = {
    createUsuario,
    updateUsuarioCpf,
    updateUsuarioNome,
    updateUsuarioEmail,
    updateUsuarioSenha,
    findUsuarioById,
    findUsuarioByCpfAndSenha,
    findProximaQuestaoByUsuario
}