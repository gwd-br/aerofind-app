const SCHEMA_SQL = `
  CREATE TABLE IF NOT EXISTS chamados_local (
    id TEXT PRIMARY KEY,
    uuid TEXT,
    numero INTEGER,
    id_cliente TEXT,
    id_tecnico TEXT,
    cdobra TEXT,
    dt_chamado TEXT,
    tipo TEXT,
    situacao TEXT,
    defeitos TEXT,
    providen TEXT,
    obs TEXT,
    h_chegada TEXT,
    h_saida TEXT,
    satisfacao INTEGER,
    comentario TEXT,
    dt_execucao TEXT,
    updated_at TEXT,
    deleted_at TEXT,
    sync_status TEXT
  );

  CREATE TABLE IF NOT EXISTS sync_queue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    record_id TEXT,
    action TEXT,
    payload TEXT,
    created_at TEXT
  );
`;

/** Executa os CREATE TABLE. Recebe a instância do DB para evitar importar sqlite (ciclo). */
export async function runSchema(db: {
  execute: (sql: string) => Promise<unknown>;
}) {
  await db.execute(SCHEMA_SQL);
}
