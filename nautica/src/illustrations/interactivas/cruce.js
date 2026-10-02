// Cruce de dos buques de propulsión mecánica: por dónde ves al otro → qué luces ves → qué situación es y quién se
// aparta (Reglas 13 a 17). Usa la misma geometría de sectores que «sectores-luces».
// Las situaciones de veleros (vela-amuras, vela-barlovento) dependen del viento y siguen siendo láminas fijas.
import { lucesVisibles, lucesTexto, situacionPorLuces } from '../../nautical/luces.js';
import { planta, noche, desde, MANDO_ASPECTO, PARTES_LUCES, BOTONES_LUCES, PIE_PLANTA, NOTA_BUQUE } from './luces-buque.js';

const ASPECTO_DE = { 'vuelta-encontrada': 0, alcance: 180, cruce: 300 };
const NOMBRE = { 'vuelta-encontrada': 'Vuelta encontrada', alcance: 'Alcance', cruce: 'Cruce' };
const QUIEN = { tu: 'Tú', el: 'Él', 'los-dos': 'Los dos' };

export const cruce = {
  aplica: (spec) => !spec.situacion || spec.situacion in ASPECTO_DE,
  mandos: [MANDO_ASPECTO],
  estado: (spec) => ({ aspecto: Number(spec.aspecto ?? ASPECTO_DE[spec.situacion] ?? 300) }),
  calcular: (e) => {
    const v = lucesVisibles(e.aspecto);
    return { v, ...situacionPorLuces(v) };
  },
  pie: () => 'Por las luces que ves del otro sabes la situación: las dos de costado, vuelta encontrada; solo la blanca de alcance, lo alcanzas tú; su roja, te apartas tú; su verde, se aparta él.',
  dibujar(e, r, { pendiente = false } = {}) {
    const vistas = [{ svg: planta(e.aspecto), pie: PIE_PLANTA }, { svg: noche(e.aspecto), pie: 'Lo que ves tú, de noche' }];
    const nota = NOTA_BUQUE;
    if (pendiente) return { vistas, nota, lectura: 'Responde la pregunta y verás qué situación es y quién se aparta.', casillas: [['Situación', '?'], ['Se aparta', '?']] };
    return {
      vistas,
      nota,
      lectura: `Lo ves ${desde(e.aspecto)} y ves ${lucesTexto(r.v)}. ${r.texto}`,
      casillas: [['Situación', NOMBRE[r.situacion]], ['Se aparta', QUIEN[r.maniobra]], ['Regla', r.regla]],
    };
  },
  prediccion: () => ({
    enunciado: 'Le ves solo una luz blanca. ¿Quién tiene que maniobrar?',
    opciones: { a: 'Tú', b: 'Él', c: 'Los dos' },
    correcta: 'a',
    tras: 'Una sola blanca es su luz de alcance: lo ves por la popa, así que eres tú quien lo alcanza y te mantienes apartado (Regla 13). Rodea el barco con el mando y mira cómo cambia la situación.',
    estado: { aspecto: 180 },
  }),
  partes: PARTES_LUCES,
  botonesPartes: BOTONES_LUCES,
};
