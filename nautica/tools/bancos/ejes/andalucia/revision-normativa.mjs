// Revisión normativa del banco vivo de Andalucía (fase F1): la resolución, pregunta a pregunta, de las 195 marcas del
// informe (tools/bancos/informes/andalucia-normativa.md, que saca normativa.mjs con detectores anchos a propósito).
//
//   node tools/bancos/ejes/andalucia/revision-normativa.mjs            → comprueba que cada marca tiene resolución
//   node tools/bancos/ejes/andalucia/revision-normativa.mjs --escribir → escribe ajustes.json y lo aplica al banco
//
// Cada decisión se tomó leyendo el texto legal (versión consolidada del BOE o la fuente primaria) y se guarda en
// tools/bancos/ejes/andalucia/ajustes.json con el formato de los ajustes por id (docs/BANCOS.md):
//   { <tit>: { <id>: { norma: { estado, normas, nota? }, revision: { motivos: [{ norma, motivo, fuente }] } } } }
// `norma` es lo que pasa al banco (la etapa «normativa» de los demás ejes copia lo mismo); `revision` es el porqué y la
// fuente de cada norma marcada. Aplicar (--escribir) es reproducible: pone `norma` en preguntas.json y, en las
// «actualizada», añade la nota a la explicación justo después de su primera frase (si no la tiene ya).
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { RAIZ } from '../../lib/comun.mjs';
import { ejecutar } from './normativa.mjs';

const BOE = (id) => `https://www.boe.es/buscar/act.php?id=${id}`;
export const FUENTES = {
  'RD 339/2021': BOE('BOE-A-2021-8268'),
  'RD 587/2022': 'https://www.boe.es/diario_boe/txt.php?id=BOE-A-2022-12013',
  'RD 186/2023': BOE('BOE-A-2023-7410'),
  'RGC art. 73': `${BOE('BOE-A-2014-10345')}#a73`,
  'RD 1188/2025': 'https://www.boe.es/diario_boe/txt.php?id=BOE-A-2025-27010',
  'RD 550/2020': BOE('BOE-A-2020-6745'),
  'RD 191/2026': 'https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-5877',
  'IALA R1001': 'https://www.iala.int/content/uploads/2022/05/C75-10.3.7-Revised-Recommendation-R1001-Ed2.0-The-IALA-Maritime-Buoyage-System-June-2022.pdf',
  'IALA MBS 2010': 'https://www.irishlights.ie/media/11141/IALA-MBS.pdf',
  'BOE-A-2026-510': 'https://www.boe.es/boe/dias/2026/01/09/pdfs/BOE-A-2026-510.pdf',
};

