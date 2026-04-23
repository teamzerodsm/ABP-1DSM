const {verifyToken} = require("../utils/jwt")
const {findUsuarioById} = require("../repositories/usuarios.repositories")

async function authmiddleware(req, res, next){
    const authorization = req.headers.authorization

    if (!authorization) {
        return res.status(401).json({ message: "Token de autenticação não fornecido" })
    }

    const [type, token] = authorization.split(" ")

    if (type !== "Bearer" || !token) {
        return res.status(401).json({ message: "Token inválido" })
    }
    try {
        const payload = verifyToken(token)

        const usuario = await findUsuarioById(payload.id_usuario)
        if (!usuario) {
            return res.status(401).json({ message: "Usuário não encontrado" })
        }

        req.usuario = usuario
        return next()
    } catch{
        return res.status(401).json({ message: "Token inválido ou expirado" })
    }
}

module.exports = authmiddleware;