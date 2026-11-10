// Cifras de las fichas de vídeo del Patrón de Yate (docs/VIDEOS-PY.md, R-34): cuántas preguntas de los tres bancos
// de PY tocan cada idea, en cuántas convocatorias sale, cuántas están reservadas para el examen final y cuántas tienen
// una discrepancia documentada; y las preguntas públicas que pueden cerrar cada vídeo. Solo lee: no cambia el banco.
//
//   node tools/videos-py.mjs                 tabla de cifras por idea (Markdown)
//   node tools/videos-py.mjs --ejemplos v21  preguntas públicas candidatas de una idea (id, convocatoria, respuesta)
//   node tools/videos-py.mjs --resto         conceptos del PY con 15 preguntas o más que no están en ninguna idea
//   node tools/videos-py.mjs --escribir      regenera en docs/VIDEOS-PY.md la tabla de cifras (<!-- cifras -->) y el
//                                            «Cuánto cae» de cada ficha (<!-- cae:vNN -->)
//   node tools/videos-py.mjs --comprobar     comprueba docs/VIDEOS-PY.md: cada id de pregunta citado (también los
//                                            abreviados de Andalucía, «2024-c1-g03») existe y no es reservada, anulada
//                                            ni retirada; la respuesta citada es la de la plantilla y la pregunta es de
//                                            la idea de su ficha; sin academias ni escuelas; cifras al día. Sale con 1
//                                            si algo falla.
//
// Las cifras cuentan preguntas distintas (una pregunta con dos conceptos de la misma idea cuenta una vez) según el
// etiquetado de data/ejes/<eje>/py/conceptos.json, incluidas las reservadas (son parte del examen real); la columna
// «públicas» las quita. No hay datos de fallos de alumnos: nada de esto mide dificultad.
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { RAIZ, leerJSON } from './bancos/leer.mjs';
import { reservas } from './cuarentena.mjs';

const EJES = ['andalucia', 'dgmm', 'baleares'];
const CORTO = { andalucia: 'And', dgmm: 'DGMM', baleares: 'Bal' };
const DOC = 'docs/VIDEOS-PY.md';
const UT = { 1: 'Seguridad', 2: 'Meteorología', 3: 'Teoría de navegación', 4: 'Carta' };

