// Taxonomía común del modo guiado (R-35) y del diagnóstico por tipo de error (R-36).
//
// - PASOS: los tipos de paso de una resolución de carta o de cuentas (lo que el modo guiado pregunta por separado).
//   Cada operación de src/exams/kit.js que da un valor preguntable lo marca con uno de estos (`steps[i].pide.paso`).
// - ERRORES: los errores típicos que el diagnóstico sabe reconocer. Cada uno pertenece a un paso (el mismo nombre en
//   las dos funciones: «fallas al calcular la Ct» y «restas la Ct en vez de sumarla» son del paso «ct»).
// - VARIANTES: cómo se comete cada error dentro del kit (createKit(chart, { error: variante })). Un error puede tener
//   varias variantes (la Ct con el signo cambiado al calcularla, o al aplicarla); el diagnóstico agrupa por error.
//
// Los ids de error coinciden, donde existen, con los de los errores típicos de los ejercicios generados
// (src/exercises/types/*.js, `mistakes`); ALIAS traduce los que se llaman distinto.
// Sin DOM: lo usan el kit, el diagnóstico, el modo guiado, la interfaz y tools/diagnostico-cobertura.mjs.

/** Tipos de paso. `nombre`: rótulo; `al`: para la frase «fallas sobre todo …». */
export const PASOS = {
  declinacion: { nombre: 'Declinación del año', al: 'al actualizar la declinación' },
  ct: { nombre: 'Corrección total (Ct)', al: 'al calcular la Ct' },
  aguja: { nombre: 'De aguja a verdadero (y al revés)', al: 'al pasar de aguja a verdadero (o al revés)' },
  marcacion: { nombre: 'Demora por marcación', al: 'al pasar de marcación a demora' },
  linea: { nombre: 'Oposición y enfilación', al: 'al medir oposiciones y enfilaciones' },
  situacion: { nombre: 'Situación en la carta', al: 'al situarte en la carta' },
  medida: { nombre: 'Rumbo y distancia en la carta', al: 'al medir rumbos y distancias en la carta' },
  tiempo: { nombre: 'Tiempo, distancia y hora', al: 'con el tiempo, la distancia y la hora' },
  tangente: { nombre: 'Rumbo para pasar a distancia', al: 'al trazar el rumbo para pasar a una distancia' },
  abatimiento: { nombre: 'Abatimiento (viento)', al: 'con el abatimiento' },
  corriente: { nombre: 'Corriente', al: 'con la corriente' },
  traslado: { nombre: 'Situación no simultánea (traslado)', al: 'al trasladar la primera línea' },
  estima: { nombre: 'Situación de estima', al: 'en la situación de estima' },
  loxodromica: { nombre: 'Estima analítica (loxodrómica)', al: 'en la estima analítica' },
  marea: { nombre: 'Altura de la marea', al: 'al calcular la altura de la marea' },
  sonda: { nombre: 'Sonda', al: 'con la sonda de la carta' },
  'hora-legal': { nombre: 'Hora oficial y UT', al: 'al pasar entre hora oficial y UT' },
};

/**
 * Errores típicos. `si`: la frase que sigue a «Es lo que sale si…» (en segunda persona); `nombre`: rótulo corto
 * («Tus errores más repetidos»); `paso`: el tipo de paso donde se comete.
 */
