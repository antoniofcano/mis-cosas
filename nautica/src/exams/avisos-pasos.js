// Avisos «Ojo / No olvides / Así se hace» de los pasos del modo guiado (R-65). Sin DOM: lo pinta src/ui/guiado.js.
//
// - AVISOS: para cada error típico de la taxonomía (src/exams/taxonomia.js, ERRORES), tres textos cortos:
//     ojo   la trampa, antes de contestar;
//     no    la regla que la evita («No olvides», se ofrece plegado);
//     asi   cómo se hace bien (tras acertar el paso);
//     has   el error con nombre, para cuando la respuesta del alumno coincide con él: «Has sumado el adelanto…».
//   Las reglas son las del temario (RD 875/2014, anexo II) y de docs/CARTA-RESUELTOS.md, como las que ya enseñan la
//   chuleta y las glosas; aquí no se inventa ninguna norma.
// - Cada paso del kit lleva `errores`: los tipos de error que se evalúan dentro de él (src/exams/kit.js).
// - avisosDelPaso: qué aviso sale en un paso y por qué (lo falló el alumno, o es el más frecuente del tribunal).
// - diagnosticarPaso: si lo que escribió el alumno en un paso es lo que sale con uno de esos errores.

import { createKit } from './kit.js';
import { ERRORES, VARIANTES, tipoDe } from './taxonomia.js';
import { toleranciaCampo } from './guiado.js';
import { quantity } from '../analysis/quantities.js';