/** Las ideas de los vídeos: id de ficha, título corto y conceptos del catálogo (data/conceptos) que cuenta. */
export const IDEAS = [
  { id: 'v01', idea: 'Equilibrio estable, indiferente e inestable; metacentro y GM', conceptos: ['estabilidad.equilibrio', 'estabilidad.metacentro', 'estabilidad.altura-metacentrica', 'estabilidad.par-adrizante', 'estabilidad.buque-duro-blando'] },
  { id: 'v02', idea: 'Centro de gravedad y centro de carena: peso y empuje', conceptos: ['estabilidad.centro-gravedad', 'estabilidad.centro-carena', 'estabilidad.desplazamiento'] },
  { id: 'v03', idea: 'Traslado de pesos, consumos y superficies libres', conceptos: ['estabilidad.traslado-vertical', 'estabilidad.traslado-horizontal', 'estabilidad.superficies-libres'] },
  { id: 'v04', idea: 'Zafa hidrostática', conceptos: ['seguridad.equipo.zafa-hidrostatica'] },
  { id: 'v05', idea: 'Radiobaliza (EPIRB) frente a respondedor de radar (SART)', conceptos: ['seguridad.radio.epirb', 'seguridad.radio.sart'] },
  { id: 'v06', idea: 'Rescate con helicóptero', conceptos: ['seguridad.helicoptero.preparacion', 'seguridad.helicoptero.maniobra', 'seguridad.helicoptero.izado'] },
  { id: 'v07', idea: 'Gradiente de presión, isobaras y fuerza del viento', conceptos: ['meteo.presion.gradiente', 'meteo.presion.gradiente-calculo', 'meteo.presion.isobaras'] },
  { id: 'v08', idea: 'Frente frío y frente cálido', conceptos: ['meteo.frentes.frio', 'meteo.frentes.calido', 'meteo.frentes.definicion'] },
  { id: 'v09', idea: 'Oclusión de tipo frío y de tipo cálido', conceptos: ['meteo.frentes.oclusion-tipos', 'meteo.frentes.ocluido'] },
  { id: 'v10', idea: 'Modelos de viento (Euler, geostrófico, gradiente, ciclostrófico, antitríptico)', conceptos: ['meteo.modelos.euler', 'meteo.modelos.geostrofico', 'meteo.modelos.gradiente', 'meteo.modelos.ciclostrofico', 'meteo.modelos.antitriptico', 'meteo.sistemas.buys-ballot'] },
  { id: 'v11', idea: 'Humedad absoluta y relativa, punto de rocío y psicrómetro', conceptos: ['meteo.humedad.absoluta', 'meteo.humedad.relativa', 'meteo.humedad.punto-rocio', 'meteo.humedad.psicrometro'] },
  { id: 'v12', idea: 'Nieblas de radiación, advección y vapor', conceptos: ['meteo.nieblas.definicion', 'meteo.nieblas.clasificacion', 'meteo.nieblas.radiacion', 'meteo.nieblas.adveccion', 'meteo.nieblas.vapor', 'meteo.nieblas.frontal', 'meteo.nieblas.prevision', 'meteo.nieblas.disipacion'] },
  { id: 'v13', idea: 'Nubes por su altura (y los géneros)', conceptos: ['meteo.nubes.altura', 'meteo.nubes.generos', 'meteo.nubes.forma'] },
  { id: 'v14', idea: 'Corrientes de arrastre, de densidad y de gradiente', conceptos: ['meteo.corrientes.clasificacion', 'meteo.corrientes.arrastre', 'meteo.corrientes.densidad', 'meteo.corrientes.gradiente'] },
  { id: 'v15', idea: 'Mar de viento frente a mar de fondo', conceptos: ['meteo.olas.mar-de-viento', 'meteo.olas.mar-de-fondo'] },
  { id: 'v16', idea: 'La hora: TU, hora civil del lugar, husos, hora legal y HRB', conceptos: ['nav.hora.tu-hcl', 'nav.hora.legal-husos', 'nav.hora.hrb'] },
  { id: 'v17', idea: 'Esfera terrestre: meridianos, paralelos, trópicos y círculos polares', conceptos: ['nav.esfera.circulos', 'nav.esfera.tropicos-polares', 'nav.esfera.meridiano-lugar'] },
  { id: 'v18', idea: 'Declinación, desvío y corrección total', conceptos: ['nav.aguja.declinacion', 'nav.aguja.declinacion-actualizar', 'nav.aguja.desvio', 'nav.ct.definicion', 'nav.ct.dm-desvio', 'nav.ct.convertir', 'nav.rumbos.tipos'] },
  { id: 'v19', idea: 'Corrección total por enfilación y por la Polar', conceptos: ['nav.ct.enfilacion', 'nav.ct.polar'] },
  { id: 'v20', idea: 'Abatimiento frente a deriva; rumbo de superficie y efectivo', conceptos: ['nav.viento-corriente.abatimiento', 'nav.rumbos.superficie-efectivo'] },
  { id: 'v21', idea: 'Radar: sintonía, ganancia y filtros', conceptos: ['nav.radar.ajustes'] },
  { id: 'v22', idea: 'Cartas raster y vectoriales', conceptos: ['nav.cartas-electronicas.tipos', 'nav.cartas-electronicas.ecdis-papel'] },
  { id: 'v23', idea: 'AIS: qué muestra y qué no', conceptos: ['nav.ais.sistema', 'nav.ais.datos'] },
  { id: 'v24', idea: 'Siglas del GNSS: HDG, COG, SOG, XTE, DTG…', conceptos: ['nav.gnss.siglas'] },
  { id: 'v25', idea: 'Rumbo a dar con corriente conocida', conceptos: ['carta.corriente.rumbo-a-dar'] },
  { id: 'v26', idea: 'Corriente desconocida', conceptos: ['carta.corriente.desconocida'] },
  { id: 'v27', idea: 'Viento en la carta: rumbo de superficie y rumbo a dar', conceptos: ['carta.viento'] },
  { id: 'v28', idea: 'Situación por líneas de posición no simultáneas', conceptos: ['carta.situacion.no-simultaneas'] },
  { id: 'v29', idea: 'Rumbo y velocidad efectivos con corriente', conceptos: ['carta.corriente.efectiva'] },
  { id: 'v30', idea: 'Mareas: sonda en un instante y hora para una sonda', conceptos: ['mareas.sonda-instante', 'mareas.hora-sonda', 'mareas.sonda-pleamar-bajamar', 'mareas.anuario'] },
  { id: 'v31', idea: 'Estima analítica directa e inversa', conceptos: ['carta.loxodromica.directa', 'carta.loxodromica.inversa', 'nav.loxodromica.conceptos'] },
  { id: 'v32', idea: 'Rumbo para pasar a una distancia de un faro', conceptos: ['carta.pasar-distancia'] },
];

