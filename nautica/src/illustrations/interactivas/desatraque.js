// Desatraque de costado, en estilo C (docs/ESTILO-LAMINAS.md): viento, esprín que trabaja y máquina → abre la proa, abre
// la popa o se queda contra el muelle. Barco atracado por babor con hélice dextrógira; reutiliza el cálculo de hélice y
// timón (src/nautical/desatraque.js). También es una animación (src/ui/animacion.js): el giro alrededor de la defensa y la
// salida salen de src/nautical/maniobra-puerto.js (respuesta de primer orden, como el modelo de Nomoto).
import { desatraque as calc } from '../../nautical/desatraque.js';
import { desatraqueMovimiento } from '../../nautical/maniobra-puerto.js';
import { enInstante, YATE } from '../../nautical/maniobra.js';
import { T, TXT, lienzo, rotulo, cartela, flecha, tierra, f1, cascoPlanta } from '../estilo-c.js';
import { pista, el, aparece, situa } from '../animaciones/pista.js';

const W = 358;
const H = 330;
const K = 14; // px por metro
const L = YATE.eslora;
const B = YATE.manga;
const LPX = L * K;
const O = [W / 2, 196]; // centro del barco atracado
const MUELLE = O[1] + (B / 2) * K; // el costado de babor toca el muelle
const NOMBRE = { 'abre-popa': 'Abre la popa', 'abre-proa': 'Abre la proa', 'se-queda': 'Se queda contra el muelle', 'se-separa': 'El viento lo separa' };
const VIENTO = { calma: 'en calma', tierra: 'de tierra (sopla desde el muelle)', mar: 'de la mar (lo aprieta contra el muelle)' };
const P = (x, y) => [O[0] + x * K, O[1] - y * K];
/** Punto del barco (en metros, en sus ejes: a hacia proa, b hacia estribor) en la situación m. */
function puntoBarco(m, a, b) {
  const r = (m.rumbo * Math.PI) / 180;
  return [m.x + Math.sin(r) * a + Math.cos(r) * b, m.y + Math.cos(r) * a - Math.sin(r) * b];
}

const pistas = new Map();
/** Pista de la animación de un estado (con su resultado). */
export function pistaDesatraque(e, r) {
  const clave = `${e.viento}|${e.esprin}|${e.maquina}`;
  if (pistas.has(clave)) return pistas.get(clave);
  const mov = desatraqueMovimiento({ resultado: r.resultado, esprin: e.esprin, maquina: e.maquina, viento: e.viento });
  const ms = mov.muestras;
  const avante = e.maquina === 'avante';
  const sale = r.resultado === 'abre-popa' ? 'atrás' : 'avante';
  const hitos = [{ t: 0, nombre: 'Atracado por babor', texto: `El barco está atracado por babor, con el esprín de ${e.esprin} y el viento ${VIENTO[e.viento]}.` },
    { t: 1.2, nombre: avante ? 'Máquina avante' : 'Máquina atrás', texto: `Se da poca máquina ${avante ? 'avante' : 'atrás'}${r.timon === 'br' ? ' con el timón al muelle (a babor)' : ''}.${r.trabaja ? ` El esprín de ${e.esprin} se tensa y no le deja ${avante ? 'avanzar' : 'retroceder'}.` : ` El esprín de ${e.esprin} no trabaja: queda en banda.`}` }];
  if (mov.tAbierta != null) {
    hitos.push({ t: 3, nombre: `Pivota en la defensa de la ${e.esprin === 'proa' ? 'amura' : 'aleta'}`, texto: `El barco gira alrededor de la defensa: ${r.resultado === 'abre-popa' ? 'la popa se separa del muelle' : 'la proa se separa del muelle'}.` },
      { t: mov.tAbierta, nombre: `${r.resultado === 'abre-popa' ? 'Popa' : 'Proa'} abierta`, texto: `Ya está abierta unos ${Math.round(Math.max(...ms.map((m) => m.abierto)))}°: se larga el esprín.` },
      { t: mov.tSale, nombre: `Sale ${sale}`, texto: `Con el esprín largado y el timón a la vía, sale ${sale} hacia el agua libre.` });
  } else if (r.resultado === 'se-separa') {
    hitos.push({ t: 4, nombre: 'El viento lo separa', texto: 'El viento de tierra empuja el barco de costado y lo separa del muelle.' });
  } else {
    hitos.push({ t: 4, nombre: 'Se queda', texto: r.texto });
  }
  const duracion = mov.fin;
  const tFijo = mov.tAbierta ?? duracion;
  const cuerda = (m) => {
    // el esprín: de la cornamusa de la amura (o de la aleta) al noray, más a popa (o más a proa)
    const a = e.esprin === 'proa' ? L / 2 - 0.8 : -L / 2 + 0.8;
    const [px, py] = puntoBarco(m, a, -B / 2 + 0.4);
    const nx = e.esprin === 'proa' ? -L / 2 + 6.5 : L / 2 - 6.5;
    return { a: P(px, py), b: P(nx, -B / 2 - 0.6) };
  };
  function cambios(t) {
    const m = enInstante(ms, t);
    const [bx, by] = P(m.x, m.y);
    const cu = cuerda(m);
    return {
      barco: { transform: situa(bx, by, m.rumbo) },
      esprin: { x1: f1(cu.a[0]), y1: f1(cu.a[1]), x2: f1(cu.b[0]), y2: f1(cu.b[1]), opacity: m.suelto ? '0' : '1', 'stroke-dasharray': r.trabaja && t >= 1.2 ? 'none' : '6 5' },
      maquina: { opacity: t >= 1.2 && !m.suelto ? '1' : '0' },
      salida: { opacity: m.suelto ? '1' : '0' },
      reloj: { texto: `${Math.round(t)} s · ${m.suelto ? 'esprín largado' : t >= 1.2 ? `máquina ${avante ? 'avante' : 'atrás'}` : 'atracado'}` },
      resultado: { opacity: aparece(t, hitos[Math.min(3, hitos.length - 1)].t) },
    };
  }
  const p = pista({ duracion, hitos, tFijo, cambios, svg: (t) => dibuja(e, r, t, cambios(t), false), datos: mov });
  pistas.set(clave, p);
  return p;
}

