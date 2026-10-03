// Motor «profe»: conocimiento pedagógico por tipo de paso, en el tono de un profesor de academia.
// Cada lección reconoce un tipo de paso por su título y aporta:
//   intro  → qué vamos a hacer y por qué (varias formas, para no repetir siempre la misma frase)
//   tip    → truco o regla para recordarlo
//   trap   → el error típico de examen en ese paso
// Para añadir conocimiento: añade o amplía una lección. El orden importa (gana la primera que encaja).

export const LESSONS = [
  // --- La hora a bordo
  {
    id: 'huso',
    match: /^huso$/i,
    intro: ['Primero el huso: cada quince grados de longitud son una hora.', 'Buscamos en qué huso estamos: dividimos la longitud entre 15 y redondeamos.'],
    tip: 'Quince grados son una hora. Al este los husos son positivos y al oeste negativos.',
    trap: 'No confundas el huso, que es un número entero, con la longitud en tiempo, que lleva minutos.',
  },
  {
    id: 'hora-legal',
    match: /^hora legal$/i,
    intro: ['Ahora la hora legal, la del huso: el TU más o menos las horas del huso.', 'Con el huso, la hora legal sale sola: TU más el huso.'],
    tip: 'Al este se suma y al oeste se resta: al este amanece antes.',
    trap: 'El error típico es restar al este. Piensa en Japón: va por delante de nosotros.',
  },
  {
    id: 'hora-civil-lugar',
    match: /^hora civil del lugar$/i,
    intro: ['Y la hora civil del lugar: la que marca el Sol en nuestra longitud exacta.', 'Para la hora civil del lugar usamos la longitud tal cual, pasada a tiempo.'],
    tip: 'Un grado son cuatro minutos y un minuto de arco, cuatro segundos.',
    trap: 'Solo coincide con la hora legal si la longitud es múltiplo de quince grados.',
  },
  {
    id: 'tu-desde-oficial',
    match: /^tu$/i,
    intro: ['Pasamos la hora oficial a tiempo universal quitando el adelanto.', 'Primero el TU: a la hora oficial le restamos el adelanto vigente.'],
    tip: 'En la península el adelanto es de una hora en invierno y dos en verano.',
    trap: 'Para ir de oficial a TU se resta; para ir de TU a oficial se suma.',
  },
  // --- Viento aparente
  {
    id: 'viento-componentes',
    match: /^componentes del real$/i,
    intro: ['Descomponemos el viento real en lo que nos llega de proa y lo que nos llega de costado.'],
    tip: 'De proa, el coseno del ángulo; de costado, el seno.',
  },
  {
    id: 'viento-avance',
    match: /^más el avance$/i,
    intro: ['Ahora el viento de avance: al movernos, notamos viento de proa igual a nuestra velocidad.'],
    trap: 'El avance se suma a la componente de proa, nunca se resta.',
  },
  {
    id: 'viento-aparente',
    match: /^aparente$|^comprobación$/i,
    intro: ['Juntamos las dos componentes: el ángulo con la arcotangente y la intensidad con Pitágoras.', 'Y comprobamos que tenga sentido.'],
    tip: 'Con arrancada avante el aparente siempre entra más a proa que el real.',
  },
  {
    id: 'declinacion',
    match: /declinaci[oó]n actualizada/i,
    intro: [
      'Antes de nada, la declinación. La de la carta está dada para un año concreto, y hay que traerla al año del ejercicio.',
      'Primero actualizamos la declinación magnética: la carta nos la da para un año y cambia un poquito cada año.',
    ],
    tip: 'Multiplica los años transcurridos por la variación anual y súmala con su signo. Al final, redondea al grado, que es como lo piden en el examen.',
    trap: 'Fíjate en el sentido de la variación: si la declinación es oeste y la variación es este, la declinación va disminuyendo.',
  },
  {
    id: 'ct-observada',
    match: /^correcci[oó]n total|^ct\b/i,
    text: /Ct = Dv/,
    intro: ['Ahora sacamos la corrección total comparando la demora verdadera de la carta con la que nos ha dado la aguja.'],
    tip: 'Corrección total igual a verdadera menos aguja. Siempre en ese orden.',
    trap: 'Si restas al revés, te sale con el signo cambiado. Comprueba el signo con sentido común: si la aguja marca menos que la verdadera, la corrección es positiva.',
  },
  {
    id: 'ct',
    match: /^correcci[oó]n total/i,
    intro: [
      'Vamos con la corrección total, que es lo primero que hago siempre que hay rumbos o demoras de aguja.',
      'Ahora la corrección total. Sin ella no podemos llevar nada a la carta.',
      'Calculamos la corrección total: es la que nos pasa de aguja a verdadero.',
    ],
    tip: 'La regla de oro: corrección total igual a declinación más desvío. Este, o nordeste, suma; oeste, o noroeste, resta.',
    trap: 'Ojo, que aquí es donde más gente falla: un signo cambiado y te vas varios grados en todo lo que viene después.',
  },
  {
    id: 'desvio',
    match: /^desv[ií]o/i,
    intro: ['Y ahora el desvío, que es lo que queda de la corrección total cuando le quitamos la declinación.'],
    tip: 'Desvío igual a corrección total menos declinación, cada uno con su signo.',
    trap: 'Cuidado con restar un número negativo: menos por menos, más.',
  },
  {
    id: 'cuadrantal',
    match: /cuadrantal/i,
    intro: ['El rumbo viene en forma cuadrantal. Lo pasamos a circular, de cero a trescientos sesenta.'],
    tip: 'Sur tantos grados oeste es ciento ochenta más esos grados; norte tantos oeste es trescientos sesenta menos esos grados.',
  },
  {
    id: 'rv',
    match: /^rumbo verdadero( a dar)?$|^salida y rv/i,
    intro: [
      'Pasamos el rumbo de aguja a verdadero, que es el único que se puede trazar en la carta.',
      'Ahora el rumbo verdadero: aguja más corrección total.',
    ],
    tip: 'Rumbo verdadero igual a rumbo de aguja más corrección total. Si te pasas de trescientos sesenta, resta trescientos sesenta.',
    trap: 'Nunca traces en la carta un rumbo de aguja. Si lo haces, todo el ejercicio sale desplazado.',
  },
  {
    id: 'ra',
    match: /^rumbo de aguja/i,
    intro: [
      'Y para terminar con el rumbo, lo pasamos a aguja, que es lo que el timonel ve en el compás.',
      'Ahora el camino inverso: de verdadero a aguja.',
    ],
    tip: 'Rumbo de aguja igual a rumbo verdadero menos corrección total. Es la misma fórmula de antes, despejada.',
    trap: 'Aquí la corrección se resta. Mucha gente la suma por inercia, y en el examen esa opción equivocada siempre está entre las respuestas.',
  },
  {
    id: 'oposicion',
    match: /oposici[oó]n/i,
    intro: ['Estamos en la oposición de dos faros: el barco está justo en la recta que los une, entre los dos.'],
    tip: 'La demora verdadera a uno de los faros es la dirección de la recta medida desde el otro faro hacia él. Eso se mide en la carta, sin aguja ni correcciones.',
    trap: 'No midas la recta al revés: si mides del faro marcado hacia el otro, te sale la opuesta, ciento ochenta grados de diferencia.',
  },
  {
    id: 'enfilacion',
    match: /enfilaci[oó]n/i,
    intro: ['Enfilación: vemos los dos faros uno detrás del otro, alineados.'],
    tip: 'La demora de la enfilación es la dirección del faro cercano al lejano, medida en la carta con el transportador. Es la mejor forma de comprobar la aguja.',
  },
  {
    id: 'marcacion',
    match: /demora/i,
    text: /Rv \+ M/,
    intro: ['Tenemos marcaciones, que se miden desde la proa del barco. Hay que pasarlas a demoras verdaderas.'],
    tip: 'Demora verdadera igual a rumbo verdadero más marcación. Estribor suma, babor resta.',
    trap: 'El error clásico es la banda: si la marcación es por babor y la sumas, el faro te aparece al otro lado del barco.',
  },
  {
    id: 'demora',
    match: /^demoras? verdaderas?|^demora$|^dv /i,
    intro: [
      'Ahora pasamos las demoras a verdaderas, porque en la carta solo se trazan demoras verdaderas.',
      'Vamos con las demoras: hay que corregirlas igual que los rumbos.',
    ],
    tip: 'Demora verdadera igual a demora de aguja más corrección total, la misma corrección que la del rumbo que llevamos.',
    trap: 'No olvides corregir las demoras. Trazar la demora de aguja es uno de los fallos más frecuentes.',
  },
  {
    id: 'lineas',
    match: /l[ií]neas? de posici[oó]n|traslado|segunda l[ií]nea/i,
    intro: [
      'Ahora a la carta. Desde cada faro trazamos la línea de posición.',
      'Llevamos las demoras a la carta con el transportador.',
    ],
    tip: 'Pon el centro del transportador en el faro y traza la demora opuesta, es decir, la demora más o menos ciento ochenta. La demora se mide desde el barco hacia el faro, y nosotros dibujamos desde el faro hacia el barco.',
    trap: 'Si trazas la demora tal cual desde el faro, la línea sale hacia tierra o hacia el lado contrario. Si tu situación cae en tierra, revisa esto.',
  },
  {
    id: 'situacion-conocida',
    match: /^situaci[oó]n/i,
    text: /^Situamos|y medimos|^A [\d,]+ millas/,
    intro: ['Lo primero, situar el barco en la carta con los datos que nos dan.', 'Empezamos colocando en la carta el punto donde estamos.'],
    tip: 'Si te dan coordenadas, llévalas con la regla desde las escalas del margen. Si te dan una dirección y una distancia desde un faro, traza desde el faro y mide en la escala de latitudes, a la altura de la zona.',
  },
  {
    id: 'situacion',
    match: /^situaci[oó]n|arco de distancia|^so\b/i,
    intro: [
      'Y donde se cortan las líneas, ahí estamos.',
      'Ya tenemos la situación. Leemos las coordenadas en las escalas de los márgenes.',
    ],
    tip: 'La latitud se lee en la escala vertical de los lados, y la longitud en la horizontal de arriba o abajo. Lleva el punto con la regla paralela a la cuadrícula.',
    trap: 'Comprueba que el punto tiene sentido: que está en el mar y cerca de donde se veían los faros.',
  },
  {
    id: 'demora-desde',
    match: /demora desde el faro/i,
    intro: ['Atención a la redacción: «demora desde el faro» es la dirección que va del faro al barco, justo la opuesta a una demora normal.'],
    tip: 'Desde el faro trazas directamente ese ángulo, sin sumar ciento ochenta.',
  },
  {
    id: 'salida',
    match: /salida|llegada|destino|punto de paso/i,
    intro: ['Primero situamos en la carta el punto del que partimos.'],
    tip: 'Si te dicen que estás al sur verdadero de un faro, desde el faro trazas hacia el sur, ciento ochenta grados. La distancia se mide siempre en la escala de latitudes, a la altura de la zona.',
  },
  {
    id: 'distancia-navegada',
    match: /distancia navegada|^tramos$/i,
    intro: ['Calculamos cuánto hemos navegado: distancia igual a velocidad por tiempo.'],
    tip: 'Pasa los minutos a horas dividiendo entre sesenta. Noventa minutos son una hora y media, no uno coma noventa.',
    trap: 'Revisa bien las horas: de las diez y cuarenta a las doce y diez hay una hora y media, no una hora y treinta décimas.',
  },
  {
    id: 'rumbo-distancia',
    match: /rumbo (verdadero )?y distancia|demora y distancia/i,
    intro: ['Unimos los dos puntos con la regla y medimos.'],
    tip: 'El rumbo, con el transportador. La distancia, con el compás llevado a la escala de latitudes, a la altura media de la recta.',
    trap: 'No midas la distancia en la escala de longitudes, la de arriba o abajo de la carta: en Mercator no sirve para distancias.',
  },
  {
    id: 'eta',
    match: /hora de llegada|hrb de llegada/i,
    intro: ['Y la hora de llegada: tiempo igual a distancia entre velocidad.'],
    tip: 'Pasa el resultado a minutos multiplicando por sesenta, y súmalo a la hora de salida.',
    trap: 'Si te dan corriente, divide entre la velocidad efectiva, no entre la del barco.',
  },
  {
    id: 'tangente',
    match: /tangente|pasar a distancia/i,
    intro: ['Para pasar a una distancia de un faro, la clave es la tangente.'],
    tip: 'Con el compás haz un círculo alrededor del faro con la distancia de paso, y desde tu situación traza la recta que lo roza. Si el faro tiene que quedar por estribor, pasas por su izquierda.',
    trap: 'La banda es la trampa: dejar el faro por estribor significa que el faro queda a tu derecha. Dibújalo antes de calcular.',
  },
  {
    id: 'distancia',
    match: /^distancia/i,
    intro: ['Medimos la distancia con el compás.'],
    tip: 'Abre el compás entre los dos puntos y llévalo a la escala de latitudes, en el margen, a la misma altura. Cada minuto es una milla.',
  },
  {
    id: 'corriente',
    match: /corriente|tri[aá]ngulo|efectiv/i,
    intro: ['Ahora la corriente, que se suma al movimiento del barco como un vector.'],
    tip: 'El rumbo de la corriente indica hacia dónde va el agua, al revés que el viento. Dibuja una hora de cada cosa: el barco, y a continuación la corriente.',
    trap: 'No confundas la corriente con el viento: corriente del noreste en un enunciado suele significar que va hacia el noreste. Lee bien.',
  },
  {
    id: 'abatimiento',
    match: /abatimiento|superficie/i,
    intro: ['El viento nos abate, nos empuja hacia sotavento.'],
    tip: 'Si el viento entra por babor, el barco cae a estribor y el abatimiento suma. Si entra por estribor, resta.',
    trap: 'El viento se nombra por de dónde viene: viento del norte empuja hacia el sur.',
  },
  {
    id: 'marea',
    match: /marea|sonda|quilla|altura|horas legales|duraci[oó]n|bajamar|^hora( oficial)?$/i,
    intro: ['Vamos con la marea.', 'Seguimos con la tabla de mareas.', 'Ahora la cuenta de la marea, paso a paso.', 'Otro paso de la marea: despacio, que aquí se cuelan los errores.'],
    tip: 'El anuario da las horas en tiempo universal: súmale el adelanto para tener la hora legal. Y la marea no sube a ritmo constante: sube despacio al principio y al final, y rápido en medio, como dice la regla de los doceavos.',
    trap: 'No interpoles en línea recta: te equivocarás por varios centímetros justo en el tramo central.',
  },
  {
    id: 'analitica',
    match: /totales|latitud de llegada|longitud|diferencia de longitud|directos/i,
    intro: ['Estima analítica: aquí no hay carta, todo es cálculo.'],
    tip: 'Diferencia de latitud igual a distancia por coseno del rumbo; apartamiento igual a distancia por seno. Y para pasar el apartamiento a longitud, divide entre el coseno de la latitud media.',
    trap: 'El apartamiento no es la diferencia de longitud. Si olvidas dividir entre el coseno de la latitud media, te quedas corto.',
  },
];

/** Lección que corresponde a un paso (o null si es un paso genérico). */
export function lessonFor(title, text = '') {
  return LESSONS.find((l) => l.match.test(title) && (!l.text || l.text.test(text))) ?? null;
}
