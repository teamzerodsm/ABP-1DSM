const env = require("./config/env");

const PORT = env.ports;

const app = require("./app");

app.listen(PORT, function () {
  console.log(`Rodando em http://localhost:${PORT}`);
});
