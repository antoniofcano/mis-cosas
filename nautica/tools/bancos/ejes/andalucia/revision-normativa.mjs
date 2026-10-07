// Revisión normativa del banco vivo de Andalucía: la resolución, pregunta a pregunta, de las marcas del informe
// (tools/bancos/informes/andalucia-normativa.md, que saca normativa.mjs con detectores anchos a propósito): las 195 del
// banco 2020–2026 (fase F1) y las de las preguntas de 2015–2019 que entraron en la fase F5 (bloque «Fase F5», abajo).
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
  'RD 128/2022': BOE('BOE-A-2022-2465'),
  'RD 238/2019': 'https://www.boe.es/diario_boe/txt.php?id=BOE-A-2019-6481',
  'RD 875/2014': 'https://www.boe.es/eli/es/rd/2014/10/10/875/con',
  'Código IDS': BOE('BOE-A-2016-12273'),
};

/** Motivo general de cada norma: lo que se comprobó en su texto y por qué la marca no cambia la respuesta. */
const GENERAL = {
  'RD 339/2021': ['RD 339/2021', 'Marca ancha (el detector encaja con una palabra suelta: achique, corredera, bocina, «regla de», balsa…). La pregunta no trata del equipo obligatorio por zonas, que es lo que cambió respecto a la Orden FOM/1144/2003 (arts. 6–13 y 15 del RD 339/2021): la respuesta oficial sigue valiendo.'],
  'RD 587/2022': ['RD 587/2022', 'El RD 587/2022 solo cambia el NAVTEX obligatorio en zona 1 (lista 6.ª) y la homologación de las balsas (ISO 9650 u otra norma equivalente aprobada por la DGMM). La pregunta trata de supervivencia en la balsa, la zafa, la EPIRB, el SART, el AIS o los canales de VHF, que no cambian.'],
  'RD 186/2023': ['RD 186/2023', 'El RD 186/2023 (Reglamento de Ordenación de la Navegación Marítima) deroga la Orden de 1964 de zonas para bañistas y regula el despacho; no toca el balizamiento, el RIPA ni la carta. La pregunta no depende de lo derogado.'],
  'RD 1188/2025 (buceo y ROM)': ['RD 1188/2025', 'El RD 1188/2025 cambia en el buceo los bautismos (1 instructor por alumno), la descompresión de emergencia y el personal mínimo, y en el ROM el despacho; no cambia la bandera «Alfa» (art. 41.3 del RD 550/2020) ni el RIPA (regla 34 d) y anexo IV). La respuesta oficial sigue valiendo.'],
  'RD 191/2026': ['RD 191/2026', 'Marca ancha («fondeadero», «fondo»): la pregunta trata del tenedero, del fondeadero, de las cartas o de las ZEPIM, no de fondear sobre praderas. El RD 191/2026 (art. 5) no cambia la respuesta.'],
  'RD 1188/2025 (gobierno sin título)': ['RD 1188/2025', 'Marca ancha («6 metros», «artefactos»): la pregunta no trata de la navegación sin título (art. 10 del RD 875/2014, nueva redacción desde el 1-10-2026). La respuesta oficial sigue valiendo.'],
  'RD 238/2019': ['RD 238/2019', 'Marca ancha («clase C» de los fuegos, «atribución»…): la pregunta no trata de lo que cambió el RD 238/2019 (errores máximos del examen de PY, «islas intermedias», motos de clase C, habilitaciones). La clasificación de los fuegos (A sólidos, B líquidos, C gases, D metales, F aceites de cocina) es la de la norma UNE-EN 2 y no ha cambiado.'],
  'RD 550/2020': ['RD 550/2020', 'La pregunta no depende de lo que regula el RD 550/2020 (boya con bandera «Alfa» y 50 m de distancia a la zona de buceo).'],
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

/** Las que ya no se estudian (su respuesta oficial ya no es correcta): de 2020–2026, ninguna; las de 2015–2019, en el bloque F5. */
export const RETIRADAS = {};

// ---------------------------------------------------------------------------------------------------------------------
// Fase F5: las preguntas de 2015–2019 (y las publicadas a las que se unieron, que ahora se marcan por su aparición más
// antigua). Resueltas contra el texto consolidado del BOE del RD 339/2021 (y la Orden FOM/1144/2003 que derogó), el RD
// 875/2014 (versión original y vigente), el RD 128/2022, el Reglamento General de Costas (art. 73), el RD 1185/2006 y el
// RD 550/2020; las características de los equipos de salvamento, con el Código IDS (LSA) al que remiten el art. 5 del RD
// 339/2021 y el RD 701/2016.
const LSA = ['Código IDS', 'Características de homologación de los equipos de salvamento (Código internacional de dispositivos de salvamento, IDS/LSA, al que remite el art. 5 del RD 339/2021 a través del RD 701/2016): altura y duración de cohetes, bengalas y fumígenas, chalecos, aros, balsas y zafas. El RD 339/2021 cambió cuántos equipos se llevan por zona (arts. 6–9), no cómo son ni cómo se usan: la respuesta oficial sigue valiendo.'];
const USO = ['RD 339/2021', 'Marca ancha: la pregunta trata del uso de los equipos o de una maniobra (pirotecnia, extintores, balsa, achique, hombre al agua, arnés), no del equipo obligatorio por zonas que cambió respecto a la Orden FOM/1144/2003. La respuesta oficial sigue valiendo.'];
const ZONA_BANO_2015 = ['RGC art. 73', 'Zona de baño: la Orden de 1964 (derogada por el RD 186/2023) fijaba 250 m en las playas y 100 m en el resto del litoral; la regla del examen (200 m en las playas, 50 m en el resto de la costa, 3 nudos) es la del art. 73 del Reglamento General de Costas (RD 876/2014), vigente desde 2014. La respuesta oficial sigue valiendo, con el mismo criterio que el tribunal mantiene en 2021 (and-2021-c2-t12).'];
const AGUAS_MOTIVO = ['RD 339/2021', 'Aguas sucias: el art. 23 del RD 339/2021 mantiene lo que decía el art. 24 de la Orden FOM/1144/2003 (3 millas si están desmenuzadas y desinfectadas, 12 si no, 4 nudos al vaciar el tanque, prohibida en puertos, rías, bahías y aguas protegidas), pero cuenta las millas desde la línea de base y permite descargar con planta de tratamiento homologada fuera de la zona 7. La oficial sigue valiendo; la explicación lo actualiza.'];
const AGUAS = 'Actualización: desde el 1 de julio de 2021 la descarga de aguas sucias la regula el art. 23 del Real Decreto 339/2021 (antes, el art. 24 de la Orden FOM/1144/2003): se mantienen las 3 millas si están desmenuzadas y desinfectadas, las 12 millas si no lo están y los 4 nudos al vaciar el tanque, pero las millas se cuentan desde la línea de base del mar territorial, y con una planta de tratamiento homologada se puede descargar fuera de la zona 7; en puertos, rías, bahías y aguas protegidas (zona 7) sigue prohibida cualquier descarga. La respuesta oficial sigue valiendo.';
const AGUAS_IDS = ['and-2015-c3-t11', 'and-2016-c1-t12', 'and-2017-c1-t12', 'and-2017-c2-t12', 'and-2017-c3-t11', 'and-2018-c1-t12', 'and-2018-c3-t11', 'and-2019-c1-t12', 'and-2019-c2-t12'];
const LSA_IDS = ['and-2015-c2-t08', 'and-2015-c3-t10', 'and-2017-c3-t08',
  'and-py-2015-c1-g03', 'and-py-2015-c1-g04', 'and-py-2015-c1-g06', 'and-py-2015-c2-g03', 'and-py-2015-c2-g06', 'and-py-2015-c2-g07', 'and-py-2015-c3-g03', 'and-py-2015-c3-g06',
  'and-py-2016-c2-g06', 'and-py-2016-c3-g06', 'and-py-2017-c1-g06', 'and-py-2017-c2-g08', 'and-py-2017-c2-g10', 'and-py-2017-c3-g02', 'and-py-2017-c3-g07',
  'and-py-2018-c1-g04', 'and-py-2018-c1b-g05', 'and-py-2018-c1b-g08', 'and-py-2018-c2-g08', 'and-py-2018-c2-g09', 'and-py-2018-c2-g10', 'and-py-2018-c4-g04', 'and-py-2018-c4-g06',
  'and-py-2019-c1-g03', 'and-py-2019-c1-g04', 'and-py-2019-c1-g05', 'and-py-2019-c1-g06', 'and-py-2019-c2-g04', 'and-py-2019-c2-g05', 'and-py-2019-c2-g06', 'and-py-2019-c2-g07',
  'and-py-2019-c3-g04', 'and-py-2019-c3-g07', 'and-py-2019-c3-g09'];
const USO_IDS = ['and-2016-c1-t30', 'and-2016-c2-t31', 'and-2016-c3-t09', 'and-2016-c3-t30', 'and-2016-c3-t32', 'and-2017-c1-t10', 'and-2017-c1-t31', 'and-2017-c2-t07', 'and-2017-c2-t08',
  'and-2017-c2-t32', 'and-2017-c3-t30', 'and-2017-c3-t32', 'and-2018-c1-t08', 'and-2018-c1-t10', 'and-2018-c1-t32', 'and-2018-c2-t08', 'and-2018-c2-t30', 'and-2018-c2-t32', 'and-2018-c3-t08',
  'and-2018-c3-t32', 'and-2018-c4-t31', 'and-2019-c1-t01', 'and-2019-c1-t09', 'and-2019-c2-t08', 'and-2019-c2-t10', 'and-2019-c2-t32', 'and-2019-c3-t31',
  'and-py-2015-c3-g07', 'and-py-2015-c3-g09', 'and-py-2016-c1-g08', 'and-py-2016-c1-g10', 'and-py-2016-c2-g07', 'and-py-2016-c2-g08', 'and-py-2016-c2-g10', 'and-py-2016-c3-g04',
  'and-py-2016-c3-g07', 'and-py-2016-c3-g08', 'and-py-2016-c3-g09', 'and-py-2016-c3-g10', 'and-py-2017-c1-g09', 'and-py-2017-c1-g10', 'and-py-2017-c2-g04', 'and-py-2017-c2-g06',
  'and-py-2017-c2-g09', 'and-py-2017-c3-g09', 'and-py-2018-c1-g06', 'and-py-2018-c1-g08', 'and-py-2018-c1-g10', 'and-py-2018-c1b-g06', 'and-py-2018-c1b-g07', 'and-py-2018-c1b-g09',
  'and-py-2018-c2-g04', 'and-py-2018-c2-g05', 'and-py-2018-c2-g06', 'and-py-2018-c2-g07', 'and-py-2018-c4-g05', 'and-py-2018-c4-g08', 'and-py-2018-c4-g09', 'and-py-2019-c1-g08',
  'and-py-2019-c1-g09', 'and-py-2019-c2-g08', 'and-py-2019-c2-g09', 'and-py-2019-c3-g08', 'and-py-2019-c3-g10'];
const F5 = {
  'and-2015-c1-t09': { 'RD 339/2021': ['RD 339/2021', 'Art. 15 del RD 339/2021: las embarcaciones con marcado CE llevan los extintores del manual del fabricante; si no, los de las tablas por eslora y por potencia (eficacia 34B; antes 21B), y con instalación fija en el motor sigue haciendo falta un extintor portátil junto a él. La oficial, calcada del art. 14.1 de la Orden FOM/1144/2003 («incluso aquellas dotadas de otros sistemas de extinción»), sigue siendo la única aceptable: se actualiza la explicación.'] },
  'and-2016-c2-t09': { 'RD 339/2021': ['RD 339/2021', 'La d) (un chaleco por tripulante, también los niños) es cierta con el art. 7 del RD 339/2021 como lo era con la Orden: la que NO es correcta sigue siendo la c) (el arnés se afirma al pecho, no). Sin cambio.'] },
  'and-2016-c2-t12': { 'RD 339/2021': ['RD 339/2021', 'Basuras: MARPOL anexo V (al que remite el art. 21 del RD 339/2021) prohíbe echar plásticos al mar en cualquier caso. Sin cambio.'] },
  'and-2016-c3-t11': { 'RD 339/2021': ['RD 339/2021', 'Basuras: MARPOL anexo V (revisado en 2013, art. 21 del RD 339/2021): fuera de zonas especiales solo restos de comida (desmenuzados a más de 3 millas; sin desmenuzar, a más de 12); cualquier descarga a menos de 3 millas está prohibida. La oficial sigue valiendo.'], 'RD 186/2023': GENERAL['RD 186/2023'] },
  'and-2018-c4-t19': { 'RD 339/2021': ['RD 339/2021', 'Señales acústicas: regla 33 del RIPA (pito desde 12 m; pito y campana desde 20 m) y art. 10.4 del RD 339/2021 (campana solo si L ≥ 20 m). Para 21 m, pito y campana. Sin cambio.'] },
  'and-2019-c3-t20': { 'RD 339/2021': ['RD 339/2021', 'Luces de un buque de motor menor de 12 m (regla 23 d) del RIPA, a la que remite el art. 10.1 del RD 339/2021): todo horizonte blanca y luces de costado. Sin cambio.'] },
  'and-2015-c3-t25': { 'RD 339/2021': ['RD 339/2021', 'Embarcaciones de remo: regla 25 d) ii) del RIPA. Sin cambio.'] },
  'and-2018-c3-t09': { 'RD 339/2021': ['RD 339/2021', 'Aros salvavidas: ni la Orden ni el RD 339/2021 (art. 8) exigen uno por tripulante; la oficial (filtros, refrigeración, alternador) sigue valiendo.'] },
  'and-2015-c1-t12': { 'RD 186/2023': ZONA_BANO_2015 },
  'and-2016-c1-t11': { 'RD 186/2023': ZONA_BANO_2015 },
  'and-2017-c1-t12': { 'RD 186/2023': ZONA_BANO_2015 },
  'and-2017-c2-t11': { 'RD 186/2023': ZONA_BANO_2015 },
  'and-2017-c3-t12': { 'RD 186/2023': ['RGC art. 73', 'La oficial (la d), «navegar perpendicularmente a tierra a 3 nudos» como afirmación falsa) respondía a la Orden de 1964, que en la franja de baño con bañistas prohibía las embarcaciones de hélice y llevaba la entrada a tierra por canales. Derogada esa Orden por el RD 186/2023 (11-4-2023), rige solo el art. 73.2 del Reglamento General de Costas: en un tramo no balizado se puede navegar dentro de la franja (200 m en playas, 50 m en el resto) a 3 nudos como máximo, así que la d) es cierta y la falsa es la b). Retirada.'] },
  'and-2019-c2-t11': { 'RD 186/2023': ZONA_BANO_2015 },
  'and-2019-c3-t11': { 'RD 186/2023': ZONA_BANO_2015 },
  'and-2018-c2-t11': { 'RD 238/2019': ['RD 875/2014', 'Atribuciones del PER (arts. 8 y 9 del RD 875/2014): 12 millas, 15 m y navegar entre las islas de Canarias son básicas, en la versión de 2014 y en la vigente. El RD 238/2019 solo añadió «incluidas las islas intermedias» al trayecto Península–Baleares. Sin cambio.'] },
  'and-2018-c4-t12': { 'RD 238/2019': ['RD 875/2014', 'Art. 9.c) del RD 875/2014: con las prácticas del anexo VI el PER gobierna embarcaciones a motor de hasta 24 m en las 12 millas (la oficial, d) y entre la Península y Baleares (la b) también es complementaria: la pregunta tiene dos respuestas válidas, en 2014 y hoy). El RD 238/2019 solo añadió «incluidas las islas intermedias». Sin cambio normativo: la discrepancia la recoge la explicación.'] },
  'and-2016-c2-t26': { 'RD 550/2020': ['RD 550/2020', 'Bandera «A» del Código Internacional de Señales: buzo sumergido; el buque que la exhibe en operaciones de buceo es de maniobra restringida (reglas 3 g) y 27 e) del RIPA). El RD 550/2020 (art. 14) también la pide en la boya del buceador. Sin cambio.'], 'RD 1188/2025 (buceo y ROM)': GENERAL['RD 1188/2025 (buceo y ROM)'] },
  'and-2018-c2-t26': { 'RD 550/2020': ['RD 550/2020', 'Marca de buque fondeado (regla 30 del RIPA): una bola a proa. La bandera «A» de la opción b) es la de buceo. Sin cambio.'], 'RD 186/2023': GENERAL['RD 186/2023'] },
  'and-2016-c3-t12': { 'RD 191/2026': ['RD 191/2026', 'Respuesta oficial correcta con la norma de su fecha y con la actual (hoy, además, prohibido en el Mediterráneo por el art. 5 del RD 191/2026): nota en la explicación.'] },
  'and-2018-c2-t12': { 'RD 128/2022': ['RD 128/2022', 'La notificación reducida de desechos de las embarcaciones de recreo (anexo V del RD 1381/2002, con la reforma del RD 1084/2009) desapareció con el RD 128/2022, que derogó el RD 1381/2002 (disposición derogatoria única) y solo exige la notificación previa a buques de 300 GT o más, sin las embarcaciones de recreo de menos de 45 m (art. 16.1). La respuesta oficial ya no es correcta: retirada.'] },
  'and-2018-c4-t11': { 'RD 128/2022': ['RD 128/2022', 'La notificación reducida de desechos de las embarcaciones de recreo (anexo V del RD 1381/2002) desapareció con el RD 128/2022, que derogó el RD 1381/2002 y solo exige la notificación previa a buques de 300 GT o más, sin las embarcaciones de recreo de menos de 45 m (art. 16.1). Las respuestas que dio por buenas el tribunal (a y b) ya no lo son: retirada.'] },
  'and-py-2019-c1-g07': { 'RD 339/2021': ['RD 339/2021', 'Revisión de las balsas: la Orden FOM/1144/2003 (art. 6.2) pedía una revisión anual en estación autorizada (la oficial). El art. 6.3 del RD 339/2021 (redacción del RD 587/2022) manda revisarlas según el fabricante en una estación de servicio autorizada, y solo a las de uso comercial les pone un máximo de 24 meses: ya no hay revisión anual obligatoria. Retirada.'], 'RD 587/2022': ['RD 587/2022', 'El RD 587/2022 reescribió el art. 6.3 del RD 339/2021 (revisión de las balsas según el fabricante; 24 meses como máximo en las de uso comercial).'] },
};
for (const id of AGUAS_IDS) F5[id] = { ...F5[id], 'RD 339/2021': AGUAS_MOTIVO };
for (const id of LSA_IDS) F5[id] = { 'RD 339/2021': LSA, ...F5[id] };
for (const id of USO_IDS) F5[id] = { 'RD 339/2021': USO, ...F5[id] };
Object.assign(PROPIOS, F5);

const EXTINTOR = 'Actualización: desde el 1 de julio de 2021 los extintores los regula el art. 15 del Real Decreto 339/2021 (antes, la Orden FOM/1144/2003): las embarcaciones con marcado CE llevan los que indique el manual del fabricante y, si no, los de las tablas por eslora y por potencia, ahora de eficacia 34B (antes 21B); con una instalación fija en el motor sigue haciendo falta un extintor portátil junto al compartimento. Una pequeña fueraborda de hasta 25 kW sin cabina no necesita ninguno. La respuesta oficial sigue siendo la única aceptable de las cuatro.';
Object.assign(ACTUALIZADAS, {
  'and-2015-c1-t09': { norma: 'RD 339/2021', nota: EXTINTOR },
  'and-2016-c3-t12': { norma: 'RD 191/2026', nota: POSIDONIA },
  ...Object.fromEntries(AGUAS_IDS.map((id) => [id, { norma: 'RD 339/2021', nota: AGUAS }])),
});
Object.assign(RETIRADAS, {
  'and-2017-c3-t12': { nota: 'Desde que el Real Decreto 186/2023 derogó la Orden de 1964 de zonas para bañistas (11 de abril de 2023), rige solo el art. 73.2 del Reglamento General de Costas: en un tramo de costa sin balizar la zona de baño ocupa 200 m en las playas y 50 m en el resto, y dentro se puede navegar a 3 nudos como máximo. La afirmación d) es cierta; la falsa es la b).' },
  'and-2018-c2-t12': { nota: 'La notificación reducida de desechos de las embarcaciones de recreo (anexo V del Real Decreto 1381/2002) desapareció el 17 de febrero de 2022, cuando el Real Decreto 128/2022 derogó aquel decreto; hoy la notificación previa solo se exige a buques de 300 GT o más, y nunca a embarcaciones de recreo de menos de 45 m (art. 16.1). Ninguna de las periodicidades es correcta.' },
  'and-2018-c4-t11': { nota: 'La notificación reducida de residuos del anexo V del Real Decreto 1381/2002 desapareció el 17 de febrero de 2022, cuando el Real Decreto 128/2022 derogó aquel decreto; hoy ninguna embarcación de recreo de menos de 45 m está obligada a notificar sus desechos antes de llegar a puerto (art. 16.1), aunque todas los entregan en la instalación receptora del puerto.' },
  'and-py-2019-c1-g07': { nota: 'La revisión anual de las balsas era la de la Orden FOM/1144/2003 (art. 6.2). Desde el 1 de julio de 2021, el art. 6.3 del Real Decreto 339/2021 (redacción del Real Decreto 587/2022, en vigor el 21-7-2022) manda revisarlas según las instrucciones del fabricante en una estación de servicio autorizada, y solo en las de uso comercial fija un máximo de 24 meses: ya no hay una revisión anual obligatoria.' },
});

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
