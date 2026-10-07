// Añade al informe de la extracción (tools/bancos/informes/baleares.md, que escribe la etapa «validar») las
// particularidades de Baleares: documentos descartados, fechas, decisiones sobre repetidas, correcciones, figuras,
// revisión normativa, reserva, explicaciones, soluciones de carta, práctica y estado frente a las puertas de calidad.
// Uso: npm run bancos -- baleares && node tools/bancos/ejes/baleares/informe.mjs
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { BANCOS, RAIZ, dirEje, leerJSON, rutaEtapa } from '../../lib/comun.mjs';
import { utPER } from '../../etapas/clasificar.mjs';

const EJE = 'baleares';
const ruta = join(BANCOS, 'informes', `${EJE}.md`);
const MARCA = '\n## Particularidades de Baleares\n';
const base = readFileSync(ruta, 'utf8').split(MARCA)[0].trimEnd();
const config = leerJSON(join(dirEje(EJE), 'config.json'));
const ficha = leerJSON(join(RAIZ, 'data', 'ejes', EJE, 'eje.json'));
const man = leerJSON(join(dirEje(EJE), 'manifiesto.json'));
const corr = leerJSON(join(dirEje(EJE), 'correcciones.json')).correcciones;
const rep = leerJSON(join(dirEje(EJE), 'repetidas.json')).decisiones;
const tabla = (cab, filas) => (filas.length ? [`| ${cab.join(' | ')} |`, `|${cab.map(() => '---').join('|')}|`, ...filas.map((f) => `| ${f.map((x) => String(x ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ')).join(' | ')} |`)].join('\n') : '_Ninguna._');
const L = [MARCA];

// Documentos
const roles = {};
for (const d of man.documentos) { const k = `${d.tit ?? '—'} · ${d.rol}${d.idioma ? ` (${d.idioma})` : ''}`; roles[k] = (roles[k] ?? 0) + 1; }
L.push('### Documentos', '', 'Un PDF por modelo (isla y turno), con la respuesta impresa tras cada pregunta. La etapa «manifiesto» lee la cabecera de cada PDF para saber titulación, modelo e idioma.', '');
L.push(tabla(['Titulación · rol (idioma)', 'PDF'], Object.entries(roles).sort()), '');
for (const tit of ['per', 'py']) {
  const ex = leerJSON(rutaEtapa(EJE, 'extraer', tit));
  const examenes = new Set(ex.apariciones.map((a) => `${a.conv}|${a.modelo}`));
  L.push(`- ${tit.toUpperCase()}: ${examenes.size} exámenes extraídos (${ex.apariciones.length} apariciones).`);
}
L.push('- Descartados: las versiones en catalán (PER dic-2022 primer turno de Mallorca, PDF 408507; PY de Mallorca de mar-2023, PDF 420397, **que solo existe en catalán**: ese examen falta en el banco) y 4 PDF que repiten otro de la misma página con el mismo modelo (225538, 234244, 290008, 385649).');
L.push('- PER específico (preguntas 28–45, para quien ya tiene el PNB): en Baleares son juegos propios, no un trozo de un PER completo. Entran como exámenes de 18 preguntas (modelos «ESP-…», huecos documentados en config.json).', '');

// Fechas
const aprox = config.convocatorias.filter((c) => c.fechaAproximada).map((c) => c.clave);
L.push('### Fechas', '', `Fecha de cada convocatoria: el primer día de examen (Menorca y Eivissa) según la resolución anual del BOIB o el calendario de la DG. Sin resolución encontrada (${aprox.length} convocatorias), la fecha es el día 1 del mes: ${aprox.join(', ')}. Solo afecta a la comparación con la entrada en vigor de las normas (al mes) y al año de la declinación.`, '');

