// Corregir la hoja en papel por pasos (R-58; docs/CARTA-MOVIL.md, «El paso al papel»). Lógica sin DOM: la interfaz está
// en src/ui/papel.js.
//
// El alumno resuelve una pregunta de carta en su hoja, como en el examen, y luego mete el resultado de los pasos que
// tiene escritos (no hace falta meterlos todos). La app los compara con la resolución por pasos del kit
// (src/exams/kit.js, los pasos con `pide`) y dice:
//   - en qué paso se desvió primero;
//   - si ese valor es el que sale con un error típico, su nombre («aquí sumaste el adelanto»): se vuelve a resolver la
//     pregunta con cada variante del error (src/exams/taxonomia.js) y con los datos que el alumno escribió antes;
//   - qué pasos siguientes están BIEN HECHOS CON SU DATO: se vuelve a resolver con sus valores en lugar de los calculados
//     (createKit(chart, { fijos })). Si un paso cuadra con lo que sale de sus números anteriores, la cuenta es buena y el
//     error viene arrastrado: no se le marca. Solo cuenta el primer fallo.
//
// Tolerancias: las del paso a paso (src/exams/guiado.js, `toleranciaCampo`): la de examen de cada magnitud
// (src/analysis/quantities.js), el doble en lo que se mide sobre la carta con transportador o compás (`medido`) y por el
// factor de Ajustes. «Casi» (hasta el doble) no es un desvío: avisa del redondeo.

import { createKit } from './kit.js';
import { pasosGuiados, toleranciaCampo, ESTADO } from './guiado.js';
import { VARIANTES, tipoDe, ERRORES } from './taxonomia.js';
import { AVISOS } from './avisos-pasos.js';
import { quantity } from '../analysis/quantities.js';

/** Estado de un paso de la hoja. */
export const PAPEL = {
  OK: 'ok', // cuadra con la resolución
  ARRASTRADO: 'arrastrado', // no cuadra con la resolución, pero sí con lo que sale de tus datos anteriores: bien hecho
  CASI: 'casi', // a un redondeo
  MAL: 'mal', // no cuadra ni con la resolución ni con tus datos
  VACIO: 'vacio', // no lo escribiste
  ILEGIBLE: 'ilegible', // no se entiende lo escrito
  SIN_COMPROBAR: 'sin-comprobar', // con tus datos anteriores no se puede seguir (p. ej. la hora cae fuera de la tabla)
};

/**
 * Teclado del móvil para cada magnitud (atributo `inputmode`). Las que llevan letra o signo (E/W, N/S, ±) van con el
 * teclado de texto: el numérico del iPhone no tiene ni letras ni signo menos.
 */
export const TECLADO = { bearing: 'numeric', clock: 'numeric', meters: 'decimal', distance: 'decimal', speed: 'decimal' };
export const tecladoDe = (kind) => TECLADO[kind] ?? 'text';

/** Margen de un campo en texto: «±1°», «±3 min», «±0,10 m». */
export function margenTexto(campo, factor = 1) {
  const q = quantity(campo.kind);
  const tol = toleranciaCampo(campo, factor);
  const dec = campo.kind === 'meters' ? 2 : Number.isInteger(tol) ? 0 : 1;
  return `±${tol.toFixed(dec).replace('.', ',')}${q.errorUnit.trim() === 'M' ? ' millas' : q.errorUnit.trim() === 'kn' ? ' nudos' : q.errorUnit.replace(/^ /, ' ')}`;
}

/** Ejemplo de cómo se escribe cada magnitud en la hoja (el mismo formato que el paso a paso). */
export const EJEMPLO = {
  bearing: '045', signed: '3 W o −3', minutos: '−68,9', lat: '36 00,5 N', lon: '5 36,5 W', distance: '7,5', speed: '6,2',
  meters: '2,35', duration: '1h25', clock: '14:35',
};

/**
 * Los pasos de la hoja: los preguntables de la resolución, numerados como en el paso a paso.
 * @returns {{ i, n, title, paso, pregunta, campos: {kind, label, medido, value}[], errores: string[] }[]}
 */
