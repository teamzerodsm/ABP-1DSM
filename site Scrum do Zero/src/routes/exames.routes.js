/*
PASSO A PASSO PARA TESTAR O SISTEMA DE EXAMES (PROVA FECHADA)

1. CRIAR USUÁRIO
curl -X POST http://localhost:3000/api/usuarios \
  -H "Content-Type: application/json" \
  -d '{"nome":"João Silva","email":"joao@email.com","cpf":"12345678901","senha":"123456"}'

2. FAZER LOGIN
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"cpf":"12345678901", "senha":"123456"}'
# Copie o token retornado

3. INICIAR EXAME NO MÓDULO 2
curl -X POST http://localhost:3000/api/exames \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '{"id_modulo": 2}'
# Copie o id_exame e as id_questao das questões retornadas

4. RESPONDER TODAS AS QUESTÕES
curl -X POST http://localhost:3000/api/exames/ID_EXAME/respostas \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN" \
  -d '[
    {"id_questao": 11, "resposta": "a"},
    {"id_questao": 12, "resposta": "b"},
    {"id_questao": 13, "resposta": "c"},
    {"id_questao": 14, "resposta": "d"},
    {"id_questao": 15, "resposta": "a"},
    {"id_questao": 16, "resposta": "b"},
    {"id_questao": 17, "resposta": "c"},
    {"id_questao": 18, "resposta": "d"},
    {"id_questao": 19, "resposta": "a"},
    {"id_questao": 20, "resposta": "b"}
  ]'

5. VER HISTÓRICO DE EXAMES
curl -X GET http://localhost:3000/api/exames/historico \
  -H "Authorization: Bearer SEU_TOKEN"

6. REVISAR EXAME (VER RESPOSTAS CORRETAS)
curl -X GET http://localhost:3000/api/exames/ID_EXAME/revisao \
  -H "Authorization: Bearer SEU_TOKEN"

NOTAS:
- Máximo 2 tentativas por módulo
- Histórico mostra tentativas restantes por módulo
- Questões são embaralhadas aleatoriamente
- Sistema impede mais de 2 tentativas no mesmo módulo
*/

const { Router } = require("express");
const authmiddleware = require("../middlewares/auth.middleware");
const {
  startExam,
  getExam,
  submitExamResponses,
  listUserExams,
  reviewExam,
} = require("../services/exames.services");

const router = Router();

router.post("/", authmiddleware, async function (req, res) {
  try {
    const { id_modulo } = req.body;
    if (!id_modulo) {
      return res.status(400).json({ message: "id_modulo é obrigatório" });
    }

    const result = await startExam(req.usuario.id_usuario, id_modulo);
    return res.status(201).json(result);
  } catch (e) {
    console.error(e);
    return res.status(e.status || 500).json({ message: e.message || "Erro interno do servidor" });
  }
});

router.get("/historico", authmiddleware, async function (req, res) {
  try {
    const history = await listUserExams(req.usuario.id_usuario);
    return res.status(200).json(history);
  } catch (e) {
    console.error(e);
    return res.status(500).json({ message: "Erro interno do servidor" });
  }
});

router.get("/:id", authmiddleware, async function (req, res) {
  try {
    const examId = Number(req.params.id);
    const result = await getExam(req.usuario.id_usuario, examId);
    return res.status(200).json(result);
  } catch (e) {
    console.error(e);
    return res.status(e.status || 500).json({ message: e.message || "Erro interno do servidor" });
  }
});

router.post("/:id/respostas", authmiddleware, async function (req, res) {
  try {
    const examId = Number(req.params.id);
    const answers = req.body;
    const result = await submitExamResponses(req.usuario.id_usuario, examId, answers);
    return res.status(201).json(result);
  } catch (e) {
    console.error(e);
    return res.status(e.status || 500).json({ message: e.message || "Erro interno do servidor" });
  }
});

router.get("/:id/revisao", authmiddleware, async function (req, res) {
  try {
    const examId = Number(req.params.id);
    const result = await reviewExam(req.usuario.id_usuario, examId);
    return res.status(200).json(result);
  } catch (e) {
    console.error(e);
    return res.status(e.status || 500).json({ message: e.message || "Erro interno do servidor" });
  }
});

module.exports = router;
