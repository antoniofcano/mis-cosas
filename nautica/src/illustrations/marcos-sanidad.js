// Marcos de las láminas de sanidad a bordo del PER en estilo C (sanidad-c.js). Mismo formato que marcos.js; el texto
// alternativo es el del dibujo. Cada hecho, el de la Guía Sanitaria a Bordo (ISM, 2013) o el del RD 339/2021, con su
// capítulo o artículo en el apéndice de docs/ESTILO-LAMINAS.md.

import { altDe, porVista } from './marcos-cierre-b.js';
import { hemorragiaC, quemaduraC, golpeCalorC, radioMedicoC, botiquinC } from './sanidad-c.js';

const SAN = 'Primeros auxilios';
const fijo = (fn, m) => (spec) => {
  const r = fn(spec);
  return r ? { tema: SAN, ...m, alt: altDe(r) } : null;
};

const hemorragia = porVista(hemorragiaC, SAN, {
  tipos: {
    titulo: 'Arterial, venosa o capilar', clave: 'Rojo vivo y a borbotones es arterial, la más peligrosa; rojo oscuro y continua, venosa.',
    datos: [{ cifra: 'arterial', texto: 'rojo vivo, al ritmo del pulso' }, { cifra: 'venosa', texto: 'rojo oscuro, continua' }, { cifra: 'capilar', texto: 'rezuma y para sola' }],
    nota: 'La sangre de las arterias va cargada de oxígeno, por eso es más viva, y sale empujada por cada latido; la de las venas ya lo ha cedido y sale con poca presión.',
  },
  parar: {
    titulo: 'Cómo parar una hemorragia externa', clave: 'Presión directa, sin soltar, y el miembro por encima del corazón.',
    datos: [{ cifra: '10 min', texto: 'de presión, como mínimo' }, { cifra: 'en alto', texto: 'brazo o pierna, sobre el corazón' }, { cifra: 'más gasas', texto: 'encima, sin quitar las primeras' }],
    nota: 'Si al elevar el miembro le duele mucho, no sigas subiéndolo. Que no esté de pie; si pierde el conocimiento, en posición antishock. Si con todo esto no se controla, el torniquete es el último recurso.',
  },
  torniquete: {
    titulo: 'El torniquete, el último recurso', clave: 'Solo si la presión no controla una hemorragia que amenaza la vida: entre la herida y el tronco, con la hora anotada.',
    datos: [{ cifra: '1 hueso', texto: 'en el brazo o en el muslo' }, { cifra: 'la hora', texto: 'anotada al ponerlo' }, { cifra: 'radio', texto: 'consejo médico cuanto antes' }],
    nota: 'Corta la sangre a todo el miembro: mantenido demasiado tiempo puede causar gangrena o lesiones de los nervios. Se puede hacer con el manguito del tensiómetro inflado por encima de la tensión del herido, o con un paño (o la venda triangular) apretado con un palo, sin nudos sobre la piel. La Guía manda además aflojarlo cada 15 minutos, y es la respuesta del examen de la DGMM; la práctica actual es no aflojarlo salvo indicación médica.',
  },
}, 'vista', 'tipos');

const quemadura = porVista(quemaduraC, SAN, {
  grados: {
    titulo: 'Quemaduras: los tres grados', clave: 'Cuanto más hondo llega, más grave: la de tercer grado ni siquiera duele.',
    datos: [{ cifra: '1.er grado', texto: 'roja y dolorosa' }, { cifra: '2.º grado', texto: 'ampollas y dolor intenso' }, { cifra: '3.er grado', texto: 'negruzca, no duele' }],
    nota: 'Las de segundo grado y más profundas se infectan con facilidad: consejo médico por radio. Cara y cuello, manos y pies, genitales, pliegues y orificios son zonas de mayor gravedad.',
  },
  enfriar: {
    titulo: 'Quemaduras: primero, el agua', clave: 'La térmica, con agua fría enseguida; la química, con agua abundante de 15 a 20 minutos.',
    datos: [{ cifra: 'agua fría', texto: 'térmica: enseguida' }, { cifra: '15–20 min', texto: 'química, como mínimo' }, { cifra: 'ojo', texto: 'de dentro hacia fuera' }],
    nota: 'Si arde la ropa, haz rodar al herido por el suelo, mójalo o envuélvelo en una manta que no sea sintética. En la eléctrica, corta antes la corriente. Si los dos ojos están afectados, lávalos por turnos cada 10 segundos.',
  },
  gravedad: {
    titulo: '¿Se trata a bordo? Extensión y zona', clave: 'La palma del herido es el 1 % de su piel: con eso decides si se trata a bordo o se evacúa.',
    datos: [{ cifra: '1 %', texto: 'la palma de su mano' }, { cifra: '20 · 10 · 1 %', texto: 'límites del 1.er, 2.º y 3.er grado' }, { cifra: 'evacuar', texto: 'cara, manos, pies, genitales' }],
    nota: 'Con lesión por inhalación (vías respiratorias) estos límites no valen: consejo médico por radio. La pérdida de líquido, la infección y las lesiones respiratorias amenazan la vida más que la propia herida: si está consciente, suero oral a pequeños sorbos.',
  },
}, 'vista', 'grados');

const golpeCalor = fijo(golpeCalorC, {
  titulo: 'Golpe de calor: enfriar ya', clave: 'Más de 40 °C: a la sombra, sin ropa y con agua fría hasta bajar a 39 °C.',
  datos: [{ cifra: '> 40 °C', texto: 'golpe de calor' }, { cifra: '20 °C', texto: 'el agua, más o menos' }, { cifra: '38,5 °C', texto: 'deja de enfriar' }],
  nota: 'No esperes: si la temperatura no baja enseguida puede haber daño cerebral o la muerte. Mídela cada 10 minutos y, si vuelve a subir, enfría otra vez.',
});

const radioMedico = fijo(radioMedicoC, {
  titulo: 'Consulta Radio-Médico: dos vías', clave: 'Por radio a través de una costera o por teléfono al 91 310 34 75: las dos valen.',
  datos: [{ cifra: '91 310 34 75', texto: 'teléfono del CRME' }, { cifra: '24 h', texto: 'todos los días, gratis' }, { cifra: '9 a 15 h', texto: 'consultas no urgentes' }],
  nota: 'Te atiende un médico del Instituto Social de la Marina, en español. Antes de llamar, reúne los datos del barco y del paciente, ten papel y lápiz y la lista del botiquín, y que el enfermo esté presente si se puede.',
});

const botiquin = fijo(botiquinC, {
  titulo: 'Botiquín de una embarcación de recreo', clave: 'Sin tripulación profesional, obligatorio en las zonas 1 a 4: el del tipo «Balsas de Salvamento».',
  datos: [{ cifra: 'zonas 1–4', texto: 'obligatorio' }, { cifra: 'zonas 5–7', texto: 'no obligatorio' }, { cifra: '+ Guía', texto: 'si llevas botiquín' }],
  nota: 'Real Decreto 339/2021, artículo 13. Guárdalo en un lugar limpio, seco y fresco, protegido de la luz y del calor, y vigila las caducidades.',
});

export const MARCOS_SANIDAD = { hemorragia, quemadura, 'golpe-calor': golpeCalor, 'radio-medico': radioMedico, botiquin };
