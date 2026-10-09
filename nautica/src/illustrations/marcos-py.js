// Marcos (docs/ESTILO-LAMINAS.md) de las láminas del PY rehechas en la última tanda: señales de peligro del Anexo IV,
// escalas Beaufort y Douglas (también del PER), electrónica (radar, GNSS, cartas electrónicas y AIS), coordenadas,
// balsa salvavidas y humedad. Mismo formato que marcos.js: { tema, titulo, clave, nota, datos: [{ cifra, texto }], alt }.
// Los hechos y cifras están comprobados contra su fuente en el apéndice de la guía. Sin DOM.

import { SOCORRO, HOJAS_SOCORRO } from './socorro.js';
import { tensionSaturacion } from '../nautical/meteo.js';

const SEG = 'Seguridad';
const SEN = 'Señales de peligro';

// ---------------------------------------------------------------------------
// Señales de peligro (RIPA, Anexo IV; Código IDS, cap. III, para la pirotecnia)

const HOJAS = {
  pirotecnia: {
    titulo: 'Señales de peligro: pirotecnia y fuego', clave: 'La luz de la pirotecnia de socorro es roja; el humo, naranja.',
    datos: [{ cifra: '1 i)', texto: 'cohete con paracaídas o bengala de mano, de luz roja' }, { cifra: '1 j)', texto: 'señal fumígena: humo naranja' }, { cifra: '1 c)', texto: 'estrellas rojas, una a una' }],
    nota: 'De noche, luz roja (cohete para que te vean de lejos; bengala para marcar tu posición a quien ya está cerca). De día, el humo naranja. Siempre por sotavento y con el viento por la espalda.',
  },
  sonido: {
    titulo: 'Señales de peligro: detonación, sonido y Morse', clave: 'Detonaciones cada minuto, un sonido continuo o SOS: se oyen aunque no te vean.',
    datos: [{ cifra: '≈ 1 min', texto: 'entre cañonazos o detonaciones' }, { cifra: 'continuo', texto: 'con cualquier aparato de niebla' }, { cifra: '··· ——— ···', texto: 'SOS, con luz, sonido o radio' }],
    nota: 'El sonido continuo no tiene pausas: no lo confundas con las señales de niebla del RIPA, que se repiten a intervalos. «SOS» es Morse; por radiotelefonía se dice «MAYDAY».',
  },
  radio: {
    titulo: 'Señales de peligro: radio y satélite', clave: 'MAYDAY y LSD los oyen los barcos de alrededor; la radiobaliza, solo los satélites.',
    datos: [{ cifra: 'canal 16', texto: 'MAYDAY por voz, en VHF' }, { cifra: 'canal 70', texto: 'alerta LSD: digital, sin voz' }, { cifra: '406 MHz', texto: 'radiobaliza, a los satélites Cospas-Sarsat' }],
    nota: 'El SART no usa satélites: responde al radar de quien te busca y se ve en su pantalla como una línea de 12 puntos. La alerta por satélite (1 m) es la de una estación terrena de buque, como Inmarsat.',
  },
  vista: {
    titulo: 'Señales de peligro: a la vista', clave: 'De día y sin pirotecnia: NC, la bandera cuadra con bola o los brazos que suben y bajan.',
    datos: [{ cifra: 'N sobre C', texto: 'del Código Internacional de Señales' }, { cifra: 'lento', texto: 'subir y bajar los brazos extendidos' }, { cifra: '3 a) y 3 b)', texto: 'lona naranja y colorante: para el aire' }],
    nota: 'La bandera cuadra puede ser cualquiera: lo que cuenta es la bola (u objeto parecido) encima o debajo de ella. La lona naranja lleva un cuadrado y un círculo negros.',
  },
};

/** Marcos propios de las señales que se estudian a fondo, en grande (las demás usan el texto del Anexo). */
const SOLO = {
  'cohete-paracaidas': {
    titulo: 'Cohete con paracaídas', clave: 'Sube a 300 m o más y su luz roja baja colgada del paracaídas: te ven de lejos.',
    datos: [{ cifra: '≥ 300 m', texto: 'altura a la que sube' }, { cifra: '≥ 30.000 cd', texto: 'luz roja brillante' }, { cifra: '≥ 40 s', texto: 'de luz, bajando a ≤ 5 m/s' }],
    nota: 'Sirve para llamar la atención de quien aún no te ve. Se dispara casi vertical, siguiendo las instrucciones; con nubes bajas, más inclinado para que la luz quede debajo de ellas. Nunca con un helicóptero cerca.',
  },
  bengala: {
    titulo: 'Bengala de mano', clave: 'Luz roja para marcar tu posición a quien ya te busca cerca.',
    datos: [{ cifra: '≥ 15.000 cd', texto: 'luz roja brillante y uniforme' }, { cifra: '≥ 1 min', texto: 'de combustión' }, { cifra: '10 s', texto: 'a 100 mm bajo el agua y sigue ardiendo' }],
    nota: 'Por sotavento, de espaldas al viento y con el brazo extendido por fuera de la borda: el humo y las chispas se alejan de ti y del barco (o de la balsa). Protégete la mano con un guante.',
  },
  humo: {
    titulo: 'Señal fumígena flotante', clave: 'Humo naranja en el agua: la señal de día, que se ve desde el aire.',
    datos: [{ cifra: '≥ 3 min', texto: 'de humo, en aguas tranquilas' }, { cifra: 'naranja', texto: 'muy visible; no arde con llama' }, { cifra: '10 s', texto: 'a 100 mm bajo el agua y sigue echando humo' }],
    nota: 'Flota y marca un punto en el agua: un hombre al agua, de día. Se lanza por sotavento; tiene un pequeño retardo para que dé tiempo a tirarla.',
  },
  radiobaliza: {
    titulo: 'La radiobaliza: de la alerta al rescate', clave: 'Su alerta va a los satélites, no a los barcos de alrededor.',
    datos: [{ cifra: '406 MHz', texto: 'alerta a Cospas-Sarsat, con el MMSI' }, { cifra: '121,5 MHz', texto: 'recalada, para los medios de rescate' }, { cifra: '≥ 48 h', texto: 'emitiendo sin parar' }],
    nota: 'Con su zafa hidrostática se suelta si el barco se hunde y empieza a emitir al tocar el agua. Debe estar registrada. Si se dispara por error, avisa enseguida a Salvamento Marítimo.',
  },
  SART: {
    titulo: 'El respondedor de radar (SART)', clave: 'Responde al radar de quien te busca: en su pantalla, 12 puntos hacia fuera.',
    datos: [{ cifra: '9 GHz', texto: 'banda X del radar' }, { cifra: '12 puntos', texto: 'desde su posición, en su misma demora' }, { cifra: '≥ 1 m', texto: 'sobre el agua, para que llegue lejos' }],
    nota: 'No usa satélites ni dice quién eres: solo marca dónde estás. Se enciende a mano en la balsa; aguanta unas 96 horas en espera y unas 8 respondiendo.',
  },
};

