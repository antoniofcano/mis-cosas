// Marcos (docs/ESTILO-LAMINAS.md) de las láminas del PER rehechas en estilo C: ritmos de las luces, regiones A y B,
// amarras, riesgo de abordaje, jerarquía entre buques, dispositivo de separación del tráfico, luces y marcas de los 32
// tipos de buque, ciaboga y desatraque. Mismo formato que marcos.js: { tema, titulo, clave, nota, datos: [{ cifra, texto }],
// alt }. Los hechos y cifras están comprobados contra su fuente en el apéndice de la guía. Sin DOM.

import { SHIPS } from './ships.js';
import { familiaRitmo, cifrasRitmo, casoRiesgo } from './per-c.js';
import { ciaboga } from '../nautical/maniobra-puerto.js';
import { curvaEvolucion, YATE } from '../nautical/maniobra.js';
import { desatraque as calcDesatraque } from '../nautical/desatraque.js';

const BAL = 'Balizamiento';
const RIPA = 'Reglamento (RIPA)';
const LUCES = 'Luces y marcas';
const MAN = 'Maniobra';
const num = (n, d = 1) => String(Math.round(n * 10 ** d) / 10 ** d).replace('.', ',');
const s = (n) => `${num(n)} s`;

// ---------------------------------------------------------------------------
// Ritmos de las luces

const NOTA_RITMO = {
  Fl: 'Destello: la luz dura claramente menos que la oscuridad. En grupo, se cuentan los destellos de cada grupo; el periodo es lo que tarda en repetirse todo.',
  'Fl+': 'Grupos compuestos: es el ritmo de las marcas de bifurcación, del color del canal principal: Fl(2+1) R o Fl(2+1) G.',
  LFl: 'Un destello largo dura 2 segundos o más. LFl 10 s es uno de los ritmos de las marcas de aguas navegables.',
  Iso: 'Isofase: el mismo tiempo encendida que apagada. Es uno de los ritmos de las marcas de aguas navegables, junto con las ocultaciones, LFl 10 s y Mo(A).',
  Oc: 'Ocultación: la luz está más tiempo encendida que apagada; lo que se cuenta son los apagones. Es uno de los ritmos de las marcas de aguas navegables.',
  Q: 'Centelleo: de 50 a 79 destellos por minuto (casi siempre 50 o 60; aquí, 60: uno por segundo). Es el ritmo de las cardinales: continuo la Norte; en grupos de 3, 6 y 9 la Este, la Sur y la Oeste.',
  VQ: 'Centelleo rápido: de 80 a 159 por minuto (casi siempre 100 o 120). Las cardinales pueden llevarlo en lugar del centelleo: VQ(3) 5 s, VQ(6)+LFl 10 s, VQ(9) 10 s.',
  QLFl: 'Es el de la cardinal Sur: seis centelleos, las 6 del reloj, y un destello largo que la distingue de la Oeste y la Este.',
  Mo: 'Morse «A»: un destello corto y uno largo (· —). Blanca, es uno de los ritmos de las marcas de aguas navegables.',
  Al: 'Alternativa: cambia de color. La de la marca de nuevo peligro destella azul y amarilla, con una breve oscuridad entre los dos colores.',
  F: 'Luz fija: continua y uniforme, sin oscuridad. No dice qué marca es: hay que mirar su color y la carta.',
};

