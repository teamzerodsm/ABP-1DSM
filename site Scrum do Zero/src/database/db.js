const env = require("../config/env");

//Configuração do banco de dados
const { Pool } = require("pg");

const usingDatabaseUrl = Boolean(process.env.DATABASE_URL);
console.log("[DB DEBUG] DATABASE_URL set:", usingDatabaseUrl);
console.log("[DB DEBUG] Postgres env vars:", {
  host: process.env.POSTGRES_HOST || env.database.host,
  user: process.env.POSTGRES_USER || env.database.user,
  database: process.env.POSTGRES_DB || env.database.database,
  port: process.env.POSTGRES_PORT || env.database.port,
});

let config;
if (usingDatabaseUrl) {
  config = {
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  };
} else {
  config = {
    host: env.database.host,
    user: env.database.user,
    password: env.database.password,
    database: env.database.database,
    port: env.database.port,
  };
}

const pool = new Pool(config);

module.exports = pool;