function socorro(spec) {
  const k = spec.resaltar;
  if (k != null && !SOCORRO[k]) return null;
  if (k && spec.solo) {
    const s = SOCORRO[k];
    const m = SOLO[k];
    if (m) return { tema: SEN, ...m, alt: socorroAlt(k) };
    return {
      tema: SEN, titulo: `Señal de peligro: ${s.nombre.charAt(0).toLowerCase()}${s.nombre.slice(1)}`, clave: `${s.nombre}, ${s.detalle}.`,
      datos: [{ cifra: `${s.letra})`, texto: s.letra.startsWith('3') ? 'punto 3 del Anexo IV: complementaria' : 'punto 1 del Anexo IV del RIPA' }],
      nota: s.nota.replace(/^Anexo IV [^:]+:\s*/, '').replace(/^./, (c) => c.toUpperCase()),
      alt: socorroAlt(k),
    };
  }
  const h = k ? SOCORRO[k].hoja : spec.hoja;
  if (h) {
    if (!HOJAS[h]) return null;
    const claves = HOJAS_SOCORRO[h].claves;
    return {
      tema: SEN, ...HOJAS[h],
      // resaltada una señal, la lámina es la del índice (resaltar no crea otra): el título dice cuál se mira
      ...(k ? { titulo: `Señal de peligro ${SOCORRO[k].letra}): ${SOCORRO[k].nombre.charAt(0).toLowerCase()}${SOCORRO[k].nombre.slice(1)}` } : {}),
      alt: `Hoja de señales de peligro del Anexo IV del RIPA, una por fila con su pictograma, su letra, su nombre y su detalle: ${claves.map((c) => `${SOCORRO[c].letra}) ${SOCORRO[c].nombre.toLowerCase()}`).join('; ')}.${k ? ` Resaltada: ${SOCORRO[k].nombre.toLowerCase()}.` : ''}`,
    };
  }
  return {
    tema: SEN, titulo: 'Señales de peligro del Anexo IV', clave: 'Juntas o por separado, piden ayuda: solo se usan si hay peligro.',
    datos: [{ cifra: '15', texto: 'señales de peligro, de la 1 a) a la 1 o)' }, { cifra: '2', texto: 'complementarias para el aire: 3 a) y 3 b)' }, { cifra: '4', texto: 'grupos: pirotecnia, sonido, radio y a la vista' }],
    nota: 'En el examen caen sobre todo la pirotecnia (cohete, bengala y humo), el MAYDAY por el canal 16, la alerta LSD por el 70 y las banderas NC. Las banderas V y W piden ayuda, pero no son señales de peligro del Anexo IV.',
    alt: 'Las diecisiete señales del Anexo IV del RIPA en cuatro recuadros, cada una con su pictograma y su letra: pirotecnia y fuego; detonación, sonido y Morse; radio y satélite; y a la vista, con la lona y el colorante del punto 3.',
  };
}

function socorroAlt(k) {
  const s = SOCORRO[k];
  const extra = {
    'cohete-paracaidas': ' Una cota marca los 300 m o más de altura; la luz roja, de 30.000 cd o más, arde 40 s o más bajando a 5 m/s como mucho.',
    bengala: ' El tripulante la sostiene por sotavento, de espaldas al viento, con el brazo por fuera de la borda; 15.000 cd o más durante 1 minuto o más.',
    humo: ' El humo naranja se aleja con el viento durante 3 minutos o más.',
    radiobaliza: ' Debajo, la cadena numerada: radiobaliza en 406 MHz, satélite Cospas-Sarsat, estación terrena, centro de control de Maspalomas y Salvamento Marítimo.',
    SART: ' Al lado, la pantalla del radar con la línea de 12 puntos que sale de la posición del SART hacia el borde.',
  }[k] ?? '';
  return `${s.forma} Señal ${s.letra}) del Anexo IV del RIPA: ${s.nombre.toLowerCase()}, ${s.detalle}.${extra}`;
}

// ---------------------------------------------------------------------------
// Escalas Beaufort (viento) y Douglas (mar): PER, UT 9, y PY, UT 2

const MET = 'Meteorología';

function beaufort(spec) {
  if ((spec.escala ?? 'beaufort') === 'douglas') {
    return {
      tema: MET, titulo: 'Escala Douglas: el estado de la mar', clave: 'Douglas clasifica la mar por la altura de las olas, del 0 (calma) al 9 (enorme).',
      datos: [{ cifra: '0–9', texto: 'diez grados' }, { cifra: '0,5–1,25 m', texto: 'marejada, el grado 3' }, { cifra: '2,5–4 m', texto: 'gruesa, el grado 5' }],
      nota: 'No hay equivalencia exacta con Beaufort: la mar que levanta un viento depende de su fuerza, del tiempo que lleva soplando (persistencia) y de la extensión de mar sobre la que sopla (fetch). Es la escala de la mar de viento; la de fondo se describe aparte.',
      alt: 'Tabla de la escala Douglas, del grado 0 al 9: calma o llana, rizada, marejadilla, marejada, fuerte marejada, gruesa, muy gruesa, arbolada, montañosa y enorme, cada una con la altura de las olas en metros y una ola dibujada que crece con el grado.',
    };
  }
  return {
    tema: MET, titulo: 'Escala Beaufort: la fuerza del viento', clave: 'Beaufort mide el viento en 13 grados, del 0 (calma) al 12 (temporal huracanado).',
    datos: [{ cifra: '0–12', texto: 'trece grados de fuerza' }, { cifra: '22–27 kn', texto: 'fuerza 6, fresco' }, { cifra: '≥ 34 kn', texto: 'fuerza 8 y más: temporal' }],
    nota: 'Es la escala de los partes marítimos de AEMET («fuerza 5», «fuerza 7»). A partir de fuerza 6 la navegación ya es exigente para una embarcación pequeña; la fuerza 8 es temporal.',
    alt: 'Tabla de la escala Beaufort, de la fuerza 0 a la 12, con su nombre (calma, ventolina, flojito, flojo, bonancible, fresquito, fresco, frescachón, temporal, temporal fuerte, temporal duro, temporal muy duro y temporal huracanado) y su velocidad en nudos; una barra por fila crece con la velocidad y una línea marca los 34 nudos del temporal.',
  };
}