export const ERRORES = {
  'signo-ct': { paso: 'ct', nombre: 'Signo de la Ct', si: 'aplicas la Ct con el signo cambiado (la restas en vez de sumarla, o al revés)' },
  'sin-ct': { paso: 'aguja', nombre: 'Sin corregir la Ct', si: 'no corriges con la Ct: usas el rumbo o la demora de aguja como si fueran verdaderos' },
  'signo-dm': { paso: 'ct', nombre: 'Signo de la declinación', si: 'tomas la declinación con el signo cambiado (E +, W −)' },
  'signo-desvio': { paso: 'ct', nombre: 'Signo del desvío', si: 'tomas el desvío con el signo cambiado (E/NE +, W/NW −)' },
  'olvida-desvio': { paso: 'ct', nombre: 'Olvidar el desvío', si: 'te olvidas del desvío (Ct = dm + Δ)' },
  'dm-sin-actualizar': { paso: 'declinacion', nombre: 'Declinación sin actualizar', si: 'no actualizas la declinación de la carta al año del enunciado' },
  'variacion-signo': { paso: 'declinacion', nombre: 'Variación anual al revés', si: 'aplicas la variación anual de la declinación con el signo cambiado' },
  'banda-marcacion': { paso: 'marcacion', nombre: 'Banda de la marcación', si: 'cambias la banda de la marcación (estribor suma, babor resta)' },
  'marcacion-como-demora': { paso: 'marcacion', nombre: 'Marcación tomada como demora', si: 'tomas la marcación como si fuera la demora (falta sumarle el rumbo)' },
  'sentido-recta': { paso: 'linea', nombre: 'Oposición o enfilación al revés', si: 'tomas la oposición o la enfilación en sentido contrario (180° de diferencia)' },
  'demora-sin-opuesta': { paso: 'situacion', nombre: 'Demora sin la opuesta', si: 'trazas desde el faro la demora sin invertirla (desde el faro va la opuesta, Dv ± 180°)' },
  'lado-del-faro': { paso: 'situacion', nombre: 'Al otro lado del faro', si: 'te sitúas al otro lado del faro («al S del faro» quiere decir que el faro te queda al N)' },
  banda: { paso: 'tangente', nombre: 'Tangente por la otra banda', si: 'dejas el faro por la banda contraria al trazar la tangente' },
  directo: { paso: 'tangente', nombre: 'Rumbo directo al faro', si: 'pones rumbo directo al faro, sin apartarte la distancia de paso' },
  'signo-abatimiento': { paso: 'abatimiento', nombre: 'Abatimiento al lado contrario', si: 'aplicas el abatimiento hacia el lado contrario (el barco cae a sotavento)' },
  'sin-abatimiento': { paso: 'abatimiento', nombre: 'Sin abatimiento', si: 'no tienes en cuenta el abatimiento' },
  'sin-corriente': { paso: 'corriente', nombre: 'Rumbo de superficie por efectivo', si: 'no tienes en cuenta la corriente: confundes el rumbo de superficie con el efectivo' },
  'corriente-invertida': { paso: 'corriente', nombre: 'Corriente al revés', si: 'aplicas la corriente en sentido contrario (su rumbo dice hacia dónde va el agua)' },
  'corriente-sumada': { paso: 'corriente', nombre: 'Corriente sumada', si: 'sumas la velocidad de la corriente a la del barco en vez de componer los vectores' },
  'sin-traslado': { paso: 'traslado', nombre: 'Sin trasladar la primera línea', si: 'cruzas las dos líneas como si fueran simultáneas, sin trasladar la primera lo navegado' },
  'horas-decimales': { paso: 'tiempo', nombre: 'Minutos y décimas de hora', si: 'confundes minutos y décimas de hora (1 h 30 min son 1,5 h, no 1,30 h)' },
  'lm-salida': { paso: 'loxodromica', nombre: 'Latitud de salida por la media', si: 'usas la latitud de salida en vez de la latitud media' },
  'sin-cos-lm': { paso: 'loxodromica', nombre: 'Apartamiento por ΔL', si: 'tomas el apartamiento como diferencia de longitud, sin el cos lm' },
  'cos-lm-multiplica': { paso: 'loxodromica', nombre: 'cos lm al revés', si: 'multiplicas por el cos lm donde hay que dividir (o al revés)' },
  'signo-dL': { paso: 'loxodromica', nombre: 'Signo de ΔL', si: 'cambias el signo de la diferencia de longitud (E +, W −)' },
  'seno-coseno': { paso: 'loxodromica', nombre: 'Seno y coseno cambiados', si: 'cambias seno y coseno (Δl = d · cos R y A = d · sen R)' },
  'sonda-carta-olvidada': { paso: 'sonda', nombre: 'Sin la sonda de la carta', si: 'no cuentas la sonda de la carta' },
  'sonda-carta-signo': { paso: 'sonda', nombre: 'Sonda de la carta al revés', si: 'restas la sonda de la carta donde hay que sumarla (o al revés)' },
  'pleamar-bajamar': { paso: 'marea', nombre: 'Pleamar por bajamar', si: 'cuentas el intervalo desde la pleamar en vez de desde la bajamar' },
  lineal: { paso: 'marea', nombre: 'Marea en línea recta', si: 'interpolas la marea en línea recta (sube según sen², no a ritmo constante)' },
  'sin-adelanto': { paso: 'hora-legal', nombre: 'Sin pasar a hora oficial', si: 'no pasas entre la hora UT del Anuario y la hora oficial' },
  'adelanto-signo': { paso: 'hora-legal', nombre: 'Adelanto al revés', si: 'aplicas el adelanto al revés (de oficial a UT se resta; de UT a oficial, se suma)' },
};