function ritmo(spec) {
  const r = spec.ritmo ?? 'Fl 5s';
  const f = familiaRitmo(r);
  if (f.k === '?') return null;
  const c = cifrasRitmo(r);
  const datos = f.k === 'F'
    ? [{ cifra: 'continua', texto: 'nunca se apaga' }, { cifra: c.colores.join(' y '), texto: 'su color' }]
    : [{ cifra: s(c.periodo), texto: 'periodo: lo que tarda en repetirse' }, { cifra: String(c.destellos), texto: c.destellos === 1 ? 'aparición de luz en cada periodo' : 'apariciones de luz en cada periodo' }, { cifra: s(c.luz), texto: `de luz ${c.colores.join(' y ')} en cada periodo` }];
  return {
    tema: BAL, titulo: `Ritmo ${r}: ${f.nombre}`, clave: f.k === 'F' ? 'Luz fija: encendida siempre, sin destellos.' : `${f.nombre.charAt(0).toUpperCase()}${f.nombre.slice(1)}, cada ${s(c.periodo)}.`,
    datos, nota: NOTA_RITMO[f.k === 'Fl' && /^Fl\(/.test(r) ? 'Fl' : f.k] ?? NOTA_RITMO.Fl,
    alt: `De noche, la luz de un faro destella con el ritmo ${r}; debajo, su cronograma de un periodo (${s(c.periodo)}), con la luz en claro sobre la franja oscura, la cota del periodo y la de la primera aparición de luz.`,
  };
}

// ---------------------------------------------------------------------------
// Balizamiento y reglamento

const regiones = () => ({
  tema: BAL, titulo: 'Regiones de balizamiento A y B', clave: 'Región A, entrando: roja a babor; en la región B, al revés.',
  datos: [{ cifra: 'A', texto: 'Europa, África, Oceanía y casi toda Asia: España' }, { cifra: 'B', texto: 'América, Japón, Corea y Filipinas' }, { cifra: 'igual', texto: 'la forma: lata a babor, cono a estribor' }],
  nota: 'Solo cambia el color de las laterales (y de las laterales modificadas). Las cardinales, el peligro aislado, las aguas navegables, las especiales y el nuevo peligro son iguales en las dos regiones.',
  alt: 'Dos canales vistos desde arriba, entrando desde la mar. Región A: rojas con forma de lata a babor y verdes con forma de cono a estribor. Región B: las mismas formas, con los colores al revés.',
});

const NOMBRE_AMARRA = { 'largo-proa': 'el largo de proa', 'esprin-proa': 'el esprín de proa', traves: 'el través', 'esprin-popa': 'el esprín de popa', 'largo-popa': 'el largo de popa' };
const amarras = (spec) => ({
  tema: 'Amarre y fondeo', titulo: 'Las amarras de un barco atracado', clave: 'Los largos se abren hacia fuera; los esprines se cruzan.',
  datos: [{ cifra: 'esprín de proa', texto: 'llama hacia popa: impide avanzar' }, { cifra: 'esprín de popa', texto: 'llama hacia proa: impide retroceder' }, { cifra: 'través', texto: 'perpendicular: impide separarse' }],
  nota: 'El largo de proa va hacia proa e impide retroceder y que la proa se abra; el de popa va hacia popa e impide avanzar y que la popa se abra. Para desatracar se deja trabajando un esprín.',
  alt: `Barco atracado por estribor, visto desde arriba con la proa a la derecha, con sus cinco amarras numeradas hasta los norays del muelle: largo de proa, esprín de proa, través, esprín de popa y largo de popa; los esprines se cruzan.${NOMBRE_AMARRA[spec.resaltar] ? ` Resaltado: ${NOMBRE_AMARRA[spec.resaltar]}.` : ''}`,
});

function riesgo(spec) {
  const caso = spec.caso ?? 'comparar';
  if (!['comparar', 'constante', 'variable'].includes(caso)) return null;
  const d = (c) => casoRiesgo(c).pos.map((q) => `${String(q.dem).padStart(3, '0')}°`);
  const datos = [{ cifra: 'constante', texto: 'la demora, y la distancia baja: hay riesgo' }, { cifra: 'Regla 7', texto: 'ante la duda, el riesgo existe' }, { cifra: 'demoras', texto: 'tomadas con la aguja, sucesivas' }];
  const nota = 'Aunque la demora cambie, puede haber riesgo con un buque muy grande, con un remolque o a muy poca distancia. Con radar, el punteo sistemático; no bastan los datos escasos.';
  if (caso === 'comparar') {
    return { tema: RIPA, titulo: 'Riesgo de abordaje: la demora', clave: 'Si la demora no cambia y la distancia baja, hay riesgo de abordaje.', datos, nota,
      alt: `Dos situaciones vistas desde arriba, cada una con cuatro demoras sucesivas desde tu barco al otro. A la izquierda la demora no cambia (${d(true).join(', ')}) y las líneas son paralelas: hay riesgo. A la derecha cambia (${d(false).join(', ')}): en principio no lo hay.` };
  }
  const c = caso === 'constante';
  return {
    tema: RIPA, titulo: c ? 'Riesgo de abordaje: demora constante' : 'Riesgo de abordaje: la demora cambia', clave: c ? 'Demora constante y distancia que baja: hay riesgo.' : 'Si la demora cambia de forma apreciable, en principio no hay riesgo.', datos, nota,
    alt: `Tu barco y otro que se acerca, vistos desde arriba, con cuatro demoras sucesivas (${d(c).join(', ')}): ${c ? 'no cambian y las líneas son paralelas; hay riesgo de abordaje' : 'cambian, el otro pasará por tu popa; en principio no hay riesgo'}.`,
  };
}

const jerarquia = () => ({
  tema: RIPA, titulo: 'Jerarquía entre buques (Regla 18)', clave: 'Cada buque se aparta de los que están por encima de él.',
  datos: [{ cifra: 'arriba', texto: 'sin gobierno y maniobra restringida' }, { cifra: 'no estorbar', texto: 'al restringido por su calado' }, { cifra: 'abajo', texto: 'el de propulsión mecánica' }],
  nota: 'No vale si alcanzas (el que alcanza siempre se aparta, Regla 13) ni en canales angostos y dispositivos de separación, donde mandan las Reglas 9 y 10. El hidroavión amarado se mantiene apartado de todos.',
  alt: 'Una escalera de cinco escalones con su marca de día: arriba, sin gobierno (dos bolas) y maniobra restringida (bola, bicónica y bola); después el restringido por su calado (cilindro), el dedicado a la pesca (dos conos unidos por el vértice), el de vela y, abajo, el de propulsión mecánica. Una flecha: se aparta de los de arriba.',
});

const dst = () => ({
  tema: RIPA, titulo: 'Dispositivo de separación del tráfico (Regla 10)', clave: 'Por la vía, en el sentido del tráfico; si cruzas, con la proa a 90°.',
  datos: [{ cifra: '90°', texto: 'la proa, al cruzar la corriente del tráfico' }, { cifra: 'extremos', texto: 'por donde se entra y se sale' }, { cifra: '< 20 m', texto: 'vela y pesca: pueden usar la zona costera' }],
  nota: 'No se entra en la zona de separación salvo para cruzar el dispositivo, para entrar o salir de una vía, para pescar en ella o ante un peligro inmediato. Los de menos de 20 m y los de vela no deben estorbar a los buques de propulsión mecánica que siguen una vía, ni los pesqueros a ningún buque que la siga.',
  alt: 'Dispositivo de separación del tráfico visto desde arriba: dos vías con sentidos contrarios y la zona de separación entre ellas; entre la vía y la costa, la zona de navegación costera. Un barco cruza con la proa a 90°, otro entra por el extremo y un velero va por la zona costera.',
});

// ---------------------------------------------------------------------------
// Luces y marcas de los buques: [frase clave, datos, nota si SHIPS no la trae]
const BUQUES = {
  motor: ['Una blanca de tope a proa, verde y roja en los costados y blanca de alcance a popa.', [['1 tope', 'blanca, 225° hacia proa'], ['costados', 'verde a estribor, roja a babor'], ['alcance', 'blanca, 135° hacia popa']],
    'La luz de tope va en crujía, más alta que las de costado. Con 50 m o más, una segunda luz de tope a popa y más alta (los menores pueden llevarla).'],
  'motor-50': ['Dos luces de tope: la de popa, más alta que la de proa.', [['2 topes', 'la de popa, más alta'], ['≥ 50 m', 'obligatoria la segunda'], ['costados', 'y alcance, como cualquier motor']],
    'La diferencia de altura dice hacia dónde va: la más baja es la de proa, del lado hacia el que navega. De popa no se ve ninguna de las dos: solo la blanca de alcance.'],
  'motor-menor-12': ['Menos de 12 m: una blanca todo horizonte y los costados, en lugar del tope y el alcance.', [['< 12 m', 'de eslora'], ['todo horizonte', 'blanca: sustituye al tope y al alcance'], ['costados', 'verde y roja']],
    'Es una opción: puede llevar las luces completas de motor. La blanca todo horizonte se ve también de popa.'],
  'motor-menor-7': ['Menos de 7 m y no más de 7 nudos: una blanca todo horizonte y, si puede, los costados.', [['< 7 m', 'de eslora'], ['≤ 7 nudos', 'de velocidad máxima'], ['si puede', 'también los costados']],
    'Es lo mínimo que se pide a una lancha muy pequeña y lenta. Si supera los 7 nudos, ya no vale: luces de menos de 12 m.'],
  vela: ['Solo costados y alcance: ninguna luz blanca de tope.', [['costados', 'verde y roja'], ['alcance', 'blanca a popa'], ['sin tope', 'lo que la distingue de un motor']],
    'Si ves verde y roja sin ninguna blanca encima, es un velero que viene de proa. Si navega a motor, ya es un buque de motor y enciende sus luces.'],
  'vela-tope': ['Puede llevar en el tope una roja sobre una verde, todo horizonte, además de costados y alcance.', [['roja', 'arriba'], ['verde', 'debajo'], ['opcional', 'además de costados y alcance']],
    '«Rojo sobre verde, vela se ve». No se puede llevar junto con el farol tricolor.'],
  'vela-motor': ['Navegando también a motor es un buque de motor: sus luces y, de día, un cono con el vértice abajo.', [['luces', 'de buque de motor'], ['cono', 'vértice abajo, a proa'], ['de día', 'la marca que lo delata']], null],
  remolque: ['Dos luces de tope en vertical y una amarilla de remolque sobre la de alcance.', [['2 topes', 'en vertical'], ['amarilla', 'de remolque, sobre la de alcance'], ['≤ 200 m', 'de remolque']],
    'La longitud del remolque se mide desde la popa del remolcador hasta el extremo de popa del remolcado. Con más de 200 m, tres luces de tope.'],
  'remolque-200': ['Remolque de más de 200 m: tres luces de tope en vertical y, de día, una marca bicónica.', [['3 topes', 'en vertical'], ['> 200 m', 'de remolque'], ['bicónica', 'de día, en el remolcador y en el remolcado']],
    'Tres luces de tope: remolque largo; dos: remolque de 200 m o menos. La amarilla de remolque va siempre sobre la de alcance.'],
  remolcado: ['El remolcado lleva costados y alcance, como un velero: ninguna luz de tope.', [['costados', 'verde y roja'], ['alcance', 'blanca a popa'], ['sin tope', 'no tiene máquina propia en marcha']], null],
  'remolcado-200': ['Con más de 200 m de remolque, el remolcado lleva además una marca bicónica de día.', [['costados', 'y alcance, de noche'], ['bicónica', 'de día'], ['> 200 m', 'de remolque']], null],
  empujando: ['Empujando a proa: dos de tope en vertical, costados y alcance, sin la amarilla de remolque.', [['2 topes', 'en vertical'], ['sin amarilla', 'la de remolque no va'], ['< 50 m', 'con más, otro tope a popa']], null],
  empujado: ['El empujado a proa solo lleva las luces de costado, en su extremo de proa.', [['costados', 'en su extremo de proa'], ['sin alcance', 'la lleva el que empuja'], ['sin tope', 'no tiene máquina en marcha']], null],
  'empuje-rigido': ['Empujador y empujado en unidad rígida se iluminan como un solo buque de motor.', [['1 buque', 'a efectos de luces'], ['≥ 50 m', 'dos luces de tope'], ['Regla 23', 'luces de buque de motor']], null],
  'remolque-costado': ['Remolcando por el costado: dos de tope en vertical, costados y alcance, sin la amarilla.', [['2 topes', 'en vertical'], ['sin amarilla', 'la de remolque no va'], ['el grupo', 'se ilumina como un solo buque']], null],
  'pesquero-arrastre': ['Arrastrero: verde sobre blanca todo horizonte; costados y alcance solo con arrancada.', [['verde', 'arriba'], ['blanca', 'debajo'], ['diábolo', 'de día: dos conos unidos por el vértice']],
    '«Verde sobre blanco, arrastrando». Parado, sin arrancada, solo verde sobre blanca: sin costados ni alcance.'],
  'pesquero-arrastre-50': ['Con 50 m o más, el arrastrero lleva además una luz de tope a popa, más alta que la verde.', [['verde', 'sobre blanca, todo horizonte'], ['tope', 'a popa y más alta'], ['≥ 50 m', 'de eslora']], null],
  'pesquero-no-arrastre': ['Pesca que no es de arrastre: roja sobre blanca todo horizonte.', [['roja', 'arriba'], ['blanca', 'debajo'], ['diábolo', 'de día, como el arrastrero']],
    '«Rojo sobre blanco, pescando». Costados y alcance solo con arrancada.'],
  'pesquero-aparejo': ['Aparejo de más de 150 m: una blanca todo horizonte (de día, un cono con el vértice arriba) hacia el aparejo.', [['> 150 m', 'de aparejo largado'], ['blanca', 'hacia donde está el aparejo'], ['cono', 'vértice arriba, de día']], null],
  'sin-gobierno': ['Sin gobierno: dos rojas todo horizonte en vertical; de día, dos bolas.', [['2 rojas', 'en vertical'], ['2 bolas', 'de día'], ['costados', 'y alcance solo con arrancada']],
    'No lleva luz de tope: no puede maniobrar como se le pide. Con arrancada, añade costados y alcance.'],
  restringido: ['Maniobra restringida: roja, blanca y roja en vertical; de día, bola, bicónica y bola.', [['roja-blanca-roja', 'todo horizonte'], ['bola-bicónica-bola', 'de día'], ['con arrancada', 'tope, costados y alcance']],
    'Sin arrancada solo roja-blanca-roja; con arrancada añade sus luces de motor. Fondeado, las de fondeo.'],
  draga: ['Draga: roja-blanca-roja y, a las bandas, dos rojas donde hay obstrucción y dos verdes por donde se pasa.', [['2 rojas', 'banda de la obstrucción: dos bolas'], ['2 verdes', 'banda libre: dos bicónicas'], ['por las verdes', 'se pasa']], null],
  buceo: ['Embarcación pequeña de buceo: roja-blanca-roja de noche y, de día, la bandera A rígida.', [['roja-blanca-roja', 'todo horizonte'], ['bandera A', 'rígida, de 1 m o más'], ['resguardo', 'apártate y modera']], null],
  dragaminas: ['Limpieza de minas: tres verdes todo horizonte o tres bolas; no te acerques a menos de 1000 m.', [['3 verdes', 'tope del palo y penoles de la verga'], ['3 bolas', 'de día'], ['1000 m', 'peligroso acercarse más']], null],
  calado: ['Restringido por su calado: tres rojas todo horizonte en vertical; de día, un cilindro.', [['3 rojas', 'en vertical'], ['cilindro', 'de día'], ['no estorbar', 'su paso seguro']],
    'Además lleva sus luces de buque de motor. Los demás, salvo el sin gobierno y el de maniobra restringida, evitan estorbar su paso.'],
  fondeado: ['Fondeado de menos de 50 m: una blanca todo horizonte; de día, una bola.', [['1 blanca', 'todo horizonte, a proa'], ['1 bola', 'de día'], ['< 50 m', 'de eslora']],
    'Fondeado no lleva costados ni alcance. Los menores de 7 m que fondeen fuera de canales y fondeaderos frecuentados no están obligados a estas luces.'],
  'fondeado-50': ['Fondeado de 50 m o más: dos blancas, la de proa más alta que la de popa.', [['2 blancas', 'todo horizonte'], ['proa', 'la más alta'], ['1 bola', 'de día']], 'Al revés que las dos de tope del motor de 50 m o más, donde la de popa es la más alta. Con 100 m o más, además ilumina la cubierta.'],
  varado: ['Varado: las luces de fondeado y dos rojas en vertical; de día, tres bolas.', [['2 rojas', 'en vertical'], ['+ fondeo', 'sus luces de fondeado'], ['3 bolas', 'de día']],
    'Tres bolas: varado; dos bolas: sin gobierno; una bola: fondeado.'],
  practico: ['Práctico en servicio: blanca sobre roja en el tope; con arrancada, costados y alcance.', [['blanca', 'arriba'], ['roja', 'debajo'], ['con arrancada', 'costados y alcance']],
    '«Blanco sobre rojo, práctico a bordo»: no confundir con el pesquero (rojo sobre blanco). La bandera H dice que tiene el práctico a bordo.'],
  'practico-fondeado': ['Fondeado, el práctico mantiene blanca sobre roja y añade las luces de fondeado.', [['blanca sobre roja', 'en el tope'], ['+ fondeo', 'su luz o su bola'], ['sin costados', 'ni alcance']], null],
  remo: ['Embarcación de remo: puede llevar luces de vela; si no, una linterna blanca lista para mostrarla.', [['linterna', 'blanca, a mano'], ['a tiempo', 'para evitar el abordaje'], ['opcional', 'las luces de vela']],
    'La linterna (o una luz eléctrica) se muestra con tiempo suficiente para evitar el abordaje; no tiene que estar encendida todo el rato.'],
  'vela-tricolor': ['Menos de 20 m: costados y alcance pueden ir en un solo farol, en el tope del palo.', [['< 20 m', 'de eslora'], ['1 farol', 'verde, roja y blanca, en el tope'], ['a vela', 'solo: a motor no vale']], null],
};

function buque(spec) {
  const b = SHIPS[spec.clase];
  const m = BUQUES[spec.clase];
  if (!b || !m) return null;
  const [clave, datos, nota] = m;
  // la banda de la obstrucción o del aparejo, si la spec la elige, da otra lámina: el título lo dice
  const lado = (k, t) => (b.luces.some((l) => l[3]?.lado === k) && spec[t] ? `, ${t === 'obstruccion' ? 'obstrucción' : 'aparejo'} por ${spec[t] === 'babor' ? 'babor' : 'estribor'}` : '');
  return {
    tema: LUCES, titulo: `${b.nombre}${lado('obs', 'obstruccion')}${lado('aparejo', 'aparejo')}`, clave,
    datos: datos.map(([cifra, texto]) => ({ cifra, texto })), nota: nota ?? b.nota ?? 'Visto de proa, la verde queda a tu izquierda y la roja a tu derecha: son las de su estribor y su babor.',
    alt: `${b.nombre}, de noche: una celda por cada vista (de proa, por sus bandas y de popa) con las luces que se ven desde ahí${spec.dia ? ', y otra de día con sus marcas' : ''}. ${clave}`,
  };
}

// ---------------------------------------------------------------------------
// Maniobra: ciaboga y desatraque

function ciabogaMarco() {
  const c = ciaboga();
  const ev = curvaEvolucion();
  const L = YATE.eslora;
  return {
    tema: MAN, titulo: 'La ciaboga con una hélice dextrógira', clave: 'Avante a estribor y atrás a babor, alternando: el barco gira casi en el sitio.',
    datos: [{ cifra: 'Er', texto: 'la banda a la que se cae, con hélice dextrógira' }, { cifra: `${c.tramos.filter((x) => x.maquina < 0).length} paladas`, texto: 'atrás, en el yate de ejemplo' }, { cifra: `${num(ev.diametroTactico / L)} esloras`, texto: 'su diámetro táctico: con la curva no cabría' }],
    nota: 'Dando atrás, la hélice dextrógira lleva la popa a babor y la proa sigue cayendo a estribor: hélice y timón suman. Con hélice levógira se cae a babor. Poca máquina y sin dejar que coja arrancada.',
    alt: `Animación vista desde arriba: el yate de ${L} m, parado en una dársena de dos esloras de ancho, da avante con todo el timón a estribor y atrás con todo a babor, alternando, hasta quedar al rumbo opuesto sin salirse de la dársena; las estelas de su proa y de su popa dibujan el giro.`,
  };
}

const VIENTO = { calma: 'en calma', tierra: 'de tierra', mar: 'de la mar' };
function desatraqueMarco(spec) {
  const popa = (spec.abrir ?? 'popa') !== 'proa';
  const e = { viento: spec.viento ?? 'calma', esprin: spec.esprin ?? (popa ? 'proa' : 'popa'), maquina: spec.maquina ?? (popa ? 'avante' : 'atras') };
  if (!['calma', 'tierra', 'mar'].includes(e.viento) || !['proa', 'popa'].includes(e.esprin) || !['avante', 'atras'].includes(e.maquina)) return null;
  const r = calcDesatraque(e);
  const propio = spec.viento != null || spec.esprin != null || spec.maquina != null;
  const titulo = propio ? `Desatraque: viento ${VIENTO[e.viento]}, esprín de ${e.esprin} y máquina ${e.maquina === 'avante' ? 'avante' : 'atrás'}` : popa ? 'Desatracar abriendo la popa' : 'Desatracar abriendo la proa';
  return {
    tema: MAN, titulo, clave: popa && !propio ? 'Esprín de proa, avante y timón al muelle: la popa se abre y se sale atrás.' : !propio ? 'Esprín de popa y atrás: la proa se abre y se sale avante.' : `${{ 'abre-popa': 'Abre la popa', 'abre-proa': 'Abre la proa', 'se-queda': 'Se queda contra el muelle', 'se-separa': 'El viento lo separa' }[r.resultado]}.`,
    datos: [{ cifra: 'esprín', texto: 'el cabo que trabaja hace de pivote' }, { cifra: 'defensa', texto: 'en la amura o en la aleta, donde apoya' }, { cifra: 'viento de la mar', texto: 'se abre primero la popa' }],
    nota: 'Con hélice dextrógira, atracado por babor ayuda la hélice al abrir la proa (dando atrás la popa va al muelle). Con viento de la mar no se puede salir de costado y la proa abierta la devuelve el viento: se abre la popa.',
    alt: `Animación vista desde arriba: el barco atracado por babor, con la proa a la izquierda; con el esprín de ${e.esprin} y máquina ${e.maquina === 'avante' ? 'avante' : 'atrás'} y el viento ${VIENTO[e.viento]}, ${r.texto.charAt(0).toLowerCase()}${r.texto.slice(1)}`,
  };
}

export const MARCOS_PER = { ritmo, regiones, amarras, riesgo, jerarquia, dst, buque, ciaboga: ciabogaMarco, desatraque: desatraqueMarco };
