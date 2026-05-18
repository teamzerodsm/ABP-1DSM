const { Router } = require("express")
const {
    createUsuario,
    updateUsuarioCpf,
    updateUsuarioNome,
    updateUsuarioEmail,
    updateUsuarioSenha,
    findUsuarioById,
    verifyUsuarioSenha
}
    = require("../repositories/usuarios.repositories");

const authmiddleware = require("../middlewares/auth.middleware")

const router = Router()

/* POST CRIAR USUÁRIO
curl -X POST http://localhost:3000/api/usuarios \
  -H "Content-Type: application/json" \
  -d '{"nome":"lucas","email":"lucas@email.com","cpf":"21345678901","senha":"123456"}'
*/

// Rota API para o cadastro, recebe do formulario (req.body) as informações e utiliza do metodo createUsuario
router.post("/", async function (req, res) {
    const { nome, email, cpf, senha } = req.body;
    if (!cpf || !nome || !senha) {
        return res.status(400)
            .json({ message: "Informações invalidas" })
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
})

/* PATCH CPF USUÁRIO
curl -X PATCH http://localhost:3000/api/usuarios/cpf \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF91c3VhcmlvIjozLCJpYXQiOjE3NzYzNzc3NzQsImV4cCI6MTc3NjM4MTM3NH0.s1RbqG4nhFLQGEFG-vov-EWqDT0ZZFhfkggxl0wqzfU" \
  -d '{"cpf":"11122233344"}'
*/

//Rota API atualizar CPF
router.get("/me", authmiddleware, async function (req, res) {
    return res.status(200).json(req.usuario)
})

router.put("/me", authmiddleware, async function (req, res) {
    const idUsuario = req.usuario.id_usuario
    const { nome, email, cpf, senhaAtual, novaSenha, confirmarSenha } = req.body

    if (!nome || !email || !cpf) {
        return res.status(400).json({ message: "Nome, e-mail e CPF são obrigatórios." })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Digite um e-mail válido." })
    }

    const cpfLimpo = cpf.toString().replace(/\D/g, "")
    if (cpfLimpo.length !== 11) {
        return res.status(400).json({ message: "Digite um CPF válido com 11 números." })
    }

    try {
        const usuarioAtual = req.usuario

        if (usuarioAtual.nome !== nome) {
            await updateUsuarioNome(idUsuario, nome)
        }
        if (usuarioAtual.email !== email) {
            await updateUsuarioEmail(idUsuario, email)
        }
        if (usuarioAtual.cpf !== cpfLimpo) {
            await updateUsuarioCpf(idUsuario, cpfLimpo)
        }

        if (novaSenha || confirmarSenha || senhaAtual) {
            if (!senhaAtual) {
                return res.status(400).json({ message: "Senha atual é obrigatória para alterar a senha." })
            }
            if (novaSenha !== confirmarSenha) {
                return res.status(400).json({ message: "A nova senha e a confirmação devem coincidir." })
            }
            if (novaSenha.trim().length < 6) {
                return res.status(400).json({ message: "A senha deve ter pelo menos 6 caracteres." })
            }
            const senhaValida = await verifyUsuarioSenha(idUsuario, senhaAtual)
            if (!senhaValida) {
                return res.status(401).json({ message: "Senha atual incorreta." })
            }
            await updateUsuarioSenha(idUsuario, novaSenha)
        }

        const usuarioAtualizado = await findUsuarioById(idUsuario)
        return res.status(200).json(usuarioAtualizado)
    } catch (e) {
        if (e && e.code === "23505") {
            return res.status(409).json({ message: "Já existe usuário com esses dados." })
        }
        return res.status(500).json({ message: "Problemas internos no servidor" })
    }
})

router.patch("/cpf", authmiddleware, async function (req, res) {
    const idUsuario = req.usuario.id_usuario

    const { cpf } = req.body
    if (!cpf) {
        return res.status(400).json({ message: "cpf é obrigatório" })
    }

    try {
        const result = await updateUsuarioCpf(idUsuario, cpf)
        if (!result) {
            return res.status(404).json({ message: "Usuário não encontrado" })
        }
        const usuario = await findUsuarioById(result.id_usuario)
        return res.status(200).json(usuario)
    } catch (e) {
        if (e && e.code == "23505") {
            return res.status(409).json({
                message: "já existe usuario com o CPF informado"
            })
        }
        return res.status(409).json({
            message: "Problemas internos no servidor"
        })
    }
})

/* PATCH NOME USUÁRIO
curl -X PATCH http://localhost:3000/api/usuarios/nome \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF91c3VhcmlvIjozLCJpYXQiOjE3NzYzNzc3NzQsImV4cCI6MTc3NjM4MTM3NH0.s1RbqG4nhFLQGEFG-vov-EWqDT0ZZFhfkggxl0wqzfU" \
  -d '{"nome":"lala"}'
*/

//Rota API atualizar NOME
router.patch("/nome", authmiddleware, async function (req, res) {
    const idUsuario = req.usuario.id_usuario

    const { nome } = req.body
    if (!nome) {
        return res.status(400).json({ message: "nome é obrigatório" })
    }

    try {
        const result = await updateUsuarioNome(idUsuario, nome)
        if (!result) {
            return res.status(404).json({ message: "Usuário não encontrado" })
        }
        const usuario = await findUsuarioById(result.id_usuario)
        return res.status(200).json(usuario)
    } catch (e) {
        return res.status(409).json({
            message: "Problemas internos no servidor"
        })
    }
})

/* PATCH EMAIL USUÁRIO
curl -X PATCH http://localhost:3000/api/usuarios/email \
  -H "Content-Type: application/json" \
   -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF91c3VhcmlvIjozLCJpYXQiOjE3NzYzNzc3NzQsImV4cCI6MTc3NjM4MTM3NH0.s1RbqG4nhFLQGEFG-vov-EWqDT0ZZFhfkggxl0wqzfU" \
  -d '{"email":"lala@teste.com"}'
*/

//Rota API atualizar EMAIL
router.patch("/email", authmiddleware, async function (req, res) {
    const idUsuario = req.usuario.id_usuario

    const { email } = req.body
    if (!email) {
        return res.status(400).json({ message: "email é obrigatório" })
    }

    try {
        const result = await updateUsuarioEmail(idUsuario, email)
        if (!result) {
            return res.status(404).json({ message: "Usuário não encontrado" })
        }
        const usuario = await findUsuarioById(result.id_usuario)
        return res.status(200).json(usuario)
    } catch (e) {
        if (e && e.code == "23505") {
            return res.status(409).json({
                message: "já existe usuario com o email informado"
            })
        }
        return res.status(409).json({
            message: "Problemas internos no servidor"
        })
    }
})

/* PATCH SENHA USUÁRIO
curl -X PATCH http://localhost:3000/api/usuarios/senha \
  -H "Content-Type: application/json" \
   -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF91c3VhcmlvIjozLCJpYXQiOjE3NzYzNzc3NzQsImV4cCI6MTc3NjM4MTM3NH0.s1RbqG4nhFLQGEFG-vov-EWqDT0ZZFhfkggxl0wqzfU" \
  -d '{"senha":"123456"}'
*/

//Rota API atualizar SENHA
router.patch("/senha", authmiddleware, async function (req, res) {
    const idUsuario = req.usuario.id_usuario

    const { senha } = req.body
    if (!senha) {
        return res.status(400).json({ message: "senha é obrigatória" })
    }
    if (senha.trim().length < 6) {
        return res
            .status(400)
            .json({ message: "A senha deve ter pelo menos 6 caracteres" })
    }

    try {
        const result = await updateUsuarioSenha(idUsuario, senha)
        if (!result) {
            return res.status(404).json({ message: "Usuário não encontrado" })
        }
        const usuario = await findUsuarioById(result.id_usuario)
        return res.status(200).json(usuario)
    } catch (e) {
        return res.status(409).json({
            message: "Problemas internos no servidor"
        })
    }
})

//Metodo definir id do usuario
function getIdUsuario(params) {
    const idUsuario = Number(params.idusuario)

    if (!Number.isInteger(idUsuario) || idUsuario <= 0) {
        return null
    }
    return idUsuario

}

module.exports = router;