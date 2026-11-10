# Ramas remotas: cuáles conservar y cuáles borrar

Regenerado el 10 de noviembre de 2026 a partir de las ramas de `origin` y de las PR fusionadas. Total: 182 ramas.
Borrar una rama remota no borra su código de `main`; sí pierde el acceso fácil a sus commits sueltos. Desde las sesiones
de Claude no se pueden borrar ramas remotas (GitHub responde 403): se borran desde un ordenador o desde GitHub.

## Conservar (7)

| Rama | Por qué |
| --- | --- |
| `main` | Rama principal |
| `feat/nautica-per` | Rama de despliegue de la web (siempre igual que `main` tras publicar) |
| `guitarra` | Otro proyecto |
| `claude/timon-abatible` | Trabajo aparte, sin fusionar |
| `feat/per-resueltos` | Ejercicios resueltos de referencia |
| `feat/py-resueltos` | Ejercicios resueltos de referencia |
| `feat/podcast-audio` | Audio del podcast (para regenerarlo, R-09) |

## A. Ya dentro de `main` por historia (18): se pueden borrar

Seguras: todos sus commits ya están en `main`.

```
git push origin --delete feat/andalucia-2015-2019 feat/conceptos feat/conceptos-cambios-balizamiento-ripa feat/conceptos-cambios-meteorologia feat/conceptos-cambios-navegacion
git push origin --delete feat/conceptos-cambios-nomenclatura-maniobra feat/conceptos-cambios-seguridad-legislacion feat/conceptos-metodo feat/cuarentena-reserva feat/discrepancias-oficiales
git push origin --delete feat/f1-reserva feat/ruta-profe feat/ux-hoy fix/calc-mesa fix/precache-dgmm fix/sw-conflicto integra-profe ruta-fase1
```

## B. Fusionadas con una PR por «squash» (40): se pueden borrar

Su PR consta como fusionada. Git no las reconoce como fusionadas porque el squash crea un commit nuevo.

```
git push origin --delete docs/producto-servicio docs/ramas docs/roadmap docs/roadmap-2 feat/animaciones feat/carta-pasos-final feat/carta-sin-solucion-final feat/catalogo-pendientes
git push origin --delete feat/chuletas-todas feat/diagnostico-ficha feat/efectos-final feat/entrada-unica feat/examen-dia feat/examen-formulas-semana feat/hoja-ver-pregunta
git push origin --delete feat/hoy-maqueta feat/hoy-travesia-c-final feat/iconos-temario feat/informe-discrepancias feat/instalar-app feat/laminas-c feat/laminas-cierre-final
git push origin --delete feat/laminas-py feat/listo-olvido-margen feat/mapas-chuletas-c-final feat/per-cierre-final feat/per-laminas-c-final feat/proteccion-datos feat/pulido-2
git push origin --delete feat/pwa-tanda1-final feat/py-laminas-cola-final feat/py-laminas-final-final feat/recordatorio-diario-final feat/repaso-con-ficha feat/sync-progreso-final
git push origin --delete feat/tarjetas-final feat/travesia fix/equivalente-enunciado-generico fix/sync-recuperar fix/tutorial-oposicion-espartel
```

## C. Sin PR propia, pero todo su contenido ya está en `main` (73): se pueden borrar

Trabajo de agentes o ramas intermedias: los ficheros que cambiaron están en `main` exactamente igual.