export const AVISOS = {
  'signo-ct': {
    ojo: 'La Ct lleva signo y se confunde al aplicarla: es una suma con signo, no una resta.',
    no: 'Ct = dm + Δ. De aguja a verdadero se suma (Rv = Ra + Ct, Dv = Da + Ct). De verdadero a aguja se resta (Ra = Rv − Ct).',
    asi: 'Escribe la Ct con su signo (E +, W −) y suma siempre en el sentido aguja → verdadero.',
    has: 'Has aplicado la Ct con el signo cambiado',
  },
  'sin-ct': {
    ojo: 'El rumbo o la demora de aguja no son verdaderos: la carta se traza en verdaderos.',
    no: 'Antes de llevar nada a la carta, corrige con la Ct. Aguja + Ct = verdadero.',
    asi: 'Corrige con la Ct y deja anotado qué rumbo es de aguja y cuál verdadero.',
    has: 'Has usado el valor de aguja sin corregirlo con la Ct',
  },
  'signo-dm': {
    ojo: 'La declinación se toma con su signo: la del Este suma y la del Oeste resta.',
    no: 'dm E (NE) = +. dm W (NW) = −. Ct = dm + Δ.',
    asi: 'Pasa la dm a número con signo antes de sumarla al desvío.',
    has: 'Has tomado la declinación con el signo cambiado',
  },
  'signo-desvio': {
    ojo: 'El desvío también lleva signo, y es fácil dar el contrario al leer la tablilla.',
    no: 'Δ E (NE) = +. Δ W (NW) = −. Ct = dm + Δ.',
    asi: 'Lee la letra del desvío (E o W) y pásala a signo antes de sumar.',
    has: 'Has tomado el desvío con el signo cambiado',
  },
  'olvida-desvio': {
    ojo: 'Si el enunciado da desvío, la Ct no es solo la declinación.',
    no: 'Ct = dm + Δ. Suma las dos, cada una con su signo.',
    asi: 'Comprueba que usas todos los datos del enunciado: declinación y desvío.',
    has: 'Te has olvidado del desvío',
  },
  'dm-sin-actualizar': {
    ojo: 'La declinación que sale en la carta es la de su año, no la de hoy.',
    no: 'Calcula los años que han pasado desde el año de la carta hasta el del enunciado y aplica la variación anual.',
    asi: 'dm del año = dm de la carta + años × variación anual, con su signo.',
    has: 'Has dejado la declinación de la carta sin actualizar',
  },
  'variacion-signo': {
    ojo: 'La variación anual tiene signo: una dm W con variación E disminuye.',
    no: 'Suma la variación anual con su signo (E +, W −) por cada año transcurrido.',
    asi: 'Pasa dm y variación a números con signo y suma: dm del año = dm de la carta + años × variación.',
    has: 'Has aplicado la variación anual con el signo cambiado',
  },
  'banda-marcacion': {
    ojo: 'La marcación se cuenta desde la proa, y la banda decide el signo.',
    no: 'Dv = Rv + M. Estribor suma, babor resta.',
    asi: 'Pon la banda delante del número (estribor +, babor −) y suma al rumbo verdadero.',
    has: 'Has cambiado la banda de la marcación',
  },
  'marcacion-como-demora': {
    ojo: 'La marcación no es una demora: falta sumarle el rumbo.',
    no: 'Dv = Rv + M. La marcación mide el ángulo desde la proa, no desde el norte.',
    asi: 'Parte del rumbo verdadero y suma la marcación con su signo.',
    has: 'Has tomado la marcación como si fuera la demora',
  },
  'sentido-recta': {
    ojo: 'Una oposición o una enfilación tiene dos sentidos, a 180° uno del otro: vale uno solo.',
    no: 'Mide la demora hacia el objeto que pide el enunciado, no desde él.',
    asi: 'Comprueba el sentido con un croquis: desde dónde miras y hacia qué objeto.',
    has: 'Has tomado la recta en el sentido contrario',
  },
  'demora-sin-opuesta': {
    ojo: 'La demora se mide desde tu barco hacia el faro; el trazo desde el faro va al revés.',
    no: 'Desde el faro se traza la opuesta: Dv ± 180°.',
    asi: 'Suma o resta 180° a la demora y traza desde el faro con ese rumbo.',
    has: 'Has trazado desde el faro la demora sin invertirla',
  },
  'lado-del-faro': {
    ojo: '«Al S del faro» quiere decir que tú estás al sur y el faro te queda al norte.',
    no: 'Desde el faro trazas hacia el lado que dice el enunciado: al S, hacia el S del faro.',
    asi: 'Dibuja el faro y sitúate en el lado que nombra el enunciado antes de medir.',
    has: 'Te has situado al otro lado del faro',
  },
  banda: {
    ojo: 'La tangente cambia según dejes el faro por una banda o por la otra.',
    no: 'Si dejas el faro por estribor, te apartas de él hacia babor: Rv = demora − ángulo. Si lo dejas por babor, Rv = demora + ángulo.',
    asi: 'Haz un croquis con el faro, tu proa y la banda por la que lo dejas.',
    has: 'Has dejado el faro por la banda contraria',
  },
  directo: {
    ojo: 'Rumbo directo al faro es pasar por encima de él: hay que apartarse la distancia de paso.',
    no: 'El ángulo de la tangente sale de arcsen(distancia de paso / distancia al faro).',
    asi: 'Calcula el ángulo y suma o resta al rumbo directo según la banda.',
    has: 'Has puesto rumbo directo al faro, sin apartarte la distancia de paso',
  },
  'signo-abatimiento': {
    ojo: 'El viento empuja al barco hacia sotavento: el abatimiento cae al lado contrario al de donde sopla.',
    no: 'Mira de qué banda entra el viento: el barco se abate hacia la otra. Viento por babor, Ab positivo (se abate a estribor). Viento por estribor, Ab negativo.',
    asi: 'Haz un croquis con la proa, el viento y la banda de sotavento antes de sumar.',
    has: 'Has aplicado el abatimiento hacia el lado contrario',
  },
  'sin-abatimiento': {
    ojo: 'Con viento hay abatimiento: el rumbo de superficie no es el verdadero.',
    no: 'Rs = Rv + Ab (con su signo). Si piden el Rv que hay que dar, Rv = Rs − Ab.',
    asi: 'Aplica el abatimiento del enunciado aunque parezca pequeño.',
    has: 'Te has olvidado del abatimiento',
  },
  'sin-corriente': {
    ojo: 'Con corriente, el barco no va adonde apunta la proa: el rumbo efectivo no es el de superficie.',
    no: 'Compón dos vectores: el del barco (Rs, Vb) y el de la corriente (Rc, Ic). La suma es el efectivo (Ref, Vef).',
    asi: 'Dibuja el vector del barco, a continuación el de la corriente, y une el principio con el final.',
    has: 'Has dejado fuera la corriente',
  },
  'corriente-invertida': {
    ojo: 'El rumbo de la corriente dice hacia dónde va el agua, no de dónde viene.',
    no: 'Si la corriente es «Rc 090», empuja hacia el Este. Dibújala en ese sentido, no al revés.',
    asi: 'Pon la flecha de la corriente apuntando al rumbo dado.',
    has: 'Has aplicado la corriente en sentido contrario',
  },
  'corriente-sumada': {
    ojo: 'La velocidad de la corriente no se suma sin más a la del barco: es un vector.',
    no: 'Vef sale de componer los vectores. Solo coincide con Vb + Ic si ambos llevan el mismo rumbo.',
    asi: 'Compón los vectores en el dibujo y mide Ref y Vef.',
    has: 'Has sumado la velocidad de la corriente en vez de componer los vectores',
  },
  'sin-traslado': {
    ojo: 'Las dos demoras no son simultáneas: entre una y otra el barco ha navegado.',
    no: 'Traslada la primera línea el rumbo y la distancia navegados. El corte con la segunda es la situación a la hora de la segunda.',
    asi: 'Traslada la primera línea paralela a sí misma lo navegado y corta con la segunda.',
    has: 'Has cruzado las dos líneas sin trasladar la primera',
  },
  'horas-decimales': {
    ojo: 'Una hora tiene 60 minutos, no 100: 1 h 30 min son 1,5 h, no 1,30 h.',
    no: 'Divide los minutos entre 60 para pasarlos a horas. d = V · t con t en horas.',
    asi: 'Pasa los minutos a horas (min / 60) antes de multiplicar por la velocidad.',
    has: 'Has confundido minutos y décimas de hora',
  },
  'lm-salida': {
    ojo: 'El apartamiento se pasa a longitud con la latitud media, no con la de salida.',
    no: 'lm = (l1 + l2) / 2, o la de salida más media Δl: lm = l0 + Δl / 2.',
    asi: 'Calcula primero la latitud de llegada y saca la media con la de salida.',
    has: 'Has usado la latitud de salida en vez de la media',
  },
  'sin-cos-lm': {
    ojo: 'El apartamiento está en millas; la diferencia de longitud está en minutos de arco: no son lo mismo.',
    no: 'ΔL = A / cos lm.',
    asi: 'Divide el apartamiento entre el coseno de la latitud media.',
    has: 'Has tomado el apartamiento como diferencia de longitud, sin el cos lm',
  },
  'cos-lm-multiplica': {
    ojo: 'El cos lm divide al pasar de apartamiento a ΔL, y multiplica al pasar de ΔL a apartamiento.',
    no: 'ΔL = A / cos lm. A = ΔL · cos lm.',
    asi: 'Comprueba el orden de magnitud: la ΔL sale mayor que el apartamiento.',
    has: 'Has multiplicado por el cos lm donde había que dividir (o al revés)',
  },
  'signo-dL': {
    ojo: 'La diferencia de longitud lleva signo: hacia el Este es positiva, hacia el Oeste negativa.',
    no: 'ΔL E +, W −. La longitud de llegada es la de salida más ΔL.',
    asi: 'Mira el sentido del apartamiento (E o W) y pon el signo antes de sumar.',
    has: 'Has cambiado el signo de la diferencia de longitud',
  },
  'seno-coseno': {
    ojo: 'Seno y coseno se confunden con facilidad: el coseno va con el eje norte-sur.',
    no: 'Δl = d · cos R. A = d · sen R.',
    asi: 'Comprueba con un rumbo conocido: al rumbo 000 todo es Δl, y al 090 todo es apartamiento.',
    has: 'Has cambiado el seno y el coseno',
  },
  antimeridiano: {
    ojo: 'Al cruzar el meridiano de 180° la longitud no pasa de 180°: cambia de E a W (o al revés), y la Δλ va por el camino corto.',
    no: 'Si L llegada pasa de 180°: 360° − L y cambia la letra. Entre una L E y otra W junto al 180°: Δλ = (180° − L1) + (180° − L2).',
    asi: 'Suma la Δλ con su signo; si pasa de 180°, resta de 360° y cambia E por W. Una Δλ de casi 360° es el camino largo.',
    has: 'Has equivocado la Δλ o la letra al cruzar el meridiano de 180°',
  },
  'corriente-al-reves': {
    ojo: 'En la estima, la corriente es un tramo más con su rumbo hacia donde va el agua: se suma como los demás.',
    no: 'Fila de la corriente: R = Rc (hacia donde va) y d = Ihc × horas que actúa. Δl = d · cos Rc y A = d · sen Rc, sumados con su signo.',
    asi: 'Pon la corriente como una fila más de la tabla, con su Rc y lo que arrastra, y súmala con los tramos.',
    has: 'Has sumado la corriente al revés',
  },
  'lm-hemisferios': {
    ojo: 'En el hemisferio S la latitud es negativa: ir hacia el S la hace mayor en número, y al cruzar el ecuador cambia la letra.',
    no: 'Latitudes con signo, N + y S −: l llegada = l salida + Δl y lm = (l salida + l llegada) / 2, cada una con su signo.',
    asi: 'Pasa las latitudes a números con signo antes de sumar y vuelve a N o S al final.',
    has: 'Has tomado las latitudes sin su signo',
  },
  'sonda-carta-olvidada': {
    ojo: 'La sonda de la carta es la del nivel de reducción, sin marea: no es la profundidad real.',
    no: 'Sonda en el momento = sonda de la carta + altura de la marea.',
    asi: 'Anota la sonda de la carta y la altura de la marea antes de operar.',
    has: 'Te has olvidado de la sonda de la carta',
  },
  'sonda-carta-signo': {
    ojo: 'La sonda de la carta se suma o se resta según lo que busques: no se hace siempre igual.',
    no: 'Sonda = sonda de la carta + altura de la marea. Si buscas la altura, altura = sonda − sonda de la carta.',
    asi: 'Escribe la fórmula entera antes de poner números.',
    has: 'Has restado la sonda de la carta donde había que sumarla (o al revés)',
  },
  'pleamar-bajamar': {
    ojo: 'El intervalo se cuenta desde la bajamar, no desde la pleamar.',
    no: 'C = A · sen²(90° · I / D), con I = tiempo desde la bajamar.',
    asi: 'Marca en la tabla la bajamar del tramo y cuenta desde esa hora.',
    has: 'Has contado el intervalo desde la pleamar en vez de desde la bajamar',
  },
  lineal: {
    ojo: 'La marea no sube a ritmo constante: sube despacio, deprisa y despacio otra vez.',
    no: 'La corrección sigue C = A · sen²(90° · I / D), no una regla de tres.',
    asi: 'Usa la fórmula, o la tabla del Anuario, y no interpoles en línea recta.',
    has: 'Has interpolado la marea en línea recta',
  },
  'sin-adelanto': {
    ojo: 'El Anuario de Mareas va en hora UT; el enunciado, en hora oficial.',
    no: 'UT = hora oficial − adelanto. Hora oficial = UT + adelanto.',
    asi: 'Pasa la hora a UT antes de entrar en la tabla, y vuelve a oficial al terminar.',
    has: 'No has pasado entre hora oficial y hora UT',
  },
  'adelanto-signo': {
    ojo: 'El adelanto se resta para ir a UT y se suma para volver a la hora oficial.',
    no: 'UT = hora oficial − adelanto. Hora oficial = UT + adelanto.',
    asi: 'Piensa que la hora oficial va por delante de UT: de oficial a UT, atrasa el reloj.',
    has: 'Has aplicado el adelanto al revés',
  },
};

