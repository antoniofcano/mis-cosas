# ADR 0013: Importación opcional del progreso de v1

- **Estado:** aceptada (sustituye a «Dominio propio y mudanza de alumnos por vinculación»)
- **Fecha:** 17 de noviembre de 2026

## Contexto

v1 sigue viva y sin tocar (ADR 0001). Sus alumnos tienen progreso en su aparato y, si sincronizan, en el Worker,
asociado a su código. El producto nuevo usa los mismos ids de pregunta (ADR 0007) y otro modelo de eventos (ADR 0010).
No hay que mudar a nadie: quien quiera pasarse debe poder traer lo estudiado, sin prisa.

## Decisión

- En el producto nuevo, «Traer mi progreso de Patrón (versión anterior)», por dos vías que **no exigen cambiar v1**:
  - **por código:** el servidor nuevo lee las operaciones del alumno por la API pública del Worker (`/v1/sync` con
    lote vacío, paginando), con el código que aporta el alumno;
  - **por fichero:** el alumno sube la copia que v1 ya sabe guardar.
- Un **conversor** en el núcleo pasa cada operación de v1 a eventos nuevos, con su fecha original; lo que no tiene
  equivalente fino entra como `importado_v1`. Los ids se derivan de los de v1: repetir la importación no duplica.
- El código de v1 se usa en la petición y **no se guarda**. Queda constancia en `importaciones_v1` (sin el código).
- Casos dorados comprueban que el progreso importado coincide con el que v1 muestra.

## Alternativas

- **Mudanza obligada con aviso en v1 (versión anterior):** exige tocar v1 y forzar un calendario.
- **Añadir una exportación nueva a v1:** contradice «v1 no se toca» y no hace falta: la API pública y la copia ya existen.
- **Volcar D1 entero al servidor nuevo:** traería datos de personas que no lo han pedido, sin base legal, y necesita
  credenciales de producción de v1.
- **No importar:** castiga a los alumnos más fieles.

## Consecuencias

- La importación por código depende de que el Worker de v1 siga en pie; la de fichero, no.
- El servidor nuevo hace peticiones de lectura a v1 dentro de sus límites de tasa (una importación son pocas llamadas).
- No viajan los ajustes del aparato, el examen a medias, el bloc ni la carta escaneada.
- Si un día se cierra v1, conviene avisar antes y dejar un periodo para importar: decisión del dueño.
