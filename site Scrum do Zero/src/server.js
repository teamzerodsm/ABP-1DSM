const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const router = require("./routes");

dotenv.config({
    quiet: true,
    path: path.resolve(__dirname, "..", ".env")
});

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const publicPath = path.join(__dirname, "..", "public");
const pagesPath = path.join(publicPath, "pages");
const assetsPath = path.join(publicPath, "assets");
const imagensQuestoesPath = path.join(
  __dirname,
  "infra",
  "init",
  "seed-data",
  "imagens",
);

app.use("/", express.static(pagesPath));
app.use("/assets", express.static(assetsPath));
app.use("/imagens/questoes", express.static(imagensQuestoesPath));
app.use("/api", router);

app.get("/index", function(_req, res){
    res.sendFile(path.join(pagesPath, "index.html"));
});

app.get("/main", function(_req, res){
    res.sendFile(path.join(pagesPath, "main.html"));
});

app.get("/cadastro", function(_req, res){
    res.sendFile(path.join(pagesPath, "cadastro.html"));
});

app.get("/perfil", function(_req, res){
    res.sendFile(path.join(pagesPath, "perfil.html"));
});

app.get("/progresso", function(_req, res){
    res.sendFile(path.join(pagesPath, "progresso.html"));
});

app.get("/quiz-page", function(_req, res){
    res.sendFile(path.join(pagesPath, "quiz-page.html"));
});

app.get("/certificado", function(_req, res){
    res.sendFile(path.join(pagesPath, "certificado.html"));
});

app.use(function(_req,res){
    res.redirect("not-found.html");
});

app.listen(PORT, function () {
    console.log(`Rodando em http://localhost:${PORT}`);
});