/** Ids de error con aviso (todos los de la taxonomía). */
export const IDS_AVISOS = Object.keys(AVISOS);

/**
 * Qué errores se evalúan en un paso, de entre los que consulta la operación del kit que lo crea (src/exams/kit.js lo
 * llama al anotar cada paso preguntable). Una operación puede dar varios pasos (marea, hora, declinación y Ct): cada
 * paso se queda con los suyos. Devuelve tipos de error sin repetir, en el orden en que los consultó la operación.
 * @param {string[]} consultados  ids consultados con E(...) en la operación (admite variantes «tipo:cómo»)
 * @param {{ paso: string, title: string, text?: string }} p
 */
export function erroresDelPaso(consultados, { paso, title, text = '' }) {
  let tipos = [...new Set(consultados.map(tipoDe))].filter((t) => ERRORES[t]);
  if (paso === 'declinacion') tipos = tipos.filter((t) => ERRORES[t].paso === 'declinacion');
  else tipos = tipos.filter((t) => ERRORES[t].paso !== 'declinacion');
  if (paso === 'marea' || paso === 'sonda' || paso === 'hora-legal') {
    tipos = tipos.filter((t) => ERRORES[t].paso === paso);
    if (paso === 'marea') {
      if (title === 'Duración y amplitud' || title === 'Altura de la marea') tipos = [];
      else if (title === 'Corrección de altura') tipos = text.startsWith('C = A') ? tipos.filter((t) => t === 'lineal') : [];
      else if (title === 'Intervalo desde la bajamar') tipos = tipos.filter((t) => (text.includes('C / A') ? t === 'lineal' : t === 'pleamar-bajamar'));
    }
  }
  if (paso === 'loxodromica') {
    const lm = ['lm-salida', 'sin-cos-lm', 'cos-lm-multiplica'];
    const de = (ids) => tipos.filter((t) => ids.includes(t));
    // R-53: corriente al revés (su fila), Δλ al cruzar el 180° y latitudes sin signo (hemisferio S o cambio de hemisferio).
    // Solo están si la operación los consultó: el kit pregunta por ellos cuando hay corriente, se cruza o hay latitud S.
    if (/^La corriente: Δl y apartamiento$/.test(title)) tipos = de(['seno-coseno', 'corriente-al-reves']);
    else if (/: Δl y apartamiento$/.test(title)) tipos = de(['seno-coseno']);
    else if (['Sumo la tabla', 'Diferencia de latitud'].includes(title)) tipos = [];
    else if (title === 'Latitud de llegada') tipos = de(['lm-hemisferios']);
    else if (title === 'Diferencia de longitud') tipos = de(['signo-dL', 'antimeridiano']);
    else if (title === 'Del apartamiento a la diferencia de longitud' || title === 'Apartamiento') tipos = de([...lm, 'lm-hemisferios']);
    else if (title === 'Rumbo y distancia') tipos = de([...lm, 'seno-coseno', 'antimeridiano', 'lm-hemisferios']);
    else tipos = de([...lm, 'signo-dL', 'antimeridiano', 'lm-hemisferios']); // la situación de llegada
  }
  return tipos;
}

