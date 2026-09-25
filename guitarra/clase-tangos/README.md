# Clase de guitarra · tangos (maqueta)

Fuera del producto OlivarTrack: es una maqueta aparte, sin build ni tests.
`index.html` es una página estática; se abre directamente en el navegador.
Va en cuatro pestañas: **Compás** (el ritmo de 8 y la alzapúa), **Ruedas**
(por arriba en Mi y por medio en La, con sus ruedas sobre el compás),
**Escala** (La frigio con los dibujos 1 y 2) y **La clase** (vídeo, partes y
falseta sincronizada).

Análisis del vídeo del 23-sep-2026 (2:26). Palo y técnicas (tangos por medio,
alzapúa, falseta) confirmados por quien grabó la clase; los tiempos, deducidos
del audio.

| Parte | Tiempo | Qué pasa |
|---|---|---|
| 0 | 0:00–0:06 | Compás y tempo (cuenta de entrada, ≈118 bpm, 8 tiempos) |
| 1 | 0:06–0:38 | Falseta, dos vueltas de 16,2 s que acaban en el acorde del tango |
| 2 | 0:38–0:57 | Rueda de acordes: La, Rem, Do7, Si♭, Sol7 |
| 3 | 0:57–2:26 | Explicación de la alzapúa: sobre La y luego por la cadencia |

La falseta está transcrita en `FALSETA` (dentro de `index.html`) con el tiempo
de cada nota en las dos vueltas; el mástil y la tablatura la siguen al
reproducir el vídeo. Las notas salen del audio y se validan cruzando las dos
vueltas. La posición sale del vídeo: dibujo 1 (trastes 0–3) hasta 0:09, dibujo 2
(trastes 3–7, Do–Re–Mi en la 5ª cuerda) hasta 0:15 y vuelta al dibujo 1.

Escala: La frigio (La, Si♭, Do, Re, Mi, Fa, Sol), Do♯ opcional.
Método: cromagrama, detección de ataques y autocorrelación del audio,
más fotogramas cada 5 s.
