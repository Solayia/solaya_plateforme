import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

export function openDatabase(filename, migrationDir = resolve('drizzle')) {
  mkdirSync(dirname(filename), { recursive: true });
  const connection = new DatabaseSync(filename);
  connection.exec('PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;');
  connection.exec('CREATE TABLE IF NOT EXISTS _migrations (name TEXT PRIMARY KEY)');
  for (const name of readdirSync(migrationDir).filter(n => n.endsWith('.sql')).sort()) {
    connection.exec('BEGIN IMMEDIATE');
    try {
      if (!connection.prepare('SELECT name FROM _migrations WHERE name=?').get(name)) {
        connection.exec(readFileSync(resolve(migrationDir, name), 'utf8'));
        connection.prepare('INSERT INTO _migrations VALUES (?)').run(name);
      }
      connection.exec('COMMIT');
    } catch (e) { connection.exec('ROLLBACK'); throw e; }
  }
  class Statement {
    constructor(sql, args = []) { this.sql = sql; this.args = args; }
    bind(...args) { return new Statement(this.sql, args); }
    first() { return connection.prepare(this.sql).get(...this.args) ?? null; }
    all() { return { results: connection.prepare(this.sql).all(...this.args) }; }
    run() { const result = connection.prepare(this.sql).run(...this.args); return { meta: { changes: Number(result.changes) } }; }
  }
  return {
    prepare(sql) { return new Statement(sql); },
    batch(statements) {
      connection.exec('BEGIN IMMEDIATE');
      try { const results = statements.map(s => s.run()); connection.exec('COMMIT'); return results; }
      catch (e) { connection.exec('ROLLBACK'); throw e; }
    },
    close() { connection.close(); },
  };
}
let instance;
export function database() { return instance ??= openDatabase(process.env.DATABASE_PATH || '/data/solaya.sqlite'); }