const leerEje = (eje) => {
  const preguntas = leerJSON(`data/ejes/${eje}/py/preguntas.json`).preguntas;
  const conceptos = leerJSON(`data/ejes/${eje}/py/conceptos.json`);
  const ex = leerJSON(`data/ejes/${eje}/py/explicaciones.json`);
  return { preguntas, conceptos, explicaciones: ex.explicaciones ?? ex };
};

/** Las cifras de cada idea. */
export async function cifras() {
  const { reservadas } = await reservas();
  const datos = Object.fromEntries(EJES.map((e) => [e, leerEje(e)]));
  const convsDeEje = Object.fromEntries(EJES.map((e) => [e, new Set(datos[e].preguntas.flatMap((q) => (q.apareceEn ?? [{ conv: q.conv }]).map((a) => a.conv)))]));
  return IDEAS.map((idea) => {
    const set = new Set(idea.conceptos);
    const fila = { ...idea, porEje: {}, convs: {}, totalConvs: {}, total: 0, publicas: 0, reservadas: 0, anuladas: 0, discrepancias: 0, ut: {}, ids: [] };
    for (const e of EJES) {
      const { preguntas, conceptos, explicaciones } = datos[e];
      const qs = preguntas.filter((q) => (conceptos[q.id] ?? []).some((c) => set.has(c)));
      fila.porEje[e] = qs.length;
      fila.total += qs.length;
      const convs = new Set(qs.flatMap((q) => (q.apareceEn ?? [{ conv: q.conv }]).map((a) => a.conv)));
      fila.convs[e] = convs.size;
      fila.totalConvs[e] = convsDeEje[e].size;
      for (const q of qs) {
        const res = reservadas.has(q.id);
        if (res) fila.reservadas++; else fila.publicas++;
        if (q.anulada) fila.anuladas++;
        if (!res && !q.anulada && explicaciones[q.id]?.discrepancia) fila.discrepancias++;
        fila.ut[q.ut] = (fila.ut[q.ut] ?? 0) + 1;
        fila.ids.push({ q, e, res, ex: explicaciones[q.id] });
      }
    }
    return fila;
  });
}

const temaDe = (ut) => Object.entries(ut).sort((a, b) => b[1] - a[1]).map(([u, n], i, arr) => (arr.length > 1 ? `${UT[u]} (${n})` : UT[u])).join(', ');

/** Tabla Markdown de cifras. */
export function tabla(filas) {
  const cab = '| Ficha | Idea | Tema del examen | And | DGMM | Bal | Total | Públicas | Reservadas | Convocatorias con ella (And · DGMM · Bal) | Discrepancias |\n|---|---|---|---|---|---|---|---|---|---|---|';
  const lineas = filas.map((f) => `| ${f.id} | ${f.idea} | ${temaDe(f.ut)} | ${f.porEje.andalucia} | ${f.porEje.dgmm} | ${f.porEje.baleares} | **${f.total}** | ${f.publicas} | ${f.reservadas} | ${EJES.map((e) => `${f.convs[e]}/${f.totalConvs[e]}`).join(' · ')} | ${f.discrepancias} |`);
  return `${cab}\n${lineas.join('\n')}`;
}

