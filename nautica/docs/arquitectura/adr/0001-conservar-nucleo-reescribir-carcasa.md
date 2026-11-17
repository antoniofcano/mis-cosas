# ADR 0001: Conservar el núcleo y reescribir la carcasa por estrangulamiento

- **Estado:** aceptada
- **Fecha:** 17 de noviembre de 2026

## Contexto

La auditoría mide un núcleo de ≈ 54.000 líneas de funciones puras, sin DOM, con cobertura del 96–100 % y solo 472
errores de `checkJs`; y una carcasa (`ui/`, 16.500 líneas al 19 % de cobertura, vistas de 400–800 líneas en una
función, CSS monolítico, `localStorage`, publicación a mano) de prototipo. El 87 % de los commits los firma un agente.

## Decisión

- El **núcleo se conserva y se tipa** sin cambiar su comportamiento; sus 2.581 pruebas viajan con él.
- La **carcasa se reescribe por estrangulamiento**: una sola app en la que cada ruta la sirve la vista antigua
  (montada por un adaptador) o la nueva, con un interruptor por ruta.
- **Antes de sustituir una pantalla** se escribe su E2E de caracterización contra la antigua; la nueva debe pasarlo
  sin tocarlo, con axe a cero.
- La lógica de negocio que hoy vive en las vistas se saca primero a funciones puras del núcleo.

## Alternativas

- **Refactor in situ de todo:** la interfaz no tiene pruebas que lo protejan y arrastra «una función por pantalla».
- **Reescritura completa:** tira lo único probado y años de contenido verificado.
- **Dos apps en paralelo (antigua y nueva en subrutas):** duplica almacenamiento y service worker en el mismo origen.

## Consecuencias

- Durante meses conviven dos estilos de interfaz y dos hojas de estilo; el coste se acota borrando lo antiguo en el
  mismo PR que activa lo nuevo para todos.
- Las 36 pruebas que fijan texto de CSS o de código no se migran: mueren con la pantalla que vigilaban.
- La frontera núcleo–carcasa pasa a estar vigilada por herramienta (ADR 0002).
