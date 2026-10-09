// Marcos de las láminas de legislación del PER rehechas en estilo C en la tanda de cierre (per-cola-normativa-c.js).
// Mismo formato que marcos.js; el texto alternativo es el del dibujo. Cada cifra, la de su norma (apéndice de la guía).

import { altDe, porVista } from './marcos-cierre-b.js';
import { zonasC, dotacionZonasC, playaC, vertidosC, tanqueRetencionC, marpolBasurasC, posidoniaC, banderasABordoC, pabellonObligatorioC } from './per-cola-normativa-c.js';
import { puertoComercialC, seguroRcC, contaminacionC, deberAuxilioC } from './per-cola-normativa-b-c.js';

const LEY = 'Legislación';
/** Marco de una lámina sin vistas: siempre el mismo, con el alt de su dibujo. */
const fijo = (fn, m) => (spec) => {
  const r = fn(spec);
  return r ? { tema: LEY, ...m, alt: altDe(r) } : null;
};

const zonas = fijo(zonasC, {
  titulo: 'Las siete zonas de navegación', clave: 'Cuanto menor es el número, más lejos puedes ir y más equipo tienes que llevar.',
  datos: [{ cifra: '60 · 25 · 12 M', texto: 'zonas 2, 3 y 4: desde la costa' }, { cifra: '5 · 2 M', texto: 'zonas 5 y 6: desde un abrigo o playa' }, { cifra: 'zona 7', texto: 'aguas protegidas' }],
  nota: 'Lo fija el artículo 3 del Real Decreto 339/2021. La zona 1 no tiene límite. Las franjas de la lámina no están a escala.',
});

const dotacionZonas = fijo(dotacionZonasC, {
  titulo: 'Chalecos, aros y balsa por zona', clave: 'El equipo de salvamento crece al alejarte: zona 1, el máximo; zonas 5 a 7, solo chalecos.',
  datos: [{ cifra: '275 · 150 · 100 N', texto: 'chalecos: zona 1, 2 a 4, 5 a 7' }, { cifra: '1 a 4', texto: 'zonas con aro con luz y rabiza' }, { cifra: '1 a 3', texto: 'zonas con balsa para todos' }],
  nota: 'Artículos 6, 7 y 8 del Real Decreto 339/2021. Un chaleco por persona, y uno más en la zona 1; la luz del chaleco se puede omitir solo navegando de día en las zonas 4 a 7.',
});

const playa = porVista(playaC, LEY, {
  balizada: {
    titulo: 'Zona de baño balizada', clave: 'Dentro de la línea de boyas amarillas no se navega; a la playa, por el canal.',
    datos: [{ cifra: 'boyas amarillas', texto: 'límite de la zona de baño' }, { cifra: 'canal', texto: 'el único paso para llegar y salir' }],
    nota: 'Reglamento General de Costas, artículo 73. En el canal de acceso, entrando hacia la playa, la marca cónica verde queda a estribor y la cilíndrica roja a babor. Se cruza despacio.',
  },
  'no-balizada': {
    titulo: 'Costa sin balizar: 200 m y 50 m', clave: 'Sin boyas, la zona de baño son 200 m en las playas y 50 m en el resto de la costa.',
    datos: [{ cifra: '200 m', texto: 'junto a las playas' }, { cifra: '50 m', texto: 'junto al resto de la costa' }, { cifra: '3 nudos', texto: 'velocidad máxima dentro' }],
    nota: 'Reglamento General de Costas, artículo 73. Dentro de esas franjas se puede navegar, pero a 3 nudos como máximo, con precaución y sin ningún vertido.',
  },
}, 'caso', 'balizada');

const vertidos = porVista(vertidosC, LEY, {
  'aguas-sucias': {
    titulo: 'Aguas sucias: dónde se descargan', clave: 'Cuanto menos tratadas, más lejos: a más de 12 millas sin tratar, a más de 3 desmenuzadas.',
    datos: [{ cifra: '> 12 M', texto: 'sin desmenuzar ni desinfectar' }, { cifra: '> 3 M', texto: 'desmenuzadas y desinfectadas' }, { cifra: '≥ 4 nudos', texto: 'en ruta, al vaciar el tanque' }],
    nota: 'Artículo 23 del Real Decreto 339/2021. Las millas se cuentan desde la línea de base. Con una instalación de tratamiento homologada, fuera de la zona 7.',
  },
  basuras: {
    titulo: 'Basuras: qué y dónde (MARPOL V)', clave: 'Plásticos y aceite de cocina, nunca; la comida, solo lejos y en ruta.',
    datos: [{ cifra: 'nunca', texto: 'plásticos y aceite de cocina' }, { cifra: '> 3 M', texto: 'comida triturada, fuera de zona especial' }, { cifra: '> 12 M', texto: 'comida en el Mediterráneo, triturada' }],
    nota: 'Anexo V del convenio MARPOL. Triturada quiere decir que pasa por una criba de 25 mm. El Mediterráneo es zona especial: allí la comida sin triturar va al puerto.',
  },
}, 'tema', 'aguas-sucias');

