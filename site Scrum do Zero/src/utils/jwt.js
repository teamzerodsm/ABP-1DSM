const path = require('path');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

dotenv.config({ path: path.resolve(__dirname, "..", "..", ".env") });

//Metodo para criação de token utilizando a JWT_SECRET presente no .env
function createToken(payload) {
    return jwt.sign(
        payload,
        process.env.JWT_SECRET,
        { expiresIn: Number(process.env.DEFAULT_EXPIRES_IN_SECONDS) }
    )
};

//Metodo que verifica o token, sempre utilizado no middleware para autenticação do usuário em cada rota
function verifyToken(token) {
    return jwt.verify(token, process.env.JWT_SECRET)
}

module.exports = {
    createToken,
    verifyToken
}