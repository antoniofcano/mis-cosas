# Versión 2.0: refactorización y arquitectura de servicio

Plan para pasar de prototipo a servicio de formación con cuentas de centro, cobro y aula. Es el documento vivo de la
refactorización: cada fase es una línea mantenible con id `V2-xx` y se cita desde `docs/ROADMAP.md`. El producto y el
negocio que lo justifican están en `docs/PRODUCTO.md`.

_Última revisión: 12 de octubre de 2026. Las estimaciones son de orden de magnitud, no compromisos._

## 1. Estado de partida

**Se conserva, porque es lo valioso:**

- El contenido verificado y sus fuentes: bancos por tribunal, fichas, láminas con apéndice, cuarentena de convocatorias
  reservadas, informe de discrepancias.
- Los motores puros (`estoyListo`, repaso espaciado, travesía, plan, fusión de operaciones) con sus más de 2.200
  pruebas: son la red de seguridad de cualquier refactor.
- El modelo de operaciones de la sincronización (`docs/SYNC.md`) y el sistema de diseño de estilo C.

**Es prototipo hoy:**

| Área | Estado actual | Riesgo |
| --- | --- | --- |
| Código | JavaScript sin tipos ni empaquetado | Cambios con miedo; sin garantías en las fronteras |
| Contenido | JSON grandes en el repo, sin esquema formal ni flujo editorial | Un error de dato se publica igual que un cambio de código |
| Integración | Los tests los lanza el desarrollador; no hay puerta automática antes de publicar | Una regresión llega a producción |
| Identidad | Código de alumno, sin cuentas ni roles | Sin profesor, centro ni cobro |
| Datos | En el aparato y en una tabla de operaciones (Cloudflare D1) | Sin analítica de aprendizaje ni informes |
| Operación | Sin registros, alertas ni copias probadas del servicio | Una pérdida de datos solo se descubre cuando un alumno se queja |
| Cumplimiento | Sin política de privacidad ni derechos del RGPD | Bloquea cobrar |