// ---------------------------------------------------------------------------
// Electrónica (PY, UT 3): radar, GNSS, cartas electrónicas y AIS

const NAV = 'Electrónica';
const NOTA_MEDIR = 'Para medir bien: la escala más pequeña que muestre el eco, el VRM al borde más próximo del eco y la EBL al centro de un eco pequeño. Con demora y distancia a un punto de la costa ya tienes tu situación.';

function radarPantalla(spec) {
  const pres = spec.presentacion ?? 'ambas';
  const datos = [{ cifra: 'Dv = Rv + M', texto: 'de marcación a demora (babor, M negativa)' }, { cifra: 'EBL', texto: 'línea de demora: marcación o demora' }, { cifra: 'VRM', texto: 'anillo variable: la distancia' }];
  const alt = 'Pantalla de radar oscura con la línea de proa, la EBL a trazos sobre un eco, el VRM tocándolo y los anillos fijos; debajo, la cuenta de marcación a demora: Dv = Rv + M.';
  if (pres === 'proa-arriba') {
    return { tema: NAV, titulo: 'Radar en proa arriba (H-UP)', clave: 'La línea de proa va arriba: la EBL da marcaciones y la imagen gira al cambiar de rumbo.', datos, nota: NOTA_MEDIR, alt };
  }
  if (pres === 'norte-arriba') {
    return { tema: NAV, titulo: 'Radar en norte arriba (N-UP)', clave: 'El norte va arriba: la EBL da demoras y la imagen no gira al cambiar de rumbo.', datos, nota: `Necesita un sensor de rumbo y se compara fácil con la carta. ${NOTA_MEDIR}`, alt };
  }
  return {
    tema: NAV, titulo: 'Radar: proa arriba y norte arriba', clave: 'En proa arriba la EBL da la marcación; en norte arriba, la demora.',
    datos, nota: NOTA_MEDIR,
    alt: 'El mismo eco en dos pantallas de radar: en proa arriba la EBL da la marcación; en norte arriba, la demora. En las dos, el VRM toca el eco. Debajo, la cuenta Dv = Rv + M.',
  };
}

function radarRespondedores(spec) {
  const cerca = spec.sart === 'cerca';
  return {
    tema: NAV, titulo: cerca ? 'El SART de cerca en el radar: arcos' : 'Racon, SART y reflector en el radar', clave: cerca ? 'Al acercarte al SART, sus 12 puntos se vuelven arcos y, muy cerca, círculos.' : 'El racon se identifica con una letra Morse; el SART marca dónde hay alguien en peligro.',
    datos: [{ cifra: 'D (— · ·)', texto: 'racon de un nuevo peligro o pecio' }, { cifra: '12 puntos', texto: 'el SART, desde su posición hacia fuera' }, { cifra: 'banda X', texto: 'la que interroga al SART (9 GHz)' }],
    nota: 'El racon es una baliza en faros, boyas o puentes: responde a tu pulso y su letra sale en línea radial detrás de su eco. El reflector es pasivo: solo hace que un casco de fibra o de madera dé eco.',
    alt: 'Pantalla de radar con tres ecos numerados: el racon, con su letra Morse detrás del eco de una boya; el SART, con sus 12 puntos (o sus arcos, de cerca); y un barco pequeño con reflector. Debajo, la leyenda.',
  };
}

const gnss = () => ({
  tema: NAV, titulo: 'GNSS: las siglas de una ruta', clave: 'BRG y DTG, hasta el WPT; COG y SOG, sobre el fondo; XTE, lo que te has apartado.',
  datos: [{ cifra: 'XTE 0,05 R', texto: 'medio cable a estribor de la ruta' }, { cifra: 'VMG 5,6 kn', texto: 'lo que te acercas: 6 · cos 20°' }, { cifra: 'ETA 13:20', texto: '10:20 + 18,0 M / 6,0 kn' }],
  nota: 'El HDG es hacia donde apunta la proa; el COG, por donde vas de verdad con el viento y la corriente. El XTE no es lo que falta para llegar: eso es el DTG.',
  alt: 'Ruta entre dos waypoints vista desde arriba, con el barco a estribor: el XTE acotado, la demora y la distancia al WPT, el COG con su SOG, su proyección (la VMG) y la proa (HDG). Debajo, la pantalla con TTG, ETA, XTE y VMG.',
});

// La banda y la hora (texto) dan otra lámina en la galería: el título lo dice.
const gnssCalculos = (spec) => ({
  tema: NAV, titulo: `XTE, VMG y ETA, paso a paso${spec.banda === 'L' ? ', con el XTE a babor' : ''}${spec.hora && spec.hora !== '10:20' ? `, a las ${spec.hora}` : ''}`, clave: 'TTG = DTG / SOG, y la VMG es la SOG por el coseno del ángulo con el BRG.',
  datos: [{ cifra: 'R · L', texto: 'XTE a la derecha (estribor) o a la izquierda (babor)' }, { cifra: 'SOG · cos α', texto: 'VMG; α, entre el COG y el BRG' }, { cifra: 'hora + TTG', texto: 'la ETA' }],
  nota: 'Una milla son 10 cables (un cable, 185 m): un XTE de 0,05 es medio cable, unos 93 m. Las cuentas usan la SOG, sobre el fondo, no la velocidad de la corredera.',
  alt: 'Tres cálculos numerados: el XTE acotado entre el barco y la ruta, el triángulo de la VMG con el ángulo entre el COG y el BRG, y una barra de tiempo de la salida a la ETA con sus horas.',
});

