// Calculadora científica (motor): reproduce el manejo de la calculadora científica no programable que se permite en
// el examen, la de dos líneas (la expresión arriba y el resultado abajo), siempre en grados sexagesimales (DEG).
// Funciones puras: el estado entra y sale como datos. La interfaz (src/ui/calculadora.js) solo pinta y pulsa teclas.
//
// Comportamiento de la calculadora real que se reproduce:
// - Prioridad: paréntesis y funciones → x², x⁻¹ → signo (−) → multiplicación implícita (2π, 3(4)) → × ÷ → + −.
//   Por eso (−)2² = −4, igual que en la calculadora.
// - sin( cos( tan( √( abren paréntesis; los paréntesis que faltan al final se cierran solos al pulsar =.
// - Tras «=», una operación (+ − × ÷ x² x⁻¹) sigue desde Ans; un número empieza una cuenta nueva; «=» otra vez repite
//   la última cuenta con el Ans nuevo (Ans × 2 = = = …).
// - °′″: tras cada parte de un valor sexagesimal (12 °′″ 30 °′″ = 12°30′). Con un resultado en pantalla, cambia entre
//   sexagesimal y decimal (12,5 ↔ 12°30′0″); SHIFT °′″ (←) lo pasa a decimal. Sirve igual para horas, minutos y segundos.
// - Una cuenta con valores sexagesimales (sumas, restas, por un número) da el resultado en sexagesimal; dentro de
//   sin, cos, tan o √ el resultado es decimal.
// - Errores: «Math ERROR» (división por cero, √ de un negativo, sin⁻¹ o cos⁻¹ fuera de [−1, 1], tan 90°…) y
//   «Syntax ERROR» (la expresión no se entiende). AC borra; DEL vuelve a la expresión para corregirla.

export const MATH_ERROR = 'Math ERROR';
export const SYNTAX_ERROR = 'Syntax ERROR';
/** Caracteres (pulsaciones) como mucho en una expresión, como la calculadora. */
export const MAX_TECLAS = 99;

/**
 * Teclas: id → { texto: lo que se escribe en la línea de arriba, shift: la función con SHIFT }.
 * Las de `INSERTA` añaden algo a la expresión; las de `OPERA` siguen desde Ans tras un resultado.
 */
export const TECLAS = {
  '0': {}, '1': {}, '2': {}, '3': {}, '4': {}, '5': {}, '6': {}, '7': {}, '8': {}, '9': {}, '.': {},
  '+': {}, '-': {}, '×': {}, '÷': {}, '(': {}, ')': {},
  neg: {}, pi: {}, ans: {}, sq: {}, inv: {}, sqrt: {},
  sin: { shift: 'asin' }, cos: { shift: 'acos' }, tan: { shift: 'atan' }, asin: {}, acos: {}, atan: {},
  gms: { shift: 'gms-dec' }, 'gms-dec': {},
  'm+': { shift: 'm-' }, 'm-': {}, mr: { shift: 'mc' }, mc: {},
  shift: {}, ac: {}, del: {}, '=': {},
};

const FUNCIONES = { sin: 'sin(', cos: 'cos(', tan: 'tan(', asin: 'sin⁻¹(', acos: 'cos⁻¹(', atan: 'tan⁻¹(', sqrt: '√(' };
const OPERA = new Set(['+', '-', '×', '÷', 'sq', 'inv']);
const INSERTA = new Set(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '+', '-', '×', '÷', '(', ')', 'neg', 'pi', 'ans', 'sq', 'inv', 'gms', 'mr', ...Object.keys(FUNCIONES)]);

/** Estado inicial (Ans y la memoria M se pueden traer guardados). */
export function estadoInicial({ ans = 0, m = 0 } = {}) {
  return { tokens: [], ultima: null, resultado: null, sexa: false, error: null, hecho: false, shift: false, ans: Number(ans) || 0, m: Number(m) || 0 };
}

// ---------------------------------------------------------------------------
// Cálculo con grados

const RAD = Math.PI / 180;
class ErrorCalc extends Error {}
const mathError = () => { throw new ErrorCalc(MATH_ERROR); };
const syntaxError = () => { throw new ErrorCalc(SYNTAX_ERROR); };
/** Redondeo a 15 cifras: lo que guarda la calculadora por dentro (evita 1,0000000000000002 en los límites). */
const r15 = (x) => (x === 0 ? 0 : Number(x.toPrecision(15)));
const resto = (x, n) => ((x % n) + n) % n;

