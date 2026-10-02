// Desatraque de costado con un esprín: barco atracado por babor, hélice dextrógira. Funciones puras.
// El esprín de proa (de la proa hacia popa, al muelle) impide avanzar; el esprín de popa impide retroceder.
// Avante sobre el esprín de proa con el timón al muelle → la proa pivota en la defensa y se abre la popa.
// Atrás sobre el esprín de popa → la popa pivota y se abre la proa (la dextrógira lleva la popa al muelle y ayuda).
// Con un esprín que no trabaja (en banda) el barco solo se desliza a lo largo del muelle.
import { caidaPopa } from './helice.js';

/**
 * @param {{ viento: 'calma'|'tierra'|'mar', esprin: 'proa'|'popa', maquina: 'avante'|'atras' }} p
 * @returns {{ resultado: 'abre-popa'|'abre-proa'|'se-queda'|'se-separa', trabaja: boolean, timon: 'br'|'via', helice, texto }}
 */
export function desatraque({ viento, esprin, maquina }) {
  const trabaja = (esprin === 'proa' && maquina === 'avante') || (esprin === 'popa' && maquina === 'atras');
  const timon = esprin === 'proa' && maquina === 'avante' ? 'br' : 'via'; // avante, timón al muelle (babor); atrás apenas gobierna
  const helice = caidaPopa({ marcha: maquina, sentido: 'dextrogira', timon });
  if (!trabaja) {
    if (viento === 'tierra') return { resultado: 'se-separa', trabaja, timon, helice, texto: `El esprín de ${esprin} no trabaja (queda en banda), pero el viento de tierra separa el barco del muelle él solo.` };
    return { resultado: 'se-queda', trabaja, timon, helice, texto: `El esprín de ${esprin} no trabaja dando ${maquina === 'avante' ? 'avante' : 'atrás'}: el barco solo se desliza a lo largo del muelle${viento === 'mar' ? ' y el viento de la mar lo aprieta contra él' : ''}.` };
  }
  if (esprin === 'proa') {
    return { resultado: 'abre-popa', trabaja, timon, helice, texto: `El esprín de proa aguanta, la proa se apoya en la defensa de la amura y, con el timón al muelle, la popa se abre (va a ${helice.popa}).${viento === 'mar' ? ' Con viento de la mar hace falta más máquina, pero es la forma de salir: la popa, con la hélice y el timón, sale primero al agua libre.' : ''} Después se sale atrás.` };
  }
  if (viento === 'mar') return { resultado: 'se-queda', trabaja, timon, helice, texto: 'El esprín de popa trabaja, pero el viento de la mar devuelve la proa contra el muelle: así no se abre. Con viento de fuera se abre primero la popa.' };
  return { resultado: 'abre-proa', trabaja, timon, helice, texto: `El esprín de popa aguanta, la popa se apoya en la defensa de la aleta y la proa se abre; la hélice dextrógira dando atrás lleva la popa a ${helice.popa}, hacia el muelle, y ayuda. Después se sale avante.` };
}
