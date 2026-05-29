const { Router } = require("express")
const {findUsuarioByCpfAndSenha} = require("../repositories/usuarios.repositories")
const { createToken } = require("../utils/jwt")
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


module.exports = router;