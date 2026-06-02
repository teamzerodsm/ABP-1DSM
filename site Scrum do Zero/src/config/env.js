const path = require("path");
const dotenv = require("dotenv");

dotenv.config({
  quiet: true,
  path: path.resolve(__dirname, "..", "..", ".env"),
});
