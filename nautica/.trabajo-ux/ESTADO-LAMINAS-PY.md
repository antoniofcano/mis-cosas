# Láminas del PY en estilo C — estado

Rama `feat/laminas-py`. Guía: `docs/ESTILO-LAMINAS.md` (apéndice con la fuente de cada lámina).

## Inventario de la galería del PY (95 láminas al empezar; 12 ya en estilo C)

Orden de migración por rentabilidad para el alumno de PY. `C` = en estilo C; `I` = interactiva.

### 1. Carta (UT 3 y 4)

| Lámina (spec) | Estado |
| --- | --- |
| nortes (dm, desvio) · I | C (esta rama) |
| rosa (rumbo, demora, marcación) · I | C (esta rama) |
| abatimiento babor / estribor · I | C (esta rama) |
| corriente efectivo / rumbo a dar · I | C (esta rama) |
| enfilacion (dv, da) | C (esta rama) |
| demoras (dos simultáneas) | C (esta rama) |
| demoras modo traslado · I | C (esta rama) |
| loxodromica (triángulo) | C (esta rama) |
| loxodromica modo triangulo · I | C (esta rama) |
| tangente-viento | pendiente |
| traves-derrota | pendiente |
| corriente-desconocida | pendiente |
| loxo-orto | pendiente |
| coordenadas (esfera, lugar, diferencias) | pendiente |
| husos (husos, cálculo e/w, oficial) | pendiente |
| radar-pantalla, radar-respondedores, gnss, gnss-calculos, carta-raster-vectorial, ais, avisos-navegantes | pendiente (UT 3, no de carta) |

### 2. Mareas y meteorología (UT 2 y 3)

| Lámina | Estado |
| --- | --- |
| marea curva / duodécimos / sonda · I | C (piloto) |
| marea fases (vivas y muertas) | pendiente |
| meteo borrasca / anticiclón | C (piloto) |
| meteo buys-ballot, isobaras · I, frentes · I, frente-frio-corte, frente-calido-corte, nieblas (3) · I, brisas (2) | pendiente |
| viento-aparente (5), beaufort, modelos-viento, vientos-regionales (2), humedad, psicrometro, nubes, nubes-pisos, ola (2), corriente-estrecho (2) | pendiente |

### 3. Seguridad (UT 1)

| Lámina | Estado |
| --- | --- |
| estabilidad estable / inestable · I | C (piloto) |
| hombre-al-agua boutakow / anderson | C (piloto) |
| barco (partes) | C (piloto) |
| busqueda cuadrado / sectores, fuego tetraedro / clases, movimiento (3), socorro, superficies-libres | pendiente |
| arnes (2), balsa (4), extintor (2), helicoptero (3) | pendiente |

## Hecho

- Grupo 1a (carta): nortes, rosa, abatimiento, corriente, enfilación, dos demoras, traslado de demoras y estima
  loxodrómica (fija e interactiva). Piezas nuevas en `estilo-c.js`: `junto()` y `colocaEtiquetas()`. Láminas fijas en
  `src/illustrations/carta-c.js`; las interactivas siguen en `src/illustrations/interactivas/`.

## Verificación

- Capturas en `scratchpad/lpy-capturas/` (`antes-*` y `despues-*`), claro y oscuro, 390 (360/990 en las principales).
- El único error de consola en las clases es un 404 previo (recurso que no está en el repositorio), igual antes y después.