/**
 * Aviso previo de un paso: el error del paso que debe verse antes de contestar.
 * - Si el alumno ya ha fallado alguno de los errores del paso (`erroresAlumno`, de src/store/errores.js: { id, n }[]),
 *   el que más veces.
 * - Si no tiene ninguna anotación (no hay datos), el más frecuente del tribunal (`erroresTribunal`: { id, n }[], de
 *   data/comun/errores-frecuentes.json).
 * - Si tiene anotaciones pero ninguna de este paso, nada (no se le machaca con lo que no ha fallado).
 * @returns {{ id: string, motivo: 'tuyo'|'tribunal' }|null}
 */
export function avisoPrevio(errores, { erroresAlumno = [], erroresTribunal = [] } = {}) {
  if (!errores?.length) return null;
  const peso = (lista, id) => lista.find((x) => x.id === id)?.n ?? 0;
  const tuyos = errores.filter((id) => peso(erroresAlumno, id) > 0).sort((a, b) => peso(erroresAlumno, b) - peso(erroresAlumno, a));
  if (tuyos.length) return { id: tuyos[0], motivo: 'tuyo' };
  if (erroresAlumno.length) return null;
  const tri = errores.filter((id) => peso(erroresTribunal, id) > 0).sort((a, b) => peso(erroresTribunal, b) - peso(erroresTribunal, a));
  return tri.length ? { id: tri[0], motivo: 'tribunal' } : null;
}