const una = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();
const NOMBRE = { andalucia: 'Andalucía', dgmm: 'la DGMM', baleares: 'Baleares' };
const MODULO = { 1: 'módulo genérico, sin límite propio de fallos', 2: 'módulo genérico, sin límite propio de fallos', 3: 'módulo de navegación; el tema admite como mucho 5 fallos', 4: 'módulo de navegación; el tema admite como mucho 3 fallos' };

/** «Cuánto cae» de una ficha (el texto que va entre <!-- cae:vNN --> y <!-- /cae:vNN -->). */
export function cae(f) {
  const uts = Object.entries(f.ut).sort((a, b) => b[1] - a[1]);
  const tema = uts.length === 1
    ? `${UT[uts[0][0]]} (${MODULO[uts[0][0]]})`
    : `${uts.map(([u, n]) => `${UT[u]} ${n}`).join(', ')} (el grueso, ${MODULO[uts[0][0]]})`;
  return `**${f.total} preguntas**: Andalucía ${f.porEje.andalucia}, DGMM ${f.porEje.dgmm}, Baleares ${f.porEje.baleares} `
    + `(${f.publicas} publicadas para estudiar y ${f.reservadas} reservadas para el examen final). `
    + `Sale en ${EJES.map((e) => `${f.convs[e]} de ${f.totalConvs[e]} convocatorias de ${NOMBRE[e]}`).join(', ')}. Tema: ${tema}.`;
}
const MARCA_CAE = /<!-- cae:(v\d\d) -->[\s\S]*?<!-- \/cae:\1 -->/g;

/** Preguntas públicas (ni reservadas, ni anuladas, ni retiradas) de una idea, las de discrepancia al final. */
export function ejemplos(fila) {
  return fila.ids.filter(({ q, res }) => !res && !q.anulada && q.norma?.estado !== 'retirada')
    .sort((a, b) => Number(Boolean(a.ex?.discrepancia)) - Number(Boolean(b.ex?.discrepancia)) || (b.q.fecha ?? '').localeCompare(a.q.fecha ?? ''));
}

/** Conceptos con preguntas de PY que no están en ninguna idea, de más a menos. */
function resto(min = 15) {
  const usados = new Set(IDEAS.flatMap((i) => i.conceptos));
  const cuenta = new Map();
  for (const e of EJES) for (const cs of Object.values(leerEje(e).conceptos)) for (const c of cs) if (!usados.has(c)) cuenta.set(c, (cuenta.get(c) ?? 0) + 1);
  return [...cuenta].filter(([, n]) => n >= min).sort((a, b) => b[1] - a[1]);
}

const MARCA = /<!-- cifras -->[\s\S]*?<!-- \/cifras -->/;