/** Seno en grados, exacto en los múltiplos de 90° (sin 180° = 0, no 1,2 · 10⁻¹⁶). */
export function senoG(x) {
  const r = r15(resto(x, 360));
  if (r === 0 || r === 180 || r === 360) return 0;
  if (r === 90) return 1;
  if (r === 270) return -1;
  if (r === 30 || r === 150) return 0.5;
  if (r === 210 || r === 330) return -0.5;
  return Math.sin(x * RAD);
}
export const cosenoG = (x) => senoG(r15(x) + 90);
export function tangenteG(x) {
  const r = r15(resto(x, 180));
  if (r === 90) mathError();
  if (r === 0 || r === 180) return 0;
  if (r === 45) return 1;
  if (r === 135) return -1;
  return Math.tan(x * RAD);
}
export function arcoseno(x) { const v = r15(x); if (v < -1 || v > 1) mathError(); return Math.asin(v) / RAD; }
export function arcocoseno(x) { const v = r15(x); if (v < -1 || v > 1) mathError(); return Math.acos(v) / RAD; }
export const arcotangente = (x) => Math.atan(x) / RAD;

const APLICA = {
  sin: senoG, cos: cosenoG, tan: tangenteG, asin: arcoseno, acos: arcocoseno, atan: arcotangente,
  sqrt: (x) => (r15(x) < 0 ? mathError() : Math.sqrt(Math.max(0, x))),
};
const valido = (v) => (Number.isFinite(v) && Math.abs(v) < 1e100 ? v : mathError());

// ---------------------------------------------------------------------------
// Sexagesimal

/** Grados (u horas), minutos y segundos → decimal. El signo va en los grados (o en `signo`). */
export function deSexagesimal(g, m = 0, s = 0, signo = Math.sign(g) || 1) {
  return signo * (Math.abs(g) + Math.abs(m) / 60 + Math.abs(s) / 3600);
}

/**
 * Decimal → { signo, g, m, s }, con los segundos redondeados a `dec` decimales y el acarreo hecho
 * (12,9999999 → 13°0′0″, nunca 12°59′60″).
 */
export function aSexagesimal(x, dec = 2) {
  const signo = x < 0 ? -1 : 1;
  const f = 10 ** dec;
  const total = Math.round(r15(Math.abs(x)) * 3600 * f) / f; // segundos
  const g = Math.floor(total / 3600 + 1e-12);
  const m = Math.floor((total - g * 3600) / 60 + 1e-12);
  const s = Math.round((total - g * 3600 - m * 60) * f) / f;
  return { signo: g === 0 && m === 0 && s === 0 ? 1 : signo, g, m, s };
}

/** «12°30′0″» o «−0°7′30.5″» (punto decimal, como la pantalla de la calculadora). */
export function textoSexagesimal(x) {
  const { signo, g, m, s } = aSexagesimal(x);
  return `${signo < 0 ? '−' : ''}${g}°${m}′${s}″`;
}

// ---------------------------------------------------------------------------
// Formato del resultado (10 cifras, como la pantalla)

const SUP = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
const sinCeros = (s) => (s.includes('.') ? s.replace(/0+$/, '').replace(/\.$/, '') : s);

/**
 * Número → texto de la pantalla: 10 cifras significativas, punto decimal y, si es muy grande o muy pequeño,
 * notación científica (1.5×10¹²). Nunca «−0».
 */
export function formatoNumero(x) {
  if (!Number.isFinite(x)) return MATH_ERROR;
  const v = Number(x.toPrecision(10));
  if (v === 0) return '0';
  const menos = v < 0 ? '−' : '';
  const a = Math.abs(v);
  if (a >= 1e10 || a < 1e-9) {
    const [mant, exp] = a.toExponential(9).split('e');
    return `${menos}${sinCeros(mant)}×10${String(Number(exp)).split('').map((c) => SUP[c]).join('')}`;
  }
  const enteras = Math.floor(Math.log10(a)) + 1;
  return `${menos}${sinCeros(a.toFixed(Math.min(20, Math.max(0, 10 - enteras))))}`;
}

// ---------------------------------------------------------------------------
// Expresión: de las teclas a lexemas y de ahí al valor (descenso recursivo)

/** Agrupa las cifras, el punto y las marcas °′″ seguidas en un número; el resto pasa tal cual. */
function lexemas(tokens) {
  const out = [];
  let i = 0;
  while (i < tokens.length) {
    const t = tokens[i];
    if (/^[0-9.]$/.test(t) || t === 'gms') {
      const partes = [''];
      let marcas = 0;
      while (i < tokens.length && (/^[0-9.]$/.test(tokens[i]) || tokens[i] === 'gms')) {
        if (tokens[i] === 'gms') { marcas += 1; partes.push(''); } else partes[partes.length - 1] += tokens[i];
        i += 1;
      }
      if (partes.at(-1) === '' && marcas) partes.pop();
      if (!partes.length || partes.length > 3 || partes.some((p) => !/^(\d+\.?\d*|\.\d+)$/.test(p))) syntaxError();
      const [g, m = '0', s = '0'] = partes.map(Number);
      out.push(marcas ? { tipo: 'num', v: deSexagesimal(g, m, s, 1), gms: true } : { tipo: 'num', v: Number(partes[0]), gms: false });
      continue;
    }
    out.push({ tipo: t });
    i += 1;
  }
  return out;
}

