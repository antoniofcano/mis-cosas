# Guía de los guiones

Esta guía la siguen todos los episodios de «Patrón en voz alta», los escriba quien los escriba. Así suenan igual y la IA de voz los lee sin tropiezos. Hay dos series con el mismo formato: «Patrón de Yate en voz alta» y «PER en voz alta». El episodio de referencia es [`py/1-1-por-que-flota-y-por-que-vuelca.md`](py/1-1-por-que-flota-y-por-que-vuelca.md).

## Las voces

- **ELENA**, la divulgadora: patrona de yate y profesora, de unos 45 años. Es cálida, segura y con humor. Explica con ejemplos del barco y avisa de las trampas («ojo, que esto cae»).
- **ANDRÉS**, el alumno: jubilado, de unos 60 años, con un velero de nueve metros en el puerto. Pregunta lo que preguntaría cualquiera y cae en las trampas típicas del examen, para que Elena las desmonte. Hacia el final razona solo y acierta.

## Contenido

- Todo sale de las clases de la app (`data/curso/*.json`) y de las preguntas reales (`data/ejes/<eje>/<tit>/preguntas.json`). Si la clase no lo dice, el guion tampoco.
- Ni academias ni marcas.
- Las trampas se cuentan cuando aparecen en la conversación, no en una lista al final.
- Cuando el examen da por buena una respuesta que la clase marca como anticuada o discutible (primeros auxilios, alguna plantilla corregida), Elena dice la que puntúa en el examen y cuenta el matiz, igual que la clase.
- En los minijuegos de carta, Elena le da a Andrés el dato medido en la carta, y él razona el resto: qué tangente coger, la Ct, la demora opuesta.

## Estructura

1. **Gancho** (30–60 s). Una situación real en el barco de Andrés que el episodio acaba explicando.
2. **Explicación en diálogo.** Intervenciones cortas, de dos a cinco frases, que se alternan. Andrés interrumpe, resume con sus palabras y se equivoca alguna vez.
3. **Vuelta al gancho.** Andrés lo explica con lo aprendido.
4. **Minijuego.** Dos o tres preguntas de exámenes reales, leídas con sus opciones. Después va `[pausa larga]` y Andrés contesta razonando.
5. **Resumen para llevarse** (30–40 s), en cinco puntos dichos de corrido, y la despedida: «Hasta entonces, buena mar».

Los episodios **Panorama** recorren el tema entero sin bajar al detalle. Dicen qué hay en el tema, qué pesa en el examen y qué temas son eliminatorios. Su minijuego tiene una pregunta de cada epígrafe.

## Extensión

Cada guion tiene entre 1.600 y 2.300 palabras habladas, que son de diez a quince minutos.

Para contarlas:

```
grep '^\*\*' archivo.md | sed 's/\*\*[A-ZÉ]*:\*\*//; s/\[[^]]*\]//g' | wc -w
```

## Formato para la síntesis de voz

- **Cabecera YAML:** `serie`, `episodio`, `tipo` (bienvenida, panorama o profundiza), `tema`, `titulo`, `lecciones`, `duracion_estimada` y `voces`.
- **Intervenciones:** una por bloque, `**ELENA:** texto` o `**ANDRÉS:** texto`, con una línea en blanco entre bloques.
- **Acotaciones:** van entre corchetes y no se leen. Hay solo tres: `[pausa]` (un segundo), `[pausa larga]` (tres segundos, para pensar en el minijuego) y `[ríe]`.
- **Cifras:** en letra, por ejemplo «doscientos diez grados», «uno coma cero dos cinco», «las diecisiete diez».
- **Letras y siglas:** se escriben como se pronuncian.
  - Puntos: «ge», «ce», «eme», «ka», «ge-eme».
  - Siglas que se deletrean: «te-u», «a-i-ese», «ge-ene-ese-ese».
  - Siglas que se leen como palabra se dejan: «Salvamento», «radar».
  - La primera vez, Elena dice el nombre completo: «el tiempo universal, te-u».
- **Fórmulas:** dichas con palabras («ka-eme menos ka-ge», «distancia entre velocidad»), nunca con símbolos.
- **Dentro del diálogo:** sin tablas, listas, negritas, enlaces ni emojis.

## Nombres de archivo

`<titulacion>/<tema>-<n>-<titulo-corto>.md`, por ejemplo `py/1-1-por-que-flota-y-por-que-vuelca.md`. Al terminar un guion, se añade `"archivo"` a su episodio en `episodios.json` y se regenera el índice con `node podcast/indice.mjs`.
