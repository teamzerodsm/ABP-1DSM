const { Router } = require("express");
const usuarios = require("./usuarios.routes");
const exames = require("./exames.routes");
const progresso = require("./progresso.routes");
const auth = require("./auth.routes");
const certificados = require("./certificados.routes");

const router = Router();

router.use("/usuarios", usuarios);
router.use("/exames", exames);
router.use("/progresso", progresso);
router.use("/certificados", certificados);
router.use("/auth", auth);

router.use(function(_req,res){
    res.status(404).json({message: "Rota inexistente"});
})

module.exports = router;