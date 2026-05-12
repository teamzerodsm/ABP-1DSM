const { Router } = require("express");
const authmiddleware = require("../middlewares/auth.middleware");
const {
  findProximaQuestaoByUsuario,
  findQuestaoDoExameByUsuario,
  findRespostaByExameEQuestao,
  inserirRespostaQuestao,
  usuarioConcluiuModuloAtual,
  findModuloAtualByUsuario,
  findOutroGrupoAleatorio,
  updateProximaTentativa,
  findProximoModuloByUsuario,
  updateProximoModulo,
} = require("../repositories/questoes.repositories");
const router = Router();

/* GET PRÓXIMA QUESTÃO PENDENTE DO USUÁRIO  
curl -X GET http://localhost:3000/api/questoes/proxima-questao \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF91c3VhcmlvIjoyLCJpYXQiOjE3Nzg1NDU4OTMsImV4cCI6MTc3ODU0OTQ5M30.blV0AfIjMxP4YV4OpETQrKfshLLYMnuypiuf5W9-zVc"
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
    
/*
  curl -X POST http://localhost:3000/api/questoes/responder \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF91c3VhcmlvIjoyLCJpYXQiOjE3Nzg1NDU4OTMsImV4cCI6MTc3ODU0OTQ5M30.blV0AfIjMxP4YV4OpETQrKfshLLYMnuypiuf5W9-zVc" \
  -d '{"id_exame": 2, "id_questao": 21, "resposta": "c"}'
*/

router.post("/responder", authmiddleware, async function (req, res) {
  try {
    console.log("body", req.body);
    const { id_exame, id_questao, resposta } = req.body;

    const respostaNormalizada = resposta.trim().toLowerCase();

    // Busca a questão vinculada ao exame e usuário
    const questao = await findQuestaoDoExameByUsuario(req.usuario.id_usuario, id_exame, id_questao);

    if (!questao) {
      return res.status(404).json({
        message: "questão não encontrada para este exame",
      });
    }

    // Verifica se já existe resposta para evitar duplicidade
    const respostaExistente = await findRespostaByExameEQuestao(
      id_exame,
      id_questao
    );

    if (respostaExistente) {
      return res.status(409).json({
        message: "questão já respondida",
      });
    }

    // Calcula a nota (1 para correto, 0 para errado)
    const nota = questao.alternativa_correta === respostaNormalizada ? 1 : 0;

    // Insere no banco de dados
    const respostaInserida = await inserirRespostaQuestao(
      id_exame, 
      id_questao, 
      respostaNormalizada, 
      nota
    );

    return res.status(201).json(respostaInserida);
  } catch (e) {
    console.error(e); // Importante para debug
    return res.status(500).json({
      message: "erro interno do servidor",
    });
  }
});

/*
curl -X PATCH http://localhost:3000/api/questoes/proxima-tentativa \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF91c3VhcmlvIjoyLCJpYXQiOjE3Nzg1NDU4OTMsImV4cCI6MTc3ODU0OTQ5M30.blV0AfIjMxP4YV4OpETQrKfshLLYMnuypiuf5W9-zVc"
*/
router.patch("/proxima-tentativa", authmiddleware, async function (req, res) {
  try {
    // 1. Verifica se o usuário terminou as questões atuais
    const concluido = await usuarioConcluiuModuloAtual(req.usuario.id_usuario);
    if (!concluido) {
      return res.status(409).json({
        message: "você ainda não concluiu todas as questões do módulo atual",
      });
    }

    // 2. Busca os dados do módulo/exame atual
    const modulo = await findModuloAtualByUsuario(req.usuario.id_usuario);
    if (!modulo) {
      return res.status(404).json({
        message: "módulo atual não encontrado",
      });
    }

    // 3. Valida limite de tentativas
    if (modulo.tentativa >= 2) {
      return res.status(409).json({
        message: "limite de 2 tentativas atingido",
      });
    }

    // 4. Busca um novo grupo de questões (diferente do atual)
    const grupo = await findOutroGrupoAleatorio(req.usuario.id_usuario, modulo.id_modulo);
    if (!grupo) {
      return res.status(404).json({
        message: "nenhum grupo alternativo disponível para este módulo",
      });
    }

    // 5. Atualiza o exame para a nova tentativa e novo grupo
    const exame = await updateProximaTentativa(modulo.id_exame, grupo, modulo.tentativa + 1);
    if (!exame) {
      return res.status(404).json({
        message: "exame não encontrado para atualização",
      });
    }

    return res.status(200).json(exame);
  } catch (e) {
    console.error("Erro em /proxima-tentativa:", e);
    return res.status(500).json({
      message: "erro interno do servidor",
    });
  }
});

/*
curl -X PATCH http://localhost:3000/api/questoes/proximo-modulo \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF91c3VhcmlvIjoyLCJpYXQiOjE3Nzg1NDU4OTMsImV4cCI6MTc3ODU0OTQ5M30.blV0AfIjMxP4YV4OpETQrKfshLLYMnuypiuf5W9-zVc"
*/
router.patch("/proximo-modulo", authmiddleware, async function (req, res) {
  try {
    // 1. Verifica se terminou o atual
    const concluido = await usuarioConcluiuModuloAtual(req.usuario.id_usuario);
    if (!concluido) {
      return res.status(409).json({
        message: "você ainda não concluiu todas as questões do módulo atual",
      });
    }

    // 2. Pega os dados do exame/módulo atual para ter o id_exame
    const moduloAtual = await findModuloAtualByUsuario(req.usuario.id_usuario);
    if (!moduloAtual) {
      return res.status(404).json({
        message: "módulo atual não encontrado",
      });
    }

    // 3. Busca o ID do próximo módulo
    const proximoModuloId = await findProximoModuloByUsuario(req.usuario.id_usuario);
    if (!proximoModuloId) {
      return res.status(404).json({
        message: "você concluiu todos os módulos",
      });
    }

    // 4. Sorteia um grupo para o novo módulo
    const grupo = await findOutroGrupoAleatorio(req.usuario.id_usuario, proximoModuloId);
    if (!grupo) {
      return res.status(404).json({
        message: "nenhum grupo disponível para o próximo módulo",
      });
    }

    // 5. Atualiza o exame existente para o novo módulo (resetando tentativa para 1)
    const exame = await updateProximoModulo(moduloAtual.id_exame, proximoModuloId, grupo, 1);
    if (!exame) {
      return res.status(404).json({
        message: "exame não encontrado para atualização",
      });
    }

    return res.status(200).json(exame);
  } catch (e) {
    console.error("Erro em /proximo-modulo:", e);
    return res.status(500).json({
      message: "erro interno do servidor",
    });
  }
});



module.exports = router;