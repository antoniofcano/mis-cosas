// D1 de mentira para las pruebas rápidas: la misma API que usa el Worker (prepare/bind/first/all/run/batch) sobre
// SQLite de Node (node:sqlite), sin red ni workerd. Las pruebas de integracion.test.js usan el D1 local de verdad.
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';

export function d1Memoria(esquema = new URL('../schema.sql', import.meta.url)) {
  const db = new DatabaseSync(':memory:');
  db.exec(readFileSync(esquema, 'utf8'));
  let consultas = 0;
  const ejecuta = (sql, params) => {
    consultas += 1;
    const st = db.prepare(sql);
    const lee = /^\s*(SELECT|WITH)|RETURNING/i.test(sql);
    if (lee) return { results: st.all(...params), meta: { changes: 0 } };
    const r = st.run(...params);
    return { results: [], meta: { changes: Number(r.changes) } };
  };
  const stmt = (sql, params = []) => ({
    bind: (...p) => stmt(sql, p),
    first: async (col) => { const r = ejecuta(sql, params).results[0] ?? null; return col ? r?.[col] ?? null : r; },
    all: async () => ejecuta(sql, params),
    run: async () => ejecuta(sql, params),
    _sql: sql,
    _params: params,
  });
  return {
    prepare: (sql) => stmt(sql),
    async batch(stmts) {
      db.exec('BEGIN');
      try {
        const out = stmts.map((s) => ejecuta(s._sql, s._params));
        db.exec('COMMIT');
        return out;
      } catch (e) { db.exec('ROLLBACK'); throw e; }
    },
    sqlite: db,
    consultas: () => consultas,
  };
}
