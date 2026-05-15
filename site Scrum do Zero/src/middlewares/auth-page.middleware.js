const {verifyToken} = require("../utils/jwt")

// Middleware que verifica se o usuário está autenticado via token em cookie
// Este middleware é usado para proteger as rotas das páginas que requerem autenticação
async function authPageMiddleware(req, res, next) {
    try {
        // Verifica se há token no cookie
        const token = req.cookies?.token;
        
        if (!token) {
            // Se não houver token, redireciona para a página de login
            return res.redirect('/index');
        }
        
        // Valida o token
        const payload = verifyToken(token);
        req.usuario = payload;
        
        return next();
    } catch(e) {
        // Se o token for inválido ou expirado, redireciona para login
        return res.redirect('/index');
    }
}

module.exports = authPageMiddleware;