// Repetidas
const cuenta = (xs, f) => xs.reduce((m, x) => { const k = f(x); m[k] = (m[k] ?? 0) + 1; return m; }, {});
const motivos = cuenta(rep, (d) => `${d.tit} · ${d.decision} · ${d.motivo.replace(/\(.*\)/, '').replace(/«.*»/, '«…»').trim()}`);
L.push('### Preguntas repetidas: decisiones', '', `El tribunal recicla mucho su banco: al copiar las preguntas corrige erratas, cambia la puntuación, reordena o retoca las opciones. La regla genérica de la etapa (umbral de similitud) dejaba miles de parejas como ambiguas; \`decidir-repetidas.mjs\` las decide con una regla más fina (documentada en el propio fichero) y deja cada decisión con su motivo en \`repetidas.json\` (${rep.length} decisiones). Las que siguen sin decidir están en la tabla «Posibles duplicados no unidos» de arriba: no se han unido.`, '');
L.push(tabla(['Titulación · decisión · motivo', 'Parejas'], Object.entries(motivos).sort((a, b) => b[1] - a[1])), '');

// Correcciones
const erratas = corr.filter((c) => c.accion === 'errata');
const revis = corr.filter((c) => c.revision);
L.push('### Correcciones', '', 'Baleares no publica anulaciones ni plantillas revisadas. Erratas aplicadas (fe de erratas de la página y notas «(*) NOTA» del cuadernillo):', '');
L.push(tabla(['Examen', 'nº', 'Cambio', 'Fuente'], erratas.map((c) => [`${c.conv} · ${c.modelo}`, c.numero, `${c.campo}: «${c.buscar}» → «${c.reemplazar}»`, c.fuente])), '');
L.push(`Respuestas contradictorias del propio tribunal entre convocatorias (o modelos) de la misma pregunta: **${revis.length}**, resueltas a mano contra la norma o el cálculo:`, '');
L.push(tabla(['Examen de referencia', 'nº', 'Se toma', 'Motivo'], revis.map((c) => [`${c.conv} · ${c.modelo}`, c.numero, c.letras.join(', '), c.texto])), '');

// Figuras y clasificación
const fig = leerJSON(join(dirEje(EJE), 'figuras.json'), {});
const bancos = Object.fromEntries(['per', 'py'].map((t) => [t, leerJSON(join(RAIZ, 'data', 'ejes', EJE, t, 'preguntas.json')).preguntas]));
const sinFigura = ['per', 'py'].flatMap((t) => bancos[t].filter((q) => /\bim[aá]gen(es)?\b.{0,40}(adjunt|siguiente|observ)|en la imagen|esta imagen/i.test(q.enunciado) && !q.figuras.length).map((q) => [q.id, q.enunciado.slice(0, 120)]));
L.push('### Figuras', '', `${new Set(Object.values(fig).flat()).size} imágenes sacadas de los PDF (figuras.mjs), asignadas a ${['per', 'py'].reduce((s, t) => s + bancos[t].filter((q) => q.figuras.length).length, 0)} preguntas. Preguntas que citan una imagen que el PDF no trae (se explican con lo que dicen las opciones):`, '');
L.push(tabla(['id', 'Enunciado'], sinFigura), '');
const incons = ['per', 'py'].flatMap((t) => bancos[t].filter((q) => new Set(q.apareceEn.map((a) => (t === 'per' ? utPER(a.numero) : Math.ceil(a.numero / 10)))).size > 1).map((q) => [q.id, q.ut, q.apareceEn.map((a) => a.numero).join(', '), q.enunciado.slice(0, 100)]));
L.push('### Tema por posición', '', 'El tema sale de la posición de la primera aparición (reparto 4-2-4-2-5-10-2-3-4-5-4 del PER; 10 + 10 + 10 + 10 del PY). Preguntas que el tribunal ha puesto en posiciones de temas distintos:', '');
L.push(tabla(['id', 'ut', 'Posiciones', 'Enunciado'], incons), '');

// Normativa
L.push('### Revisión normativa', '', 'Todas las preguntas que el detector de `data/normativa.json` marcó «revisar» se han revisado contra el BOE (decisión y nota de cada una en `ajustes.json`, campo `norma`):', '');
for (const t of ['per', 'py']) {
  const c = cuenta(bancos[t].filter((q) => q.norma.normas?.length), (q) => q.norma.estado);
  L.push(`- ${t.toUpperCase()}: ${Object.entries(c).map(([k, v]) => `${v} ${k}`).join(', ')}; quedan «revisar»: ${bancos[t].filter((q) => q.norma.estado === 'revisar').length}.`);
}
L.push('', tabla(['id', 'Estado', 'Nota'], ['per', 'py'].flatMap((t) => bancos[t].filter((q) => ['actualizada', 'retirada'].includes(q.norma.estado)).map((q) => [q.id, q.norma.estado, q.norma.nota]))), '');

