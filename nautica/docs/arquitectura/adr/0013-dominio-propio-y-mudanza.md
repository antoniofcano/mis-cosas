# ADR 0013: Dominio propio y mudanza de alumnos por vinculación

- **Estado:** aceptada
- **Fecha:** 17 de noviembre de 2026

## Contexto

La app se sirve en `antoniofcano.github.io/mis-cosas/nautica`, origen compartido con otros sitios. Cambiar de origen
deja atrás `localStorage`, IndexedDB, el service worker, la instalación y las suscripciones de push. El progreso
compartido está en el servidor, asociado al código de alumno, y existe `#/vincular/<código>`.

## Decisión

1. El dominio nuevo sirve **la misma app** y habla con **el mismo servidor de sincronización** (el origen nuevo se
   añade a `ORIGENES_EXTRA`, que el Worker ya admite sin cambiar código).
2. La app antigua, en una versión publicada tras la convocatoria de marzo de 2027, muestra una pantalla de mudanza
   que: se asegura de que hay código (lo crea si no) y de que **todo lo pendiente está subido**; ofrece copiar el
   código y abre `https://<dominio>/#/vincular/<código>`; y explica en tres pasos cómo instalar la app nueva.
3. La app nueva pregunta en la bienvenida «¿Vienes de la app anterior?» con un campo para el código (necesario en
   iPhone, donde la app instalada no comparte almacenamiento con Safari).
4. Lo que no viaja se dice: ajustes del aparato, examen a medias, bloc, y **la carta escaneada, que hay que volver a
   importar**. El aviso diario se da de baja en el origen antiguo y se ofrece de nuevo en el nuevo.
5. El sitio antiguo sigue vivo **al menos 12 meses**: primero con aviso descartable (8 semanas) y luego solo con la
   pantalla de mudanza. Nunca se activa su interruptor de emergencia.
6. La mudanza se hace **antes** de introducir cuentas.

## Alternativas

- **Pasar los datos entre orígenes con `postMessage` en una ventana emergente:** no sirve en iPhone con la app
  instalada; se añade solo como atajo para trasladar los ajustes del aparato en navegadores de escritorio.
- **Redirección automática:** perdería lo no sincronizado y la instalación.
- **Mantener los dos orígenes indefinidamente:** perpetúa S-01.

## Consecuencias

- El código viaja una vez más en un enlace (S-05): se acepta por ser el último uso del código como credencial.
- Habrá alumnos que no se muden: su progreso sigue en el servidor y basta el código para recuperarlo.
- Hay que probarlo en teléfonos reales (iPhone instalado, Android instalado, navegador) antes de activarlo.
