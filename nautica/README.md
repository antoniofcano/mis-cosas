# Carta Náutica — preparación de ejercicios prácticos (PER · Patrón de Yate)

Aplicación web estática, gratuita y sin dependencias para practicar los ejercicios de carta náutica
de los exámenes de **Patrón de Embarcaciones de Recreo (PER)** y, más adelante, **Patrón de Yate (PY)**.

- **Ejercicios por tipo**, generados con datos nuevos cada vez sobre la zona del Estrecho (carta L105).
- **Corrección automática** con tolerancias de examen y **diagnóstico de errores típicos**
  (signo de la Ct, demora sin invertir, corriente al revés, olvidar el traslado…).
- **Pistas paso a paso** y **construcción gráfica** progresiva en la carta (SVG).
- **Herramienta de medición** en la carta: rumbo y distancia entre dos puntos, coordenadas del cursor.
- **72 preguntas reales de examen** (PER Andalucía 2020–2026, preguntas de carta) con la respuesta de la
  plantilla oficial y **resolución paso a paso calculada por la app** (con dibujo en la carta).
  La app resuelve 71 de ellas y en las 68 no anuladas elige la opción oficial: es la validación de los motores
  y de la carta (`tests/exams.test.js`).
- **Progreso** guardado en el navegador, exportable.
- **Preparada para asistentes IA** (Claude en Chrome / Cowork): resumen compacto `#ai-context`,
  API `window.nautica` y `llms.txt`.

## Uso

Necesita servirse por HTTP (los módulos ES no funcionan con `file://`):

```bash
cd nautica
npm start            # = python3 -m http.server 8080
# abre http://localhost:8080
npm test             # pruebas (Node ≥ 20, sin dependencias)
```

Publicación gratuita: GitHub Pages (Settings → Pages → rama y carpeta raíz). La app quedará en
`https://<usuario>.github.io/mis-cosas/nautica/`.

## Tipos de ejercicio (PER)

| Categoría | Ejercicio |
|---|---|
| Aguja | Conversión de rumbos y Ct · Ct por enfilación u oposición |
| Estima | Situación de estima · Rumbo de aguja, distancia y HRB de llegada · Rumbo para pasar a X millas de un faro |
| Situación | Demora y distancia · Dos demoras o marcaciones simultáneas · Oposición/enfilación + demora (distancia a faro) · Demoras no simultáneas |
| Corrientes (PY) | Rumbo/velocidad efectivos · Rumbo a dar · Calcular la corriente |
| Viento (PY) | Abatimiento (Rs y rumbo a dar) |

Los enunciados generados imitan los de Andalucía: declinación «4º NW» o «de la carta, 2° 50′ W 2005 (7′ E)»
(con actualización al año), desvío «+4º (más)», situaciones «a 4 millas al Sur verdadero del faro…», «al Sur
verdadero de A y al Oeste verdadero de B», coordenadas, puertos (Barbate, Algeciras, Ceuta, Tánger)…

Ver [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) para la arquitectura y cómo añadir tipos nuevos.

## Aviso

Es una herramienta de estudio. La carta de examen es la **IHM L105 Enseñanza «Estrecho de Gibraltar»**
(datum ED50). Las posiciones de faros y luces se han tomado de la NGA Pub. 113 y comprobado sobre un escaneo
georreferenciado de la L105 (ver `tools/source/notes.md`); la costa es de © OpenStreetMap contributors (ODbL),
simplificada. Preguntas de examen: Junta de Andalucía (enlace a cada cuadernillo y plantilla). Practica también el trazado
con transportador y compás sobre la carta L105 en papel.