/** Motivo general de cada norma: lo que se comprobó en su texto y por qué la marca no cambia la respuesta. */
const GENERAL = {
  'RD 339/2021': ['RD 339/2021', 'Marca ancha (el detector encaja con una palabra suelta: achique, corredera, bocina, «regla de», balsa…). La pregunta no trata del equipo obligatorio por zonas, que es lo que cambió respecto a la Orden FOM/1144/2003 (arts. 6–13 y 15 del RD 339/2021): la respuesta oficial sigue valiendo.'],
  'RD 587/2022': ['RD 587/2022', 'El RD 587/2022 solo cambia el NAVTEX obligatorio en zona 1 (lista 6.ª) y la homologación de las balsas (ISO 9650 u otra norma equivalente aprobada por la DGMM). La pregunta trata de supervivencia en la balsa, la zafa, la EPIRB, el SART, el AIS o los canales de VHF, que no cambian.'],
  'RD 186/2023': ['RD 186/2023', 'El RD 186/2023 (Reglamento de Ordenación de la Navegación Marítima) deroga la Orden de 1964 de zonas para bañistas y regula el despacho; no toca el balizamiento, el RIPA ni la carta. La pregunta no depende de lo derogado.'],
  'RD 1188/2025 (buceo y ROM)': ['RD 1188/2025', 'El RD 1188/2025 cambia en el buceo los bautismos (1 instructor por alumno), la descompresión de emergencia y el personal mínimo, y en el ROM el despacho; no cambia la bandera «Alfa» (art. 41.3 del RD 550/2020) ni el RIPA (regla 34 d) y anexo IV). La respuesta oficial sigue valiendo.'],
  'RD 191/2026': ['RD 191/2026', 'Marca ancha («fondeadero», «fondo»): la pregunta trata del tenedero, del fondeadero, de las cartas o de las ZEPIM, no de fondear sobre praderas. El RD 191/2026 (art. 5) no cambia la respuesta.'],
  'RD 1188/2025 (gobierno sin título)': ['RD 1188/2025', 'Marca ancha («6 metros», «artefactos»): la pregunta no trata de la navegación sin título (art. 10 del RD 875/2014, nueva redacción desde el 1-10-2026). La respuesta oficial sigue valiendo.'],
  'IALA MBS 2022': ['IALA R1001', 'Cotejada con la IALA R1001 ed. 2.0 (MBS que cita el BOE-A-2026-510; tablas 1–11) frente a la MBS 2010: los colores, formas, marcas de tope y ritmos de las laterales, bifurcaciones, cardinales, peligro aislado, aguas navegables, especiales y pecio no cambian. La ed. 2.0 añade el MAtoN (marca especial móvil con ritmo propio), las marcas de amarre como especiales y el AIS como complemento, y corrige la errata del folleto de 2010 en los ritmos de la cardinal Norte y Este (VQ o Q; VQ(3) cada 5 s o Q(3) cada 10 s). Ninguna respuesta del banco depende de eso.'],
};

const ZONA_BANO = ['RGC art. 73', 'Zona de baño: la regla no estaba en la Orden de 1964 que derogó el RD 186/2023, sino en el art. 73 del Reglamento General de Costas (RD 876/2014), vigente: en las zonas balizadas no se navega; sin balizar, la zona ocupa 200 m en las playas y 50 m en el resto de la costa y dentro no se pasa de 3 nudos.'];

