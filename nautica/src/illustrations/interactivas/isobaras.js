// Meteo, variante isobaras: borrasca o anticiclón, posición del barco y separación de las isobaras. El mando de
// posición enseña también la ley de Buys-Ballot. Hemisferio norte.
import { vientoEnPunto, intensidad, rumboNombre } from '../../nautical/meteo.js';
import { rad } from './kit.js';
import { T, TXT, lienzo, rotulo, etiqueta, flecha, rosaNorte, f1 } from '../estilo-c.js';

// Estilo C (docs/ESTILO-LAMINAS.md): isobaras de carta con su presión en hPa, la B roja o la A azul (con su letra) y
// el viento en magenta, más largo y grueso cuanto más juntas están las isobaras.
const W = 358;
const H = 300;
const C = [179, 150];
const R = 92;

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
    const B = e.centro === 'B';
    const alt = `Isobaras ${e.separacion <= 19 ? 'muy juntas' : e.separacion <= 25 ? 'juntas' : 'separadas'} alrededor de ${B ? 'una borrasca' : 'un anticiclón'}; tu barco está al ${rumboNombre(e.posicion)} del centro y el viento sopla del ${rumboNombre(r.desde)}, ${r.int.texto}, cruzando las isobaras hacia ${B ? 'dentro' : 'fuera'}.`;
    const { out, id, cierra } = lienzo(W, H, alt, { fondo: T.agua2 });
    out.push(`<clipPath id="${id}-c"><rect x="6" y="6" width="${W - 12}" height="${H - 12}"/></clipPath><g clip-path="url(#${id}-c)">`);
    for (let i = 1; i <= 7; i++) out.push(`<circle data-parte="isobaras" cx="${C[0]}" cy="${C[1]}" r="${i * e.separacion}" fill="none" stroke="${T.tinta}" stroke-width="1.1"/>`);
    out.push('</g>');
    // la presión de una de cada dos isobaras (4 hPa entre una y otra), hacia el SW
    for (const i of [2, 4, 6]) {
      const [x, y] = [C[0] - Math.sin(rad(45)) * i * e.separacion, C[1] + Math.cos(rad(45)) * i * e.separacion];
      if (x > 30 && y < H - 30) out.push(etiqueta(x, y, String(B ? 996 + (i - 1) * 4 : 1028 - (i - 1) * 4), { size: TXT.min, p: 'isobaras' }));
    }
    out.push(rotulo(C[0], C[1] + 13, e.centro, { size: 36, weight: 700, estilo: 'serif', color: B ? T.rojoTxt : T.azulTxt, p: 'centro' }));
    out.push(rosaNorte(W - 30, 36));
    const b = [C[0] + R * Math.sin(rad(e.posicion)), C[1] - R * Math.cos(rad(e.posicion))];
    const len = 30 + r.int.t * 40;
    const v = [Math.sin(rad(r.hacia)), -Math.cos(rad(r.hacia))];
    out.push(flecha(b[0] - (v[0] * len) / 2, b[1] - (v[1] * len) / 2, b[0] + (v[0] * len) / 2, b[1] + (v[1] * len) / 2, { color: T.magenta, w: 1.8 + r.int.t * 1.4, p: 'viento' }));
    out.push(`<circle data-parte="barco" cx="${f1(b[0])}" cy="${f1(b[1])}" r="7" fill="${T.papel}" stroke="${T.tinta}" stroke-width="1.6"/><circle cx="${f1(b[0])}" cy="${f1(b[1])}" r="2.2" fill="${T.tinta}"/>`);
    out.push(rotulo(14, H - 14, 'hemisferio norte · cada 4 hPa', { size: TXT.min, estilo: 'serif', italic: true, anchor: 'start', color: T.apagado }));
    out.push(cierra());
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
