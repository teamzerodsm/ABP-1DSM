const {verifyToken} = require("../utils/jwt")
const {findUsuarioById} = require("../repositories/usuarios.repository")
const {isBlacklisted} = require("../utils/tokenBlacklist")

//Metodo que verifica se o token esta correto, é chamado sempre junto de api's para a verificação antes de realizar qualquer coisa
async function authmiddleware(req, res, next){
    const authorization = req.headers.authorization

    if (!authorization) {
        return res.status(401).json({ message: "Token de autenticação não fornecido" })
    }

    const [type, token] = authorization.split(" ")

    if (type !== "Bearer" || !token) {
        return res.status(401).json({ message: "Token inválido" })
    }
    // Verifica se o token já foi invalidado (logout)
    if (isBlacklisted(token)) {
        return res.status(401).json({ message: "Token inválido ou expirado" })
    }
    try {
        const payload = verifyToken(token)

        const usuario = await findUsuarioById(payload.id_usuario)
        if (!usuario) {
            return res.status(401).json({ message: "Usuário não encontrado" })
        }

        req.usuario = usuario
        return next()
    } catch(e){
        console.log("ERRO: ", e.error)
        return res.status(401).json({ message: "Token inválido ou expirado" })
    }
}

module.exports = authmiddleware;