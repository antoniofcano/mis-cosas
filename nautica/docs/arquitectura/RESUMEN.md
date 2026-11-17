# «Patrón» 2.0 en una página

Para el dueño. El detalle técnico está en [`ARQUITECTURA-V2.md`](ARQUITECTURA-V2.md) y el plan, en
[`PLAN-MIGRACION.md`](PLAN-MIGRACION.md). _17 de noviembre de 2026._

## Qué se va a construir

La misma app que conoces, convertida en un servicio que se puede vender a academias y cobrar:

- **Casa propia:** dominio propio y un repositorio solo para Patrón (hoy vive en una carpeta, junto a otros proyectos).
- **Una red de seguridad automática:** ningún cambio llega a los alumnos sin pasar pruebas y sin tu aprobación.
- **Servidor propio** en tu VPS, con una base de datos seria, copias diarias fuera de la máquina y una restauración
  que se ensaya cada semana. La web y el audio van por una red de distribución, así que **la app sigue abriendo
  aunque el servidor se caiga**.
- **Cuentas opcionales:** el alumno sigue pudiendo estudiar sin registrarse; quien quiera, entra con su correo (sin
  contraseñas). Puede ver sus aparatos, cerrarlos, descargar sus datos y borrarlos.
- **Academias:** el profesor reparte un código, ve cómo van sus alumnos (solo si cada alumno acepta) y un centro
  nunca ve nada de otro.
- **Cobro:** pases para particulares y canon trimestral por alumno activo para centros.
- **Una interfaz rehecha por dentro**, igual por fuera, mucho más rápida de abrir (de 403 descargas a unas 15).

## Por qué

La auditoría encontró que **el motor es mejor de lo que pensabas** (las cuentas, el plan de estudio, la carta y la
sincronización están bien hechos y bien probados) y que **lo que lo rodea es de prototipo**: se publica a mano y sin
pruebas, comparte dirección con otros sitios, no hay copias ni alertas, no hay cuentas ni forma de borrar los datos de
un alumno, y el servidor no sabe qué es una academia. Por eso **no se tira ni se reescribe todo**: se conserva el motor
y se sustituye la carcasa poco a poco, con la app funcionando todo el tiempo.

## En qué orden

| Cuándo | Qué | ¿Lo notas tú o los alumnos? |
| --- | --- | --- |
| **Ahora – Navidad** | Repositorio nuevo, pruebas automáticas, audio fuera, dominio comprado | No |
| **Enero – febrero** | Pruebas de cada pantalla; servidor preparado con copias; la app en el dominio nuevo como beta | No, salvo que quieras probar la beta |
| **Marzo de 2027** | **Nada.** Solo tu examen | No |
| **Abril – mayo** | Los alumnos se mudan al dominio nuevo con su código, sin perder progreso | Sí: un aviso y tres pasos |
| **Mayo – julio** | Sincronización en tu servidor, en paralelo con el actual hasta comprobar que coinciden | No |
| **Julio – septiembre** | Cuentas opcionales y privacidad | Opcional |
| **Septiembre – noviembre** | Academias; **piloto con 1–3 centros a final de año** | Los centros piloto |
| **Diciembre – enero de 2028** | Cobro | Sí |
| **Otoño de 2027 – primavera de 2028** | Interfaz nueva, pantalla a pantalla | Poco: más rápida |

**Hasta tu examen de marzo la app actual no se toca.** Todo lo de antes de marzo se hace al lado, sin cambiar lo que usas.

## Cuánto tiempo

Unos **16 meses** hasta poder cobrar, con una dedicación tuya de unas 20 horas a la semana dirigiendo y revisando a
los agentes (entre 63 y 85 semanas de trabajo). Con menos dedicación, se alarga en proporción. El plan anterior
(8–12 meses) era optimista: solo rehacer la interfaz son 5–6 meses.

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
profesional (un pago único) y lo que ya gastes en los modelos de IA.

## Lo que te toca decidir

| # | Decisión | Para cuándo |
| ---: | --- | --- |
| 1 | **Nombre del dominio** (`.es` o `.com`) y comprarlo | Diciembre de 2026 |
| 2 | **¿Conservas la clave secreta (`PEPPER`) del servidor actual?** Si no, la mudanza del servidor es más lenta | Esta semana |
| 3 | Repositorio **privado** (recomendado mientras no estén claros los derechos del contenido) | Diciembre |
| 4 | **Cuántas horas a la semana** puedes dedicar: fija el calendario real | Diciembre |
| 5 | Qué más hay en el VPS y si tiene tamaño suficiente (recomendado: 2 núcleos, 4 GB) | Enero |
| 6 | Dónde guardar las copias y con quién enviar el correo (proveedores europeos, céntimos al mes) | Enero |
| 7 | **Derechos de las preguntas y de la carta:** sin aclararlos no se puede cobrar. Es una gestión tuya y conviene empezarla ya | Antes del otoño de 2027 |
| 8 | **Hablar con 5–10 academias y apalabrar 2–3 centros piloto** | Antes del verano de 2027 |
| 9 | Un profesional que revise la política de privacidad y el contrato con los centros | Verano de 2027 |
| 10 | **Cómo cobrar:** Stripe llevando tú las facturas y el IVA (más barato), o un intermediario que lo lleve por ti (unas tres veces más comisión). Con tu asesor | Otoño de 2027 |
| 11 | Dar por buena la regla de borrar los datos de quien lleve 24 meses sin entrar | Verano de 2027 |

Lo demás (herramientas, base de datos, forma de desplegar) está decidido y razonado en los documentos; una prueba
técnica en verano confirmará la librería de interfaz, sin que tengas que hacer nada.
