const env = require("../config/env");

//Configuração do banco de dados
const { Pool } = require("pg");
let config;
if (process.env.DATABASE_URL){
  config = {
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  };
} else{
  config = {
    host: env.database.host,
    user: env.database.user,
    password: env.database.password,
    database: env.database.database,
    port: env.database.port,
  }
};

const pool = new Pool(config);

module.exports = pool;