const tanqueRetencion = porVista(tanqueRetencionC, LEY, {
  puerto: {
    titulo: 'Tanque de retención: se vacía en puerto', clave: 'Con inodoro a bordo, las aguas sucias se guardan y se vacían en la instalación del puerto.',
    datos: [{ cifra: 'conexión universal', texto: 'para vaciar el tanque fijo' }, { cifra: 'precinto', texto: 'en la válvula de descarga al mar' }, { cifra: 'zona 7', texto: 'nada al mar' }],
    nota: 'Artículo 22 del Real Decreto 339/2021 (no se aplica a los barcos con marcado CE). En lugar del tanque vale una instalación de tratamiento homologada o un sistema para desmenuzar y desinfectar.',
  },
  mar: {
    titulo: 'Vaciar el tanque en la mar', clave: 'Poco a poco, en ruta y a 4 nudos o más; nunca parado ni fondeado.',
    datos: [{ cifra: '≥ 4 nudos', texto: 'velocidad mínima' }, { cifra: '> 3 M', texto: 'desmenuzadas y desinfectadas' }, { cifra: '> 12 M', texto: 'sin tratar' }],
    nota: 'Artículo 23 del Real Decreto 339/2021: lo almacenado no se descarga de golpe, sino a régimen moderado. Las distancias, desde la línea de base.',
  },
}, 'vista', 'puerto');

const BASURAS = {
  titulo: 'Basuras a un lado y otro del Estrecho', clave: 'Al este de 5° 36′ W, el Mediterráneo es zona especial: la comida, triturada y a más de 12 millas.',
  datos: [{ cifra: '5° 36′ W', texto: 'límite de la zona especial' }, { cifra: '> 3 M', texto: 'comida triturada en el Atlántico' }, { cifra: '> 12 M', texto: 'comida triturada en el Mediterráneo' }],
  nota: 'Anexo V del convenio MARPOL. Plásticos y aceite de cocina, nunca; papel, vidrio, latas y envases, al puerto. Si la comida va mezclada con otra basura, manda la regla más dura.',
};
const marpolBasuras = porVista(marpolBasurasC, LEY, {
  todas: BASURAS,
  atlantico: { ...BASURAS, titulo: 'Basuras en el Atlántico', clave: 'Al oeste de 5° 36′ W no es zona especial: comida triturada a más de 3 millas y sin triturar a más de 12.' },
  mediterraneo: { ...BASURAS, titulo: 'Basuras en el Mediterráneo', clave: 'Zona especial: la comida, solo triturada, en ruta y a más de 12 millas; sin triturar, al puerto.' },
}, 'zona', 'todas');

const posidonia = porVista(posidoniaC, LEY, {
  fondeo: {
    titulo: 'Fondear en arena, nunca en la pradera', clave: 'Ni el ancla ni la cadena pueden tocar la posidonia, tampoco al bornear.',
    datos: [{ cifra: 'arena', texto: 'mancha clara: se fondea' }, { cifra: 'pradera', texto: 'mancha oscura: solo boya autorizada' }],
    nota: 'Lo prohíbe el Real Decreto 191/2026 en el Mediterráneo español, salvo fuerza mayor o peligro para la vida humana o la navegación. Antes de fondear, mira el fondo y calcula el círculo de borneo.',
  },
  planta: {
    titulo: 'La posidonia: una planta, no un alga', clave: 'Raíces, rizoma, hojas en cinta, flores y fruto: una planta del Mediterráneo.',
    datos: [{ cifra: 'endémica', texto: 'solo del Mediterráneo' }, { cifra: 'muy lenta', texto: 'el daño de un ancla tarda décadas en repararse' }],
    nota: 'Forma praderas sobre fondos de arena. Por eso, antes de fondear en el Mediterráneo, distingue la mancha oscura de la clara.',
  },
}, 'vista', 'fondeo');

