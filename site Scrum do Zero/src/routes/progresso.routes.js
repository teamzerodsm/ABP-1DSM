const { Router } = require("express");
const authmiddleware = require("../middlewares/auth.middleware");
const {
  obterHistoricoProgressoController,
} = require("../controllers/progresso.controller");

const router = Router();

router.get("/historico", authmiddleware, obterHistoricoProgressoController);
router.get("/tentativas", authmiddleware, obterHistoricoProgressoController);

module.exports = router;
