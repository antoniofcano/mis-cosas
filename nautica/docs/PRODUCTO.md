# Producto como servicio y modelo de negocio

Qué se ofrece, a quién y a qué precio. **Es un documento de diseño con hipótesis, no un compromiso**: lo que está
medido se marca como _dato_, lo que no, como _hipótesis_, y los huecos se listan al final. La arquitectura y los
requisitos técnicos que se derivan de aquí están en `docs/VERSION-2.md`; el estado de cada línea, en `docs/ROADMAP.md`.

_Última revisión: 12 de octubre de 2026. Base: investigación de mercado de esa fecha (no versionada)._

## 1. Qué es el producto

Un preparador de los exámenes teóricos de recreo (PER y Patrón de Yate hoy; PNB y Capitán después) que no solo
reparte tests:

- **Contenido verificado con su fuente:** bancos por tribunal (Andalucía, DGMM, Baleares), láminas, animaciones y
  fichas con apéndice de fuentes.
- **Carta paso a paso:** ejercicios de examen resueltos y comprobados contra la geometría, con las herramientas de la
  mesa de cartas (regla, compás, transportador).
- **Un modelo de preparación honesto:** «estoy listo» con olvido y margen, repaso con fichas, plan hasta el examen.
- **Sincronización sin cuentas:** el progreso viaja entre dispositivos con un código de alumno.
- **Diseño pensado para gente mayor** y uso sin conexión (PWA instalable, sin tienda de apps).

## 2. Mercado

**Dato (Baleares, única estadística pública leída entera):** en 2024, 2.960 solicitudes de examen teórico, 3.017 PER
expedidos o renovados, 507 PY y 264 CY. «Expedidos o renovados» mezcla ambos conceptos y las solicitudes son de
exámenes, no de personas.

**Hipótesis:** extrapolar a España es especulación. Si Baleares fuera el 10–20 % del total saldrían 15.000–30.000 PER
al año; la horquilla es una suposición, no un dato. Hay que pedir por transparencia los presentados y aprobados por
convocatoria y el listado de escuelas registradas.

**Referencia de otro mercado (Francia, prensa especializada de septiembre de 2026):** 86.536 permisos de recreo tras
examen en 2025, frente a 111.984 en 2022. Sirve para ver que el volumen cae, no para calibrar España.

## 3. Competencia (resumen)

| Qué hay | Lo que hacen | Precio observado |
| --- | --- | --- |
| Apps de test PER/PY | Bancos de preguntas, simulacros, a veces sincronización | 4–5 €/mes; una a 8,99 €/mes, 49,99 €/año o 89,99 € de pago único |
| Campus online de teoría | Vídeo, tutoría y material | 69–289 € por la teoría del PER (8 fuentes) |
| Carta digital | Un campus la vende como extra de su curso; hay una web gratuita sobre cartografía abierta, no sobre la carta oficial | Extra dentro de un curso de ~250 € |
| Software de test para autoescuelas | Panel de gestión y alta de alumnos | El único precio B2B público comparable: 180 €/año por centro |
| Panel de profesor en náutica | Existe en un campus, sin precio publicado | — |

**Huecos:** ninguna app de tienda verificada ofrece ejercicios de carta resueltos; ninguna oferta náutica publica
precio de panel de profesor ni de licencia a centros. Ojo: la sincronización por código **no** es exclusiva (otra app ya
la declara), así que no es un argumento de venta por sí sola.

**Límites de la investigación:** no se vieron reseñas de Google Play ni precios de sus compras; los precios
presenciales y de PY/CY salen en buena parte de un único agregador interesado; no hay datos de conversión ni de abandono
tras aprobar específicos del sector.

## 4. Segmentos y propuesta de valor

| Segmento | Qué necesita | Qué recibe |
| --- | --- | --- |
| Alumno suelto | Aprobar el examen con el mínimo gasto y estrés | Pases por tiempo, nivel gratuito útil, garantía «hasta aprobar» |
| Academia o profesor autónomo | Ahorrar tiempo de clase, saber quién llega mal, dar tutorías | Código de centro, seguimiento, aula virtual con carta y láminas |
| Club o escuela con varios grupos | Lo mismo, a escala | Tramos por alumno activo, informes por grupo |