const banderasABordo = fijo(banderasABordoC, {
  titulo: 'Dónde va cada bandera a bordo', clave: 'Asta de popa y pico del palo mayor, solo para la de España.',
  datos: [{ cifra: 'popa', texto: 'la bandera de España' }, { cifra: 'pico', texto: 'también reservado a la de España' }, { cifra: '1/3', texto: 'área máxima de las demás' }],
  nota: 'Real Decreto 2335/1980. La autonómica, la del club o la de cortesía van en otro sitio (por ejemplo, una driza de las crucetas) y solo con la de España izada.',
});

const pabellonObligatorio = fijo(pabellonObligatorioC, {
  titulo: 'Cuándo izar el pabellón nacional', clave: 'Al entrar y salir de puerto, ante un buque de guerra y cuando lo pida la autoridad o la costumbre.',
  datos: [{ cifra: 'puerto', texto: 'al entrar y al salir' }, { cifra: 'de sol a sol', texto: 'en puerto, los días festivos' }, { cifra: '1/3', texto: 'área máxima de las demás' }],
  nota: 'Real Decreto 2335/1980. También a la vista de una fortaleza y en aguas extranjeras si lo exigen sus normas. Las demás banderas, solo con la de España izada.',
});

const puertoComercial = fijo(puertoComercialC, {
  titulo: 'En un puerto comercial', clave: 'El recreo de menos de 20 m no estorba a los buques; en el canal de acceso no se fondea si se puede evitar.',
  datos: [{ cifra: '< 20 m', texto: 'recreo: no estorba el tránsito' }, { cifra: 'regla 9 g', texto: 'evitar fondear en un canal angosto' }],
  nota: 'Real Decreto 186/2023 (aguas de servicio de los puertos comerciales) y RIPA, regla 9. Estorbar el tránsito de los buques en esas aguas es una infracción.',
});

const seguroRc = fijo(seguroRcC, {
  titulo: 'Seguro obligatorio de responsabilidad civil', clave: 'Paga lo que causas a terceros, nunca los daños de tu propio barco.',
  datos: [{ cifra: '120.202,42 €', texto: 'por víctima' }, { cifra: '240.404,84 €', texto: 'daños personales por siniestro' }, { cifra: '96.161,94 €', texto: 'daños materiales por siniestro' }],
  nota: 'Real Decreto 607/1999: obligatorio para las embarcaciones de recreo a motor (también motos náuticas) y las sin motor de más de 6 m. Para regatas y competiciones, un seguro especial.',
});

const contaminacion = porVista(contaminacionC, LEY, {
  responsables: {
    titulo: 'Contaminar: quién responde', clave: 'Naviero, propietario, asegurador de RC y patrón responden solidariamente.',
    datos: [{ cifra: '4', texto: 'responsables a la vez' }, { cifra: 'solidaria', texto: 'se puede reclamar todo a cualquiera' }],
    nota: 'Texto refundido de la Ley de Puertos y de la Marina Mercante, artículo 310. Y los cuatro quedan obligados, también solidariamente, a reparar el daño causado.',
  },
  aviso: {
    titulo: 'Si ves contaminación, avisa', clave: 'Posición y hora, aspecto de la mancha y el buque que la causa: a Salvamento Marítimo, sin demora.',
    datos: [{ cifra: 'VHF 16', texto: 'canal de socorro y llamada' }, { cifra: '900 202 202', texto: 'Salvamento Marítimo' }, { cifra: '112', texto: 'emergencias' }],
    nota: 'La Ley de Navegación Marítima (artículo 186) obliga a los capitanes a comunicar a la Capitanía Marítima todo episodio de contaminación que observen.',
  },
}, 'vista', 'responsables');

const deberAuxilio = fijo(deberAuxilioC, {
  titulo: 'Deber de auxilio', clave: 'Si puedes ayudar sin grave peligro, acudes; si no, anotas por qué e informas.',
  datos: [{ cifra: 'SOLAS V/33.1', texto: 'acudir a toda velocidad' }, { cifra: 'art. 183.3', texto: 'Ley de Navegación Marítima' }, { cifra: 'diario', texto: 'constancia de lo actuado' }],
  nota: 'Sea cual sea la nacionalidad o la condición de las personas en peligro. Si no acudes porque no puedes o porque no lo consideras razonable ni necesario, anota el motivo en el diario e informa al servicio de salvamento.',
});

export const MARCOS_NORMATIVA = {
  'puerto-comercial': puertoComercial, 'seguro-rc': seguroRc, contaminacion, 'deber-auxilio': deberAuxilio,
  zonas, 'dotacion-zonas': dotacionZonas, playa, vertidos, 'tanque-retencion': tanqueRetencion, 'marpol-basuras': marpolBasuras,
  posidonia, 'banderas-a-bordo': banderasABordo, 'pabellon-obligatorio': pabellonObligatorio,
};
