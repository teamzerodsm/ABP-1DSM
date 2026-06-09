const { Router } = require("express");
const {
  buscarCertificadoPorHashController,
} = require("../controllers/certificado.controller");

const router = Router();

/*
curl -X GET http://localhost:3000/api/certificados/hash/HASH_DO_CERTIFICADO
*/
router.get("/hash/:hash", buscarCertificadoPorHashController);

module.exports = router;