const EMPIEZA_VALOR = new Set(['num', '(', 'pi', 'ans', 'mr', ...Object.keys(FUNCIONES)]);

/**
 * Evalúa una expresión (lista de teclas) con Ans y M. Devuelve { valor, gms } (gms: el resultado se enseña en
 * sexagesimal) o { error: 'Math ERROR' | 'Syntax ERROR' }.
 */
export function evaluar(tokens, { ans = 0, m = 0 } = {}) {
  try {
    const lx = lexemas(tokens);
    let i = 0;
    const ver = () => lx[i]?.tipo;
    const toma = () => lx[i++];

    function suma() {
      let a = producto();
      while (ver() === '+' || ver() === '-') {
        const op = toma().tipo;
        const b = producto();
        a = { v: valido(op === '+' ? a.v + b.v : a.v - b.v), gms: a.gms || b.gms };
      }
      return a;
    }
    function producto() {
      let a = implicito();
      while (ver() === '×' || ver() === '÷') {
        const op = toma().tipo;
        const b = implicito();
        if (op === '÷' && b.v === 0) mathError();
        a = { v: valido(op === '×' ? a.v * b.v : a.v / b.v), gms: a.gms || b.gms };
      }
      return a;
    }
    // Multiplicación implícita (2π, 3(1+1), 2sin(30)): va antes que × y ÷, como en la calculadora (1÷2π = 1÷(2π)).
    function implicito() {
      let a = signo();
      while (EMPIEZA_VALOR.has(ver())) {
        const b = signo();
        a = { v: valido(a.v * b.v), gms: a.gms || b.gms };
      }
      return a;
    }
    // Signo: (−) o un − / + donde se espera un valor.
    function signo() {
      if (ver() === 'neg' || ver() === '-') { toma(); const a = signo(); return { v: -a.v, gms: a.gms }; }
      if (ver() === '+') { toma(); return signo(); }
      return postfijo();
    }
    function postfijo() {
      let a = primario();
      while (ver() === 'sq' || ver() === 'inv') {
        const op = toma().tipo;
        if (op === 'inv' && a.v === 0) mathError();
        a = { v: valido(op === 'sq' ? a.v * a.v : 1 / a.v), gms: false };
      }
      return a;
    }
    function cierra() {
      if (ver() === ')') toma();
      else if (i < lx.length) syntaxError(); // solo puede faltar al final (se cierra solo)
    }
    function primario() {
      const t = toma();
      if (!t) syntaxError();
      if (t.tipo === 'num') return { v: t.v, gms: t.gms };
      if (t.tipo === 'pi') return { v: Math.PI, gms: false };
      if (t.tipo === 'ans') return { v: ans, gms: false };
      if (t.tipo === 'mr') return { v: m, gms: false };
      if (t.tipo === '(') { const a = suma(); cierra(); return a; }
      if (FUNCIONES[t.tipo]) { const a = suma(); cierra(); return { v: valido(APLICA[t.tipo](a.v)), gms: false }; }
      return syntaxError();
    }

    if (!lx.length) syntaxError();
    const r = suma();
    if (i < lx.length) syntaxError(); // sobra algo: un «)» de más, dos operadores…
    return { valor: r15(valido(r.v)) || 0, gms: r.gms };
  } catch (e) {
    if (e instanceof ErrorCalc) return { error: e.message };
    throw e;
  }
}

// ---------------------------------------------------------------------------
// Teclas → estado

const nuevo = (e, cambios) => ({ ...e, ...cambios });

/** Calcula `tokens` y deja el resultado en pantalla (y en Ans). */
function calcula(e, tokens) {
  const r = evaluar(tokens, e);
  if (r.error) return nuevo(e, { tokens, error: r.error, hecho: false, shift: false });
  return nuevo(e, { tokens, ultima: tokens, resultado: r.valor, ans: r.valor, sexa: r.gms, error: null, hecho: true, shift: false });
}

/**
 * Pulsa una tecla (id de TECLAS). Devuelve el estado nuevo; nunca lanza.
 * @param {ReturnType<typeof estadoInicial>} e
 * @param {string} tecla
 */
