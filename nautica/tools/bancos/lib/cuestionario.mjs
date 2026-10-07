// Analizador genérico de cuestionarios en texto (salida de pdftotext): preguntas numeradas con opciones a)–d).
// Cada adaptador le pasa sus reglas (formato del número, de las opciones, secciones, cabeceras y bloques de contexto).
import { limpiar } from './texto.mjs';

/**
 * @param {string} texto  salida de pdftotext (con \f entre páginas)
 * @param {object} reglas
 *   numero: RegExp con (número)(resto)            p. ej. /^(\d{1,2})\s*\.\s*(.*)$/
 *   opcion: RegExp con (letra)(resto)              p. ej. /^([a-d])\)\s*(.*)$/
 *   seccion(linea) → nombre | null                 encabezado de unidad o materia
 *   ruido(linea) → bool                            cabeceras y pies que se ignoran
 *   contexto(linea) → bool                         inicio de un bloque de datos compartido (mareas…)
 *   nuevoExamen(linea) → objeto | null             separador de examen dentro del mismo PDF (DGMM)
 *   inicio: RegExp                                  (opcional) línea a partir de la cual empiezan las preguntas
 *   maxNumero                                      número máximo de pregunta
 * @returns {{ examenes: Array<{cabecera, preguntas}> }}
 */
export function analizarCuestionario(texto, reglas) {
  const R = { maxNumero: 45, seccion: () => null, ruido: () => false, contexto: () => false, nuevoExamen: () => null, ...reglas };
  const examenes = [];
  let ex = null;
  let q = null;
  let campo = null;
  let seccion = null;
  let contexto = null;
  let enContexto = false;
  let pagina = 1;
  let iniciado = !R.inicio;
  const nuevo = (cab = {}) => { ex = { cabecera: cab, preguntas: [], lineasPrevias: [] }; examenes.push(ex); q = null; campo = null; seccion = null; contexto = null; enContexto = false; };
  nuevo();
  const cerrar = () => {
    if (!q) return;
    q.enunciado = limpiar(q.enunciado);
    for (const k of Object.keys(q.opciones)) q.opciones[k] = limpiar(q.opciones[k]);
    repararOpciones(q, R);
    q = null;
  };
  for (const pag of texto.split('\f')) {
    for (const bruta of pag.split('\n')) {
      const l = bruta.replace(/ /g, ' ').trim();
      if (!l) continue;
      const cab = R.nuevoExamen(l);
      if (cab) { cerrar(); if (ex.preguntas.length || Object.keys(ex.cabecera).length) nuevo(cab); else ex.cabecera = cab; continue; }
      if (!iniciado) { if (R.inicio.test(l)) iniciado = true; else { ex.lineasPrevias.push(l); continue; } }
      if (R.ruido(l)) continue;
      const sec = R.seccion(l);
      if (sec && (!q || Object.keys(q.opciones).length === 4)) { cerrar(); seccion = sec; contexto = null; enContexto = false; continue; }
      const esperado = (ex.preguntas.at(-1)?.numero ?? 0) + 1;
      const mn = R.numero.exec(l);
      const nOpc = q ? Object.keys(q.opciones).length : 4;
      if (mn && Number(mn[1]) <= R.maxNumero) {
        const n = Number(mn[1]);
        const cuadra = n === esperado || (!ex.preguntas.length && n > 1 && R.permiteInicio?.(n));
        if (cuadra && (nOpc === 4 || (nOpc >= 2 && l.length > 25)) && (!enContexto || l.length > 20)) {
          cerrar();
          enContexto = false;
          q = { numero: n, seccion, enunciado: mn[2], opciones: {}, contexto, pagina };
          ex.preguntas.push(q);
          campo = 'enunciado';
          continue;
        }
      }
      const mo = typeof R.opcion === 'function' ? R.opcion(l) : R.opcion.exec(l);
      if (mo && q && !enContexto) {
        const letra = mo[1].toLowerCase();
        const toca = 'abcd'[nOpc];
        if (letra === toca) { q.opciones[letra] = mo[2]; campo = letra; continue; }
      }
      if (q && nOpc === 4 && R.contexto(l)) { cerrar(); enContexto = true; contexto = l; continue; }
      if (enContexto) { contexto += `\n${l}`; continue; }
      if (!q) { ex.lineasPrevias.push(l); continue; }
      if (campo === 'enunciado') q.enunciado += ` ${l}`;
      else q.opciones[campo] += ` ${l}`;
    }
    pagina++;
  }
  cerrar();
  return { examenes };
}

const LETRAS = 'abcd';
const COORD = /\d{1,3}\s*º\s*\d{1,2}[,.]\d\s*['′´]*\s*[NSEW]/g;

/**
 * Arreglos de maquetación (solo cuando faltan opciones):
 * - opciones en la misma línea («… c) Ct = 6º + d) Ct = 6º –», o «D l= …» sin paréntesis);
 * - opciones en columnas: a), b), c) y d) sin texto y los valores después, por columnas (latitudes y luego longitudes);
 * - un encabezado de bloque («LOXODRÓMICA») pegado al final de la última opción.
 * Exportada para los tests.
 */
export function repararOpciones(q, R = {}) {
  const n0 = Object.keys(q.opciones).length;
  if (n0 === 4 && Object.values(q.opciones).every(Boolean)) return;
  if (n0 === 0) {
    const m = /\s(?:a\)|A[.)])\s*/.exec(q.enunciado);
    if (m) { q.opciones.a = q.enunciado.slice(m.index + m[0].length); q.enunciado = q.enunciado.slice(0, m.index).trim(); }
  }
  let n = Object.keys(q.opciones).length;
  while (n > 0 && n < 4) {
    const ult = LETRAS[n - 1];
    const sig = LETRAS[n];
    const re = new RegExp(`\\s(?:${sig}\\)|${sig.toUpperCase()}[.)]?)\\s+`);
    const m = re.exec(q.opciones[ult]);
    if (!m) break;
    q.opciones[sig] = q.opciones[ult].slice(m.index + m[0].length).trim();
    q.opciones[ult] = q.opciones[ult].slice(0, m.index).trim();
    n++;
  }
  const vacias = [...LETRAS].filter((l) => q.opciones[l] === '');
  if (vacias.length === 3 && q.opciones.d) {
    const cs = q.opciones.d.match(COORD) ?? [];
    if (cs.length === 8) for (let i = 0; i < 4; i++) q.opciones[LETRAS[i]] = `${cs[i].replace(/\s+/g, ' ')} ${cs[i + 4].replace(/\s+/g, ' ')}`;
    else if (cs.length === 4) for (let i = 0; i < 4; i++) q.opciones[LETRAS[i]] = cs[i].replace(/\s+/g, ' ');
  }
  const ultima = LETRAS[Object.keys(q.opciones).length - 1];
  const cola = ultima && /\s([A-ZÁÉÍÓÚÑ]{5,})$/.exec(q.opciones[ultima] ?? '');
  if (cola && R.contexto?.(cola[1])) { q.opciones[ultima] = q.opciones[ultima].slice(0, cola.index).trim(); q.encabezadoPendiente = cola[1]; }
}