/** El dibujo en un instante (c: los cambios de ese instante). */
function dibuja(e, r, t, c, pendiente) {
  const alt = `Desatraque visto desde arriba: el barco atracado por babor, con la proa a la izquierda y el muelle abajo; viento ${VIENTO[e.viento]}, el esprín de ${e.esprin} y máquina ${e.maquina === 'avante' ? 'avante' : 'atrás'}.${pendiente ? '' : ` ${NOMBRE[r.resultado]}.`}`;
  const { out, pt, cierra } = lienzo(W, H, alt, { fondo: T.agua2 });
  out.push(tierra(`M0,${f1(MUELLE + 2)} H${W} V${H} H0 Z`, pt), rotulo(W - 14, H - 14, 'MUELLE', { size: TXT.rotulo, weight: 700, estilo: 'cap', anchor: 'end', espacio: 2 }));
  // el viento
  if (e.viento === 'calma') out.push(rotulo(14, 30, 'viento en calma', { size: TXT.nota, estilo: 'serif', italic: true, anchor: 'start', color: T.apagado, p: 'viento' }));
  else {
    const g = [rotulo(14, 30, `viento ${e.viento === 'tierra' ? 'de tierra' : 'de la mar'}`, { size: TXT.nota, estilo: 'serif', italic: true, weight: 700, anchor: 'start' })];
    for (const x of [150, 230, 310]) g.push(e.viento === 'tierra' ? flecha(x, 104, x, 62) : flecha(x, 60, x, 102));
    out.push(`<g data-parte="viento">${g.join('')}</g>`);
  }
  // dónde estaba atracado
  out.push(`<g transform="${situa(O[0], O[1], 270)}"><path d="${cascoPlanta(LPX, B * K)}" fill="none" stroke="${T.apagado}" stroke-width="1" stroke-dasharray="4 3"/></g>`);
  // los norays y la defensa (en el pivote)
  const nx = e.esprin === 'proa' ? -L / 2 + 6.5 : L / 2 - 6.5;
  const [qx, qy] = P(nx, -B / 2 - 0.6);
  out.push(`<circle cx="${f1(qx)}" cy="${f1(qy)}" r="5" fill="${T.negro}" stroke="${T.tinta}" stroke-width="1"/>`);
  const [dx, dy] = P(e.esprin === 'proa' ? -L / 2 + 1.2 : L / 2 - 1.2, -B / 2);
  out.push(`<rect data-parte="defensa" x="${f1(dx - 7)}" y="${f1(dy - 4)}" width="14" height="8" rx="4" fill="${T.amarillo}" stroke="${T.tinta}" stroke-width="1.2"/>`);
  // el esprín (continuo si trabaja, a trazos si queda en banda)
  out.push(el('esprin', 'line', { 'data-parte': 'esprin', stroke: T.magenta, 'stroke-width': 2.2, 'stroke-linecap': 'round' }, c));
  // el barco: proa a la izquierda (rumbo 270°), con la pala del timón (al muelle si avante sobre el esprín de proa)
  const pala = r.timon === 'br' ? `<line x1="0" y1="${f1(LPX / 2)}" x2="${f1(-8)}" y2="${f1(LPX / 2 + 14)}" stroke="${T.tinta}" stroke-width="3" stroke-linecap="round"/>`
    : `<line x1="0" y1="${f1(LPX / 2)}" x2="0" y2="${f1(LPX / 2 + 16)}" stroke="${T.tinta}" stroke-width="3" stroke-linecap="round"/>`;
  const avante = e.maquina === 'avante';
  const empuje = el('maquina', 'g', { 'data-parte': 'maquina' }, c, avante ? flecha(0, LPX / 2 - 30, 0, LPX / 2 - 80, { color: T.magenta, w: 2.2 }) : flecha(0, LPX / 2 - 80, 0, LPX / 2 - 30, { color: T.magenta, w: 2.2 }));
  out.push(el('barco', 'g', {}, c, `<path d="${cascoPlanta(LPX, B * K)}" fill="${T.casco}" stroke="${T.tinta}" stroke-width="1.4" stroke-linejoin="round"/>` +
    `<line x1="0" y1="${f1(-LPX / 2 + 6)}" x2="0" y2="${f1(LPX / 2 - 4)}" stroke="${T.tinta}" stroke-width=".6"/>${pala}${empuje}`));
  out.push(rotulo(O[0] - LPX / 2 - 6, O[1] + 4, 'proa', { size: TXT.nota, estilo: 'serif', italic: true, anchor: 'end' }));
  // la salida, al largar el esprín
  const abre = r.resultado === 'abre-popa' || r.resultado === 'abre-proa';
  out.push(el('salida', 'g', {}, c, abre ? rotulo(W / 2, 50, r.resultado === 'abre-popa' ? 'largado el esprín, sale atrás' : 'largado el esprín, sale avante', { size: TXT.nota, estilo: 'serif', italic: true, weight: 700, color: T.magenta }) : ''));
  // rótulos: el esprín y lo que pasa
  out.push(rotulo(14, H - 14, `esprín de ${e.esprin}${r.trabaja ? '' : ' (en banda)'}`, { size: TXT.rotulo, weight: 700, estilo: 'serif', anchor: 'start', p: 'esprin' }));
  out.push(el('reloj', 'text', { x: W - 14, y: 30, 'font-size': TXT.min, 'font-weight': 600, 'text-anchor': 'end', fill: T.tinta, class: 'lc-mono' }, c));
  if (!pendiente) out.push(el('resultado', 'g', {}, c, cartela(W / 2, MUELLE + 42, NOMBRE[r.resultado].toUpperCase(), null, { color: T.magenta, size: TXT.min, espacio: 0.6 })));
  out.push(cierra());
  return out.join('');
}