/** Comprueba el documento. → lista de problemas. */
export async function comprobar(texto, filas) {
  const { reservadas, porId } = await reservas();
  const mal = [];
  if (/academia|escuela/i.test(texto)) mal.push('menciona una academia o escuela');
  const m = texto.match(MARCA);
  if (!m) mal.push('falta el bloque <!-- cifras --> … <!-- /cifras -->');
  else if (!m[0].includes(tabla(filas))) mal.push('la tabla de cifras no está al día: node tools/videos-py.mjs --escribir');
  for (const f of filas) {
    const b = texto.match(new RegExp(`<!-- cae:${f.id} -->([\\s\\S]*?)<!-- /cae:${f.id} -->`));
    if (!b) mal.push(`${f.id}: falta su bloque <!-- cae:${f.id} -->`);
    else if (b[1].trim() !== cae(f)) mal.push(`${f.id}: «Cuánto cae» no está al día: node tools/videos-py.mjs --escribir`);
  }
  const idsIdea = new Map(filas.map((f) => [f.id, new Set(f.ids.map(({ q }) => q.id))]));
  const conDiscrepancia = new Set(filas.flatMap((f) => f.ids.filter(({ ex }) => ex?.discrepancia).map(({ q }) => q.id)));
  // Cada id de pregunta citado (and-py-…, dgmm-py-…, bal-py-…), y los abreviados de Andalucía («2024-c1-g03»).
  const citados = new Set([...texto.matchAll(/\b((?:and|dgmm|bal)-py-[\w-]*\w)/g)].map((m) => m[1]));
  for (const [, a] of texto.matchAll(/(?<![\w-])(20\d\d-c\d-[gn]\d\d)\b/g)) citados.add(`and-py-${a}`);
  for (const id of citados) {
    const q = porId.get(id);
    if (!q) { mal.push(`${id}: no existe`); continue; }
    if (reservadas.has(id)) mal.push(`${id}: reservada para el examen final`);
    if (q.anulada) mal.push(`${id}: anulada`);
    if (q.norma?.estado === 'retirada') mal.push(`${id}: retirada`);
  }
  // En las fichas, «id … Respuesta: x)» tiene que ser la de la plantilla, y la pregunta, de una idea de la ficha.
  for (const bloque of texto.split(/\n(?=### )/)) {
    const ficha = bloque.match(/^### (v\d\d)/)?.[1];
    if (!ficha) continue;
    for (const [, id, letra] of bloque.matchAll(/`((?:and|dgmm|bal)-py-[\w-]+)`[^\n]*?Respuesta(?: oficial)?: \*\*([a-d])\)/g)) {
      const q = porId.get(id);
      if (q && q.correcta !== letra) mal.push(`${ficha} ${id}: la plantilla da ${q.correcta}), no ${letra})`);
      if (q && !idsIdea.get(ficha)?.has(id)) mal.push(`${ficha} ${id}: no está etiquetada con ningún concepto de la ficha`);
      if (conDiscrepancia.has(id)) mal.push(`${ficha} ${id}: tiene una discrepancia documentada; elige otra para cerrar el vídeo`);
    }
  }
  return mal;
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split('/').pop())) {
  const filas = await cifras();
  const arg = process.argv;
  if (arg.includes('--ejemplos')) {
    const f = filas.find((x) => x.id === arg[arg.indexOf('--ejemplos') + 1]);
    if (!f) { console.error('Idea desconocida'); process.exit(1); }
    for (const { q, ex } of ejemplos(f)) {
      console.log(`${q.id} · ${q.convocatoria} · ${una(q.enunciado)}\n   → ${q.correcta}) ${una(q.opciones?.[q.correcta])}${ex?.trampa ? `\n   trampa: ${una(ex.trampa)}` : ''}${ex?.discrepancia ? `\n   DISCREPANCIA: ${una(ex.discrepancia)}` : ''}`);
    }
  } else if (arg.includes('--resto')) {
    for (const [c, n] of resto()) console.log(String(n).padStart(4), c);
  } else if (arg.includes('--escribir')) {
    const ruta = join(RAIZ, DOC);
    const texto = readFileSync(ruta, 'utf8');
    if (!MARCA.test(texto)) { console.error(`${DOC}: falta el bloque <!-- cifras --> … <!-- /cifras -->`); process.exit(1); }
    const porId = new Map(filas.map((f) => [f.id, f]));
    writeFileSync(ruta, texto.replace(MARCA, `<!-- cifras -->\n${tabla(filas)}\n<!-- /cifras -->`)
      .replace(MARCA_CAE, (m, id) => (porId.has(id) ? `<!-- cae:${id} -->\n${cae(porId.get(id))}\n<!-- /cae:${id} -->` : m)));
    console.log(`${DOC}: cifras de ${filas.length} ideas`);
  } else if (arg.includes('--comprobar')) {
    const mal = await comprobar(readFileSync(join(RAIZ, DOC), 'utf8'), filas);
    for (const m of mal) console.error(m);
    console.log(mal.length ? `${mal.length} problemas` : `${DOC}: bien`);
    process.exit(mal.length ? 1 : 0);
  } else console.log(tabla(filas));
}