/**
 * Variantes del kit (createKit(chart, { error })): «tipo» o «tipo:cómo». Las de un mismo tipo cuentan como un solo
 * error en el diagnóstico.
 */
export const VARIANTES = [
  'signo-ct:valor', // la Ct calculada con el signo cambiado (Ct = −(dm + Δ), Ct = Da − Dv)
  'signo-ct:aplicacion', // la Ct bien, pero aplicada al revés en todas las conversiones (Rv = Ra − Ct, Ra = Rv + Ct)
  'signo-ct:suma-siempre', // siempre suma: bien de aguja a verdadero, mal de verdadero a aguja (Ra = Rv + Ct)
  'signo-ct:resta-siempre', // siempre resta: mal de aguja a verdadero (Rv = Ra − Ct, Dv = Da − Ct)
  'sin-ct', 'signo-dm', 'signo-desvio', 'olvida-desvio', 'dm-sin-actualizar', 'variacion-signo',
  'banda-marcacion', 'marcacion-como-demora', 'sentido-recta', 'demora-sin-opuesta', 'lado-del-faro',
  'banda', 'directo', 'signo-abatimiento', 'sin-abatimiento',
  'sin-corriente', 'corriente-invertida', 'corriente-sumada', 'sin-traslado', 'horas-decimales',
  'lm-salida', 'sin-cos-lm', 'cos-lm-multiplica', 'signo-dL', 'seno-coseno',
  'sonda-carta-olvidada', 'sonda-carta-signo', 'pleamar-bajamar', 'lineal', 'sin-adelanto', 'adelanto-signo',
];

/** Tipo de error de una variante ('signo-ct:valor' → 'signo-ct'). */
export const tipoDe = (variante) => String(variante).split(':')[0];

/** Ids de los errores típicos de los ejercicios generados que aquí se llaman distinto. */
export const ALIAS = {
  'resta-al-reves': 'signo-ct',
  'ignora-corriente': 'sin-corriente',
  adelanto: 'adelanto-signo',
};

/** Id de la taxonomía de un error (de un ejercicio generado o del diagnóstico), o null si no está en ella. */
export function errorComun(id) {
  const t = ALIAS[id] ?? id;
  return ERRORES[t] ? t : null;
}

/** «Es lo que sale si …» de uno o dos errores. */
export function fraseError(tipos) {
  if (tipos.length === 1) return `Es lo que sale si ${ERRORES[tipos[0]].si}.`;
  return `Puede salir de dos errores: si ${ERRORES[tipos[0]].si}, o si ${ERRORES[tipos[1]].si}.`;
}