export const desatraque = {
  mandos: [
    { id: 'viento', tipo: 'opciones', etiqueta: 'Viento', opciones: [['calma', 'Calma'], ['tierra', 'De tierra'], ['mar', 'De la mar']] },
    { id: 'esprin', tipo: 'opciones', etiqueta: 'Cabo que dejas trabajando', opciones: [['proa', 'Esprín de proa'], ['popa', 'Esprín de popa']] },
    { id: 'maquina', tipo: 'opciones', etiqueta: 'Máquina', opciones: [['avante', 'Avante'], ['atras', 'Atrás']] },
  ],
  estado: (spec) => {
    const popa = (spec.abrir ?? 'popa') !== 'proa';
    return { viento: spec.viento ?? 'calma', esprin: spec.esprin ?? (popa ? 'proa' : 'popa'), maquina: spec.maquina ?? (popa ? 'avante' : 'atras') };
  },
  calcular: (e) => calc(e),
  pie: () => 'Abrir la popa: esprín de proa, avante y timón al muelle; se sale atrás. Abrir la proa: esprín de popa y atrás; se sale avante. Con viento de la mar, normalmente se abre primero la popa.',
  dibujar(e, r, { pendiente = false, t = null } = {}) {
    const p = pistaDesatraque(e, r);
    const ti = pendiente ? 0 : t ?? p.tFijo;
    const svg = dibuja(e, r, ti, p.cambios(ti), pendiente);
    const base = `Atracado por babor, con hélice dextrógira y viento ${VIENTO[e.viento]}: dejas el esprín de ${e.esprin} y das ${e.maquina === 'avante' ? 'avante' : 'atrás'}.`;
    if (pendiente) return { svg, lectura: `${base} Responde y verás qué pasa.` };
    return { svg, lectura: `${base} ${r.texto}`, casillas: [['Resultado', NOMBRE[r.resultado]], ['El esprín', r.trabaja ? 'trabaja (hace de pivote)' : 'no trabaja (en banda)']] };
  },
  // La maniobra animada: máquina, giro alrededor de la defensa y salida (src/nautical/maniobra-puerto.js).
  animacion: { pista: (e, r) => pistaDesatraque(e, r) },
  prediccion: () => ({
    enunciado: 'Viento de la mar, que te aprieta contra el muelle: ¿por dónde sales?',
    opciones: { a: 'Abriendo la proa', b: 'Abriendo la popa', c: 'Separándote de costado' },
    correcta: 'b',
    tras: 'Con viento de fuera no puedes separarte de costado, y la proa abierta te la devuelve el viento. Se abre primero la popa sobre el esprín de proa, avante y con el timón al muelle, y se sale atrás. Prueba las combinaciones.',
    estado: { viento: 'mar', esprin: 'popa', maquina: 'atras' },
  }),
  partes: {
    esprin: 'El esprín que trabaja hace de pivote: el barco gira alrededor de la defensa en lugar de avanzar o retroceder.',
    defensa: 'La defensa en la amura (o en la aleta) protege el casco donde se apoya mientras gira.',
    maquina: 'Hacia donde empuja la máquina: avante o atrás.',
    viento: 'El viento de tierra te separa del muelle; el de la mar te aprieta contra él.',
  },
};