Lección que motiva la fase 0: una orden de borrado sin condición sobre producción eliminó alumnos reales y solo se supo
por un aviso del alumno (corregido con la recomposición automática de #134). En un servicio profesional eso no debe poder
ocurrir.

## 2. Principios

1. **Estrangulamiento, no reescritura.** Cada pieza nueva envuelve a la vieja y la sustituye cuando la iguala en
   pruebas. El motor de repaso y la fusión no se tocan salvo para tiparlos.
2. **Contratos primero:** esquemas de contenido y especificación de la API antes del código.
3. **Cada paso se publica y se deshace,** con interruptores de funcionalidad.
4. **Pruebas de caracterización antes de mover nada.**
5. **Medir antes de optimizar:** presupuestos de tamaño, CPU y errores.
6. **Consumo optimizado** (requisito del autor): nada que haga trabajo por usuario inactivo; límites en cada ruta.
7. **Nunca operaciones destructivas sin condición sobre producción;** toda migración con copia previa y verificación.
8. **Portabilidad:** ningún dato atrapado en un modelo propietario.

## 3. Arquitectura objetivo

```
 PWA (cliente)  ──────────────►  API (Cloudflare Workers)  ──────►  PostgreSQL (UE)
  · núcleo TS sin interfaz         · autenticación, roles            sistema de registro:
  · sin conexión + operaciones     · límites, validación             cuentas, centros, grupos,
  · mesa de cartas, láminas        · pagos (webhooks)                pases, cupones, progreso,
        │                          · avisos (push, cron)             auditoría
        │ WebSocket                                                      ▲
        ▼                                                                │ al cerrar la clase
  Sala en tiempo real (Durable Objects) ──────────────────────────────────┘
        pizarra, chat, test en clase (estado efímero)

 Contenido (repo + empaquetado) ──► paquetes versionados y firmados ──► cliente
 Pagos: comerciante de registro (IVA y facturación)  ──► webhook ──► pases en Postgres
```

### 3.1 Contenido como producto

Repositorio con **esquema formal** para preguntas, lecciones y láminas; **estados** (borrador, verificado, publicado) y
**versión semántica por banco**. Cada pregunta y lámina guarda su fuente y la fecha de verificación. Un paso de
empaquetado genera paquetes firmados que consume el cliente. Las convocatorias reservadas siguen la cuarentena.

### 3.2 Núcleo de aprendizaje

Paquete **TypeScript sin interfaz** con el modelo de memoria, repaso, preparación, ruta y plan. Es el corazón y lo más
probado: los mismos 2.200 tests, ahora sobre el paquete.

### 3.3 Cliente

PWA con empaquetado, TypeScript y componentes. El estilo C pasa a un paquete de componentes con accesibilidad WCAG 2.2 AA
auditada. Mantiene el uso sin conexión y el registro de operaciones.

### 3.4 Servicio e identidad

- **Cuentas opcionales** que se vinculan al código de alumno actual (nadie pierde su progreso al registrarse).
- **Roles:** alumno, profesor, administrador de centro, administrador del servicio.
- **Derechos de acceso** por titulación y por pase; código de centro que da acceso a los alumnos mientras el centro esté
  al corriente.
- **Seguridad por filas** en la base de datos: una academia nunca ve datos de otra aunque falle el código.
- Sincronización y avisos existentes, migrados sin cambiar su contrato.

### 3.5 Base de datos: PostgreSQL

D1 (SQLite gestionado) basta para el prototipo, pero el producto necesita relaciones (centro → profesor → grupo →
alumno → pase → cupón), transacciones, seguridad por filas, copias con restauración a un punto en el tiempo, migraciones
versionadas y región UE. **Proveedor sin decidir** (gestionado y portable; se compara al llegar a V2-F4). Acceso desde
Workers (Cloudflare ofrece un servicio de conexión, Hyperdrive; comprobar su estado y precio).

**Decisión registrada:** no se usa Firebase. Su ventaja (tiempo real y autenticación listos) no compensa: coste menos
predecible con muchas escrituras pequeñas, encaje pobre con una identidad por código sin cuentas (obligaría a tokens
personalizados y funciones de servidor igualmente), modelo difícil de portar y rehacer lo ya probado. Plan B solo para la
sala en tiempo real si Durable Objects no cumple en el prototipo de V2-F5.

### 3.6 Aula

- **Vista de profesor:** cohortes, informes de progreso, avisos de inactividad, exportación en formatos estándar de
  formación (xAPI).
- **Sala virtual:** mesa compartida (carta, láminas, test en clase) con chat de texto; vídeo y voz fuera, con enlace
  externo (`docs/PRODUCTO.md` §7).

### 3.7 Pagos y derechos

Comerciante de registro (Paddle o Lemon Squeezy; comparar al llegar a V2-F4). Webhooks idempotentes que crean, amplían o
caducan pases y cupones; nunca fiarse del cliente para saber quién ha pagado.

### 3.8 Operación

Registros estructurados, alertas, copias de seguridad **probadas con restauración real**, plan de recuperación,
objetivos de disponibilidad, solicitud de borrado/exportación por alumno, registro de auditoría de accesos de profesor.

## 4. Requisitos nuevos (respecto al prototipo)

| Id | Requisito | Fase |
| --- | --- | --- |
| V2-R1 | Cuentas opcionales con vinculación del código de alumno actual sin pérdida de progreso | F4 |
| V2-R2 | Roles y seguridad por filas entre centros | F4 |
| V2-R3 | Pases por tiempo, «hasta aprobar», combo, cupón de ascenso y garantía de ampliación | F4 |
| V2-R4 | Código de centro con acceso mientras el centro esté al corriente | F4 |
| V2-R5 | Cobro del canon por alumno activo, trimestral, con meses de pausa | F4–F5 |
| V2-R6 | Consentimiento del alumno para compartir su progreso con el profesor, revocable | F5 |
| V2-R7 | Vista de profesor: cohortes, riesgo, informe semanal, exportación xAPI | F5 |
| V2-R8 | Sala virtual: carta, láminas y test en clase en tiempo real, con recuperación tras cortes | F6 |
| V2-R9 | Chat efímero (sin retención larga) | F6 |
| V2-R10 | Política de privacidad, contrato de encargado del tratamiento, exportación y borrado por alumno | F4 |
| V2-R11 | Permiso del IHM (o cartografía propia) antes de mostrar la carta en la sala y de cobrar por ella | previo a F6 |
| V2-R12 | Registro de auditoría de accesos de profesor a datos de alumno | F5 |
| V2-R13 | Presupuestos de consumo y límites por ruta, verificados en pruebas | F0 |

## 5. Plan por fases

Un desarrollador con ayuda de agentes bajo especificación y revisión. Tiempos orientativos; en total, 8–12 meses.

| Id | Fase | Contenido | Salida | Tiempo |
| --- | --- | --- | --- | --- |
| V2-F0 | Cimientos | Integración continua que bloquea si fallan tests, formato y tipos; TypeScript en lo nuevo; registro de decisiones; presupuestos de consumo; protocolo de operaciones sobre producción | Nada llega a producción sin pasar | 2–3 semanas |
| V2-F1 | Contenido como producto | Esquemas, estados editoriales, versiones, fuentes obligatorias, paquetes firmados | Un cambio de contenido tiene revisión y versión | 4–6 |
| V2-F2 | Núcleo | Extraer los motores a un paquete tipado con contratos | Los mismos tests sobre el paquete | 3–4 |
| V2-F3 | Cliente | Empaquetado, TypeScript, componentes, auditoría de accesibilidad | Misma app, medible y mantenible | 6–8 |
| V2-F4 | Servicio e identidad | Cuentas, roles, derechos, Postgres, pagos, RGPD | Se puede cobrar y dar de baja | 6–8 |
| V2-F5 | Aula: profesor | Vista de profesor, cohortes, consentimiento, informes, exportación | Un centro puede usarlo | 6–8 |
| V2-F6 | Aula: sala virtual | Prototipo de sala (dos clientes, un trazo, recuperación), después carta, láminas y test en clase | Tutoría con contenido propio | 4–6 |
| V2-F7 | Operación | Registros, alertas, copias probadas, runbooks, soporte, analítica | Servicio con garantías | continuo |

**Orden condicionado por el negocio:** las fases 4–6 se adelantan si el piloto con centros pide la vista de profesor
antes que la modernización del cliente; las fases 1–3 pueden ir en paralelo si hay revisión externa.

## 6. Migración sin riesgo

1. Postgres solo para lo nuevo (centros, profesores, cupones, pagos); D1 sigue sirviendo el progreso.
2. Más adelante, volcar el progreso con **doble escritura y comparación** antes de cortar.
3. Copia exportable antes de cada cambio; ninguna orden destructiva sin condición ni sin copia verificada.
4. Interruptores de funcionalidad por cuenta/centro para probar con un piloto sin afectar al resto.

## 7. Puertas de decisión

| Puerta | Condición |
| --- | --- |
| Invertir en V2-F0–F2 | ~30 clientes de pago o un centro dispuesto a pagar en 90 días (`docs/PRODUCTO.md` §10) |
| Cobrar | Derechos de preguntas y carta aclarados; política de privacidad publicada |
| V2-F5 | Piloto con 2–3 centros que lo pidan y acepten el modelo de consentimiento |
| V2-F6 | Prototipo de sala superado y permiso del IHM |

## 8. Riesgos

- **Reescribir lo que funciona:** es el error más caro; se mitiga con el estrangulamiento.
- **Derechos del contenido y de la carta:** sin aclararlos no se puede cobrar.
- **Vigencia normativa:** el contenido caduca; hace falta revisión periódica (R-13).
- **Dependencia de una persona:** documentación, pruebas y automatización son el seguro.
- **Coste operativo imprevisto en la sala en tiempo real:** presupuestos y límites desde el prototipo.

## 9. Decisiones abiertas

- Proveedor de PostgreSQL gestionado (UE) y de comerciante de registro.
- Si se contrata revisión externa o un segundo desarrollador.
- Dedicación semanal del autor, que fija el calendario real.
- Estrategia de los datos de los alumnos que hoy no tienen cuenta: vinculación voluntaria o por centro.
