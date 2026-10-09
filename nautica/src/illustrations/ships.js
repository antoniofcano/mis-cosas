// Ilustraciones: luces y marcas del RIPA (Reglas 21–30). Un buque visto de noche desde proa, una banda o popa,
// o de día con sus marcas.
// spec: { tipo:'buque', clase, vista:'proa'|'babor'|'estribor'|'popa'|'todas', dia?: bool, arrancada?: bool,
//         obstruccion?: 'babor'|'estribor' (draga), aparejo?: 'babor'|'estribor' (pesquero con aparejo > 150 m) }

// Luces de cada clase: [tipo, at, h, opciones?]. at: 'proa'|'popa'|'centro'; h: altura (0..1);
// tipo: tope | todo-W/R/G | remolque | linterna | tricolor. opciones.lado: 'obs' | 'libre' | 'aparejo' | 'ambos' (luz
// desplazada a una banda: verga, banda obstruida…); opciones.siempre: se muestra aunque no tenga arrancada.
// Las de costado, tope y alcance solo con arrancada (si arrancada:false se omiten en sin gobierno / restringido / pesquero).
// vistas: las vistas que tienen sentido (las luces a una banda solo se distinguen de proa o de popa).
// dia: marcas en el palo, de arriba abajo; diaLados: marcas a una banda { obs|libre|aparejo|ambos: [...] } y desde qué
// marca (índice en dia) cuelgan.
export const SHIPS = {
  motor: { nombre: 'Buque de propulsión mecánica en navegación (< 50 m)', luces: [['tope', 'proa', 0.75]], dia: [] },
  'motor-50': { nombre: 'Buque de propulsión mecánica en navegación (≥ 50 m)', luces: [['tope', 'proa', 0.6], ['tope', 'popa', 0.9]], dia: [] },
  'motor-menor-12': { nombre: 'Buque de propulsión mecánica < 12 m', luces: [['todo-W', 'centro', 0.7]], sinAlcance: true, dia: [] },
  'motor-menor-7': { nombre: 'Propulsión mecánica < 7 m y ≤ 7 nudos (costados si es posible)', luces: [['todo-W', 'centro', 0.6]], sinAlcance: true, dia: [] },
  vela: { nombre: 'Buque de vela en navegación', luces: [], dia: [] },
  'vela-tope': { nombre: 'Buque de vela con luces opcionales (roja sobre verde en el tope)', luces: [['todo-R', 'centro', 0.95], ['todo-G', 'centro', 0.85]], dia: [] },
  'vela-tricolor': {
    nombre: 'Velero < 20 m con farol combinado en el tope', luces: [['tricolor', 'centro', 0.95]], sinCostados: true, dia: [],
    nota: 'Regla 25 b): el velero de menos de 20 m puede llevar costados y alcance en un solo farol combinado (tricolor) en el tope del palo. No puede llevarlo junto con las opcionales roja sobre verde, y si navega a motor no vale: debe encender las luces de buque de motor.',
  },
  'vela-motor': { nombre: 'Buque de vela navegando también a motor', luces: [['tope', 'proa', 0.75]], dia: ['cono-abajo'] },
  remolque: { nombre: 'Buque remolcando (remolque ≤ 200 m)', luces: [['tope', 'proa', 0.62], ['tope', 'proa', 0.75], ['remolque', 'popa', 0.5]], dia: [] },
  'remolque-200': { nombre: 'Buque remolcando (remolque > 200 m)', luces: [['tope', 'proa', 0.62], ['tope', 'proa', 0.74], ['tope', 'proa', 0.86], ['remolque', 'popa', 0.5]], dia: ['bicono'] },
  remolcado: {
    nombre: 'Buque remolcado (remolque ≤ 200 m)', luces: [], dia: [],
    nota: 'Regla 24 e): el buque remolcado lleva luces de costado y de alcance, como un velero (sin luces de tope). Si el remolque mide más de 200 m, de día exhibe además una marca bicónica.',
  },
  'remolcado-200': {
    nombre: 'Buque remolcado (remolque > 200 m)', luces: [], dia: ['bicono'],
    nota: 'Regla 24 e): costados y alcance; con un remolque de más de 200 m (desde la popa del remolcador hasta el extremo de popa del remolque), una marca bicónica en el lugar más visible, igual que el remolcador.',
  },
  empujando: {
    nombre: 'Buque empujando a proa (sin unidad rígida, < 50 m)', luces: [['tope', 'proa', 0.62], ['tope', 'proa', 0.75]], dia: [],
    nota: 'Regla 24 c): el que empuja a proa sin formar unidad compuesta lleva dos luces de tope en vertical, costados y alcance, pero no la luz amarilla de remolque (con 50 m o más, además la de tope a popa). El grupo se ilumina como un solo buque: el empujado lleva sus costados en el extremo de proa.',
  },
  empujado: {
    nombre: 'Buque empujado a proa (sin unidad rígida)', luces: [], sinAlcance: true, dia: [],
    nota: 'Regla 24 f i): el buque empujado a proa, sin formar unidad compuesta, solo lleva luces de costado en su extremo de proa; la luz de alcance la lleva el que empuja, detrás de él.',
  },
  'empuje-rigido': {
    nombre: 'Empujador y empujado en unidad rígida (≥ 50 m)', luces: [['tope', 'proa', 0.6], ['tope', 'popa', 0.9]], dia: [],
    nota: 'Regla 24 b): si empujador y empujado están unidos rígidamente formando una unidad compuesta, son un buque de propulsión mecánica y llevan sus luces (Regla 23): aquí, de 50 m o más, dos de tope. En niebla, pitada larga como un buque de motor.',
  },
  'remolque-costado': {
    nombre: 'Buque remolcando por el costado (< 50 m)', luces: [['tope', 'proa', 0.62], ['tope', 'proa', 0.75]], dia: [],
    nota: 'Regla 24 c): el que remolca por el costado lleva dos luces de tope en vertical, costados y alcance, sin luz de remolque (con 50 m o más, además la de tope a popa). El remolcado por el costado lleva luz de alcance y costados en su extremo de proa: el grupo se ilumina como un solo buque.',
  },
  'pesquero-arrastre': { nombre: 'Buque pesquero de arrastre', luces: [['todo-G', 'centro', 0.85], ['todo-W', 'centro', 0.72]], opcionalCostados: true, dia: ['diabolo'] },
  'pesquero-arrastre-50': {
    nombre: 'Buque pesquero de arrastre (≥ 50 m)', luces: [['tope', 'popa', 0.97, { siempre: true }], ['todo-G', 'centro', 0.82], ['todo-W', 'centro', 0.7]], opcionalCostados: true, dia: ['diabolo'],
    nota: 'Regla 26 b ii): el arrastrero de 50 m o más lleva además una luz de tope a popa y más alta que la verde todo horizonte (los menores pueden llevarla). Costados y alcance solo con arrancada.',
  },
  'pesquero-no-arrastre': { nombre: 'Buque dedicado a la pesca (no de arrastre)', luces: [['todo-R', 'centro', 0.85], ['todo-W', 'centro', 0.72]], opcionalCostados: true, dia: ['diabolo'] },
  'pesquero-aparejo': {
    nombre: 'Pesquero (no arrastre) con aparejo > 150 m', luces: [['todo-R', 'centro', 0.85], ['todo-W', 'centro', 0.72], ['todo-W', 'centro', 0.55, { lado: 'aparejo' }]], opcionalCostados: true,
    vistas: ['proa', 'popa'], dia: ['diabolo'], diaLados: { desde: 0, aparejo: ['cono-arriba'] },
    nota: 'Regla 26 c ii): si el aparejo largado se extiende más de 150 m en horizontal, una luz blanca todo horizonte (de día, un cono con el vértice hacia arriba) en la dirección del aparejo, más baja que la blanca del pesquero.',
  },
  'sin-gobierno': { nombre: 'Buque sin gobierno', luces: [['todo-R', 'centro', 0.85], ['todo-R', 'centro', 0.72]], opcionalCostados: true, sinTope: true, dia: ['bola', 'bola'] },
  restringido: { nombre: 'Buque con capacidad de maniobra restringida', luces: [['tope', 'proa', 0.95], ['todo-R', 'centro', 0.79], ['todo-W', 'centro', 0.67], ['todo-R', 'centro', 0.55]], opcionalCostados: true, dia: ['bola', 'bicono', 'bola'] },
  draga: {
    nombre: 'Draga u obras submarinas con obstrucción',
    luces: [['tope', 'proa', 0.95], ['todo-R', 'centro', 0.79], ['todo-W', 'centro', 0.67], ['todo-R', 'centro', 0.55],
      ['todo-R', 'centro', 0.52, { lado: 'obs' }], ['todo-R', 'centro', 0.41, { lado: 'obs' }], ['todo-G', 'centro', 0.52, { lado: 'libre' }], ['todo-G', 'centro', 0.41, { lado: 'libre' }]],
    opcionalCostados: true, vistas: ['proa', 'popa'], dia: ['bola', 'bicono', 'bola'], diaLados: { desde: 2, obs: ['bola', 'bola'], libre: ['bicono', 'bicono'] },
    nota: 'Regla 27 d): además de roja-blanca-roja (bola-bicónica-bola), dos rojas (dos bolas) en la banda de la obstrucción y dos verdes (dos bicónicas) en la banda por la que se puede pasar. Fondeada, muestra estas luces en lugar de las de fondeo.',
  },
  buceo: {
    nombre: 'Embarcación pequeña en operaciones de buceo', luces: [['todo-R', 'centro', 0.85], ['todo-W', 'centro', 0.73], ['todo-R', 'centro', 0.61]], sinCostados: true, dia: ['bandera-A'],
    nota: 'Regla 27 e): si por su tamaño no puede llevar las luces y marcas de la draga, roja-blanca-roja todo horizonte y, de día, una reproducción rígida de la bandera «A» de al menos 1 m de altura, visible en todo el horizonte.',
  },
  dragaminas: {
    nombre: 'Buque dedicado a limpieza de minas', luces: [['tope', 'proa', 0.6], ['todo-G', 'centro', 0.95], ['todo-G', 'centro', 0.76, { lado: 'ambos' }]],
    dia: ['bola'], diaLados: { desde: 0, ambos: ['bola'] },
    nota: 'Regla 27 f): además de sus luces de buque de motor (o de fondeo), tres verdes todo horizonte (de día, tres bolas): una en el tope del palo de proa y una en cada penol de su verga. Es peligroso acercarse a menos de 1000 m.',
  },
  calado: { nombre: 'Buque restringido por su calado', luces: [['tope', 'proa', 0.95], ['todo-R', 'centro', 0.79], ['todo-R', 'centro', 0.67], ['todo-R', 'centro', 0.55]], dia: ['cilindro'] },
  fondeado: { nombre: 'Buque fondeado (< 50 m)', luces: [['todo-W', 'proa', 0.75]], sinCostados: true, dia: ['bola'] },
  'fondeado-50': { nombre: 'Buque fondeado (≥ 50 m)', luces: [['todo-W', 'proa', 0.75], ['todo-W', 'popa', 0.5]], sinCostados: true, dia: ['bola'] },
  varado: { nombre: 'Buque varado', luces: [['todo-W', 'proa', 0.6], ['todo-R', 'centro', 0.95], ['todo-R', 'centro', 0.83]], sinCostados: true, dia: ['bola', 'bola', 'bola'] },
  practico: { nombre: 'Buque en servicio de practicaje', luces: [['todo-W', 'centro', 0.9], ['todo-R', 'centro', 0.78]], dia: [] },
  'practico-fondeado': {
    nombre: 'Práctico en servicio, fondeado', luces: [['todo-W', 'centro', 0.9], ['todo-R', 'centro', 0.78], ['todo-W', 'proa', 0.6]], sinCostados: true, dia: ['bola'],
    nota: 'Regla 29 a iii): fondeado, el práctico en servicio mantiene blanca sobre roja y añade las luces (o la bola) de buque fondeado; no lleva costados ni alcance.',
  },
  remo: { nombre: 'Embarcación de remo (linterna blanca lista para mostrar)', luces: [['linterna', 'centro', 0.4]], sinCostados: true, dia: [] },
};

