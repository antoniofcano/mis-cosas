// Bloc de notas del alumno (hoja de borrador de un ejercicio): la lógica, sin DOM. La interfaz está en src/ui/bloc.js.
// - Cada ejercicio o pregunta tiene su nota, por un identificador (ID_BLOC). Otro ejercicio = otro identificador =
//   empieza en blanco; volver al mismo (misma semilla, misma pregunta) recupera lo escrito.
// - Se guardan en el aparato (localStorage, clave CLAVE). No se sincronizan entre dispositivos ni entran en el
//   registro de operaciones de src/store/sync/: son papel de borrador, no progreso.
// - Solo se conservan las MAX_NOTAS más recientes y las de los últimos CADUCA_DIAS días.
// - Además: trocear un enunciado en texto y datos (para apuntar un dato con un toque) e insertar un trozo en la nota.

export const CLAVE = 'nautica.bloc.v1';
export const MAX_NOTAS = 40;
export const CADUCA_DIAS = 60;
const DIA = 864e5;

/** Identificadores de las notas: uno por ejercicio, cuenta o pregunta (y por examen, para que cada examen empiece limpio). */
export const ID_BLOC = {
  ejercicio: (tipo, semilla) => `ej:${tipo}:${semilla}`,
  cuenta: (leccion, tarjeta, semilla) => `cuenta:${leccion}:${tarjeta}:${semilla}`,
  pregunta: (id) => `q:${id}`,
  /** Dentro de un examen: la nota es de ese examen (no trae lo apuntado al practicar la misma pregunta). */
  examen: (examen, id) => `ex:${examen}:${id}`,
};

// ---------------------------------------------------------------------------
// Estado puro: { v: 1, notas: { [id]: { t: texto, m: milisegundos de la última vez } } }

export const estadoVacio = () => ({ v: 1, notas: {} });

/** Lo guardado, saneado (si está roto o es de otra versión, vacío). */
export function leerEstado(crudo) {
  try {
    const e = typeof crudo === 'string' ? JSON.parse(crudo) : crudo;
    if (!e || e.v !== 1 || typeof e.notas !== 'object' || !e.notas) return estadoVacio();
    const notas = {};
    for (const [id, n] of Object.entries(e.notas)) if (n && typeof n.t === 'string' && n.t.trim() && Number.isFinite(n.m)) notas[id] = { t: n.t, m: n.m };
    return { v: 1, notas };
  } catch { return estadoVacio(); }
}

/** Quita las notas caducadas y, si sobran, las más antiguas. */
export function podar(estado, ahora, { max = MAX_NOTAS, dias = CADUCA_DIAS } = {}) {
  const vivas = Object.entries(estado.notas).filter(([, n]) => ahora - n.m <= dias * DIA).sort((a, b) => b[1].m - a[1].m).slice(0, max);
  return { v: 1, notas: Object.fromEntries(vivas) };
}

/** Guarda el texto de una nota (vacío o solo espacios: la borra). Devuelve el estado nuevo, ya podado. */
export function ponNota(estado, id, texto, ahora) {
  const notas = { ...estado.notas };
  if (String(texto ?? '').trim()) notas[id] = { t: String(texto), m: ahora }; else delete notas[id];
  return podar({ v: 1, notas }, ahora);
}

export const quitaNota = (estado, id, ahora) => ponNota(estado, id, '', ahora);
export const textoNota = (estado, id) => estado.notas[id]?.t ?? '';

// ---------------------------------------------------------------------------
// Almacén: el estado puro sobre un almacenamiento tipo localStorage (inyectable en los tests)

/**
 * @param {{ almacen?: { getItem: Function, setItem: Function } | null, ahora?: () => number }} [o]
 *   Sin almacenamiento (modo privado, cuota llena) las notas viven mientras dure la página.
 */
export function crearAlmacenBloc({ almacen = almacenDelNavegador(), ahora = () => Date.now() } = {}) {
  let memoria = null; // copia de respaldo si el almacenamiento falla
  const lee = () => {
    if (memoria) return memoria;
    try { return leerEstado(almacen?.getItem(CLAVE) ?? null); } catch { return (memoria = estadoVacio()); }
  };
  const escribe = (e) => {
    if (memoria) { memoria = e; return; }
    try { if (!almacen) throw new Error('sin almacenamiento'); almacen.setItem(CLAVE, JSON.stringify(e)); } catch { memoria = e; }
  };
  return {
    /** El texto guardado de esa nota ('' si no hay). */
    leer: (id) => textoNota(lee(), id),
    guardar: (id, texto) => escribe(ponNota(lee(), id, texto, ahora())),
    borrar: (id) => escribe(quitaNota(lee(), id, ahora())),
    hay: (id) => !!textoNota(lee(), id).trim(),
    ids: () => Object.keys(lee().notas),
  };
}

function almacenDelNavegador() {
  try { return globalThis.localStorage ?? null; } catch { return null; }
}

// ---------------------------------------------------------------------------
// Datos del enunciado: los números con su unidad («04:15 UT», «0,45 m», «36º 05,0′ N», «+6º», «8 nudos»)

