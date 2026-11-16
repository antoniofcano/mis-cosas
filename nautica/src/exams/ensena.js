// Paso a paso que enseña (R-71; docs/CARTA-MOVIL.md, función 1). Lógica sin DOM; la interfaz está en src/ui/guiado.js.
//
// Tres cosas que se suman al paso a paso de siempre (src/exams/guiado.js, `pasosGuiados`):
//   1. El primer paso «¿Qué tipo de problema es?»: tres o cuatro tipos (el de la pregunta, que es el `ejercicio` de su
//      solución programada, y los que más se le parecen). Si se falla, se explica por qué es de ese tipo: qué dato del
//      enunciado lo delata. No va al cuaderno de fallos: ningún error de la taxonomía es «confundir el tipo».
//   2. Ayuda por escalones en cada paso, en lugar del «Dímelo» de golpe: la pista (qué buscar), la fórmula o la regla con
//      los datos (la cuenta del kit sin su resultado) y, por último, el valor («Dímelo»). Usar un escalón no es fallar,
//      pero queda apuntado («con 2 ayudas»).
//   3. El ejemplo resuelto y, después, otro con huecos: dos preguntas reales del mismo tipo, de la práctica (nunca las
//      reservadas: docs/CUARENTENA.md), elegidas siempre igual para una misma pregunta. En la de huecos, la primera mitad
//      de los pasos que se preguntan va rellena y el alumno completa el resto.

import { quantity } from '../analysis/quantities.js';
import { NOMBRES_TIPO } from '../course/velocidad.js';
import { AVISOS } from './avisos-pasos.js';
import { PASOS } from './taxonomia.js';

// ---- 1. ¿Qué tipo de problema es?
/**
 * Los tipos de problema de carta: cuándo es de ese tipo (en segunda persona) y qué dato del enunciado lo delata. `claves`:
 * expresiones por orden de lo que más delata el tipo; se cita lo que casa con la primera que se encuentra en el enunciado.
 * `dosHoras`: lo que lo delata son dos horas distintas (la segunda observación).
 */
