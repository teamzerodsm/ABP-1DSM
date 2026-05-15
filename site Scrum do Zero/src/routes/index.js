const { Router } = require("express");
const usuarios = require("./usuarios.routes");
const questoes = require("./questoes.routes");
const exames = require("./exames.routes");
const auth = require("./auth.routes");
const certificados = require("./certificados.routes");

const router = Router();

router.use("/usuarios", usuarios);
router.use("/questoes", questoes);
router.use("/exames", exames);
router.use("/certificados", certificados);
router.use("/auth", auth);

router.use(function(_req,res){
    res.status(404).json({message: "Rota inexistente"});
})

module.exports = router;