Las academias son, en su mayoría, autónomos o pequeñas empresas: el canon se diseña **para que siempre les salga a
cuenta** (ver §6) y la herramienta no sustituye su clase, la amplía.

## 5. Planes para particulares

Principios: **pago por tiempo, sin renovación automática** (quien aprueba se va; los alumnos mayores desconfían de las
suscripciones), un nivel gratuito que muestre el valor y una garantía clara.

| Plan | Precio (IVA incl.) | Duración | Notas |
| --- | --- | --- | --- |
| Gratis | 0 € | sin límite | Contenido de entrada, un test al día, una muestra de la carta |
| Pase Mes | 9,90 € | 30 días | Para la recta final |
| Pase PER | 24,90 € | 3 meses | |
| **PER hasta aprobar** | 39,90 € | 6 meses, +3 si no se aprueba | Garantía de ampliación |
| Pase PY | 49,90 € | 6 meses | Incluye la carta del PY |
| **Combo PER + PY** | 79,90 € | 12 meses | |
| **Promoción «¡Aprobé!»** | cupón de 10–15 € | sobre el nivel siguiente, 12 meses para usarlo | De un solo uso |

Todos los precios son **hipótesis** apoyadas en el rango observado (4–5 €/mes en apps, 69–289 € en campus, mediana anual
de educación en apps de suscripción de unos 45 $ según un informe del sector). Se contrastan con el piloto.

**Cupón «¡Aprobé!»:** botón en la app que, declarando el aprobado, genera un código de descuento para la titulación
siguiente (PER → PY → CY). Se declara a mano: a este volumen no compensa verificarlo, y de paso mide cuántos aprueban y
suben de nivel.

**Cobro:** a través de un comerciante de registro (Paddle o Lemon Squeezy) que gestiona el IVA internacional, con un
coste de ~5 % + 0,50 $ por operación. Orden de magnitud neto, **estimado** (IVA 21 %, 0,50 $ ≈ 0,50 €): Pase PER
≈ 19 €, Pase Mes ≈ 7 €. El fijo de 0,50 pesa en los tickets bajos. Evita la tienda de apps (15–30 % de comisión).

## 6. Plan para academias (modelo mixto)

Servicio abierto para todos y, si la academia paga, **sus alumnos entran gratis** con un código de centro y el profesor
ve su progreso. Pensado para que el autónomo gane siempre:

- **Se paga por alumno activo** (con actividad en los últimos 30 días), no por matriculado.
- **Cuota trimestral con meses de pausa** (verano y periodos sin curso): la cuota sigue la estacionalidad del negocio.
- **Sin permanencia**, mes de prueba con hasta 10 alumnos.
- **Precio por alumno decreciente.** En euros, sin IVA:

| Tramo | Alumnos activos | Cuota trimestral | €/alumno/trimestre |
| --- | --- | --- | --- |
| Tutor | hasta 15 | 45 € | 3,00 |
| Escuela | hasta 50 | 150 € | 3,00 |
| Academia | hasta 120 | 330 € | 2,75 |
| A medida | más de 120 | desde 2,50 €/alumno | 2,50 |

Referencia: una academia que cobra 100–300 € por curso gasta un 1–3 % en la herramienta. **Hipótesis:** el canon se
apoya en una sola tarifa B2B pública comparable (180 €/año por centro en software de test para autoescuelas) y en una
cifra de blog sin metodología (500–1.000 €/año para plataformas completas). Hay que validarlo con 5–10 conversaciones.

### Qué incluye el canon

1. Acceso completo de los alumnos del centro (sin pase propio) con código de centro, sin cuentas ni contraseñas.
2. **Vista de profesor:** actividad, preparación por tema, quién va en riesgo, informe semanal; **siempre con el
   consentimiento del alumno**.
3. **Aula virtual** (ver §7), incluida sin cargo aparte.
4. Marca del centro y fecha de su próxima convocatoria.

