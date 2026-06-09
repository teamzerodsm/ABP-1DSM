const {
  findCertificadoByHash,
} = require("../repositories/certificados.repository");

async function buscarCertificadoPorHash(certificadoHash) {
  return findCertificadoByHash(certificadoHash);
}

module.exports = {
  buscarCertificadoPorHash,
};
