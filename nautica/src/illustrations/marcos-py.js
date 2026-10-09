// Marcos (docs/ESTILO-LAMINAS.md) de las láminas del PY rehechas en la última tanda: señales de peligro del Anexo IV,
// escalas Beaufort y Douglas (también del PER), electrónica (radar, GNSS, cartas electrónicas y AIS), coordenadas,
// balsa salvavidas y humedad. Mismo formato que marcos.js: { tema, titulo, clave, nota, datos: [{ cifra, texto }], alt }.
// Los hechos y cifras están comprobados contra su fuente en el apéndice de la guía. Sin DOM.

import { SOCORRO, HOJAS_SOCORRO } from './socorro.js';

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

export const MARCOS_PY = { socorro, beaufort, coordenadas, balsa, 'radar-pantalla': radarPantalla, 'radar-respondedores': radarRespondedores, gnss, 'gnss-calculos': gnssCalculos, 'carta-raster-vectorial': cartaRaster, ais };