export function pasosPapel(steps) {
  return pasosGuiados(steps).filter((p) => p.pide?.campos?.length)
    .map((p, j) => ({ i: p.i, n: j + 1, title: p.title, paso: p.pide.paso, pregunta: p.pide.pregunta, campos: p.pide.campos, errores: p.errores ?? [] }));
}

/** Resuelve con un kit; si la resolución se rompe a medias, los pasos calculados hasta ahí siguen valiendo. */
function resolver(chart, sol, q, opciones) {
  let k = null;
  try { k = createKit(chart, opciones); sol.solve(k, q); return { steps: k.steps, roto: false }; } catch { return { steps: k?.steps ?? [], roto: true }; }
}

/** El valor de un paso en otra resolución, si es el mismo paso (mismo tipo y mismos campos). */
function campoDe(steps, i, p) {
  const s = steps[i];
  if (!s?.pide || s.pide.paso !== p.paso || s.pide.campos.length !== p.campos.length) return null;
  return s.pide.campos;
}

/** La hora que escribe el alumno, en el mismo día de la cuenta (00:23 de la madrugada siguiente → 24:23). */
function alDiaDe(kind, v, ref) {
  if (kind !== 'clock' || !Number.isFinite(v) || !Number.isFinite(ref)) return v;
  return v + Math.round((ref - v) / 1440) * 1440;
}

/** Lee lo que escribió el alumno en un paso: [{ raw, valor (NaN si no se entiende, null si vacío) }]. */
export function leerEntradas(p, textos = []) {
  return p.campos.map((c, j) => {
    const raw = String(textos[j] ?? '').trim();
    if (!raw) return { raw, valor: null };
    return { raw, valor: alDiaDe(c.kind, quantity(c.kind).parse(raw), c.value) };
  });
}

/** ¿Cuadran los campos escritos (los demás no cuentan) con estos valores, dentro de `veces` la tolerancia? */
function cuadra(p, leidos, campos, factor, veces = 1) {
  if (!campos) return false;
  let alguno = false;
  for (let j = 0; j < p.campos.length; j++) {
    const v = leidos[j].valor;
    if (v == null || Number.isNaN(v)) continue;
    alguno = true;
    if (quantity(p.campos[j].kind).error(v, campos[j].value) > veces * toleranciaCampo(p.campos[j], factor)) return false;
  }
  return alguno;
}

/**
 * Corrige la hoja.
 * @param {{ sol, q, chart, entradas: Record<number, string[]>, factor?: number }} o
 *   `entradas`: por índice de paso de la resolución (`steps[i]`), el texto de cada campo ('' o ausente = no lo escribió).
 * @returns {{
 *   pasos: { i, n, title, paso, pregunta, estado, campos: { label, kind, medido, raw, valor, valorTexto, esperadoTexto,
 *            conTuDatoTexto, estado }[], error: string|null, errorEn: number|null }[],
 *   primero: object|null,   el primer paso MAL (el desvío)
 *   fallo: { error, i, n, title }|null,  su error con nombre, si se reconoce
 *   otros: number,          pasos MAL después del primero que no vienen arrastrados (otro desvío)
 *   arrastrados: number, aciertos: number, escritos: number, total: number
 * }}
 */