const N = String.raw`\d+(?:[.,]\d+)?`;
const MIN = String.raw`['′’´]`;
const RUMBO = 'NNE|ENE|ESE|SSE|SSW|WSW|WNW|NNW|NE|NW|SE|SW|N|S|E|W';
const UNIDAD = 'millas?|nudos?|metros?|minutos?|horas?|cm|kn|min|UT|HRB|TU|m|h';
const FIN = String.raw`(?![\p{L}\d])`; // la unidad o el rumbo acaban ahí (no son el principio de una palabra)
const DATO = new RegExp(
  String.raw`(?<![\p{L}\d.,])` // no en mitad de una palabra ni de otro número («P12», «L-105» → solo 105)
  + String.raw`(?:(?<=^|[\s(=:«])[+\-–−]\s?)?` // signo, si va suelto delante («= –8º», «UT + 1 h»)
  + '(?:'
  + String.raw`\d{1,2}:\d{2}(?::\d{2})?` // hora 10:30
  + String.raw`|\d{1,2}\s?h\s?\d{1,2}\s?m(?:in)?${FIN}` // 12h 00m, 2 h 25 min
  + String.raw`|${N}\s?[°º](?:\s?-?\s?${N}\s?${MIN}(?:\s?${N}\s?[″"])?)?(?:\s?(?:${RUMBO})${FIN})?` // grados (minutos, segundos) y rumbo
  + String.raw`|${N}\s?${MIN}(?:\s?(?:${RUMBO})${FIN})?` // minutos sueltos: 6′ W
  + String.raw`|${N}(?:\s?(?:${UNIDAD})${FIN})?` // número con su unidad
  + String.raw`)(?:\s?(?:UT|HRB|TU)${FIN})?`, 'gu');

/**
 * Trocea un enunciado en trozos de texto y datos, en orden: [{ t, dato }]. Unidos dan el enunciado tal cual.
 * @param {string} texto
 */
export function trocear(texto) {
  const s = String(texto ?? '');
  const trozos = [];
  let i = 0;
  for (const m of s.matchAll(DATO)) {
    if (m.index > i) trozos.push({ t: s.slice(i, m.index), dato: false });
    trozos.push({ t: m[0], dato: true });
    i = m.index + m[0].length;
  }
  if (i < s.length) trozos.push({ t: s.slice(i), dato: false });
  return trozos;
}

/** Solo los datos de un enunciado, sin repetir. */
export const datosDe = (texto) => [...new Set(trocear(texto).filter((x) => x.dato).map((x) => x.t))];

// ---------------------------------------------------------------------------
// Insertar en la nota (un dato del enunciado, el resultado de la calculadora, un signo)

/**
 * Pone `trozo` en la nota donde está el cursor (sustituye lo seleccionado), con los espacios justos para que no se
 * pegue a lo de al lado. Devuelve el texto nuevo y dónde queda el cursor.
 * @param {string} texto
 * @param {number} ini  principio de la selección (fuera de rango: al final)
 * @param {number} fin  fin de la selección
 * @param {string} trozo
 * @param {{ pegado?: boolean }} [o]  pegado: sin espacio delante (°, ′: van pegados al número)
 */
export function insertar(texto, ini, fin, trozo, { pegado = false } = {}) {
  const s = String(texto ?? '');
  const a = Number.isInteger(ini) && ini >= 0 && ini <= s.length ? ini : s.length;
  const b = Number.isInteger(fin) && fin >= a && fin <= s.length ? fin : a;
  const antes = s.slice(0, a);
  const despues = s.slice(b);
  if (trozo === '\n') return { texto: `${antes}\n${despues}`, cursor: a + 1 };
  const delante = !pegado && antes && !/[\s(]$/.test(antes) ? ' ' : '';
  // Detrás, un espacio si lo que sigue se pegaría; y tras «=» o una flecha siempre, para seguir escribiendo el valor.
  const detras = despues && !/^[\s).,;]/.test(despues) ? ' ' : (!despues || /^\n/.test(despues)) && /^[=→+−×÷]$/.test(trozo) ? ' ' : '';
  const nuevo = `${antes}${delante}${trozo}${detras}${despues}`;
  return { texto: nuevo, cursor: a + delante.length + trozo.length + detras.length };
}

// ---------------------------------------------------------------------------
// ¿Es una pregunta de hacer cuentas? (fuera del tema de carta, donde lo son todas)

const PIDE_CUENTA = /\bcalcul|\bhall(?:ar|e)\b|¿cuánto vale|¿qu[ée] (?:rumbo|distancia|hora|sonda|velocidad|desv[ií]o|demora|marcaci[oó]n)\b/i;

/**
 * Una pregunta tipo test que se resuelve con números: el enunciado trae datos, pide calcular y todas las opciones
 * son valores. (Criterio prudente: mejor no ofrecer el bloc que ofrecerlo en una pregunta de teoría.)
 * @param {{ enunciado?: string, opciones?: Record<string, string> }} q
 */
export function preguntaDeCuentas(q) {
  const ops = Object.values(q?.opciones ?? {});
  return /\d/.test(q?.enunciado ?? '') && PIDE_CUENTA.test(q.enunciado) && ops.length > 0 && ops.every((o) => /\d/.test(String(o)));
}
