const { Router } = require("express");
const authmiddleware = require("../middlewares/auth.middleware");
const {
  createUsuarioController,
  getUsuarioLogadoController,
  updatePerfilController,
  updateCpfController,
  updateNomeController,
  updateEmailController,
  updateSenhaController,
} = require("../controllers/usuario.controller");

const router = Router();

/* POST CRIAR USUÁRIO
curl -X POST http://localhost:3000/api/usuarios \
  -H "Content-Type: application/json" \
  -d '{"nome":"lucas","email":"lucas@email.com","cpf":"21345678901","senha":"123456"}'
*/
router.post("/", createUsuarioController);

/* GET DADOS DO USUÁRIO LOGADO */
router.get("/me", authmiddleware, getUsuarioLogadoController);

/* PUT ATUALIZAR PERFIL DO USUÁRIO LOGADO */
router.put("/me", authmiddleware, updatePerfilController);

router.patch("/cpf", authmiddleware, updateCpfController);
router.patch("/nome", authmiddleware, updateNomeController);
router.patch("/email", authmiddleware, updateEmailController);
router.patch("/senha", authmiddleware, updateSenhaController);
module.exports = router;