const LEJOS = /\b0?(?:[2-9]\d|1[0-7]\d) ?[º°][^.;]{0,14}?[EW]\b|\b\d{1,2} ?[º°][^.;]{0,12}? ?S\b/;
export const TIPOS = {
  'marea-sonda': { cuando: 'te piden la altura de la marea o la sonda a una hora (o la hora para tener una sonda): se resuelve con el Anuario de Mareas', claves: [/sonda|pleamar|bajamar|mareas?\b|anuario/i] },
  'estima-analitica': { cuando: 'el barco navega lejos de la carta (o varios rumbos seguidos) y la situación se saca con números: Δl, apartamiento y ΔL', claves: [/siguientes rumbos|rumbo directo|distancia a navegar|durante \d+ ?h|loxodr|\d{3,} millas|cambiamos al r|rumbo a un punto/i, LEJOS] },
  'corriente-desconocida': { cuando: 'tienes la situación de estima y la observada a la misma hora, y te piden la corriente que te ha llevado de una a otra', claves: [/corriente desconocida|rumbo de la corriente|rumbo e intensidad|intensidad horaria de la misma|rc e ih|(calcula|determina|halla)r? (el )?(rumbo|la intensidad|rc)\b[^.]*corriente/i, /corriente/i, /\b(rc|ihc)\b/i] },
  'corriente-rumbo-a-dar': { cuando: 'te dan la corriente y el punto al que quieres llegar, y buscas el rumbo (y a veces la velocidad) que hay que dar', claves: [/corriente[^.]*/i, /\brc ?=[^,.]*/i] },
  'corriente-efectiva': { cuando: 'te dan la corriente y tu rumbo, y buscas por dónde vas de verdad: el rumbo efectivo o la situación de estima', claves: [/corriente[^.,]*/i, /\brc ?=[^,.]*/i] },
  abatimiento: { cuando: 'sopla un viento que te abate y buscas el rumbo de superficie (o el que hay que dar): Rs = Rv + Ab', claves: [/abatimiento|abate|abamiento/i, /viento del|viento de/i] },
  'ct-enfilacion': { cuando: 'estás en una enfilación u oposición de dos faros: su demora verdadera se mide en la carta y sirve para sacar la Ct (o para situarte)', claves: [/oposici[oó]n|enfilaci[oó]n|enfilad|polar/i, /declinaci[oó]n|correcci[oó]n total/i] },
  'demoras-no-simultaneas': { cuando: 'las dos líneas de posición se toman a horas distintas: entre una y otra el barco navega y la primera se traslada', claves: [/se vuelve a|m[aá]s tarde|posteriormente|se contin[uú]a navegando/i], dosHoras: true },
  'situacion-dos-distancias': { cuando: 'te sitúas con dos distancias a dos faros: el corte de dos arcos', claves: [/a \d+(,\d+)? millas (del|de)\b[^.]*\by a \d+(,\d+)? millas/i, /distancias?\b/i] },
  'situacion-demora-distancia': { cuando: 'te sitúas con una demora (o marcación, o enfilación) y una distancia al mismo tiempo', claves: [/distancia[^.,]*|radar/i, /a (\d+(,\d+)?|una) millas? (al|del|de)\b[^.,]*/i] },
  'situacion-dos-demoras': { cuando: 'te sitúas con dos demoras o marcaciones tomadas a la vez: el corte de dos rectas', claves: [/simult[aá]nea\w*/i, /(demoras?|marcaci[oó]n|marcan|marcamos)[^.]*/i, /oposici[oó]n[^.]*|por la proa|trav[eé]s|al [NSEW]\/v|(este|oeste|norte|sur) verdadero/i] },
  'distancia-faro': { cuando: 'te piden a qué distancia pasas o estás de un faro (o cuándo lo verás por su alcance), o su demora desde un punto', claves: [/a qu[eé] distancia|distancia entre|alcance|avista\w*|trav[eé]s|con qu[eé] demora|qu[eé] demora/i, /distancia/i] },
  'rumbo-pasar-distancia': { cuando: 'quieres pasar a una distancia de un faro: el rumbo es la tangente al círculo de esa distancia', claves: [/pasar a (\d+(,\d+)?|una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez) millas?[^.,]*/i, /pasar a/i] },
  'estima-directa': { cuando: 'sabes de dónde sales, el rumbo, la velocidad y el tiempo, y buscas dónde estarás: la situación de estima', claves: [/situaci[oó]n de estima|en qu[eé] (posici[oó]n|situaci[oó]n)|despu[eé]s de navegar|nos encontraremos|situaci[oó]n final|(calcular|calcule|obtener|hallar) (la )?(situaci[oó]n|posici[oó]n)[^.]*/i, /(situaci[oó]n|posici[oó]n) (a|al ser) (las )?h\w*[^.]*/i] },
  'rumbo-distancia': { cuando: 'sabes de dónde sales y a dónde vas, y buscas el rumbo, la distancia o la hora de llegada', claves: [/(damos|dar|ponemos|poner|se da) rumbo[^.,]*|rumbo al pie[^.,]*|para llegar[^.,]*|nos dirigimos[^.,]*|se pone rumbo[^.,]*|con rumbo al[^.,]*|dirigirnos[^.,]*|recalar[^.,]*/i, /llegada|traves[ií]a|qu[eé] marcaci[oó]n/i] },
};

/** Con qué tipos se confunde cada uno (los distractores de «¿qué tipo es?»), por orden. */
const CONFUNDE_TIPO = {
  'marea-sonda': ['estima-analitica', 'rumbo-distancia', 'distancia-faro'],
  'estima-analitica': ['estima-directa', 'rumbo-distancia', 'corriente-efectiva'],
  'corriente-desconocida': ['corriente-efectiva', 'corriente-rumbo-a-dar', 'situacion-dos-demoras'],
  'corriente-rumbo-a-dar': ['corriente-efectiva', 'corriente-desconocida', 'rumbo-distancia'],
  'corriente-efectiva': ['corriente-rumbo-a-dar', 'corriente-desconocida', 'estima-directa'],
  abatimiento: ['corriente-efectiva', 'rumbo-distancia', 'estima-directa'],
  'ct-enfilacion': ['situacion-dos-demoras', 'situacion-demora-distancia', 'demoras-no-simultaneas'],
  'demoras-no-simultaneas': ['situacion-dos-demoras', 'corriente-desconocida', 'situacion-demora-distancia'],
  'situacion-dos-distancias': ['situacion-demora-distancia', 'situacion-dos-demoras', 'demoras-no-simultaneas'],
  'situacion-demora-distancia': ['situacion-dos-demoras', 'situacion-dos-distancias', 'demoras-no-simultaneas'],
  'situacion-dos-demoras': ['demoras-no-simultaneas', 'situacion-demora-distancia', 'ct-enfilacion'],
  'distancia-faro': ['rumbo-pasar-distancia', 'situacion-demora-distancia', 'estima-directa'],
  'rumbo-pasar-distancia': ['rumbo-distancia', 'distancia-faro', 'corriente-rumbo-a-dar'],
  'estima-directa': ['rumbo-distancia', 'estima-analitica', 'corriente-efectiva'],
  'rumbo-distancia': ['estima-directa', 'rumbo-pasar-distancia', 'corriente-rumbo-a-dar'],
};