const cartaRaster = () => ({
  tema: NAV, titulo: 'Cartas electrónicas: raster y vectorial', clave: 'La raster es un dibujo; la vectorial, una base de datos que puede avisarte.',
  datos: [{ cifra: 'RNC', texto: 'raster: imagen escaneada de la de papel' }, { cifra: 'ENC', texto: 'vectorial: objeto a objeto, norma S-57' }, { cifra: 'ECDIS', texto: 'sistema homologado OMI: no es una carta' }],
  nota: 'Las dos se actualizan. Un ECDIS con ENC oficiales al día puede sustituir a la carta de papel; con raster necesita además cartas de papel al día. En España, las ENC oficiales las produce el Instituto Hidrográfico de la Marina.',
  alt: 'A la izquierda, una carta raster que al ampliarla se ve hecha de píxeles; a la derecha, una vectorial en capas (boyas, sondas, tierra) con la norma S-57 y una alarma de veril. Abajo, que ECDIS, ECS y plotter son sistemas, no cartas.',
});

const ais = () => ({
  tema: NAV, titulo: 'AIS: solo ves a quien lo lleva', clave: 'El AIS da la identidad, el rumbo y la velocidad de quien lo lleva encendido.',
  datos: [{ cifra: '87B · 88B', texto: 'los dos canales de VHF del AIS' }, { cifra: '20–30 M', texto: 'alcance habitual, el del VHF' }, { cifra: 'clase B', texto: 'la habitual en recreo; la A, la de los buques SOLAS' }],
  nota: 'Toma la posición del GNSS del barco y la emite sola, sin que hagas nada. Un barco sin AIS o con el equipo apagado no aparece: por eso no sustituye al radar ni a la vigilancia visual.',
  alt: 'Carta vista desde arriba con tu barco en el centro y el alcance del VHF a trazos: aparecen un mercante con AIS (triángulo y vector), una boya con AIS y la estación costera; un velero sin AIS, cerca, no aparece.',
});

// ---------------------------------------------------------------------------
// Coordenadas geográficas (PY, UT 3.1)

const TIERRA = 'La Tierra y la carta';
const fLat = (l) => `${Math.abs(l)}° ${l >= 0 ? 'N' : 'S'}`;
const fLon = (L) => `${String(Math.abs(L)).padStart(3, '0')}° ${L >= 0 ? 'E' : 'W'}`;

function coordenadas(spec) {
  const vista = spec.vista ?? 'esfera';
  const r = new Set([].concat(spec.resaltar ?? []));
  if (vista === 'esfera') {
    if (r.has('tropicos')) {
      return {
        tema: TIERRA, titulo: 'Paralelos con nombre propio', clave: 'Trópicos a 23° 27′ y círculos polares a 66° 33′, en los dos hemisferios.',
        datos: [{ cifra: '23° 27′ N', texto: 'trópico de Cáncer' }, { cifra: '23° 27′ S', texto: 'trópico de Capricornio' }, { cifra: '66° 33′', texto: 'círculos polares ártico (N) y antártico (S)' }],
        nota: 'Los trópicos están a la latitud de la inclinación del eje de la Tierra y los círculos polares a 90° menos esa inclinación. Hoy vale unos 23° 26′, pero el temario y el examen usan 23° 27′.',
        alt: 'Esfera con el ecuador y, en magenta, los trópicos de Cáncer y Capricornio y los círculos polares ártico y antártico, cada uno con su latitud.',
      };
    }
    return {
      tema: TIERRA, titulo: r.has('maximos') ? 'Círculos máximos y menores' : 'Ecuador, paralelos y meridianos', clave: r.has('maximos') ? 'Si su plano pasa por el centro de la Tierra, es un círculo máximo: el ecuador y los meridianos.' : 'El ecuador y los meridianos son círculos máximos; los paralelos, círculos menores.',
      datos: [{ cifra: '0°', texto: 'ecuador: origen de las latitudes' }, { cifra: '0°', texto: 'Greenwich: origen de las longitudes' }, { cifra: '2 polos', texto: 'por donde pasan todos los meridianos' }],
      nota: 'Los paralelos son paralelos al ecuador y se hacen más pequeños hacia los polos; los meridianos van de polo a polo. La Tierra gira de W a E alrededor de su eje.',
      alt: 'Esfera con su eje entre los polos, el ecuador, varios paralelos y meridianos y el meridiano de Greenwich, cada uno con su rótulo: círculo máximo o menor.',
    };
  }
  if (vista === 'latitud' || vista === 'longitud') {
    const lat = Number(spec.lat ?? 40);
    const lon = Number(spec.lon ?? -50);
    if (vista === 'latitud') {
      return {
        tema: TIERRA, titulo: 'La latitud', clave: 'Arco de meridiano desde el ecuador hasta el lugar: de 0° a 90°, N o S.',
        datos: [{ cifra: fLat(lat), texto: 'la de P, en el dibujo' }, { cifra: '0°–90°', texto: 'hacia el N o hacia el S' }, { cifra: '1′ = 1 M', texto: 'un minuto de latitud, una milla' }],
        nota: 'Todos los puntos del mismo paralelo tienen la misma latitud. Por eso las distancias se miden en la escala de latitudes de la carta.',
        alt: 'Esfera con un punto P: en magenta, el arco de su meridiano desde el ecuador hasta P, que es su latitud; a trazos, el paralelo del lugar.',
      };
    }
    return {
      tema: TIERRA, titulo: 'La longitud', clave: 'Arco de ecuador desde Greenwich hasta el meridiano del lugar: de 0° a 180°, E o W.',
      datos: [{ cifra: fLon(lon), texto: 'la de P, en el dibujo' }, { cifra: '0°–180°', texto: 'hacia el E o hacia el W' }, { cifra: 'Greenwich', texto: 'el meridiano 0°' }],
      nota: 'Todos los puntos del mismo meridiano tienen la misma longitud. Un minuto de longitud solo mide una milla en el ecuador: hacia los polos, cada vez menos.',
      alt: 'Esfera con un punto P: en magenta, el arco de ecuador desde el meridiano de Greenwich hasta el meridiano de P, que es su longitud.',
    };
  }
  if (vista === 'lugar') {
    return {
      tema: TIERRA, titulo: 'Meridiano del lugar: superior e inferior', clave: 'Tu meridiano superior pasa por ti; el inferior, por el lado opuesto de la Tierra.',
      datos: [{ cifra: '180°', texto: 'entre el superior y el inferior' }, { cifra: 'mediodía', texto: 'el Sol cruza tu meridiano superior' }, { cifra: 'E · W', texto: 'los hemisferios, a cada lado de Greenwich' }],
      nota: 'Visto desde encima del Polo N, el E queda a la derecha de Greenwich y el W a la izquierda. El meridiano de 180° es el antimeridiano de Greenwich.',
      alt: 'La Tierra vista desde encima del Polo N, con el ecuador como borde: Greenwich abajo, el de 180° arriba y, en magenta, tu meridiano superior y el inferior, a trazos.',
    };
  }
  return {
    tema: TIERRA, titulo: 'Diferencias de latitud y longitud', clave: 'Mismo nombre, se restan; distinto nombre, se suman.',
    datos: [{ cifra: '3° 30′ S', texto: 'Δl de 2° 10′ N a 1° 20′ S' }, { cifra: '150° W', texto: 'ΔL de 100° W a 110° E' }, { cifra: '> 180°', texto: 'la ΔL: se toma 360° − ΔL y cambia el sentido' }],
    nota: 'La diferencia se nombra hacia donde vas: si llegas más al S, la Δl es S. La ΔL nunca pasa de 180°: es el camino corto.',
    alt: 'A la izquierda, la diferencia de longitud vista desde el Polo N, con el camino largo por Greenwich (210°) y el corto por 180° en magenta (150° W). A la derecha, la diferencia de latitud sobre un meridiano (3° 30′ S). Debajo, las cuentas.',
  };
}

