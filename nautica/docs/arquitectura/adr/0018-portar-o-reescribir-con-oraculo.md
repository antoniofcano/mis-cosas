# ADR 0018: Qué se porta y qué se reescribe; casos dorados generados con v1

- **Estado:** aceptada (sustituye a «Doble escritura y apagado del Worker»)
- **Fecha:** 17 de noviembre de 2026

## Contexto

El núcleo de v1 son ≈ 54.000 líneas de funciones puras con cobertura del 96–100 %: el método hecho código. El dueño
autoriza rehacerlo («no tengas miedo»), porque lo nuevo no puede romper lo que hay. Pero no todo merece el mismo
trato: hay matemática y normas que no ganan nada reescribiéndose, y hay piezas atadas al modelo de datos de la
maqueta, con funciones de complejidad 50–83, que sí.

## Decisión

**Criterio.** Se **porta tal cual** (se tipa, no se cambia la lógica) lo que es matemática o norma, está bien probado
y no depende de cómo se guarda el progreso. Se **reescribe** lo que arrastra el modelo de datos de v1, es demasiado
complejo o mezclaba lógica con interfaz. Nada se copia sin pasar por tipos, lint y pruebas.

| Se porta tal cual | Se porta como contenido | Se reescribe | No se lleva |
| --- | --- | --- | --- |
| `math`, `nautical`, `chart`, `exercises`, `analysis`, `graphics`, kit de resoluciones, fórmulas de repaso y de «estoy listo», reglas de examen, reserva y equivalentes, tubería de bancos, cuarentena | Resoluciones de carta, láminas | Plan de «Hoy», estado del alumno, examen final, ruta, semana, travesía, cuaderno; simulacros y corrección; eventos y pliegue | Interfaz, estilos, almacenamiento local, service worker, Worker, API `window.nautica`, voz, modo profesor por fichero |

**Oráculo.** `herramientas/oraculo` ejecuta v1, fijada a un commit, y genera **casos dorados**: todas las preguntas de
carta, ejercicios por tipo y semilla, corrección de hojas de respuestas, miles de historiales para repaso y plan,
reserva por tribunal, SVG de láminas y secuencias de operaciones. El código nuevo debe coincidir: exacto en lo
portado; con la tolerancia declarada en lo reescrito. Toda diferencia deliberada se apunta en
`docs/divergencias-v1.md`; una diferencia no apuntada es un fallo.

Las 2.581 pruebas de v1 se usan como fuente: las de módulos portados pasan casi literales; las demás, como especificación.

## Alternativas

- **Portarlo todo:** rápido, pero mete en el producto nuevo el modelo de progreso de v1 y sus funciones más enredadas.
- **Reescribirlo todo:** gasto sin beneficio en trigonometría y en un kit que ya da la respuesta oficial de cada pregunta.
- **Reescribir solo con las pruebas unitarias de v1:** cubren lo que alguien pensó probar; los dorados cubren todo el banco.
- **Depender de v1 en ejecución:** ataría los dos productos.

## Consecuencias

- El generador de dorados es de lo primero que se construye y condiciona el ritmo del núcleo.
- Los dorados heredan los fallos de v1: si v1 se equivoca, el oráculo también. Cada discrepancia sospechosa la decide
  una persona (o Opus, con fuente), no la mayoría.
- Cuando v1 cambie (contenido nuevo hasta el relevo), se regeneran los dorados afectados.
- Tras el relevo, los dorados quedan como pruebas de regresión del producto y v1 deja de ser necesaria.
