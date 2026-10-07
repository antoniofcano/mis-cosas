# Soluciones de carta · eje Illes Balears

Trabajo: resolver con el kit de carta de la app las preguntas de carta de un lote del banco de exámenes de **Baleares**
(PER: preguntas 42–45; PY: 31–40), una solución programada por pregunta, igual que las ya hechas para el otro banco
de la app (`nautica/src/exams/solutions/andalucia-per-*.js` y `andalucia-py-*.js`: léelas primero, son el modelo).

## Entrada y salida

- Entrada: `nautica/.trabajo-carta/entrada/lote-NN.jsonl`, una pregunta por línea: `id, tit, fecha (de la
  convocatoria), enunciado, opciones, correcta, notas`. El banco completo está en `nautica/data/ejes/baleares/<tit>/preguntas.json`.
- Salida: `nautica/src/exams/solutions/baleares-<tit>-NN.js` (un fichero por titulación del lote; NN = número del
  lote), con el mismo formato que los de Andalucía:

```js
// Soluciones programadas de carta del PER de Baleares (lote NN). Ver baleares-per.js para el formato.
import { hrb } from '../kit.js';

const latlon = (p) => [{ kind: 'lat', value: p.lat }, { kind: 'lon', value: p.lon }];
// Declinación de la carta L105: 2°50′ W 2005 (7′ E).
const L105 = [-(2 + 50 / 60), 2005, 7];

export default {
  'bal-per-2019-04-b-43': {
    ejercicio: 'rumbo-pasar-distancia',
    solve(k) {
      const s = k.pos('36 01,4 N', '5 19,2 W', 'Salida');
      const rv = k.tangent(s, 'punta-europa', 1.8, 'estribor');
      const ct = k.ct({ carta: L105, anyo: 2019, desvio: 2 });
      return [{ kind: 'bearing', value: k.ra(rv, ct) }];
    },
  },
};

/* DISCREPANCIAS
 * 'bal-per-…' (motivo): qué sale, qué da la oficial y por qué no cuadra.
 */
```

Cada `solve(k, q)` calcula con el kit (cada operación explica un paso y dibuja en la carta) y devuelve los valores que
se comparan con las opciones (`kind`: `lat`, `lon`, `bearing`, `signed` (Ct, dm), `clock` (minutos desde las 00:00),
`distance` (millas), `speed` (nudos), `meters`). `ejercicio` es obligatorio; usa uno de estos tipos:
`situacion-dos-demoras`, `situacion-demora-distancia`, `estima-directa`, `estima-analitica`, `rumbo-distancia`,
`rumbo-pasar-distancia`, `distancia-faro`, `ct-enfilacion`, `demoras-no-simultaneas`, `abatimiento`,
`corriente-efectiva`, `corriente-rumbo-a-dar`, `corriente-desconocida`, `marea-sonda`. En el PY, `sinCarta: true` en las
que no dibujan nada (estima analítica fuera de la carta, cálculos sin trazado).

## Reglas

1. **Comprueba cada solución**: `node nautica/.trabajo-carta/probar.mjs src/exams/solutions/baleares-per-NN.js`. Una
   solución solo se queda en `export default` si el comprobador elige la opción oficial (y, en el PY, con margen: es
   la misma regla que `tests/exams.test.js`). Las que no llegan a la oficial NO se fuerzan: van al bloque
   `/* DISCREPANCIAS */` del final con el motivo (qué sale, qué da la oficial, posible errata del enunciado o de la
   plantilla, dato que falta en la carta de la app) y, si existe, el código que la resolvería.
2. **Declinación del año en curso**: la de la carta (`L105`) llevada al año de la convocatoria (`q.fecha`), o al año
   que diga el enunciado («A fecha 3 de mayo de 2021», «la del año en curso (2019)»). Si da el valor (dm = 2º NW),
   úsalo tal cual. Si redondea («redondear al grado próximo»), redondea. Si la oficial solo sale con otra declinación,
   dilo en un comentario o en DISCREPANCIAS.
