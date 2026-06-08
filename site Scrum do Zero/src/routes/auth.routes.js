const { Router } = require("express")
const { findUsuarioByCpfAndSenha } = require("../repositories/usuarios.repository")
const { createToken } = require("../utils/jwt")
// Use project's password utils for consistent hashing
const { hashPassword } = require("../utils/password");
const { 
  findUsuarioByEmail, 
  criarRecuperacaoSenha, 
  verificarCodigo, 
  marcarComoUtilizado,
  atualizarSenha 
} = require("../repositories/password-recovery.repository")
const { enviarCodigoRecuperacao } = require("../utils/email")
const crypto = require("crypto")
const { addToken } = require("../utils/tokenBlacklist")

const router = Router()

/* POST LOGIN USUÁRIO
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"cpf":"12345678901", "senha":"123456"}'
*/

//API de login, recebe CPF e SENHA do front e utiliza a funcao findUsuarioByCpfAndSenha importada do usuario.repositories

router.post("/login", async function (req, res) {
    const { cpf, senha } = req.body
         if (!cpf || !senha) {
        return res.status(400)
            .json({ message: "CPF ou senha inválidos" })
    }
    try{
        const usuario = await findUsuarioByCpfAndSenha(cpf, senha)
        const token = createToken({ id_usuario: usuario.id_usuario})
        return res.status(200).json({
            token,
            nome: usuario.nome
        })
    }catch(e){
        const invalidCredentials = e.message === "Usuário não encontrado" || e.message === "Senha inválida"
        return res.status(invalidCredentials ? 401 : 500).json({
                message: e.message
            })
    }
})

// POST LOGOUT: invalida o token enviado no header Authorization
router.post('/logout', function (req, res) {
    const authorization = req.headers.authorization
    if (!authorization) {
        return res.status(204).send()
    }

    const [type, token] = authorization.split(' ')
    if (type !== 'Bearer' || !token) {
        return res.status(400).json({ message: 'Token inválido' })
    }

    addToken(token)
    return res.status(200).json({ message: 'Logout realizado' })
})

/* POST FORGOT PASSWORD - SOLICITAR RESET
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"usuario@email.com"}'
*/
router.post("/forgot-password", async function (req, res) {
  const { email } = req.body
  
  if (!email) {
    return res.status(400).json({ message: "Email é obrigatório" })
  }

  try {
    // Verificar se o usuário existe
    const usuario = await findUsuarioByEmail(email)

    // Gerar código de 6 dígitos
    const codigo = String(Math.floor(Math.random() * 999999)).padStart(6, "0")
    
    // Gerar token único
    const token = crypto.randomBytes(32).toString("hex")

    // Criar registro de recuperação
    await criarRecuperacaoSenha(usuario.id_usuario, email, codigo, token)

    // Enviar email com código
    await enviarCodigoRecuperacao(email, codigo)

    return res.status(200).json({ 
      message: "Código enviado para o email",
      token: token // Frontend vai usar este token para validação adicional
    })
  } catch (e) {
    console.error(e)
    return res.status(e.message === "Usuário não encontrado com este email" ? 404 : 500).json({
      message: e.message || "Erro ao processar solicitação"
    })
  }
})

/* POST VERIFY CODE
curl -X POST http://localhost:3000/api/auth/verify-code \
  -H "Content-Type: application/json" \
  -d '{"email":"usuario@email.com", "codigo":"123456"}'
*/
router.post("/verify-code", async function (req, res) {
  const { email, codigo } = req.body

  if (!email || !codigo) {
    return res.status(400).json({ message: "Email e código são obrigatórios" })
  }

  try {
    const recovery = await verificarCodigo(email, codigo)

    return res.status(200).json({ 
      message: "Código verificado com sucesso",
      recovery_id: recovery.id_recovery,
      id_usuario: recovery.id_usuario
    })
  } catch (e) {
    console.error(e)
    return res.status(400).json({
      message: e.message || "Erro ao verificar código"
    })
  }
})

/* POST RESET PASSWORD
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"recovery_id":1, "id_usuario":1, "nova_senha":"novaSenha123"}'
*/
router.post("/reset-password", async function (req, res) {
  const { recovery_id, id_usuario, nova_senha } = req.body

  if (!recovery_id || !id_usuario || !nova_senha) {
    return res.status(400).json({ message: "Todos os campos são obrigatórios" })
  }

  if (nova_senha.length < 6) {
    return res.status(400).json({ message: "Senha deve ter no mínimo 6 caracteres" })
  }

  try {
    // Hash da nova senha usando scrypt (consistente com `hashPassword` usado no restante do projeto)
    const senhaCriptografada = hashPassword(nova_senha);

    // Atualizar senha do usuário
    await atualizarSenha(id_usuario, senhaCriptografada);

    // Marcar token como utilizado
    await marcarComoUtilizado(recovery_id)

    return res.status(200).json({ 
      message: "Senha alterada com sucesso"
    })
  } catch (e) {
    console.error(e)
    return res.status(500).json({
      message: e.message || "Erro ao resetar senha"
    })
  }
})

module.exports = router;