export function corregirPapel({ sol, q, chart, entradas = {}, factor = 1 }) {
  // Siempre con `fijos` (aunque esté vacío): así el kit sigue con los datos del alumno aunque se salgan de la tabla.
  const base = resolver(chart, sol, q, { fijos: {} });
  const lista = pasosPapel(base.steps);
  const fijos = {};
  let hayDesvio = false;
  let ultimoEscrito = -1; // posición en `lista` del último paso escrito
  const pasos = [];
  lista.forEach((p, pos) => {
    const leidos = leerEntradas(p, entradas[p.i]);
    const escritos = leidos.filter((x) => x.valor != null);
    // Con lo que el alumno escribió antes (y lo calculado donde no escribió nada).
    const propio = Object.keys(fijos).length ? resolver(chart, sol, q, { fijos }) : base;
    const conTuDato = campoDe(propio.steps, p.i, p);
    const campos = p.campos.map((c, j) => {
      const { raw, valor } = leidos[j];
      const qn = quantity(c.kind);
      const tol = toleranciaCampo(c, factor);
      const out = { label: c.label, kind: c.kind, medido: !!c.medido, raw, valor, valorTexto: valor != null && !Number.isNaN(valor) ? qn.format(valor) : null,
        esperadoTexto: qn.format(c.value), conTuDatoTexto: conTuDato && qn.error(conTuDato[j].value, c.value) > 1e-6 ? qn.format(conTuDato[j].value) : null, margen: margenTexto(c, factor) };
      if (valor == null) return { ...out, estado: PAPEL.VACIO };
      if (Number.isNaN(valor)) return { ...out, estado: PAPEL.ILEGIBLE };
      const eV = qn.error(valor, c.value);
      const eP = conTuDato ? qn.error(valor, conTuDato[j].value) : Infinity;
      const estado = eV <= tol ? PAPEL.OK : eP <= tol ? (hayDesvio ? PAPEL.ARRASTRADO : PAPEL.OK) : Math.min(eV, eP) <= 2 * tol ? PAPEL.CASI : PAPEL.MAL;
      return { ...out, estado };
    });
    let estado;
    if (!escritos.length) estado = PAPEL.VACIO;
    else if (escritos.some((x) => Number.isNaN(x.valor))) estado = PAPEL.ILEGIBLE;
    else if (cuadra(p, leidos, p.campos, factor)) estado = PAPEL.OK;
    else if (cuadra(p, leidos, conTuDato, factor)) estado = hayDesvio ? PAPEL.ARRASTRADO : PAPEL.OK;
    else if (!conTuDato && Object.keys(fijos).length) estado = PAPEL.SIN_COMPROBAR;
    else if (cuadra(p, leidos, p.campos, factor, 2) || cuadra(p, leidos, conTuDato, factor, 2)) estado = PAPEL.CASI;
    else estado = PAPEL.MAL;

    // Error con nombre: el de este paso o el de un paso anterior que no escribiste (lo que se ve aquí sale de él). Un
    // «casi» que es justo lo que sale con un error típico (olvidar una Ct de 2°) es ese error, no un redondeo.
    let error = null; let errorEn = null; let posibles = null;
    if (estado === PAPEL.MAL || estado === PAPEL.CASI) {
      const saltados = lista.slice(ultimoEscrito + 1, pos);
      const candidatos = [{ p, errores: p.errores }, ...saltados.reverse().map((s) => ({ p: s, errores: s.errores }))];
      const hallados = new Map(); // error → paso donde se comete
      for (const c of candidatos) {
        for (const tipo of c.errores) {
          if (hallados.has(tipo)) continue;
          for (const variante of VARIANTES.filter((v) => tipoDe(v) === tipo)) {
            const r = resolver(chart, sol, q, { error: variante, fijos });
            if (cuadra(p, leidos, campoDe(r.steps, p.i, p), factor)) { hallados.set(tipo, c.p); break; }
          }
        }
      }
      if (hallados.size === 1) { const [[e, en]] = [...hallados]; error = e; errorEn = en.i; estado = PAPEL.MAL; }
      // Dos errores dan lo mismo: se dicen los dos, pero no van al cuaderno (no sabemos cuál fue).
      if (hallados.size === 2 && estado === PAPEL.MAL) posibles = [...hallados.keys()];
    }
    pasos.push({ i: p.i, n: p.n, title: p.title, paso: p.paso, pregunta: p.pregunta, estado, campos, error, errorEn, posibles });

    if (escritos.length) {
      ultimoEscrito = pos;
      // Lo que escribió (lo que se entiende) sigue en las cuentas siguientes.
      const fila = leidos.map((x) => (x.valor == null || Number.isNaN(x.valor) ? null : x.valor));
      if (fila.some((v) => v != null)) fijos[p.i] = fila;
    }
    if (estado === PAPEL.MAL || estado === PAPEL.CASI) hayDesvio = true;
  });

  const primero = pasos.find((x) => x.estado === PAPEL.MAL) ?? null;
  const fallo = primero?.error ? { error: primero.error, i: primero.errorEn ?? primero.i, n: pasos.find((x) => x.i === (primero.errorEn ?? primero.i))?.n ?? primero.n, title: pasos.find((x) => x.i === (primero.errorEn ?? primero.i))?.title ?? primero.title } : null;
  return {
    pasos, primero, fallo,
    otros: pasos.filter((x) => x.estado === PAPEL.MAL).length - (primero ? 1 : 0),
    arrastrados: pasos.filter((x) => x.estado === PAPEL.ARRASTRADO).length,
    aciertos: pasos.filter((x) => x.estado === PAPEL.OK).length,
    casi: pasos.filter((x) => x.estado === PAPEL.CASI).length,
    escritos: pasos.filter((x) => x.estado !== PAPEL.VACIO).length,
    total: pasos.length,
  };
}

