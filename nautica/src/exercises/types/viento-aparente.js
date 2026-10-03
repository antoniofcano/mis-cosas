import { defineExercise } from '../define.js';
import { vientoAparente } from '../../nautical/viento.js';
import { fmtKnots } from '../helpers.js';

const coma = (n, d = 1) => (+n).toFixed(d).replace('.', ',');
const lado = (a) => (a < 67.5 ? 'la amura' : a <= 112.5 ? 'el través' : 'la aleta');

export default defineExercise({
  id: 'viento-aparente',
  title: 'Viento aparente',
  category: 'viento',
  levels: ['PER', 'PY'],
  difficulty: 2,
  concepts: [],
  summary: 'Con el viento real y la velocidad del barco, por dónde y con qué fuerza se nota el viento a bordo.',
  method: [
    'El viento aparente es la suma del real y del viento de avance, que viene siempre de proa con la velocidad del barco.',
    'Descompón el real: hacia proa vr · cos α y de costado vr · sen α (α = ángulo del real desde la proa).',
    'Suma el avance a la componente de proa: proa = vr · cos α + vb.',
    'Ángulo del aparente desde la proa = arctg(costado / proa); intensidad = √(proa² + costado²).',
    'Con arrancada avante el aparente entra siempre más hacia proa que el real.',
  ],

  generate(rng) {
    return { ang: rng.step(30, 150, 5), banda: rng.int(0, 1) ? 'estribor' : 'babor', vr: rng.int(8, 20), vb: rng.int(4, 8) };
  },

  statement(p) {
    return `Navegamos a ${fmtKnots(p.vb)}. El viento real, de ${fmtKnots(p.vr)}, entra a ${p.ang}° de la proa por ${p.banda} (por ${lado(p.ang)}). ¿A cuántos grados de la proa y con qué intensidad notamos el viento aparente?`;
  },

  answers: [
    { key: 'ang', label: 'Ángulo del aparente desde la proa (°)', kind: 'bearing', tolerance: 2 },
    { key: 'va', label: 'Intensidad del aparente', kind: 'speed', tolerance: 0.5 },
  ],

  solve(p) {
    const r = vientoAparente({ angReal: p.ang, vr: p.vr, vb: p.vb });
    return {
      results: { ang: r.ang, va: r.va },
      steps: [
        { title: 'Componentes del real', text: `De proa: ${p.vr} · cos ${p.ang}° = ${coma(p.vr * Math.cos((p.ang * Math.PI) / 180))} kn; de costado: ${p.vr} · sen ${p.ang}° = ${coma(r.costado)} kn.` },
        { title: 'Más el avance', text: `El avance añade ${p.vb} kn de proa: ${coma(r.proa)} kn de proa.` },
        { title: 'Aparente', text: `Ángulo = arctg(${coma(r.costado)} / ${coma(r.proa)}) = ${Math.round(r.ang)}° por ${p.banda}; intensidad = √(${coma(r.proa)}² + ${coma(r.costado)}²) = ${coma(r.va)} kn.` },
        { title: 'Comprobación', text: `Entra más hacia proa que el real (${Math.round(r.ang)}° frente a ${p.ang}°), como siempre con arrancada avante.` },
      ],
    };
  },

  mistakes: [
    { id: 'resta-avance', explain: 'Has restado el avance: el viento de avance viene de proa y se SUMA a la componente de proa del real.', mutate: (p) => ({ ...p, vb: -p.vb }) },
  ],
});
