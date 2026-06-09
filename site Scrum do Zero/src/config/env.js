const path = require("path");
const dotenv = require("dotenv");
dotenv.config({
  quiet: true,
  path: path.resolve(__dirname, "..", "..", ".env"),
});


module.exports = {
    ports: process.env.PORT,

    database: {
        host: process.env.POSTGRES_HOST || "localhost",
        user: process.env.POSTGRES_USER || "postgres",
        password: process.env.POSTGRES_PASSWORD || "postgres",
        database: process.env.POSTGRES_DB || "scrum_do_zero",
        port: process.env.POSTGRES_PORT || 5432,
    },

jwt: {
        secret: process.env.JWT_SECRET || "seu_secret_key_aqui",
        expiresInSeconds: Number(process.env.DEFAULT_EXPIRES_IN_SECONDS) || 3600
    }
};