// ---------------------------------------------------------------------------
// Balsa salvavidas (PY, UT 1: py-1-5 y py-1-8)

const BALSA = {
  zafa: {
    titulo: 'La balsa: contenedor, zafa y boza', clave: 'La zafa hidrostática suelta la balsa sola si el barco se hunde, antes de 4 m.',
    datos: [{ cifra: '≤ 4 m', texto: 'la zafa suelta la trinca por la presión del agua' }, { cifra: '1 trinca', texto: 'solo la que pasa por la zafa' }, { cifra: 'unión débil', texto: 'rompe la boza con la balsa ya inflada' }],
    nota: 'La zafa no se dispara con las olas, al mojarse ni con un golpe: solo con la presión del agua al hundirse. También se puede soltar a mano. Cámbiala en el plazo que diga el fabricante.',
    alt: 'La balsa en su contenedor sobre la cuna, en cubierta: la trinca pasa por encima y acaba en la zafa hidrostática; la boza va del contenedor a la unión débil, junto a la zafa.',
  },
  inflado: {
    titulo: 'La balsa se infla sola: zafa, boza y unión débil', clave: 'La zafa la suelta, el barco que se hunde tensa la boza y la balsa se infla; luego la unión débil la libera.',
    datos: [{ cifra: '≤ 4 m', texto: 'suelta la zafa' }, { cifra: 'boza tensa', texto: 'dispara la botella de gas' }, { cifra: 'unión débil', texto: 'se rompe: la balsa queda libre' }],
    nota: 'Por eso la boza debe ir amarrada al barco a través de la unión débil: sin ella, la balsa se hundiría con el barco; sin boza, no se inflaría.',
    alt: 'Cuatro viñetas de un barco que se hunde: la zafa suelta la trinca antes de 4 metros, el contenedor sube a flote, la boza se tensa y la balsa se infla, y la unión débil se rompe.',
  },
  adrizar: {
    titulo: 'Adrizar una balsa volcada', clave: 'Desde la botella, a sotavento, tira de las cinchas echándote atrás: el viento la voltea.',
    datos: [{ cifra: 'sotavento', texto: 'el lado desde el que se adriza' }, { cifra: 'botella', texto: 'donde te subes, de pie' }, { cifra: 'cinchas', texto: 'de adrizamiento, en el fondo de la balsa' }],
    nota: 'Al voltearse, la balsa cae hacia ti: apártate nadando para que no te atrape debajo. Hazlo con el chaleco puesto.',
    alt: 'Balsa boca abajo con el toldo bajo el agua: a sotavento, una persona de pie sobre la botella tira de las cinchas echándose atrás, y el viento levanta el borde de barlovento.',
  },
  lanzar: {
    titulo: 'Lanzar la balsa a mano y embarcar', clave: 'Boza amarrada, lanzarla por sotavento y un tirón de la boza: se infla al costado.',
    datos: [{ cifra: 'sotavento', texto: 'por donde se lanza y se embarca' }, { cifra: 'un tirón', texto: 'de la boza, cuando ya está toda fuera' }, { cifra: 'todos dentro', texto: 'y solo entonces se suelta la boza' }],
    nota: 'Embarca desde el barco sin mojarte, si puedes, y sin saltar encima de la balsa; que entre primero alguien fuerte, que ayude a los demás.',
    alt: 'El barco visto desde arriba con el viento por un costado: la boza amarrada a un punto fuerte del costado de sotavento llega a la balsa, que flota al costado; cuatro números marcan los pasos.',
  },
};
const balsa = (spec) => { const m = BALSA[spec.vista ?? 'zafa']; return m ? { tema: SEG, ...m } : null; };

