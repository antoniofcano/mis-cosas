# ADR 0007: Contenido en git con esquema Zod, importado de v1 y compilado a paquetes

- **Estado:** aceptada (ampliada con la importación desde v1)
- **Fecha:** 17 de noviembre de 2026

## Contexto

El contenido de v1 es el activo principal: 10.182 preguntas de tres tribunales con explicaciones, clases, conceptos,
16.741 líneas de resoluciones de carta, 17.101 de láminas y 62 episodios de pódcast. No tiene esquema formal (D-03),
mezcla lo generado con lo escrito a mano (M-09) y se carga entero (R-03). La cuarentena de convocatorias reservadas y
la independencia de bancos por tribunal son principios del proyecto.

## Decisión

- El contenido vive **en git, revisado por PR**, en `packages/contenido/fuentes/`, con **un fichero por convocatoria**.
- **Esquema Zod 4** en `@patron/contratos/contenido` como fuente única: tipos por inferencia y JSON Schema para el editor.
- **Importador repetible** (`herramientas/importar-v1`): lee un commit de v1, convierte, valida y escribe un informe.
  Hasta el **relevo** (al lanzar para particulares), el contenido se mantiene en v1 y se reimporta; después, solo en
  el repositorio nuevo.
- **Se conservan los ids de pregunta de v1**; un id publicado no se reutiliza ni se renombra.
- **Compilador** a paquetes con nombre por *hash*: índice ligero por banco, preguntas y explicaciones por tema, y
  **cada convocatoria que es o ha sido reserva en un paquete aparte**.
- Resoluciones y láminas siguen siendo código (TypeScript), cargado con `import()` por banco.
- La herramienta de cuarentena se porta y se ejecuta sobre fuentes y sobre paquetes compilados.
- Audio en R2; en git, índice y guiones. La tubería de extracción de exámenes se porta tal cual.

## Alternativas

- **Base de datos con editor (CMS):** solo hace falta cuando edite alguien que no usa git.
- **Rehacer el contenido:** impensable; son años de verificación.
- **Importar una vez y bifurcar ya:** obligaría a mantener el contenido en dos sitios mientras v1 siga en uso.
- **Ids nuevos:** romperían la reserva, la cuarentena y la importación del progreso.
- **Paquetes firmados:** sin amenaza mientras contenido y app compartan origen.

## Consecuencias

- Un campo mal escrito falla en CI en vez de publicarse; la importación dice exactamente qué no entra.
- Hasta el relevo no se edita contenido a mano en el repositorio nuevo.
- Cambiar la reserva de un tribunal es un cambio mayor del banco y regenera los paquetes de convocatoria.
- El contenido propio de un centro (configuración del grupo) no es contenido de git: es dato de servidor.
