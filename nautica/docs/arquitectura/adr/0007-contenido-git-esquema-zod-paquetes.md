# ADR 0007: Contenido en git con esquema Zod y paquetes por banco

- **Estado:** aceptada
- **Fecha:** 17 de noviembre de 2026

## Contexto

24 MB de JSON (10.182 preguntas de tres tribunales) sin esquema formal (D-03), con datos generados y escritos a mano
mezclados (M-09); 16.741 líneas de resoluciones y 17.101 de láminas que son contenido con forma de código y viajan en
el arranque (E-04); cada pantalla analiza el banco entero (R-03). La cuarentena de convocatorias reservadas y la
independencia de bancos por tribunal son principios que no se negocian.

## Decisión

- El contenido **sigue en git, revisado por PR**, en `packages/contenido/fuentes/`.
- **Esquema Zod 4** en `@patron/contratos/contenido` como fuente única: tipos por inferencia y JSON Schema generado
  para el editor.
- **Compilador** a paquetes con nombre por *hash*: índice ligero por banco, preguntas y explicaciones por tema, y
  **cada convocatoria que es o ha sido reserva en un paquete aparte**, que solo se carga según la reserva del alumno.
- Resoluciones y láminas siguen siendo código, cargado con `import()` por banco.
- Versión semántica por banco; ids publicados inmutables, comprobados en CI contra la versión anterior.
- La cuarentena se comprueba sobre las fuentes y sobre los paquetes compilados.
- Audio en R2; en git, índice y guiones.

## Alternativas

- **Base de datos con editor (CMS):** solo hace falta cuando edite alguien que no usa git; hoy añade un sistema que
  mantener.
- **JSON Schema escrito a mano:** dos fuentes de verdad (esquema y tipos).
- **Contenido en IndexedDB con consultas:** más potente y más frágil; los paquetes por tema con caché resuelven R-03.
- **Paquetes firmados:** sin amenaza mientras contenido y app compartan origen.

## Consecuencias

- Un campo mal escrito falla en CI en vez de publicarse.
- Las 62 pruebas de contrato de datos pasan a ser el trabajo `contenido` de CI.
- Cambiar la reserva de un eje es un cambio mayor del banco y regenera los paquetes de convocatoria.
- El contenido propio de un centro (configuración del grupo) no es contenido de git: es dato de servidor.
