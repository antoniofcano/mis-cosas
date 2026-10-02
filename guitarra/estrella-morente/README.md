# «Estrella» (Enrique Morente) · tango

Página de estudio: el vídeo de la clase (guitarra y voz, 1:36) sincronizado con
la foto de la pizarra del profe. Un foco recorre la pizarra verso a verso y
marca el acorde que suena. Al lado, el diagrama del acorde actual y del
siguiente con cuenta atrás.

Se abre `index.html` directamente en el navegador. No necesita build.

- **Pizarra / Letra limpia:** dos vistas. La letra limpia es una ventana del
  tamaño del vídeo que se desplaza sola, con karaoke palabra a palabra.
- **Práctica:** velocidad 0,5× / 0,75× / 1×, repetir verso (`L`), saltar de
  verso (`←` `→`), pulsar un verso para ir a él.
- **Afinar los tiempos:** `M` marca el inicio del verso siguiente mientras
  suena. Se guarda en el navegador (`localStorage`).

## Cómo se sacó

- **Cejilla en el 2º traste.** Todo suena dos semitonos por encima de lo
  escrito. Se ve en el vídeo.
- **Tiempos de los versos:** reconocimiento de voz (Whisper) sobre el audio.
- **Cambios de acorde:** cromagrama del audio comparado con los acordes de la
  pizarra, descontando la cejilla. Acierta 19 de 24 en la parte escrita.
  Para dudas entre parejas de acordes (lam/Do, rem/Mi7) se miró el bajo.
- **Coda (desde 1:04):** es el estribillo de la canción, que no está en la
  pizarra. Sus acordes salen del mismo análisis del audio.

## Lo que queda dudoso

- El audio apenas distingue FA de FΔ (Fmaj7).
- En varios Mi se oye un Fa (la novena menor flamenca, o la voz).
- El último rem del cierre (1:35) dura menos de un segundo.
- En «Estrella, llévame a un mundo» suena un Sol que la pizarra no tiene; se
  ha dejado como está escrito.

## Comparado con LaCuerda

Misma tonalidad (Fa# flamenco). El profe cambia dos acordes: **lam** donde
LaCuerda pone Re (Do con cejilla al 2), y **rem** donde pone Fa#7 (Mi7 con
cejilla). El bajo del audio confirma la versión del profe.

## Archivos

- `index.html`: la página.
- `tango.mp4`: el vídeo convertido a 480p H.264 (de 105 MB a 5 MB). El original
  está en Google Photos.
- `pizarra.jpg`: la foto de la pizarra. `poster.jpg`: fotograma de portada.

Publicada también como Artifact privado:
https://claude.ai/artifact/2ZS4QbF1Wm9umceY3r48Xk
