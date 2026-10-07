// Figuras de las preguntas de Andalucía 2015–2019 que el cuestionario dibuja en la página (banderas, piezas, un mapa del
// tiempo). Son pocas y se localizaron a mano (imágenes y grupos de trazos de los cuestionarios del modelo A, junto al
// número de su pregunta); este guion las recorta de los PDF de la caché y deja:
//   data/ejes/andalucia/img/<id>.png                  la figura (solo la zona del dibujo, sin el texto de la pregunta)
//   tools/bancos/ejes/andalucia/figuras.json          { "<conv>|<modelo>|<número>": ["img/<id>.png"] } (lo lee el adaptador)
// Se ejecuta a mano con los PDF en la caché: node tools/bancos/ejes/andalucia/figuras.mjs
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { RAIZ, cacheEje, dirEje, escribirJSON, python } from '../../lib/comun.mjs';

/** Zona de cada figura: PDF de la caché, página y rectángulo en puntos (con las apariciones de su pregunta). */
export const FIGURAS = [
  { id: 'and-2016-c2-t26', pdf: '2016-c2_per_A_cuestionario.pdf', pagina: 6, zona: [405, 675, 520, 778], apariciones: ['and-2016-c2|A|26', 'and-2016-c2|B|25'], que: 'bandera «A» (blanca y azul, cortada en cola de golondrina)' },
  { id: 'and-2019-c2-t01', pdf: '2019-c2_per_A_cuestionario.pdf', pagina: 3, zona: [304, 217, 522, 338], apariciones: ['and-2019-c2|A|1', 'and-2019-c2|B|1'], que: 'hélice con una flecha al cono del extremo (capacete)' },
  { id: 'and-2019-c2-t21', pdf: '2019-c2_per_A_cuestionario.pdf', pagina: 6, zona: [398, 457, 556, 540], apariciones: ['and-2019-c2|A|21', 'and-2019-c2|B|23'], que: 'bandera «A» (blanca y azul, cortada en cola de golondrina)' },
  { id: 'and-2019-c3-t01', pdf: '2019-c3_per_A_cuestionario.pdf', pagina: 3, zona: [392, 195, 540, 316], apariciones: ['and-2019-c3|A|1', 'and-2019-c3|B|1'], que: 'timón con una flecha a la mecha' },
  { id: 'and-py-2016-c1-g17', pdf: '2016-c1_py_generico_cuestionario.pdf', pagina: 5, zona: [120, 470, 415, 672], apariciones: ['and-py-2016-c1|generico|17'], que: 'depresión con frente cálido y frío; la X en el sector cálido, delante del frente frío' },
];

export function recortar() {
  const mapa = {};
  for (const f of FIGURAS) {
    const pdf = join(cacheEje('andalucia'), 'pdf', f.pdf);
    const rel = `img/${f.id}.png`;
    if (!existsSync(pdf)) throw new Error(`falta ${pdf} en la caché (npm run bancos -- andalucia --todas)`);
    python('recorte.py', [pdf, String(f.pagina), ...f.zona.map(String), join(RAIZ, 'data', 'ejes', 'andalucia', rel), '150']);
    for (const a of f.apariciones) mapa[a] = [rel];
  }
  escribirJSON(join(dirEje('andalucia'), 'figuras.json'), mapa);
  return mapa;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) console.log(JSON.stringify(recortar(), null, 1));
