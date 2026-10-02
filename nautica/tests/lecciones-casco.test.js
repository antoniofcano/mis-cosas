import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LAMINAS } from '../src/illustrations/lecciones/casco.js';

const variantes = (tipo, def) => {
  const specs = [def.ejemplo, { tipo }];
  for (const [p, vals] of Object.entries(def.params)) {
    if (!Array.isArray(vals)) continue;
    for (const v of vals) specs.push({ tipo, [p]: v });
  }
  if (def.params.vista && def.params.resaltar) for (const vista of def.params.vista) for (const r of def.params.resaltar) specs.push({ tipo, vista, resaltar: r });
  return specs;
};

for (const [tipo, def] of Object.entries(LAMINAS)) {
  test(`lámina ${tipo}: dibuja el ejemplo y todas las variantes`, () => {
    assert.equal(def.ejemplo.tipo, tipo);
    for (const spec of variantes(tipo, def)) {
      const r = def.fn(spec);
      const msg = JSON.stringify(spec);
      assert.ok(r.svg.startsWith('<svg') && r.svg.endsWith('</svg>'), msg);
      assert.ok(!/NaN|undefined/.test(r.svg), msg);
      assert.ok(typeof r.caption === 'string' && r.caption.trim().length > 0, msg);
    }
  });
}

test('timón: caña a babor → la proa cae a estribor', () => {
  assert.match(LAMINAS.timon.fn({ tipo: 'timon', vista: 'cana', cana: 'babor' }).caption, /caña a babor → la pala va a estribor → la proa cae a estribor/);
  assert.match(LAMINAS.timon.fn({ tipo: 'timon', vista: 'cana', cana: 'estribor' }).caption, /proa cae a babor/);
});