// ---------------------------------------------------------------------------
// Cola de láminas del PY: humedad y psicrómetro, nubes, olas y modelos de viento (UT 2); helicóptero, chaleco y arnés y
// superficies libres (UT 1); husos horarios (UT 3). Dibujos en py-cola-meteo-c.js y py-cola-c.js.

const humedadM = (spec) => {
  const t = Number(spec.t ?? 20);
  const td = Number(spec.td ?? 12);
  const hr = Math.round((100 * tensionSaturacion(td)) / tensionSaturacion(t));
  const propio = t !== 20 || td !== 12;
  return {
    tema: MET, titulo: `Humedad relativa y punto de rocío${propio ? `: aire a ${t} °C y rocío a ${td} °C` : ''}`, clave: 'Al enfriarse sin ganar vapor, la humedad relativa sube hasta el 100 % en el punto de rocío.',
    datos: [{ cifra: `${hr} %`, texto: `HR del aire a ${t} °C con el rocío a ${td} °C` }, { cifra: '100 %', texto: 'en el punto de rocío: el vapor condensa' }, { cifra: 'T ≈ Td', texto: 'temperatura cerca del rocío: niebla fácil' }],
    nota: 'La humedad relativa compara el vapor que lleva el aire con el que le cabría a su temperatura, y el aire caliente admite más. Con el mismo vapor, la HR baja al calentarse de día y sube al enfriarse de noche.',
    alt: `Gráfica con la curva del vapor que satura el aire según la temperatura. El aire a ${t} °C, con una humedad relativa del ${hr} %, queda por debajo de la curva; una flecha magenta lo enfría sin añadir vapor hasta tocarla a ${td} °C, su punto de rocío.`,
  };
};

const PSICRO = {
  ejemplo: ['El psicrómetro: termómetro seco y húmedo', 'El húmedo marca menos porque su agua se evapora; la diferencia da la humedad.', [{ cifra: '18 / 15 °C', texto: 'seco y húmedo, en el ejemplo' }, { cifra: '> 70 %', texto: 'humedad relativa, en las tablas' }, { cifra: '≈ 13 °C', texto: 'punto de rocío' }]],
  humedo: ['El psicrómetro con el aire casi saturado', 'Si el seco y el húmedo marcan casi lo mismo, la humedad relativa es alta.', [{ cifra: '0,5 °C', texto: 'de diferencia: casi no se evapora' }, { cifra: 'HR alta', texto: 'cerca del 100 %' }, { cifra: 'T ≈ Td', texto: 'niebla o rocío probables' }]],
  seco: ['El psicrómetro con el aire seco', 'Mucha diferencia entre el seco y el húmedo: aire seco, humedad relativa baja.', [{ cifra: '7 °C', texto: 'de diferencia en el dibujo' }, { cifra: 'HR baja', texto: 'mucha evaporación en la muselina' }, { cifra: 'Td ≪ T', texto: 'lejos de la niebla' }]],
};
const psicrometroM = (spec) => {
  const c = PSICRO[spec.caso ?? 'ejemplo'];
  if (!c) return null;
  return {
    tema: MET, titulo: c[0], clave: c[1], datos: c[2],
    nota: 'Se lee a la sombra y con aire que corra junto al bulbo húmedo. Con la temperatura del seco y la diferencia, las tablas psicrométricas dan la humedad relativa y el punto de rocío.',
    alt: 'Psicrómetro: dos termómetros iguales; el húmedo lleva el bulbo envuelto en una muselina mojada por una mecha desde un depósito de agua y marca menos que el seco. Al lado, la diferencia acotada y lo que se lee en las tablas.',
  };
};

const nubesM = () => ({
  tema: MET, titulo: 'Los diez géneros de nubes por pisos', clave: '«Cirro-» son las altas, «alto-» las medias y sin prefijo las bajas; Cu y Cb crecen en vertical.',
  datos: [{ cifra: '> 6000 m', texto: 'altas: Ci, Cc y Cs, de hielo' }, { cifra: '2000–6000 m', texto: 'medias: Ac y As' }, { cifra: '< 2000 m', texto: 'bajas: St, Sc y Ns' }],
  nota: 'Son las alturas del examen, aproximadas. La OMM da márgenes más amplios y que se solapan, y pone el nimbostrato en el piso medio aunque su base baje mucho; el examen lo cuenta entre las bajas.',
  alt: 'El cielo en tres pisos sobre el mar, con el dibujo de cada género: altas, cirros, cirrocúmulos y cirrostratos con su halo; medias, altocúmulos y altostratos; bajas, estratos, estratocúmulos y nimbostratos con lluvia. A la derecha, el cúmulo y el cumulonimbo, que sube hasta el piso alto con su yunque.',
});

const nubesPisosM = () => ({
  tema: MET, titulo: 'Cada piso, sus nubes', clave: 'Altas Ci, Cc y Cs; medias Ac y As; bajas St, Sc y Ns; verticales Cu y Cb.',
  datos: [{ cifra: 'cirro-', texto: 'prefijo de las altas' }, { cifra: 'alto-', texto: 'prefijo de las medias, no de las altas' }, { cifra: 'Cb', texto: 'cumulonimbo: tormenta, granizo y rachas' }],
  nota: 'El halo alrededor del Sol o de la Luna es de los cirrostratos; el sol «esmerilado», tras un velo gris, de los altostratos. Los nimbostratos dan lluvia continua; los cumulonimbos, chubascos y tormenta.',
  alt: 'Tabla de las nubes por pisos, con la abreviatura, el nombre y cómo se reconoce cada género: altas (cirro-), medias (alto-), bajas (sin prefijo) y de desarrollo vertical.',
});

