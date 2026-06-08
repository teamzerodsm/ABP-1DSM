const {
    createUsuario,
    updateUsuarioCpf,
    updateUsuarioNome,
    updateUsuarioEmail,
    updateUsuarioSenha,
    findUsuarioById,
    verifyUsuarioSenha
}   = require("../repositories/usuarios.repository");

async function createUsuarioController(req, res) {
    const { nome, email, cpf, senha } = req.body;
    if (!cpf || !nome || !senha) {
        return res.status(400)
            .json({ message: "Informações invalidas" })
    }

    if (!validarCpf(cpf)) {
        return res.status(400)
            .json({ message: "CPF inválido. Digite um CPF válido com 11 números." })
    }

    if (senha.trim().length < 6) {
        return res
            .status(400)
            .json({ message: "A senha deve ter pelo menos 6 caracteres" })
    }
    try {
        const result = await createUsuario(nome, email, cpf, senha)

        res.send(result);
    } catch (e) {

        if (e && e.code == "23505") {
            return res.status(409).json({
                message: "já existe usuario com os dados informados"
            })
        }
        return res.status(409).json({
            message: "Problemas internos no servidor"
        })
    }
}   

module.exports = {
    createUsuarioController,
}