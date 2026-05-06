const path = require("path");
const dotenv = require("dotenv");
dotenv.config({
  quiet: true,
  path: path.resolve(__dirname, "..", "..", ".env"),
});

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
    host: process.env.POSTGRES_HOST,
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
    port: process.env.POSTGRES_PORT,
  }
};

const pool = new Pool(config);

module.exports = pool;