/** Motivos propios de algunas preguntas (norma marcada → [fuente, motivo]). */
const PROPIOS = {
  'and-2020-c1-t11': { 'RD 339/2021': ['RD 339/2021', 'Art. 23.1.a): las aguas sucias de los tanques de retención se descargan a régimen moderado, en ruta y a no menos de 4 nudos. Igual que antes.'] },
  'and-2020-c1-t12': { 'RD 339/2021': ['RD 339/2021', 'No es del RD 339/2021: es MARPOL anexo V (el Mediterráneo es zona especial; restos de comida a más de 12 millas). Sin cambio.'] },
  'and-2020-c3-t10': { 'RD 339/2021': ['RD 339/2021', 'Art. 8: en zonas 1 a 4, aro con luz y rabiza (y otro sin luz ni rabiza en zona 1). La respuesta (bandas o popa, con luz y suelta rápida) sigue valiendo.'] },
  'and-2020-c3-t12': { 'RD 339/2021': ['RD 339/2021', 'Plásticos: MARPOL anexo V los prohíbe en el mar en todo caso (art. 21 del RD 339/2021 remite a MARPOL). Sin cambio.'] },
  'and-2021-c1-t07': { 'RD 339/2021': ['RD 339/2021', 'La fumígena flotante emite humo al menos 3 minutos (Código IDS; el art. 5 del RD 339/2021 exige equipos certificados). El RD cambia cuántas se llevan por zona (art. 9), no cuánto duran.'] },
  'and-py-2020-c3-g04': { 'RD 339/2021': ['RD 339/2021', 'Fumígena: humo naranja al menos 3 minutos, de uso diurno, con retardo (Código IDS). El RD 339/2021 cambia cuántas se llevan por zona (art. 9), no sus características.'] },
  'and-py-2020-c1-g04': { 'RD 339/2021': ['RD 339/2021', 'La bengala de mano arde al menos 1 minuto (Código IDS). El RD 339/2021 cambia cuántas se llevan por zona (art. 9), no cuánto duran.'] },
  'and-2021-c1-t09': { 'RD 339/2021': ['RD 339/2021', 'Art. 7.5: flotabilidad mínima de 275 N en zona 1, 150 N en zonas 2 a 4 y 100 N en zonas 5 a 7. Zona 4 = 150 N, como en la respuesta oficial.'] },
  'and-py-2021-c1-g04': { 'RD 339/2021': ['RD 339/2021', 'Art. 7.3: chalecos para todos los niños y bebés a bordo, adecuados a su peso y talla (uno por niño). Igual que la respuesta oficial.'] },
  'and-py-2020-c3-g06': { 'RD 339/2021': ['RD 339/2021', 'Características de los chalecos (vuelven a la persona boca arriba, bandas reflectantes, por encima de la ropa): sin cambio. El RD 339/2021 añade la luz del chaleco (art. 7.1), que la pregunta no trata.'] },
  'and-2020-c1-t16': { 'RD 186/2023': GENERAL['RD 186/2023'] },
  'and-2020-c3-t11': { 'RD 186/2023': ZONA_BANO },
  'and-2021-c2-t12': { 'RD 186/2023': ZONA_BANO },
  'and-2022-c3-t11': { 'RD 186/2023': ZONA_BANO },
  'and-2023-c1-t12': { 'RD 186/2023': ZONA_BANO },
  'and-2023-c3-t11': { 'RD 1188/2025 (buceo y ROM)': ['RD 550/2020', 'Bandera de buceo: el RD 550/2020 (no modificado en esto por el RD 1188/2025) pide la bandera «Alfa» en la embarcación y en la boya; la roja con diagonal blanca es la de buceo deportivo de uso común, y la respuesta oficial (buceadores sumergidos) sigue valiendo.'] },
  'and-2022-c1-q44': { 'RD 186/2023': ['RD 186/2023', 'Ejercicio de carta (rumbo y hora de llegada a Ceuta): ninguna norma lo cambia.'] },
  'and-py-2021-c1-n15': { 'RD 186/2023': ['RD 186/2023', 'Ejercicio de carta (corriente, abatimiento y rumbo de aguja): ninguna norma lo cambia.'] },
  'and-2023-c1-t01': { 'RD 1188/2025 (gobierno sin título)': ['RD 339/2021', 'No trata de la navegación sin título: es la línea de fondeo, art. 11.2 del RD 339/2021 (tramo de cadena al menos igual a la eslora, salvo en las de 6 m o menos). Coincide con la respuesta oficial.'] },
  'and-2026-c2-t11': { 'RD 1188/2025 (gobierno sin título)': ['RGC art. 73', 'No trata de la navegación sin título. La c) es falsa por el art. 73.2 del Reglamento General de Costas (200 m en playas, 50 m en el resto de la costa): la respuesta oficial b) sigue valiendo.'] },
  'and-2025-c2-q45': { 'RD 191/2026': ['RD 191/2026', 'Ejercicio de carta (zona de fondeo prohibido de la carta L105): no depende del RD 191/2026.'] },
};

/** Las que cambian de norma aunque la respuesta oficial siga valiendo: nota para la explicación (tras su primera frase). */
const POSIDONIA = 'Actualización: desde el 2 de abril de 2026 lo regula para todo el Mediterráneo español el Real Decreto 191/2026 (art. 5): se prohíbe con carácter general fondear sobre praderas de posidonia y de cymodocea, y también en la arena próxima si la cadena o el borneo las alcanzan; solo se puede en sistemas de bajo impacto autorizados (boyas) y, como excepción, por fuerza mayor o peligro para la vida humana o la navegación. La respuesta oficial sigue valiendo.';
export const ACTUALIZADAS = {
  'and-2022-c2-t11': { norma: 'RD 191/2026', nota: POSIDONIA },
  'and-2024-c3-t11': { norma: 'RD 191/2026', nota: POSIDONIA },
  'and-2026-c1-t11': { norma: 'RD 191/2026', nota: POSIDONIA },
};

