// Meteo, variante isobaras: borrasca o anticiclón, posición del barco y separación de las isobaras. El mando de
// posición enseña también la ley de Buys-Ballot. Hemisferio norte.
import { vientoEnPunto, intensidad, rumboNombre } from '../../nautical/meteo.js';
import { svgOpen, flecha, texto, f1, rad } from './kit.js';

const W = 320;
const H = 260;
const C = [160, 130];
const R = 84;

export const isobaras = {
  mandos: [
    { id: 'centro', tipo: 'opciones', etiqueta: 'Centro de presión', opciones: [['B', 'Borrasca (B)'], ['A', 'Anticiclón (A)']] },
    { id: 'posicion', tipo: 'rango', etiqueta: 'Dónde está tu barco', min: 0, max: 355, paso: 5, texto: (v) => `al ${rumboNombre(v)} del centro`, extremos: ['N', 'E', 'S', 'W', 'N'] },
    { id: 'separacion', tipo: 'rango', etiqueta: 'Separación de las isobaras', min: 14, max: 34, paso: 1, texto: (v) => (v <= 19 ? 'muy juntas' : v <= 25 ? 'juntas' : v <= 30 ? 'separadas' : 'muy separadas'), extremos: ['juntas', 'separadas'] },
  ],
  estado: (spec) => ({ centro: spec.centro === 'A' ? 'A' : 'B', posicion: Number(spec.posicion ?? 135), separacion: Number(spec.separacion ?? 26) }),
  calcular: (e) => ({ ...vientoEnPunto(e), int: intensidad(e.separacion) }),
  pie: () => 'Las isobaras unen puntos de igual presión. Isobaras juntas: más viento. En el hemisferio norte el viento gira en sentido antihorario alrededor de la borrasca y horario alrededor del anticiclón, cruzando las isobaras. De espaldas al viento, la borrasca queda a la izquierda.',
  dibujar(e, r) {
    const out = [svgOpen(W, H, `Isobaras alrededor de ${e.centro === 'B' ? 'una borrasca' : 'un anticiclón'}`)];
    out.push(`<rect width="${W}" height="${H}" rx="10" fill="var(--l-mar)"/>`);
    for (let i = 1; i <= 6; i++) out.push(`<circle data-parte="isobaras" cx="${C[0]}" cy="${C[1]}" r="${i * e.separacion}" fill="none" stroke="var(--l-v)" stroke-width="1.5" opacity=".6"/>`);
    out.push(texto(C[0], C[1] + 11, e.centro, { size: 30, weight: 700, color: e.centro === 'B' ? 'var(--l-r)' : 'var(--l-v)', p: 'centro' }));
    out.push(texto(W - 12, 22, 'N ↑', { anchor: 'end', size: 15 }));
    const b = [C[0] + R * Math.sin(rad(e.posicion)), C[1] - R * Math.cos(rad(e.posicion))];
    const len = 26 + r.int.t * 40;
    const v = [Math.sin(rad(r.hacia)), -Math.cos(rad(r.hacia))];
    out.push(flecha(b[0] - (v[0] * len) / 2, b[1] - (v[1] * len) / 2, b[0] + (v[0] * len) / 2, b[1] + (v[1] * len) / 2, 'var(--l-a)', 3 + r.int.t * 3, 'viento'));
    out.push(`<circle data-parte="barco" cx="${f1(b[0])}" cy="${f1(b[1])}" r="7" fill="var(--text)" stroke="var(--surface)" stroke-width="2"/>`);
    out.push(texto(12, H - 10, 'hemisferio norte', { anchor: 'start', size: 13, weight: 400, color: 'var(--muted)' }));
    out.push('</svg>');
    const bb = e.centro === 'B' ? 'la borrasca te queda a la izquierda (algo adelantada)' : 'el anticiclón te queda a la derecha';
    return {
      svg: out.join(''),
      lectura: `Viento del ${rumboNombre(r.desde)}, ${r.int.texto}. De espaldas al viento, ${bb}.`,
      casillas: [['Viento', `del ${rumboNombre(r.desde)}`], ['Intensidad', r.int.texto]],
    };
  },
  prediccion: () => ({
    enunciado: 'Las isobaras se juntan. ¿Qué hace el viento?',
    opciones: { a: 'Aumenta', b: 'Disminuye', c: 'No cambia' },
    correcta: 'a',
    tras: 'Isobaras juntas quieren decir mucha diferencia de presión en poca distancia (gradiente fuerte): más viento. Compruébalo con el mando de separación y luego rodea la borrasca: de espaldas al viento siempre te queda a la izquierda.',
  }),
  partes: {
    isobaras: 'Isobaras: líneas que unen puntos con la misma presión. Cuanto más juntas, más fuerte el viento.',
    centro: 'Centro: B, borrasca (baja presión, mal tiempo); A, anticiclón (alta presión, buen tiempo).',
    viento: 'El viento gira alrededor del centro y cruza las isobaras: hacia dentro en la borrasca y hacia fuera en el anticiclón.',
    barco: 'Tu barco. Ponte de espaldas al viento: la borrasca queda a tu izquierda (ley de Buys-Ballot, hemisferio norte).',
  },
};