// Barajar de forma estable (las opciones no cambian de sitio al volver a la pregunta), como en src/exams/intencion.js.
function semilla(s) { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
function barajar(lista, clave) {
  let x = semilla(clave) || 1;
  const r = () => { x ^= x << 13; x ^= x >>> 17; x ^= x << 5; return (x >>> 0) / 4294967296; };
  const a = [...lista];
  for (let i = a.length - 1; i > 0; i--) { const k = Math.floor(r() * (i + 1)); [a[i], a[k]] = [a[k], a[i]]; }
  return a;
}

const HORA = /\b(\d{1,2}) ?(?:[:h.-]|h ?) ?(\d{2})(?!\d)|\b(\d{2})(\d{2}) ?h\b/gi;
/** El trozo del enunciado que delata el tipo: desde la palabra que casa hasta el final de la frase (o unas palabras). */
function cita(texto, i, largo) {
  const a = Math.max(0, texto.lastIndexOf(' ', i) + 1);
  const fin = texto.slice(i + largo).search(/[.;?]\s|[.;?]$/);
  let b = fin < 0 ? texto.length : i + largo + fin;
  if (b - a > 110) { b = texto.indexOf(' ', a + 90); if (b < 0) b = texto.length; }
  return `${a > 0 ? '…' : ''}${texto.slice(a, b).trim()}${b < texto.length ? '…' : ''}`;
}

/** Qué dato del enunciado delata el tipo: la cita, o null si no se encuentra (se explica solo con la regla). */
export function delator(enunciado, tipo) {
  const t = TIPOS[tipo];
  const e = String(enunciado ?? '').replace(/\s+/g, ' ');
  if (!t || !e) return null;
  if (t.dosHoras) {
    const horas = [...e.matchAll(HORA)];
    const distintas = horas.filter((m, i) => horas.findIndex((x) => x[0] === m[0]) === i);
    if (distintas.length >= 2) {
      // Desde el principio de la frase (o del trozo) de la segunda hora.
      const i = distintas[1].index;
      const ini = Math.max(0, ...['. ', '; ', ', '].map((x) => e.lastIndexOf(x, i) + 2).filter((x) => x > 1 && i - x < 40));
      return cita(e, ini, i - ini + distintas[1][0].length);
    }
  }
  for (const re of t.claves) {
    const m = e.match(re);
    if (m) return cita(e, m.index, m[0].length);
  }
  return null;
}

/**
 * El primer paso «¿Qué tipo de problema es?» de una pregunta, o null si su tipo no es uno de los de carta que se enseñan.
 * @param {{ id: string, enunciado: string }} q
 * @param {string} tipo  el tipo de la pregunta (`tipoDePregunta`: el `ejercicio` de su solución)
 * @returns {{ tipo, pregunta, opciones: { id, texto, ok }[], explica: (elegido?) => string }|null}
 */
export function preguntaDeTipo(q, tipo) {
  if (!TIPOS[tipo] || !NOMBRES_TIPO[tipo]) return null;
  const otros = (CONFUNDE_TIPO[tipo] ?? []).filter((x) => x !== tipo && NOMBRES_TIPO[x]).slice(0, 3);
  const opciones = barajar([{ id: tipo, texto: NOMBRES_TIPO[tipo], ok: true }, ...otros.map((x) => ({ id: x, texto: NOMBRES_TIPO[x], ok: false }))], `${q.id}:tipo`);
  const dato = delator(q.enunciado, tipo);
  return {
    tipo, pregunta: '¿Qué tipo de problema es?', opciones,
    /** Por qué es de ese tipo (y, si se eligió otro, cuándo sería ese otro), en frases. */
    partes: (elegido = null) => {
      const partes = [`Es «${NOMBRES_TIPO[tipo]}»: ${TIPOS[tipo].cuando}.`];
      if (dato) partes.push(`Lo delata este dato del enunciado: «${dato.replace(/^…|…$/g, '').trim()}».`);
      if (elegido && elegido !== tipo && TIPOS[elegido]) partes.push(`«${NOMBRES_TIPO[elegido]}» sería si ${TIPOS[elegido].cuando}.`);
      return partes;
    },
    explica(elegido = null) { return this.partes(elegido).join(' '); },
    dato,
  };
}

// ---- 2. Ayuda por escalones
/** Qué buscar en cada tipo de paso (el primer escalón). */
export const PISTAS = {
  declinacion: 'Busca en la rosa de la carta la declinación, su año y su variación anual, y cuenta los años que han pasado.',
  ct: 'Junta la declinación y el desvío, cada uno con su signo (E +, W −).',
  aguja: 'Mira hacia dónde vas: de aguja a verdadero se suma la Ct; de verdadero a aguja, se resta.',
  marcacion: 'La marcación se cuenta desde la proa: súmala al rumbo si es por estribor y réstala si es por babor.',
  linea: 'Une los dos faros en la carta y mide su dirección desde el barco hacia ellos.',
  situacion: 'Busca dónde se cortan las líneas de posición que ya tienes.',
  medida: 'Une los dos puntos en la carta y mide el rumbo con el transportador y la distancia con el compás.',
  tiempo: 'Relaciona distancia, velocidad y tiempo (d = V · t), con el tiempo en horas.',
  tangente: 'Desde tu situación, el rumbo que pasa rozando el círculo de la distancia de paso, por la banda que pide el enunciado.',
  abatimiento: 'Mira por qué banda entra el viento: el barco cae hacia sotavento.',
  corriente: 'Piensa en el triángulo: lo que hace el barco, lo que arrastra la corriente (hacia donde va) y lo que sale de verdad.',
  traslado: 'Entre las dos observaciones el barco ha navegado: la primera línea viaja con él.',
  estima: 'Desde la salida, el rumbo sobre el fondo y la distancia navegada.',
  loxodromica: 'Separa cada rumbo en lo que avanzas hacia el N o el S (Δl) y hacia el E o el W (apartamiento).',
  marea: 'En el Anuario, la pleamar y la bajamar que rodean la hora, y en qué punto del tramo estás.',
  sonda: 'La sonda de la carta está medida en la bajamar más baja: la marea se le suma.',
  'hora-legal': 'El Anuario da las horas en UT: el adelanto las pasa a hora oficial.',
  trazado: 'Piensa qué línea de posición o qué rumbo toca ahora.',
};

/** La regla de cada tipo de paso, cuando el paso no trae su cuenta escrita (el segundo escalón). */
export const REGLAS = {
  declinacion: 'dm del año = dm de la carta + variación anual × años.',
  ct: 'Ct = dm + Δ.',
  aguja: 'Rv = Ra + Ct · Dv = Da + Ct (y al revés, restando).',
  marcacion: 'Dv = Rv + M (estribor +, babor −).',
  linea: 'La demora de la oposición o de la enfilación se mide en la carta, del barco hacia los faros.',
  situacion: 'Desde el faro se traza la opuesta de la demora (Dv ± 180°); el corte de las líneas es la situación.',
  medida: 'Rumbo en el transportador desde el N verdadero; distancia en la escala de latitudes.',
  tiempo: 'd = V · t · t = d / V · minutos / 60 = horas.',
  tangente: 'El rumbo es tangente al círculo con centro en el faro y radio la distancia de paso.',
  abatimiento: 'Rs = Rv + Ab (viento por babor, Ab +; por estribor, Ab −).',
  corriente: 'Efectivo = barco + corriente, sumando vectores (no velocidades).',
  traslado: 'La 1ª línea se traslada paralela a sí misma el rumbo y la distancia navegados entre las dos.',
  estima: 'Desde la salida, el rumbo y la distancia navegados (con corriente, el efectivo).',
  loxodromica: 'Δl = d · cos R · A = d · sen R · ΔL = A / cos lm.',
  marea: 'Altura = altura de la bajamar + corrección de la tabla (amplitud, intervalo y duración).',
  sonda: 'Sonda = sonda de la carta + altura de la marea.',
  'hora-legal': 'Hora oficial = UT + adelanto · UT = hora oficial − adelanto.',
  trazado: 'Primero lo que da la situación; después, lo que sale de ella.',
};

/** Las líneas de la cuenta del paso sin su resultado (las que no escriben el valor que se pide). */
export function cuentaSinResultado(p) {
  if (!p?.lineas?.length || !p.pide?.campos?.length) return [];
  const campos = p.pide.campos;
  /** ¿Escribe este trozo el valor que se pide (o uno de ellos)? Se lee con la magnitud del campo, o por su texto. */
  const daValor = (trozo) => campos.some((c) => {
    const q = quantity(c.kind);
    const t = trozo.trim().replace(/\s*\((?:[^()]*)\)\s*$/, '').replace(/\s+(UT|millas|nudos|m)$/i, '');
    const f = q.format(c.value);
    if ([f, f.replace(/^[+−-]/, '')].some((x) => x.length >= 2 && trozo.includes(x))) return true;
    for (const x of [t, trozo.trim()]) {
      let v = NaN;
      try { v = q.parse(x); } catch { /* no se lee */ }
      if (Number.isFinite(v) && q.error(v, c.value) <= q.tolerance) return true;
    }
    return false;
  });
  const out = [];
  for (const l of p.lineas) {
    // La línea se corta en el primer «=» tras el que viene el resultado: «D = 23:25 − 17:16 = …».
    const partes = l.split('=');
    const k = partes.findIndex((x, i) => i > 0 && daValor(x));
    let linea = l;
    if (k > 0) linea = `${partes.slice(0, k).join('=').trimEnd()} = …`;
    else if (partes.length === 1 && daValor(l)) continue;
    // Lo que queda sin cuenta («Rv = …», «l = …»), fuera.
    if (k > 0 && !/\d/.test(partes.slice(0, k).join('='))) continue;
    out.push(linea);
  }
  while (out.length && /:\s*$/.test(out.at(-1))) out.pop();
  return out;
}

/**
 * Los tres escalones de ayuda de un paso (de `pasosGuiados`): la pista, la fórmula o la regla con los datos y el valor.
 * @returns {{ id: 'pista'|'formula'|'valor', titulo: string, texto?: string, lineas?: string[] }[]}
 */
export function escalones(p) {
  if (!p?.pide) return [];
  const paso = p.pide.paso;
  const buscas = p.pide.campos.map((c) => c.label).filter(Boolean).join(' y ');
  const pista = [PISTAS[paso], buscas ? `Buscas: ${buscas}.` : null].filter(Boolean).join(' ');
  const cuenta = cuentaSinResultado(p);
  const regla = p.plantea ?? REGLAS[paso] ?? (p.errores?.[0] ? AVISOS[p.errores[0]]?.no : null) ?? 'Mira la explicación del paso anterior.';
  return [
    { id: 'pista', titulo: 'Pista', texto: pista },
    { id: 'formula', titulo: cuenta.length ? 'La fórmula con tus datos' : 'La regla', texto: regla, lineas: cuenta },
    { id: 'valor', titulo: 'Dímelo', texto: null },
  ];
}

/** «con 2 ayudas» (o nada si no usó ninguna). */
export const textoAyudas = (n) => (n > 0 ? `con ${n === 1 ? '1 ayuda' : `${n} ayudas`}` : '');

/** Resumen de las ayudas de un recorrido: cuántos pasos se hicieron con alguna ayuda y cuántas en total. */
export function resumenAyudas(resultados) {
  const con = resultados.filter((r) => (r.ayudas ?? 0) > 0 && r.resultado !== 'dimelo' && r.resultado !== 'relleno');
  return { pasos: con.length, ayudas: con.reduce((s, r) => s + r.ayudas, 0) };
}

// ---- 3. Ejemplo resuelto y otro con huecos
/**
 * Dos preguntas reales del mismo tipo que `q` para enseñar: la resuelta y la de huecos. Solo de la práctica y nunca
 * reservadas; siempre las mismas para una misma pregunta (por su id), y distintas entre sí y de `q`.
 * @param {{ q: object, tipo: string, practica: object[], reservadas?: Set<string>, tipoDe: (q) => string|null, sirve?: (q) => boolean }} o
 *   `tipoDe`: el tipo de una candidata (null si no tiene resolución); `sirve`: si se puede resolver paso a paso
 * @returns {{ resuelto: object|null, huecos: object|null }}
 */
export function ejemplosDelTipo({ q, tipo, practica, reservadas = new Set(), tipoDe, sirve = () => true }) {
  const mismas = (practica ?? []).filter((x) => x.id !== q.id && !reservadas.has(x.id) && x.tit === q.tit && tipoDe(x) === tipo);
  const orden = barajar(mismas, `${q.id}:ejemplo`);
  const elegidas = [];
  for (const x of orden) { if (sirve(x)) elegidas.push(x); if (elegidas.length === 2) break; }
  return { resuelto: elegidas[0] ?? null, huecos: elegidas[1] ?? null };
}

/** Los pasos que van rellenos en el ejemplo con huecos: la primera mitad (por abajo) de los que se preguntan. */
export function pasosRellenos(pasos) {
  const preguntados = pasos.filter((p) => p.pide).map((p) => p.i);
  return new Set(preguntados.slice(0, Math.floor(preguntados.length / 2)));
}

/** Nombre del tipo de paso, para el progreso. */
export const nombrePaso = (paso) => PASOS[paso]?.nombre ?? '';
