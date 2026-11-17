# ADR 0001: Producto nuevo; v1 queda como maqueta, fuente de contenido y oráculo

- **Estado:** aceptada (sustituye a «Conservar el núcleo y reescribir la carcasa por estrangulamiento»)
- **Fecha:** 17 de noviembre de 2026

## Contexto

La primera versión de esta arquitectura migraba la app actual por estrangulamiento: vistas antiguas dentro de la app
nueva, doble escritura con el Worker, mudanza de dominio y congelación hasta el examen de marzo de 2027. El dueño ha
cambiado el enfoque: lo nuevo se aloja en otro sitio, así que nunca puede romper lo que hay, y Patrón v1 «ha cumplido
como maqueta para definir el método y ponerlo en práctica con el material».

## Decisión

- **Patrón v1 sigue vivo y sin tocar** en GitHub Pages con su Worker. No recibe código del producto nuevo ni lo aporta
  en tiempo de ejecución.
- **El producto nuevo se construye desde cero**: repositorio, dominio, servidor, modelo de datos e interfaz propios,
  elegidos como en un proyecto nuevo.
- De v1 se aprovechan tres cosas, las tres por **lectura**:
  1. el **contenido**, con un importador repetible a los esquemas nuevos (ADR 0007);
  2. los **algoritmos**, portados o reescritos contra **casos dorados** generados ejecutando v1 (ADR 0018);
  3. el **progreso** de quien quiera traerlo, con una importación opcional (ADR 0013).
- v1 es además la **referencia de comportamiento y de aspecto**: lista de paridad por pantalla y capturas.
- Las diferencias deliberadas se apuntan en `docs/divergencias-v1.md`.

## Alternativas

- **Estrangulamiento (la versión anterior):** protege a los alumnos actuales a costa de meses conviviendo con dos
  interfaces, dos almacenamientos y dos servidores, y de arrastrar el modelo de datos de la maqueta. Pierde sentido
  cuando lo nuevo va en otro sitio.
- **Reescribir sin mirar v1:** tiraría el contenido verificado y la única especificación ejecutable del método.
- **Bifurcar el repositorio de v1 y limpiarlo:** hereda la estructura, el historial y los 304 MB de audio.

## Consecuencias

- Desaparecen el adaptador de vistas, la doble escritura, la mudanza obligada y la congelación: se puede empezar ya.
- Hasta el lanzamiento no hay nada que enseñar a los alumnos; el valor llega de golpe, no pantalla a pantalla.
- Dos productos vivos a la vez durante un tiempo: el contenido se mantiene en v1 hasta el relevo y se reimporta.
- v1 conserva sus carencias (privacidad, origen compartido) mientras siga abierta; su fecha de cierre es decisión del dueño.
- El riesgo clásico de una reescritura —perder comportamiento que nadie recordaba— se cubre con los casos dorados.