### Qué NO se promete

Ni vídeo propio, ni grabación de clases, ni integraciones de gestión de alumnos. El centro conserva su relación con el
alumno y sus propios cursos.

## 7. Aula virtual

El valor diferencial frente a una videollamada genérica es la **mesa compartida con nuestro contenido**, no el vídeo.

- Profesor y alumno entran en una **sala con código** y ven el mismo contenido nativo: carta con regla, compás y
  transportador (cada uno ve en vivo los trazos del otro), láminas con puntero, y preguntas de test lanzadas por el
  profesor con resultados al instante. Hay chat de texto.
- Lo que viaja son operaciones (trazos, posición, mensajes), no imagen: pesa poco y se ve nítido.
- **La voz y el vídeo se resuelven fuera:** botón «abrir sala» que genera un enlace de una videollamada externa, o la
  voz por el medio que ya usen. Voz integrada solo si los profesores lo piden, y empezando por clases de uno a uno.
- Incluida en el canon: el coste marginal es de céntimos mientras no se aloje vídeo.
- **Dependencia previa:** aclarar el permiso del Instituto Hidrográfico de la Marina para mostrar su carta (§9).

## 8. Economía

**Costes (orden de magnitud, a verificar en las páginas oficiales antes de comprometer):** plan de pago de Workers
(~5 $/mes), base de datos gestionada (0–25 $/mes según proveedor), dominio, comisiones de pago. El coste dominante es el
tiempo de desarrollo y de soporte, no la infraestructura.

**Escenarios de ingresos, no previsiones** (bruto, sin comisiones ni impuestos):

| Escenario | Supuestos | Ingreso anual |
| --- | --- | --- |
| Particulares, bajo | 300 pases PER a 24,90 € | ≈ 7.500 € |
| Particulares, medio | 1.000 pases a 25 € | ≈ 25.000 € |
| Academias, bajo | 10 centros × 25 alumnos activos × 12 €/año | ≈ 3.000 € |
| Academias, medio | 30 centros × 35 alumnos activos × 12 €/año, 70 % de actividad media | ≈ 8.800 € |

Es una cifra de complemento más que de empresa; las academias aportan sobre todo **captación y retención**, no el grueso
del ingreso. La conversión de gratis a pago de blogs del sector (2–4 %) no se ha verificado en fuente primaria.

## 9. Riesgos y condiciones previas

| Riesgo | Condición para cobrar |
| --- | --- |
| Derechos de las preguntas oficiales | Aclararlos con la administración que corresponda |
| Carta oficial del IHM | Permiso escrito o cartografía propia; hoy el catálogo prohíbe reproducirla sin permiso |
| Origen del contenido | Verificar que es original o está limpio de derechos antes de venderlo a terceros |
| Protección de datos | Política de privacidad, contrato de encargado del tratamiento con los centros, consentimiento del alumno para compartir progreso, chat sin retención larga |
| Estacionalidad | Ventas concentradas antes de cada convocatoria; el plan de pausas y el combo la amortiguan |
| Abandono al aprobar | Ruta PER → PY → CY y cupón «¡Aprobé!» |
| Un solo desarrollador | Documentación, pruebas y automatización (`docs/VERSION-2.md`) |

## 10. Puertas de decisión

Las cifras son una propuesta del autor, para cambiar:

1. **Antes de invertir en V2:** 90 días con ~30 clientes de pago o un centro dispuesto a pagar. Si no, el producto se
   mantiene gratuito y mínimo.
2. **Antes de cobrar:** derechos y política de privacidad resueltos.
3. **Antes de fijar el canon:** 5–10 conversaciones con autónomos y escuelas y un piloto de un mes con 2–3 centros.

## 11. Huecos de información

No hay: cifras nacionales de títulos y presentados; descargas e ingresos de las apps competidoras; reseñas de Google Play;
conversión y abandono tras aprobar en el sector; comisión de los marketplaces a las escuelas; ningún precio B2B
específico del sector náutico. Los precios y rangos de este documento hay que actualizarlos al contrastarlos.