3. **Signos**: NE/E/+ positivo, NW/W/− negativo; marcaciones estribor +, babor −; «desvío 3º(-)» = −3.
4. **Puntos de la carta de la app** (`k.P('id')`, o el id como texto en las funciones del kit):
   - `cabo-roche`: Faro de Cabo Roche (36.2963, -6.1387) Fl(4)W 24s 20M
   - `cabo-trafalgar`: Faro de Cabo Trafalgar (36.1840, -6.0337) Fl(2+1)W 15s 22M
   - `barbate-faro`: Barbate, faro de tierra (36.1879, -5.9216) Fl(2)WR 7s 10/7M
   - `barbate-espigon`: Barbate, luz roja del espigón (dique de poniente) (36.1809, -5.9245) Fl.R 4s 5M
   - `punta-gracia`: Faro de Punta de Gracia (Camarinal) (36.0915, -5.8089) Oc(2)W 5s 13M
   - `punta-paloma`: Faro de Punta Paloma (36.0656, -5.7181) Oc.WR 5s 10/7M
   - `isla-tarifa`: Faro de Isla de Tarifa (36.0019, -5.6086) Fl(3)WR 10s 26/18M (Racon)
   - `tarifa-espigon`: Tarifa, espigón exterior (cabeza dique E) (36.0081, -5.6023) Fl.G 5s 5M (NGA)
   - `punta-carnero`: Faro de Punta Carnero (36.0788, -5.4246) Fl(4)WR 20s 16/13M
   - `punta-europa`: Faro de Punta Europa (Europa Point, Gibraltar) (36.1114, -5.3437) Iso.W & Oc.R 10s 19/15M
   - `punta-carbonera`: Faro de Punta Carbonera (36.2459, -5.2996) Oc.W 4s 14M
   - `gibraltar-aero`: Luz aeronáutica de Gibraltar (Peñón) (36.1442, -5.3420) Aero Mo(GB)R 10s 30M
   - `cabo-negro`: Faro de Cabo Negro (Ras El Aswad) (35.6873, -5.2730) Oc.W 4s 20M
   - `punta-almina`: Faro de Punta Almina (Ceuta) (35.9012, -5.2797) Fl(2)W 10s 22M
   - `ceuta-bocana`: Ceuta, luz verde de la bocana (dique de poniente) (35.8973, -5.3101) Fl.G 5s 10M (Racon)
   - `ceuta-roja`: Ceuta, dique de levante (luz roja) (35.8970, -5.3067) Fl.R 5s 5M
   - `punta-cires`: Faro de Punta Cires (35.9103, -5.4818) Fl(3)W 10s 18M
   - `punta-alcazar`: Faro de Punta Alcázar (Ksar es Srhir) (35.8498, -5.5609) Fl(4)W 12s 8M
   - `punta-malabata`: Faro de Punta Malabata (35.8205, -5.7495) Fl.W 5s 22M
   - `el-xarf`: Faro de El Xarf (Le Charf), Tánger (35.7677, -5.7880) Oc(3)WRG 12s 16-11M
   - `tanger-espigon`: Tánger, farola del espigón (cabeza dique de abrigo) (35.7914, -5.7910) Fl(3)W 12s 14M
   - `cabo-espartel`: Faro de Cabo Espartel (35.7921, -5.9237) Fl(4)W 20s 30M
   - `boukhalf-aero`: Luz aeronáutica Tánger-Boukhalf (35.7252, -5.9113) Aero Fl.W 12s 25M
   - `algeciras-espigon`: Algeciras, luz roja del espigón (farola roja) (36.1483, -5.4265) Fl(2)R 6s 8M
   - `boya-getares`: Boya cardinal E (Ensenada de Getares / Pta. San García) (36.1140, -5.4095) Q(3)W 10s 4M (BYB)
   - `gibraltar-muelle-sur`: Gibraltar, muelle sur (Fl 2s) (36.1341, -5.3630) Fl.W 2s 15M
   - `punta-camarinal`: Punta Camarinal (36.0784, -5.7940)
   - `torre-guadalmesi`: Torre de Guadalmesí (Punta Guadalmesí) (36.0388, -5.5192)
   - `bajo-cabezos`: Bajo de Los Cabezos (4,3 m) (36.0125, -5.6725)
   - `punta-san-garcia`: Punta de San García (36.1066, -5.4303)
   - `punta-europa-cabo`: Punta Europa (cabo) (36.1103, -5.3450)
   - `punta-tarifa`: Punta de Tarifa (Isla de Tarifa, extremo S) (36.0078, -5.6075)
   - `monte-hacho`: Monte Hacho (Ceuta, 204 m) (35.8983, -5.2856)
   - `penon-gibraltar`: Peñón de Gibraltar (cumbre 426 m) (36.1299, -5.3432)
   - `isla-perejil`: Isla del Perejil (centro) (35.9157, -5.4178)
   - `punta-leona`: Punta Leona (35.9235, -5.4006)
   - `torre-de-la-pena`: Torre de la Peña (36.0583, -5.6579)
   - `punta-chullera`: Punta de la Chullera (36.3123, -5.2459)
   - `jebel-musa`: Yebel Musa (839 m) (35.9003, -5.4118)
   «Ras El Aswad» = `cabo-negro`; «Punta Camarinal» o «faro de Camarinal» = normalmente el faro de Punta de Gracia
   (`punta-gracia`), salvo que el enunciado hable de la punta. Si la pregunta usa un elemento que no está (isobáticas,
   naufragios, montes, marcas cardinales o especiales, bajos, el DST…) y el enunciado no da sus coordenadas, no lo
   inventes: va a DISCREPANCIAS como «elemento que no está en la carta de la app».
5. **Lee bien el enunciado**: hora reloj (HRB) vs UT, «al través», «por la proa», distancia o tiempo navegados,
   cambios de rumbo y velocidad (`k.tramos`, `k.run`), corrientes y abatimiento (`k.efectivo`, `k.rumboConCorriente`,
   `k.abatimiento`, `k.rvConAbatimiento`). Las funciones del kit están documentadas en `nautica/src/exams/kit.js`.
6. Explica con `k.note(título, texto)` (en castellano) cualquier interpretación del enunciado que no sea obvia.
7. Nada de nombrar academias ni escuelas.

## Al terminar

- `node nautica/.trabajo-carta/probar.mjs` sobre cada fichero tuyo: 0 problemas en lo exportado.
- En la cabecera de cada fichero, un comentario con el resumen: resueltas, en DISCREPANCIAS y por qué (contadas).
- Commit solo de tus ficheros `nautica/src/exams/solutions/baleares-*-NN.js` y push a tu rama.
