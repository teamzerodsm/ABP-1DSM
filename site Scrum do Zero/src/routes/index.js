const { Router } = require("express")
const usuarios = require("./usuarios.routes")
const questoes = require("./questoes.routes")
const auth = require("./auth.routes")

const router = Router()

//Define rotas das api's
router.use("/usuarios", usuarios)
router.use("/questoes", questoes)
router.use("/auth", auth)

router.use(function(_req,res){
    res.status(404).json({message: "Rota inexistente"})
})

module.exports = router;