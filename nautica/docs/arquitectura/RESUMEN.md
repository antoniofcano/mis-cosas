# «Patrón» 2.0 en una página

Para el dueño. El detalle técnico está en [`ARQUITECTURA-V2.md`](ARQUITECTURA-V2.md) y el plan, en
[`PLAN.md`](PLAN.md). _17 de noviembre de 2026 (segunda versión: producto nuevo)._

## Qué se va a construir

Un **producto nuevo**, aparte de la app actual. Patrón tal como está ha cumplido como maqueta: ha definido el método
y lo ha probado con el material. Se queda donde está, funcionando y sin tocar, mientras al lado se construye el
servicio de verdad:

- **Casa propia:** dominio, repositorio y servidor propios (tu VPS), con una base de datos seria, copias diarias fuera
  de la máquina y una restauración que se ensaya cada semana.
- **La app sigue abriendo aunque el servidor se caiga**: la web y el audio van por una red de distribución y todo lo
  necesario para estudiar está en el móvil.
- **Sin registro obligatorio:** se puede estudiar sin cuenta; quien quiera, entra con su correo (sin contraseñas),
  ve sus aparatos, descarga sus datos o los borra.
- **Academias:** el profesor reparte un código, ve cómo van sus alumnos (solo si cada uno acepta) y un centro nunca
  ve nada de otro.
- **Cobro:** pases para particulares y canon trimestral por alumno activo para centros.
- **Una red de seguridad automática:** nada llega a los alumnos sin pasar pruebas y sin tu aprobación.

## Qué se aprovecha de la app actual

- **Todo el contenido** (preguntas de los tres tribunales, explicaciones, clases, resoluciones de carta, láminas,
  pódcast), que es lo más valioso: se importa con una herramienta que lo revisa pieza a pieza.
- **El método:** las cuentas de náutica y de carta se trasladan tal cual; el plan de estudio y el registro del
  progreso se rehacen más limpios. En los dos casos **la app actual hace de juez**: se le hacen miles de preguntas y
  el producto nuevo tiene que contestar lo mismo.
- **El progreso de tus alumnos**, si quieren traerlo: escriben su código y aparece. Sin prisa y sin obligación.

Lo que no se aprovecha es lo que la auditoría encontró flojo: la interfaz por dentro, cómo se guarda el progreso en el
móvil, el servidor y la forma de publicar.

## En qué orden

| Cuándo (con 20 h a la semana) | Qué | Resultado |
| --- | --- | --- |
| **Ahora – Navidad** | Repositorio, pruebas automáticas, dominio, servidor con copias, y una primera función completa en pruebas | Se puede abrir en tu móvil una tanda de preguntas de verdad |
| **Diciembre – abril** | Importar el contenido; trasladar y rehacer el método contra la app actual | El «motor» nuevo da lo mismo que el antiguo |
| **Febrero – mayo** | Servidor: progreso, aparatos, cuentas | |
| **Abril – julio** | La app del alumno, pantalla a pantalla, con tu visto bueno | |
| **Agosto – septiembre de 2027** | Privacidad, prueba con 10–20 personas | **Lanzamiento para particulares, gratis** |
| **Septiembre – noviembre** | Academias | **Piloto con 1–3 centros a final de 2027** |
| **Diciembre – enero** | Cobro | **Se puede cobrar: febrero de 2028** |
| **Hasta la primavera de 2028** | Lo que falte para igualar a la app actual (mesa de cartas, pódcast…) | Ya no hace falta la app antigua |

**Se puede empezar hoy.** Como nada de esto toca la app actual, no hay que esperar a tu examen de marzo: tú sigues
estudiando con la de siempre.

## Cuánto tiempo

| Tu dedicación | Lanzamiento para particulares | Academias (piloto) | Cobro |
| --- | --- | --- | --- |
| **20 horas a la semana** | Septiembre de 2027 | Noviembre–diciembre de 2027 | Febrero de 2028 |
| **10 horas a la semana** | Mayo de 2028 | Septiembre–octubre de 2028 | Enero de 2029 |

Son entre 57 y 74 semanas de trabajo. Los agentes escriben deprisa; lo que marca el ritmo es tu tiempo para revisar y
decidir. **Con 10 horas, las academias no llegan en el primer año**: habría que recortar el primer lanzamiento o
apoyarse en alguien más para revisar.

El plazo es parecido al del plan anterior (migrar poco a poco). Lo que cambia: no se arriesga la app que usan tus
alumnos y el resultado no arrastra nada de la maqueta. El precio: **no hay nada publicado hasta el primer lanzamiento**.

## Cuánto cuesta al mes

| Concepto | €/mes |
| --- | ---: |
| Tu VPS de OVH | Ya lo pagas |
| Dominio | ≈ 1 |
| Red de distribución, audio, DNS (Cloudflare, plan gratuito) | 0 |
| GitHub con repositorio privado y aprobaciones | ≈ 4 |
| Copias de seguridad fuera del VPS | < 1 |
| Envío de correos de acceso | 0–2 |
| **Total fijo nuevo** | **≈ 6–8** |

Aparte: la comisión de cada cobro (con Stripe, alrededor del 1,5 % + 0,25 €), la revisión de los textos legales por un
profesional (un pago único) y lo que ya gastes en los modelos de IA. La app actual sigue costando lo mismo que hoy.

## Lo que te toca decidir

| # | Decisión | Para cuándo |
| ---: | --- | --- |
| 1 | **Nombre del dominio** (`.es` o `.com`) y comprarlo | Ya |
| 2 | **Cuántas horas a la semana** puedes dedicar de verdad: fija todo el calendario | Ya |
| 3 | Repositorio **privado** (recomendado mientras no estén claros los derechos del contenido) | Ya |
| 4 | Qué más hay en el VPS y si tiene tamaño suficiente (recomendado: 2 núcleos, 4 GB) | Diciembre |
| 5 | Dónde guardar las copias y con quién enviar el correo (proveedores europeos, céntimos al mes) | Diciembre |
| 6 | **Derechos de las preguntas y de la carta:** sin aclararlos no se puede cobrar. Conviene empezar la gestión ya | Antes de finales de 2027 |
| 7 | **Hablar con 5–10 academias y apalabrar 2–3 centros piloto** | Primavera de 2027 |
| 8 | Dar el visto bueno a cada pantalla nueva frente a la actual | Abril–julio de 2027 |
| 9 | Un profesional que revise la política de privacidad y el contrato con los centros | Verano de 2027 |
| 10 | **Qué hacer con la app actual** tras el lanzamiento: cerrarla con aviso o dejarla como demostración (hoy no tiene política de privacidad ni forma de borrar datos) | Otoño de 2027 |
| 11 | **Cómo cobrar:** Stripe llevando tú las facturas y el IVA (más barato) o un intermediario que lo lleve por ti (unas tres veces más comisión). Con tu asesor | Otoño de 2027 |
| 12 | Dar por buena la regla de borrar los datos de quien lleve 24 meses sin entrar | Verano de 2027 |

Lo demás (herramientas, base de datos, forma de desplegar) está decidido y razonado en los documentos. La librería de
interfaz se confirma con la primera función completa, antes de Navidad, sin que tengas que hacer nada.