/** Las que ya no se estudian (su respuesta oficial ya no es correcta). En el banco vivo de Andalucía, ninguna. */
export const RETIRADAS = {};

/** La resolución de cada pregunta marcada → { tit: { id: ajuste } }. */
export function resolver(r = ejecutar()) {
  const out = { per: {}, py: {} };
  for (const [id, normas] of [...r.marcas.porPregunta].sort(([a], [b]) => a.localeCompare(b))) {
    const tit = id.startsWith('and-py-') ? 'py' : 'per';
    const motivos = normas.map((n) => {
      const [fuente, motivo] = PROPIOS[id]?.[n] ?? (ACTUALIZADAS[id]?.norma === n ? ['RD 191/2026', 'Respuesta oficial correcta con la norma de su fecha y con la actual; cambia la norma que lo regula: nota en la explicación.'] : GENERAL[n]);
      if (!motivo) throw new Error(`${id}: sin motivo para ${n}`);
      return { norma: n, motivo, fuente: FUENTES[fuente] ?? fuente };
    });
    const estado = RETIRADAS[id] ? 'retirada' : ACTUALIZADAS[id] ? 'actualizada' : 'vigente';
    const nota = RETIRADAS[id]?.nota ?? ACTUALIZADAS[id]?.nota;
    out[tit][id] = { norma: { estado, normas, ...(nota ? { nota } : {}) }, revision: { motivos } };
  }
  return out;
}

/** Inserta la nota tras la primera frase de la explicación (idempotente). */
export function conNota(explicacion, nota) {
  if (!explicacion || explicacion.includes(nota)) return explicacion;
  const m = /^.+?[.!?](\s|$)/s.exec(explicacion);
  return m ? `${m[0].trimEnd()} ${nota} ${explicacion.slice(m[0].length).trim()}`.trim() : `${explicacion} ${nota}`;
}

function escribir(ajustes) {
  const dir = join(RAIZ, 'tools', 'bancos', 'ejes', 'andalucia');
  writeFileSync(join(dir, 'ajustes.json'), `${JSON.stringify(ajustes, null, 1)}\n`);
  for (const tit of ['per', 'py']) {
    const ruta = join(RAIZ, 'data', 'ejes', 'andalucia', tit, 'preguntas.json');
    const d = JSON.parse(readFileSync(ruta, 'utf8'));
    for (const q of d.preguntas) q.norma = ajustes[tit][q.id]?.norma ?? { estado: 'vigente' };
    // Una pregunta por línea (como lo escribe la extracción).
    writeFileSync(ruta, `{"meta":${JSON.stringify(d.meta)},\n"preguntas":[\n${d.preguntas.map((q) => JSON.stringify(q)).join(',\n')}\n]}\n`);
    const rutaE = join(RAIZ, 'data', 'ejes', 'andalucia', tit, 'explicaciones.json');
    const ex = JSON.parse(readFileSync(rutaE, 'utf8'));
    let cambiadas = 0;
    for (const [id, a] of Object.entries(ajustes[tit])) {
      if (a.norma.estado !== 'actualizada' || !ex[id]) continue;
      const nueva = conNota(ex[id].explicacion, a.norma.nota);
      if (nueva !== ex[id].explicacion) { ex[id] = { ...ex[id], explicacion: nueva }; cambiadas += 1; }
    }
    if (cambiadas) writeFileSync(rutaE, JSON.stringify(ex)); // en una línea, como está
    console.log(tit, 'explicaciones con nota nueva:', cambiadas);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const a = resolver();
  const n = (e) => ['per', 'py'].reduce((s, t) => s + Object.values(a[t]).filter((x) => x.norma.estado === e).length, 0);
  console.log('resueltas', Object.keys(a.per).length + Object.keys(a.py).length, '· vigente', n('vigente'), '· actualizada', n('actualizada'), '· retirada', n('retirada'));
  if (process.argv.includes('--escribir')) escribir(a);
}