export function pulsar(e, tecla) {
  if (!(tecla in TECLAS)) return e;
  if (tecla === 'shift') return nuevo(e, { shift: !e.shift });
  const t = e.shift && TECLAS[tecla].shift ? TECLAS[tecla].shift : tecla;
  const s = nuevo(e, { shift: false });

  switch (t) {
    case 'ac': return nuevo(s, { tokens: [], error: null, hecho: false, resultado: null, sexa: false });
    case 'del':
      if (s.error) return nuevo(s, { error: null, hecho: false });
      return nuevo(s, { tokens: s.tokens.slice(0, -1), hecho: false });
    case '=':
      if (s.error || !s.tokens.length) return s;
      return calcula(s, s.tokens); // tras un resultado, repite la misma cuenta con el Ans nuevo
    case 'gms':
      if (s.hecho) return nuevo(s, { sexa: !s.sexa }); // con un resultado: sexagesimal ↔ decimal
      break;
    case 'gms-dec':
      return s.hecho ? nuevo(s, { sexa: false }) : s;
    case 'm+': case 'm-': {
      if (s.error) return s;
      const c = s.hecho ? s : s.tokens.length ? calcula(s, s.tokens) : null;
      if (!c || c.error) return c ?? s;
      return nuevo(c, { m: r15(c.m + (t === 'm+' ? c.resultado : -c.resultado)) });
    }
    case 'mc': return nuevo(s, { m: 0 });
    default: break;
  }
  if (!INSERTA.has(t)) return s;
  // Tras un resultado (o un error), una operación sigue desde Ans; cualquier otra tecla empieza una cuenta nueva.
  let base = s.tokens;
  if (s.hecho) base = OPERA.has(t) ? ['ans'] : [];
  else if (s.error) base = [];
  if (base.length >= MAX_TECLAS) return s;
  return nuevo(s, { tokens: [...base, t], hecho: false, error: null });
}

/** Pulsa varias teclas seguidas (para pruebas y ejemplos). */
export const pulsarTodas = (e, teclas) => teclas.reduce(pulsar, e);

// ---------------------------------------------------------------------------
// Pantalla

const TEXTO = { '-': '−', neg: '(−)', pi: 'π', ans: 'Ans', mr: 'M', sq: '²', inv: '⁻¹', ...FUNCIONES };
const MARCAS = ['°', '′', '″'];

/** La línea de arriba: lo tecleado, con °′″ según la parte del valor sexagesimal. */
export function textoExpresion(tokens) {
  let marcas = 0;
  return tokens.map((t) => {
    if (t === 'gms') return MARCAS[Math.min(2, marcas++)];
    if (!/^[0-9.]$/.test(t)) marcas = 0;
    return TEXTO[t] ?? t;
  }).join('');
}

/**
 * Lo que enseña la pantalla: { arriba, abajo, indicadores: { shift, m, d } }.
 * Abajo va el resultado (o el error); mientras se teclea, vacía. Al empezar, «0».
 */
export function pantalla(e) {
  const abajo = e.error ? e.error
    : e.hecho ? (e.sexa ? textoSexagesimal(e.resultado) : formatoNumero(e.resultado))
      : e.tokens.length ? '' : '0';
  return { arriba: textoExpresion(e.tokens), abajo, indicadores: { shift: e.shift, m: e.m !== 0, d: true } };
}

/** Lo que se guarda entre sesiones: la memoria, Ans y la última cuenta. */
export const guardable = (e) => ({ ans: e.ans, m: e.m, tokens: e.hecho ? e.tokens : e.tokens.slice(0, MAX_TECLAS) });

/** Recupera un estado guardado (si la cuenta guardada se puede calcular, vuelve con su resultado en pantalla). */
export function restaurar(g = {}) {
  const e = estadoInicial(g);
  const tokens = Array.isArray(g.tokens) ? g.tokens.filter((t) => t in TECLAS && INSERTA.has(t)).slice(0, MAX_TECLAS) : [];
  return tokens.length ? nuevo(e, { tokens }) : e;
}

/** Tecla física → tecla de la calculadora (null si no es de la calculadora). Mayúsculas S/C/T: las inversas. */
export function teclaDeTeclado(ev) {
  const k = ev.key;
  if (/^[0-9]$/.test(k)) return k;
  const mapa = {
    '.': '.', ',': '.', '+': '+', '-': '-', '*': '×', x: '×', '/': '÷', ':': '÷', '(': '(', ')': ')',
    Enter: '=', '=': '=', Backspace: 'del', Delete: 'ac', Escape: 'ac',
    s: 'sin', c: 'cos', t: 'tan', S: 'asin', C: 'acos', T: 'atan', r: 'sqrt', R: 'sqrt', q: 'sq', '²': 'sq', i: 'inv',
    p: 'pi', a: 'ans', A: 'ans', m: 'mr', M: 'mr', g: 'gms', G: 'gms-dec', "'": 'gms', '°': 'gms', 'º': 'gms', n: 'neg', '_': 'neg',
  };
  return mapa[k] ?? null;
}
