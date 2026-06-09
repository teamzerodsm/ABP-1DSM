const {
  createUsuario,
  updateUsuarioCpf,
  updateUsuarioNome,
  updateUsuarioEmail,
  updateUsuarioSenha,
  findUsuarioById,
  verifyUsuarioSenha,
} = require("../repositories/usuarios.repository");

async function cadastrarUsuario(nome, email, cpf, senha ){
    return createUsuario(nome, email, cpf, senha);
}

async function alterarCPF(idUsuario, cpf){
    const result = await updateUsuarioCpf(idUsuario, cpf);
if (!result) {
  return null;
}

return findUsuarioById(result.id_usuario);
}

async function alterarNome(idUsuario, nome){
    const result = await updateUsuarioNome(idUsuario, nome);
if (!result) {
  return null;
}

return findUsuarioById(result.id_usuario);
}

async function alterarEmail(idUsuario, email){
    const result = await updateUsuarioEmail(idUsuario, email);
if (!result) {
  return null;
}

return findUsuarioById(result.id_usuario);
}

async function alterarSenha(idUsuario, senha){
    const result = await updateUsuarioSenha(idUsuario, senha);
if (!result) {
  return null;
}

return findUsuarioById(result.id_usuario);
}

module.exports = {
   cadastrarUsuario,
    alterarCPF,
    alterarNome,
    alterarEmail,
    alterarSenha,
};