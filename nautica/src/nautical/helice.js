// Hélice y timón: hacia dónde cae la popa. Funciones puras con la convención del examen.
//  - Presión lateral de las palas: dextrógira avante → popa a estribor; dextrógira atrás → popa a babor
//    (levógira, al revés). Dando atrás el efecto es muy marcado.
//  - Timón (con arrancada): avante, la popa va a la banda contraria a la que metes la caña… del timón; es decir,
//    timón a estribor → proa a estribor y popa a babor. Atrás, la popa va hacia la banda del timón.
//  - Si se oponen: avante, en cuanto hay arrancada manda el timón; atrás, con poca arrancada manda la hélice.

const otra = (b) => (b === 'estribor' ? 'babor' : 'estribor');
const BANDA = { er: 'estribor', br: 'babor', estribor: 'estribor', babor: 'babor' };

/**
 * @param {{ marcha: 'avante'|'atras', sentido: 'dextrogira'|'levogira', timon: 'br'|'via'|'er' }} p
 * @returns {{ popa, proa, popaHelice, popaTimon: string|null, dominante: 'helice'|'timon'|'ambos', matiz: string }}
 */
export function caidaPopa({ marcha, sentido, timon }) {
  const atras = marcha === 'atras';
  const dex = sentido !== 'levogira';
  const popaHelice = dex !== atras ? 'estribor' : 'babor';
  const t = timon === 'via' ? null : BANDA[timon];
  const popaTimon = t ? (atras ? t : otra(t)) : null;
  let popa;
  let dominante;
  let matiz;
  if (!popaTimon) {
    popa = popaHelice;
    dominante = 'helice';
    matiz = atras ? 'Con el timón a la vía solo actúa la hélice, y dando atrás su efecto es muy marcado.' : 'Con el timón a la vía solo actúa la hélice; avante el efecto es pequeño.';
  } else if (popaTimon === popaHelice) {
    popa = popaTimon;
    dominante = 'ambos';
    matiz = 'Hélice y timón empujan la popa hacia la misma banda: el efecto se suma.';
  } else if (!atras) {
    popa = popaTimon;
    dominante = 'timon';
    matiz = 'Se oponen: avante, en cuanto el barco coge arrancada manda el timón; solo al arrancar se nota la hélice.';
  } else {
    popa = popaHelice;
    dominante = 'helice';
    matiz = 'Se oponen: dando atrás y con poca arrancada manda la hélice; el timón solo gobierna cuando el barco ya va hacia atrás con velocidad.';
  }
  return { popa, proa: otra(popa), popaHelice, popaTimon, dominante, matiz };
}
