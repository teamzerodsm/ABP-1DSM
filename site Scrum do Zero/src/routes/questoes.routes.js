const { Router } = require("express");
const authmiddleware = require("../middlewares/auth.middleware")
const { findProximaQuestaoByUsuario } = require("../repositories/questoes.repositories");   

const router = Router();

/* GET PRÓXIMA QUESTÃO PENDENTE DO USUÁRIO  
curl -X GET http://localhost:3000/api/questoes/proxima-questao \
  -H "Authorization: Bearer "
*/

//rota API que encontra proxima questão para o usuário
router.get("/proxima-questao", authmiddleware, async function (req, res) {
    try {
        const questao = await findProximaQuestaoByUsuario(req.usuario.id_usuario);
        if (!questao) {
            return res
                .status(404)
                .json({ message: "nenhuma questão pendente encontrada" });
        }
        return res.status(200).json(questao);
    } catch (e) {
        return res.status(500).json({
            message: "erro interno do servidor",
        });
    }
});

module.exports = router;