// Reserva
L.push('### Reserva para el examen final', '', `Modo «${ficha.reserva.modo}»: las preguntas de ${ficha.reserva.per.join(', ')} (PER) y ${ficha.reserva.py.join(', ')} (PY), y las que aparecen también en ellas, salen de toda la práctica.`, '');
for (const t of ['per', 'py']) {
  const r = bancos[t].filter((q) => q.apareceEn.some((a) => ficha.reserva[t].includes(a.conv)));
  L.push(`- ${t.toUpperCase()}: ${r.length} preguntas reservadas (${r.filter((q) => q.apareceEn.some((a) => !ficha.reserva[t].includes(a.conv))).length} de ellas ya habían salido antes).`);
}
L.push('');

// Explicaciones
L.push('### Explicaciones del profe', '');
for (const t of ['per', 'py']) {
  const ex = leerJSON(join(RAIZ, 'data', 'ejes', EJE, t, 'explicaciones.json'), {});
  const nc = bancos[t].filter((q) => !q.requiere.includes('carta'));
  const con = nc.filter((q) => ex[q.id]?.explicacion);
  const adaptadas = nc.filter((q) => q.concepto?.startsWith('and-')).length;
  L.push(`- ${t.toUpperCase()}: ${con.length} de ${nc.length} preguntas sin carta con explicación; ${adaptadas} adaptadas de una explicación ya revisada del otro banco (concepto \`and-…\`), ${con.length - adaptadas} escritas para Baleares; ${nc.filter((q) => ex[q.id]?.discrepancia).length} con discrepancia frente a la plantilla.`);
}
L.push('');

// Carta
L.push('### Soluciones de carta', '');
const solDir = join(RAIZ, 'src', 'exams', 'solutions');
const ficheros = readdirSync(solDir).filter((f) => /^baleares-(per|py)-\d+\.js$/.test(f));
let disc = 0;
for (const f of ficheros) disc += (readFileSync(join(solDir, f), 'utf8').split('/* DISCREPANCIAS')[1]?.match(/^ \* 'bal-/gm) ?? []).length;
const { default: balSol } = await import(join(RAIZ, 'src', 'bancos', 'ejes', `${EJE}.js`)).catch(() => ({ default: { soluciones: {} } }));
for (const t of ['per', 'py']) {
  const carta = bancos[t].filter((q) => q.requiere.includes('carta'));
  L.push(`- ${t.toUpperCase()}: ${carta.filter((q) => balSol.soluciones[q.id]).length} de ${carta.length} preguntas de carta con solución programada que llega a la oficial.`);
}
L.push(`- En los bloques DISCREPANCIAS de \`src/exams/solutions/baleares-*.js\`: ${disc} preguntas (no llegan a la oficial o necesitan un elemento que la carta de la app no tiene), cada una con su motivo.`);
for (const t of ['per', 'py']) L.push(`- Mareas que necesitan el anuario (\`requiere: ["anuario"]\`), ${t.toUpperCase()}: ${bancos[t].filter((q) => q.requiere.includes('anuario')).length}.`);
L.push('');

// Práctica
const pinf = leerJSON(join(dirEje(EJE), 'practica-informe.json'), null);
if (pinf) {
  L.push('### Práctica por clase', '', 'practica.mjs asigna cada pregunta del estudio a una clase de su tema (concepto revisado del otro banco, pregunta vecina, tipo de ejercicio de carta o palabras clave de la clase); el motivo de cada una está en `practica-informe.json`.', '');
  for (const t of ['per', 'py']) L.push(`- ${t.toUpperCase()}: ${pinf[t].asignadas} preguntas en ${Object.keys(pinf[t].porClase).length} clases; por motivo: ${Object.entries(pinf[t].motivos).map(([k, v]) => `${k} ${v}`).join(', ')}; clases sin práctica: ${pinf[t].sinPractica.length ? pinf[t].sinPractica.join(', ') : 'ninguna'}.`);
  L.push('');
}
writeFileSync(ruta, `${base}\n${L.join('\n')}\n`);
console.log('informe actualizado');