/** Suma por error de varios bancos de data/comun/errores-frecuentes.json (`porBanco`), filtrando por titulación si se da. */
export function erroresDelTribunal(porBanco, tit = null) {
  const suma = new Map();
  for (const [banco, lista] of Object.entries(porBanco ?? {})) {
    if (tit && !banco.endsWith(`/${tit}`)) continue;
    for (const { id, n } of lista) suma.set(id, (suma.get(id) ?? 0) + n);
  }
  return [...suma].map(([id, n]) => ({ id, n })).sort((a, b) => b.n - a.n);
}

/**
 * ¿Lo que escribió el alumno en el paso `i` es lo que sale con uno de los errores del paso? Vuelve a resolver la pregunta
 * con cada variante de esos errores (createKit(chart, { error })) y compara los campos de ese paso: cae dentro de la
 * tolerancia de examen del valor con error y fuera de la del valor bueno. Solo se afirma si todos los errores que
 * coinciden son el mismo (nunca se inventa un motivo).
 * @param {number[]} valores  valor leído de cada campo (undefined si no se pudo leer)
 * @returns {string|null}  id del error, o null
 */
export function diagnosticarPaso({ sol, q, chart, i, errores, pide, valores, factor = 1 }) {
  if (!errores?.length || !sol || !pide?.campos?.length) return null;
  const coincide = (campos) => campos.length === pide.campos.length
    && campos.every((c, j) => Number.isFinite(valores[j]) && quantity(c.kind).error(valores[j], c.value) <= toleranciaCampo(c, factor));
  if (coincide(pide.campos)) return null;
  const hallados = new Set();
  for (const variante of VARIANTES.filter((v) => errores.includes(tipoDe(v)))) {
    // Si la resolución con el error se rompe más adelante (con el adelanto al revés, la hora UT puede caer fuera de la
    // tabla de mareas), el paso `i` ya se calculó antes de romperse: vale para diagnosticar este paso.
    let k = null;
    try { k = createKit(chart, { error: variante }); sol.solve(k, q); } catch { if (!k) continue; }
    const campos = k.steps[i]?.pide?.campos;
    if (campos && k.steps[i].pide.paso === pide.paso && coincide(campos)) hallados.add(tipoDe(variante));
  }
  return hallados.size === 1 ? [...hallados][0] : null;
}
