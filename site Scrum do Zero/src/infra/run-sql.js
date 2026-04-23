const fs = require("fs/promises");
const path = require("path");
const pool = require("../database/db");

const projectRoot = path.resolve(__dirname, "..", "..");
const sqlDir = path.resolve(__dirname, "init");
const seedDataDir = path.resolve(sqlDir, "seed-data");

// A ordem importa: esse array define a sequência exata de execução dos scripts.
const sqlFiles = [
  "01_schema_modulos.sql",
  "02_schema_questoes.sql",
  "03_schema_usuarios.sql",
  "04_schema_exames.sql",
  "05_schema_respostas.sql",
  "06_seed_modulos.sql",
  "07_seed_questoes.sql",
];

const seedConfigs = {
  "06_seed_modulos.sql": {
    csv: "modulos.csv",
    table: "modulos",
    columns: ["id_modulo", "titulo"],
    conflictColumn: "id_modulo"
  },
  "07_seed_questoes.sql": {
    csv: "questoes.csv",
    table: "questoes",
    columns: ["id_questao", "id_modulo", "grupo", "numero", "dificuldade", "enunciado", "alternativa_correta", "alternativa_a", "alternativa_b", "alternativa_c", "alternativa_d", "imagem"],
    conflictColumn: "id_questao"
  }
};

async function runSqlFiles() {
  const files = sqlFiles.map((fileName) => path.join(sqlDir, fileName));

  if (files.length === 0) {
    throw new Error(`Nenhum arquivo .sql encontrado em ${sqlDir}`);
  }

  try {
    // Lê cada arquivo, ajusta caminhos locais e executa o SQL no banco configurado.
    for (const file of files) {
      const fileName = path.basename(file);
      const relativeFile = path.relative(projectRoot, file).replaceAll(path.sep, "/");

      if (seedConfigs[fileName]) {
        process.stdout.write(`Executando ${relativeFile}... `);
        await seedFromCsv(seedConfigs[fileName]);
        console.log("ok");
      } else {
        let sql = await fs.readFile(file, "utf8");
        sql = prepareSql(sql);

        process.stdout.write(`Executando ${relativeFile}... `);
        await pool.query(sql);
        console.log("ok");
      }
    }
  } finally {
    await pool.end();
  }

  console.log(`${files.length} arquivo(s) SQL executado(s).`);
}

async function seedFromCsv(config) {
  const csvPath = path.join(seedDataDir, config.csv);
  const data = await fs.readFile(csvPath, "utf8");
  const lines = data.split("\n").slice(1); // skip header

  for (const line of lines) {
    if (!line.trim()) continue;
    const values = line.split(";").map(v => v.replace(/^"|"$/g, "").trim()); // remove quotes if any
    if (values.length !== config.columns.length) continue; // skip malformed

    const placeholders = values.map((_, i) => `$${i+1}`).join(", ");
    const updateClause = config.columns.slice(1).map(col => `${col} = EXCLUDED.${col}`).join(", ");
    const query = `INSERT INTO public.${config.table} (${config.columns.join(", ")}) VALUES (${placeholders}) ON CONFLICT (${config.conflictColumn}) DO UPDATE SET ${updateClause}`;
    await pool.query(query, values);
  }
}

function prepareSql(sql) {
  // O PostgreSQL espera caminhos com "/" no COPY, inclusive no Windows.
  const postgresPath = seedDataDir.replaceAll("\\", "/");

  // Substitui o placeholder usado nos .sql pelo caminho real dos arquivos CSV.
  return sql.replace(/__SEED_DATA_DIR__/g, postgresPath);
}

runSqlFiles().catch((error) => {
  console.error("Erro ao executar arquivos SQL:");
  console.error(error.message);
  process.exitCode = 1;
});