/** La frase con nombre del error: «Aquí sumaste el adelanto…» (de AVISOS.has, en segunda persona). */
export function fraseFallo(error) {
  const a = AVISOS[error];
  if (!a) return null;
  return `${a.has}.`;
}

/** El veredicto en una frase, para la cabecera del resultado y para `nautica.state()`. */
export function veredicto(r) {
  if (!r.escritos) return 'No has escrito ningún paso.';
  if (r.primero) {
    const nombre = r.fallo ? ` ${ERRORES[r.fallo.error].nombre}.` : r.primero.posibles ? ` Puede ser «${ERRORES[r.primero.posibles[0]].nombre}» o «${ERRORES[r.primero.posibles[1]].nombre}».` : '';
    const donde = r.fallo && r.fallo.i !== r.primero.i ? `Te desviaste antes del paso ${r.primero.n}, en el paso ${r.fallo.n} (${r.fallo.title}), que no escribiste.` : `Te desviaste en el paso ${r.primero.n}: ${r.primero.title}.`;
    const arr = r.arrastrados ? ` ${r.arrastrados === 1 ? 'El paso siguiente que escribiste está bien hecho' : `Los ${r.arrastrados} pasos siguientes que escribiste están bien hechos`} con tu dato: el error viene arrastrado.` : '';
    return `${donde}${nombre}${arr}`;
  }
  if (r.casi) return 'Todo cuadra salvo algún redondeo: revisa los decimales.';
  if (r.pasos.some((x) => x.estado === PAPEL.SIN_COMPROBAR)) return 'Lo que se puede comprobar está bien.';
  return r.escritos === r.total ? 'Toda la hoja cuadra con la resolución.' : `Los ${r.escritos} pasos que escribiste cuadran con la resolución.`;
}

/** Resumen en texto para `nautica.state()` (y para un asistente). */
export function textoPapel(r) {
  const linea = (p) => `  ${p.n}. ${p.title}: ${p.estado.toUpperCase()}${p.campos.filter((c) => c.raw).map((c) => ` · ${c.label} ${c.raw} (resolución ${c.esperadoTexto}${c.conTuDatoTexto ? `, con tu dato ${c.conTuDatoTexto}` : ''})`).join('')}${p.error ? ` · ERROR ${p.error}` : ''}`;
  return [`HOJA EN PAPEL: ${veredicto(r)}`, ...r.pasos.filter((p) => p.estado !== PAPEL.VACIO).map(linea)].join('\n');
}

/** ¿Se puede corregir en papel? Tiene resolución con pasos que escribir. */
export function papelPosible(sol, q, chart) {
  if (!sol || !chart) return false;
  const r = resolver(chart, sol, q, {});
  return !r.roto && pasosPapel(r.steps).length > 0;
}

export { ESTADO };
