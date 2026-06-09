const pool = require("../database/db");

async function findUsuarioByEmail(email) {
  const result = await pool.query(
    "SELECT * FROM usuarios WHERE email = $1",
    [email]
  );
  if (result.rows.length === 0) {
    throw new Error("Usuário não encontrado com este email");
  }
  return result.rows[0];
}

async function criarRecuperacaoSenha(id_usuario, email, codigo, token) {
  const expira_em = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos
  const result = await pool.query(
    "INSERT INTO password_recovery (id_usuario, email, codigo, token, expira_em) VALUES ($1, $2, $3, $4, $5) RETURNING *",
    [id_usuario, email, codigo, token, expira_em]
  );
  return result.rows[0];
}

async function verificarCodigo(email, codigo) {
  const result = await pool.query(
    `SELECT * FROM password_recovery 
     WHERE email = $1 AND codigo = $2 
     AND expira_em > NOW() 
     AND utilizado_em IS NULL
     ORDER BY criado_em DESC
     LIMIT 1`,
    [email, codigo]
  );
  
  if (result.rows.length === 0) {
    throw new Error("Código inválido ou expirado");
  }
  return result.rows[0];
}

async function marcarComoUtilizado(id_recovery) {
  await pool.query(
    "UPDATE password_recovery SET utilizado_em = NOW() WHERE id_recovery = $1",
    [id_recovery]
  );
}

async function atualizarSenha(id_usuario, novaSenha) {
  const result = await pool.query(
    "UPDATE usuarios SET senha = $1 WHERE id_usuario = $2 RETURNING id_usuario",
    [novaSenha, id_usuario]
  );
  if (result.rows.length === 0) {
    throw new Error("Erro ao atualizar senha");
  }
  return result.rows[0];
}

module.exports = {
  findUsuarioByEmail,
  criarRecuperacaoSenha,
  verificarCodigo,
  marcarComoUtilizado,
  atualizarSenha
};