const olaM = (spec) => {
  if ((spec.vista ?? 'partes') === 'mar-de-fondo') {
    return {
      tema: MET, titulo: 'Mar de viento y mar de fondo', clave: 'La mar de viento la levanta el viento que sopla ahí; la de fondo viene de un temporal lejano.',
      datos: [{ cifra: 'agudas', texto: 'crestas de la mar de viento, que rompen' }, { cifra: 'largas', texto: 'y regulares, las olas de la mar de fondo' }, { cifra: 'fetch', texto: 'la mar crece con él, el viento y su duración' }],
      nota: 'La mar de fondo puede llegar con calma o con un viento local de otra dirección. En los partes se da aparte de la mar de viento.',
      alt: 'Dos cortes del mar: arriba, la mar de viento, con olas cortas, irregulares y de crestas rotas bajo el viento que las levanta; abajo, la mar de fondo, con olas largas y redondeadas que avanzan en otra dirección que el viento local.',
    };
  }
  return {
    tema: MET, titulo: 'Partes de una ola', clave: 'La altura va del seno a la cresta; la longitud de onda, de cresta a cresta.',
    datos: [{ cifra: 'H = 2 · A', texto: 'la altura, el doble de la amplitud' }, { cifra: 'metros', texto: 'la longitud de onda: de cresta a cresta' }, { cifra: 'segundos', texto: 'el periodo: entre dos crestas por un punto' }],
    nota: 'La amplitud se mide desde el nivel del mar en calma, no desde el seno. El periodo se mide en un punto fijo (una boya): el tiempo que pasa entre dos crestas.',
    alt: 'Perfil de una ola sobre el nivel en calma, a trazos, con la cresta y el seno rotulados y tres cotas: la longitud de onda de cresta a cresta, la altura del seno a la cresta y la amplitud del nivel en calma a la cresta. Una boya fija sirve para medir el periodo.',
  };
};

const MODELOS = {
  todos: ['Modelos de viento y sus fuerzas', 'Sin rozamiento el viento sigue las isobaras; con rozamiento, las corta hacia las bajas.'],
  geostrofico: ['El viento geostrófico', 'Gradiente y Coriolis se equilibran: el viento sigue las isobaras rectas, con las altas a su derecha.'],
  gradiente: ['El viento de gradiente', 'Con isobaras curvas se suma la centrífuga: el viento sigue las isobaras curvas.'],
  antitriptico: ['El viento con rozamiento (antitríptico)', 'El rozamiento frena el viento y lo hace cortar las isobaras hacia las bajas.'],
};
const modelosVientoM = (spec) => {
  const m = MODELOS[spec.modelo ?? 'todos'];
  if (!m) return null;
  return {
    tema: MET, titulo: m[0], clave: m[1],
    datos: [{ cifra: 'G = C', texto: 'geostrófico: gradiente igual a Coriolis' }, { cifra: 'G = C + Cf', texto: 'de gradiente, alrededor de una baja' }, { cifra: '10–20°', texto: 'lo que corta las isobaras sobre el mar' }],
    nota: 'Geostrófico y de gradiente son teóricos y soplan desde unos 1000 m, por encima del rozamiento. En sentido estricto el antitríptico equilibra solo gradiente y rozamiento; el viento real de superficie suma las tres fuerzas, y es el que se dibuja aquí.',
    alt: 'Modelos de viento en el hemisferio norte: el geostrófico entre isobaras rectas, el de gradiente alrededor de una baja y el viento con rozamiento, que corta las isobaras 20° hacia la baja; en cada uno, las fuerzas dibujadas y rotuladas.',
  };
};

const HELI = {
  rumbo: ['Helicóptero: el rumbo para el izado', 'Normalmente te pedirán el viento unos 30° por la amura de babor, a rumbo y velocidad constantes.', [{ cifra: '30°', texto: 'el viento, por la amura de babor' }, { cifra: 'por popa', texto: 'se acerca el helicóptero' }, { cifra: 'canal 16', texto: 'escucha y sigue sus instrucciones' }],
    'El helicóptero se mantiene aproado al viento y suele llevar la grúa a su derecha: así ve tu barco a su lado. Velas arriadas, motor en marcha y la cubierta despejada de todo lo que pueda volar.',
    'El barco visto desde arriba con el viento a 30° por la amura de babor y el helicóptero llegando por su popa, aproado al viento, con la grúa a su derecha.'],
  cable: ['Helicóptero: el cable de izado', 'Deja que el cable toque el agua antes de cogerlo y nunca lo hagas firme al barco.', [{ cifra: 'estática', texto: 'la descarga al tocar el agua o el casco' }, { cifra: 'nunca', texto: 'firme a la cornamusa ni a nada del barco' }, { cifra: 'brazos abajo', texto: 'en el arnés de izado' }],
    'Si el barco da un bandazo con el cable amarrado, puede arrastrar al helicóptero. La línea guía, si la bajan, solo se cobra para orientar la carga, sin amarrarla.',
    'El helicóptero de costado baja el cable hasta tocar el agua junto al barco; una línea tachada del cable a una cornamusa recuerda que nunca se hace firme.'],
  senales: ['Helicóptero: guiarlo y hacerse ver', 'Las horas se cuentan desde el helicóptero: su morro son las 12.', [{ cifra: 'a sus 3', texto: 'a su derecha' }, { cifra: 'humo', texto: 'de día, para que te encuentre' }, { cifra: 'nunca', texto: 'un cohete con paracaídas cerca de él' }],
    'El cohete con paracaídas puede alcanzar al helicóptero o deslumbrar al piloto; cuando ya te ha visto, basta el humo, el espejo, la bengala de mano con cuidado y el VHF.',
    'Esfera de reloj centrada en el helicóptero visto desde arriba, con el morro a las 12; el barco está a su derecha, a las 3.'],
};
const helicopteroM = (spec) => { const h = HELI[spec.vista ?? 'rumbo']; return h ? { tema: SEG, titulo: h[0], clave: h[1], datos: h[2], nota: h[3], alt: h[4] } : null; };

