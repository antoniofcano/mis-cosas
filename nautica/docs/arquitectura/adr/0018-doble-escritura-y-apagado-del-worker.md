# ADR 0018: Doble escritura y apagado del Worker

- **Estado:** aceptada
- **Fecha:** 17 de noviembre de 2026

## Contexto

El progreso de los alumnos actuales está en D1, tras un Worker identificado por código. Hay que llevarlo a PostgreSQL
sin interrumpir a nadie. A favor: las operaciones son idempotentes, cada aparato guarda su registro y la app ya sabe
recomponer un servidor que ha perdido datos.

## Decisión

Cuatro pasos, cada uno reversible:

1. **Sombra:** la API nueva expone `/v1/sync` con el mismo contrato. El cliente sincroniza con el Worker (principal) y,
   además, con la API (segundo remoto con su propio cursor). Un fallo del segundo remoto no se enseña al alumno.
2. **Importación y comparación:** se exporta D1 en solo lectura y se importa en Postgres (operaciones y *hashes* con
   `pepper_v = 1`). Una tarea diaria compara por alumno recuento, último `seq` y huella de los ids; objetivo: 0
   diferencias durante 14 días.
3. **Cambio de principal:** el cliente pasa a tener la API como principal y el Worker como sombra, 30 días.
4. **Apagado:** el cliente deja de escribir en el Worker; el Worker queda en solo lectura 90 días, se hace una
   exportación final archivada y se elimina.

## Alternativas

- **Corte en una noche con exportación e importación:** pierde lo que suba durante el corte y no deja vuelta atrás.
- **Que el Worker reenvíe a la API:** obliga a tocar y redesplegar el Worker y lo convierte en punto de fallo.
- **No importar y dejar que los aparatos resuban:** deja fuera a quien no vuelva a abrir la app.

## Consecuencias

- **Hace falta el `PEPPER` actual** para que los *hashes* importados sirvan; si no se conserva, los alumnos se
  recuperan solo por resubida desde sus aparatos y el Worker debe vivir más tiempo. Hay que confirmarlo en F0.
- El cliente lleva durante unos meses dos cursores; es código que se borra al terminar.
- Los avisos diarios se migran en el paso 3; durante el cambio nunca envían los dos servidores a la vez.
