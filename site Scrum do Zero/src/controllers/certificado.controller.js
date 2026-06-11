const {
  buscarCertificadoPorHash,
} = require("../services/certificado.service");

async function buscarCertificadoPorHashController(req, res) {
  const certificadoHash = String(req.params.hash || "").trim();

  if (!certificadoHash) {
    return res.status(400).json({
      message: "hash do certificado obrigatório",
    });
  }

  try {
    const certificado = await buscarCertificadoPorHash(certificadoHash);

    if (!certificado) {
      return res.status(404).json({
        message: "certificado inexistente para o hash informado",
      });
    }

    if (certificado.indisponivel) {
      return res.status(409).json({
        message: certificado.motivo,
      });
    }

    return res.status(200).json(certificado);
  } catch (e) {
    return res.status(500).json({
      message: "erro interno do servidor",
    });
  }
}

module.exports = {
  buscarCertificadoPorHashController,
};