const arnesM = (spec) => {
  if ((spec.vista ?? 'chaleco') === 'arnes') {
    return {
      tema: SEG, titulo: 'Arnés y línea de vida', clave: 'Engánchate a la línea de vida antes de salir de la bañera: el arnés es para no caer.',
      datos: [{ cifra: '≤ 2 m', texto: 'la línea de amarre, de cinta' }, { cifra: 'pecho', texto: 'donde va el enganche del arnés' }, { cifra: 'proa-popa', texto: 'la línea de vida, tensa por cubierta' }],
      nota: 'Con mosquetones de seguridad, que no se abren solos. Si caes enganchado, el barco te arrastra: por eso se busca no llegar al agua. Guárdalo seco y lejos del combustible y de los productos de limpieza.',
      alt: 'Velero de costado con la línea de vida tensa de popa a proa; un tripulante a proa, con el arnés enganchado por el pecho a la línea de vida con una línea de amarre de 2 m como máximo.',
    };
  }
  return {
    tema: SEG, titulo: 'El chaleco salvavidas', clave: 'Luz, silbato y bandas retrorreflectantes; y flotabilidad para dar la vuelta al que cae inconsciente.',
    datos: [{ cifra: '275 N', texto: 'zona 1' }, { cifra: '150 N', texto: 'zonas 2, 3 y 4' }, { cifra: '100 N', texto: 'zonas 5, 6 y 7' }],
    nota: 'Uno por persona y uno más en la zona 1; los de los niños, a su peso y talla. La luz se puede omitir solo navegando de día en las zonas 4 a 7. Cuanta más flotabilidad, mejor da la vuelta a quien está inconsciente: el de 100 N puede no hacerlo.',
    alt: 'Chaleco salvavidas de frente con la luz, el silbato, las bandas retrorreflectantes y los flotadores rotulados; debajo, la flotabilidad mínima de cada zona de navegación.',
  };
};

const superficiesLibresM = () => ({
  tema: SEG, titulo: 'Superficies libres', clave: 'Un tanque a medias sube G a G virtual: se pierde altura metacéntrica.',
  datos: [{ cifra: 'GM menor', texto: 'con el tanque a medias' }, { cifra: '0', texto: 'lleno del todo o vacío: no resta' }, { cifra: '¼', texto: 'la pérdida, con un mamparo en medio' }],
  nota: 'La pérdida depende de la manga del tanque al cubo, no de la cantidad de líquido: un mamparo longitudinal deja dos superficies de media manga y la pérdida baja a la cuarta parte. Mejor tanques llenos o vacíos.',
  alt: 'Sección del barco escorado con un tanque a medias: el líquido corre a la banda baja y G sube hasta G virtual, más cerca de M. Debajo, cuatro tanques: lleno, a medias, vacío y con mamparo.',
});

const husosM = (spec) => {
  const vista = spec.vista ?? 'husos';
  if (vista === 'oficial') {
    return {
      tema: TIERRA, titulo: 'Hora oficial en España', clave: 'La hora oficial la fija el Gobierno: no es la del huso.',
      datos: [{ cifra: 'TU + 1', texto: 'Península y Baleares, en invierno (+ 2 en verano)' }, { cifra: 'TU', texto: 'Canarias, en invierno (+ 1 en verano)' }, { cifra: '01:00 TU', texto: 'el cambio, el último domingo de marzo y de octubre' }],
      nota: 'La Península está casi toda en el huso 0, pero su hora oficial va una hora por delante incluso en invierno. A bordo, la hora del reloj de bitácora la decide el patrón.',
      alt: 'Tabla con el huso y la hora oficial de invierno y de verano de la Península, Baleares, Ceuta y Melilla y de Canarias; debajo, el horario de verano y las tres horas: legal, oficial y del reloj de bitácora.',
    };
  }
  if (vista === 'calculo') {
    const e = { e: ['10:30', '069° 25′ E'], w: ['08:00', '075° W'] }[spec.ejemplo ?? 'e'] ?? ['10:30', '069° 25′ E'];
    const tu = spec.tu ?? (spec.lon != null ? '12:00' : e[0]);
    const lugar = spec.lon != null ? `${String(Math.floor(Math.abs(spec.lon))).padStart(3, '0')}° ${spec.lon >= 0 ? 'E' : 'W'}` : e[1];
    return {
      tema: TIERRA, titulo: `Hora legal y civil: TU ${tu} en ${lugar}`, clave: 'La hora legal es la del meridiano central del huso; la civil del lugar, la de su longitud exacta.',
      datos: [{ cifra: '15° = 1 h', texto: 'longitud / 15, redondeada: el huso' }, { cifra: '1° = 4 min', texto: 'la longitud en tiempo' }, { cifra: 'E + · W −', texto: 'hacia el E se suma, hacia el W se resta' }],
      nota: 'Las dos coinciden solo en el meridiano central del huso. En el examen, cuidado con el signo: al E la hora va adelantada respecto al TU; al W, atrasada.',
      alt: `Franja de husos con el meridiano de ${lugar} marcado en su huso; debajo, el huso, la hora legal y la hora civil del lugar, paso a paso, para el TU ${tu}.`,
    };
  }
  const tu = spec.tu ?? '12:00';
  return {
    tema: TIERRA, titulo: `Husos horarios${tu !== '12:00' ? `: a las ${tu} TU` : ''}`, clave: '24 husos de 15°: una hora más por huso hacia el E y una menos hacia el W.',
    datos: [{ cifra: '15°', texto: 'cada huso, centrado en un múltiplo de 15°' }, { cifra: '7° 30′', texto: 'a cada lado de Greenwich: el huso 0' }, { cifra: 'Hz = TU ± huso', texto: 'E suma, W resta' }],
    nota: 'La Tierra gira 360° en 24 horas: 15° por hora. Todo el huso usa la hora de su meridiano central, la hora legal.',
    alt: `Franja de trece husos, del 6 W al 6 E, con Greenwich en el centro y, debajo de cada uno, su hora legal cuando son las ${tu} TU; flechas: + 1 h por huso hacia el E y − 1 h hacia el W.`,
  };
};

export const MARCOS_PY = {
  socorro, beaufort, coordenadas, balsa, 'radar-pantalla': radarPantalla, 'radar-respondedores': radarRespondedores, gnss, 'gnss-calculos': gnssCalculos, 'carta-raster-vectorial': cartaRaster, ais,
  humedad: humedadM, psicrometro: psicrometroM, nubes: nubesM, 'nubes-pisos': nubesPisosM, ola: olaM, 'modelos-viento': modelosVientoM,
  helicoptero: helicopteroM, arnes: arnesM, 'superficies-libres': superficiesLibresM, husos: husosM,
};
