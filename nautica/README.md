# Carta Náutica — preparación de ejercicios prácticos (PER · Patrón de Yate)

Aplicación web estática, gratuita y sin dependencias para practicar los ejercicios de carta náutica
de los exámenes de **Patrón de Embarcaciones de Recreo (PER)** y, más adelante, **Patrón de Yate (PY)**.

- **Ejercicios por tipo**, generados con datos nuevos cada vez sobre la zona del Estrecho (carta 102).
- **Corrección automática** con tolerancias de examen y **diagnóstico de errores típicos**
  (signo de la Ct, demora sin invertir, corriente al revés, olvidar el traslado…).
- **Pistas paso a paso** y **construcción gráfica** progresiva en la carta (SVG).
- **Herramienta de medición** en la carta: rumbo y distancia entre dos puntos, coordenadas del cursor.
- **Preguntas reales de examen** (Andalucía) con la respuesta de la plantilla oficial.
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
| Aguja | Conversión de rumbos y Ct · Ct y desvío por enfilación |
| Estima | Situación de estima · Rumbo y distancia entre dos puntos (ETA) |
| Situación | Demora y distancia · Dos demoras simultáneas (o marcaciones) · Demoras no simultáneas |
| Corrientes | Rumbo/velocidad efectivos · Rumbo a dar · Calcular la corriente |
| Viento | Abatimiento (Rs y rumbo a dar) |

Ver [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) para la arquitectura y cómo añadir tipos nuevos.

## Aviso

Es una herramienta de estudio. La carta es una representación simplificada de la zona; las
coordenadas de los puntos proceden de fuentes públicas (ver `data/`). Practica también el trazado
con transportador y compás sobre la carta 102 en papel.