```
git push origin --delete feat/apendice-mates feat/ayudas-alumno feat/bancos-f0 feat/bancos-f2 feat/bancos-f2-fin feat/calculadora-mates feat/clases-cortas feat/eje-baleares
git push origin --delete feat/eje-dgmm feat/eje-dgmm-carta-per-a feat/eje-dgmm-carta-per-b feat/eje-dgmm-carta-py-a feat/eje-dgmm-carta-py-b feat/eje-dgmm-expl-per-1 feat/eje-dgmm-expl-per-2
git push origin --delete feat/eje-dgmm-expl-per-3 feat/eje-dgmm-expl-per-4 feat/eje-dgmm-expl-per-5 feat/eje-dgmm-expl-per-6 feat/eje-dgmm-expl-py-1 feat/eje-dgmm-expl-py-2
git push origin --delete feat/ejercicios-laminas feat/evaluacion-py feat/guia feat/huecos-py feat/laminas-interactivas feat/laminas-lecciones feat/mapas-t1 feat/mapas-t2
git push origin --delete feat/mapas-t3 feat/mapas-t4 feat/plan-estudio feat/podcast-py feat/revision-2 feat/revision-clases feat/ui-mejoras feat/visual fix/avance-clases
git push origin --delete fix/contenido-muestreo fix/descartar-examen fix/evaluacion-2 fix/nueve-acabado fix/nueve-fiabilidad fix/nueve-pedagogia fix/nueve-secuencia fix/nueve-uso
git push origin --delete fix/py-interactivas-carta fix/recorrido fix/recorrido-2 fix/revision-per-2 fix/revision-uso-per integra-baleares integra-dgmm trabajo/baleares-carta
git push origin --delete trabajo/baleares-carta-01 trabajo/baleares-carta-02 trabajo/baleares-carta-03 trabajo/baleares-carta-04 trabajo/baleares-carta-05 trabajo/baleares-carta-06
git push origin --delete trabajo/baleares-carta-07 trabajo/baleares-carta-08 trabajo/baleares-expl-01 trabajo/baleares-expl-02 trabajo/baleares-expl-03 trabajo/baleares-expl-04
git push origin --delete trabajo/baleares-expl-05 trabajo/baleares-expl-06 trabajo/baleares-expl-07 trabajo/baleares-expl-08 trabajo/baleares-expl-09 trabajo/baleares-expl-10
git push origin --delete trabajo/baleares-explicaciones
```

## D. Trabajo intermedio superado (44): borrar si no necesitas su historial

Ramas de trabajo cuyo resultado entró en `main` por otra rama (normalmente su versión `-final` o una integración
posterior) y que `main` ha seguido cambiando después: por eso sus ficheros ya no coinciden. No contienen nada pendiente
de publicar que se sepa, pero conservan los pasos intermedios.

```
git push origin --delete feat/carta-pasos feat/carta-sin-solucion feat/conceptos-balizamiento-ripa feat/conceptos-meteorologia feat/conceptos-motor feat/conceptos-navegacion
git push origin --delete feat/conceptos-nomenclatura-maniobra feat/conceptos-seguridad-legislacion feat/efectos feat/hoy-travesia-c feat/laminas-cierre feat/laminas-sanidad
git push origin --delete feat/mapas-chuletas-c feat/per-cierre feat/per-laminas-c feat/pwa-tanda1 feat/py-laminas-cola feat/py-laminas-final feat/recordatorio-diario feat/sync-progreso
git push origin --delete feat/tarjetas-c trabajo/and1519-carta-per-a trabajo/and1519-carta-per-b trabajo/and1519-carta-per-c trabajo/and1519-carta-py-2015 trabajo/and1519-carta-py-2016
git push origin --delete trabajo/and1519-carta-py-2017 trabajo/and1519-carta-py-2018 trabajo/and1519-carta-py-2019 trabajo/and1519-carta-resolver trabajo/and1519-expl-per-01
git push origin --delete trabajo/and1519-expl-per-02 trabajo/and1519-expl-per-03 trabajo/and1519-expl-per-04 trabajo/and1519-expl-per-05 trabajo/and1519-expl-per-06 trabajo/and1519-expl-per-07
git push origin --delete trabajo/and1519-expl-py-01 trabajo/and1519-expl-py-02 trabajo/and1519-expl-py-03 trabajo/and1519-expl-py-04 trabajo/and1519-expl-py-05 trabajo/and1519-expl-pycarta-01
git push origin --delete trabajo/and1519-expl-pycarta-02
```

## Cómo comprobar el resultado

```
git fetch --prune origin
git branch -r
```

## Ramas locales de los agentes

Las copias de trabajo de los agentes (`.claude/worktrees/…`) son locales a cada sesión y no se suben; se quitan con
`git worktree remove` al integrar su trabajo.
