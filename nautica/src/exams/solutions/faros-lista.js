// Situación oficial de un faro (Lista de faros, NGA Pub. 113, WGS84) llevada al datum de la carta L105 (ED50: +0,08′ N,
// +0,07′ E, nota de la carta), para las preguntas en que el tribunal mide la dirección entre dos faros con ella y no con
// el símbolo dibujado. Los datos salen de tools/source/points.json (`lat_wgs84`, `lon_wgs84`).
//
// Punta Malabata: su símbolo en la carta L105 está 0,16′ al N de su situación oficial (tools/source/notes.md). Para
// situarse con él da igual (0,16′), pero la enfilación Cabo Espartel–Punta Malabata, de solo 8,7 millas, gira más de
// un grado: 078,6° entre los símbolos y 079,9° entre las situaciones oficiales. Los tribunales de Andalucía y de
// Baleares usan 079,5°–080° (Ct de sus plantillas con Da 078°, 087°, 090°, 093° y 071°).

const ED50 = (lat, lon) => ({ lat: lat + 0.08 / 60, lon: lon + 0.07 / 60 });

/** Faro de Punta Malabata en su situación oficial: 35° 49,0′ N 005° 44,9′ W (WGS84), 35° 49,1′ N en la carta. */
export const MALABATA_LISTA = { ...ED50(35.8165, -5.74872), name: 'Faro de Punta Malabata (situación oficial)' };

const NOTA = 'Entre los símbolos de los dos faros en la carta de la app la recta mide 078,6°; con la situación oficial del faro '
  + 'de Punta Malabata (Lista de faros: 35° 49,0′ N 005° 44,9′ W) sale 079,8°, prácticamente 080°, que es el valor que '
  + 'toma el tribunal. El símbolo de Malabata en la carta está unas 0,16′ más al N: para situarse no importa, pero en una '
  + 'enfilación tan corta (8,7 millas) gira la recta más de un grado. Si mides en tu carta te saldrá entre 078° y 080°: '
  + 'la plantilla usa 080°.';

/** Dv de la enfilación Cabo Espartel–Punta Malabata (en el sentido más próximo a `approx`), con la nota. */
export function enfilacionEspartelMalabata(k, approx = 80) {
  k.note('Enfilación Espartel–Malabata', NOTA);
  return k.enfilacion('cabo-espartel', MALABATA_LISTA, approx);
}

/** Dv a Punta Malabata estando en la oposición Cabo Espartel–Punta Malabata (entre los dos faros), con la nota. */
export function oposicionEspartelMalabata(k) {
  k.note('Oposición Espartel–Malabata', NOTA);
  return k.oposicion('cabo-espartel', MALABATA_LISTA);
}
