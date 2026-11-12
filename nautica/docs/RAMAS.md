# Ramas remotas

**Limpieza hecha el 12 de noviembre de 2026:** se borraron 179 ramas ya fusionadas o superadas (de 186) desde un
ordenador. Quedan las 7 que hay que conservar. La lista de lo borrado, con su clasificación, está en el historial de
este fichero (versión de la PR #145).

## Las que se conservan (7)

| Rama | Por qué |
| --- | --- |
| `main` | Rama principal |
| `feat/nautica-per` | Rama de despliegue de la web (siempre igual que `main` tras publicar) |
| `guitarra` | Otro proyecto |
| `claude/timon-abatible` | Trabajo aparte, sin fusionar |
| `feat/per-resueltos` | Ejercicios resueltos de referencia |
| `feat/py-resueltos` | Ejercicios resueltos de referencia |
| `feat/podcast-audio` | Audio del podcast (para regenerarlo, R-09) |

## Ramas nuevas

Cada cambio que se publica desde una sesión de Claude deja su rama en GitHub tras fusionar la PR: desde las sesiones no
se pueden borrar ramas remotas (GitHub responde 403). Se pueden borrar en cuanto su PR consta como fusionada.

Pendientes de borrar:

- `docs/ramas-limpias` (la de este mismo cambio)

## Cómo borrar una rama

1. Abre una terminal **dentro de una carpeta que sea un repositorio git** (cualquiera, aunque sea de otro proyecto). En
   una carpeta que no lo es, git responde `fatal: not a git repository` y no hace nada.
2. Usa la dirección completa del repositorio, no `origin`: así el borrado va a `mis-cosas` estés donde estés.

```
git push https://github.com/antoniofcano/mis-cosas.git --delete nombre-de-la-rama
```

Un borrado correcto responde ` - [deleted]  nombre-de-la-rama`. Con varias ramas en la misma línea, si una no existe git
cancela la línea entera.

También se puede desde GitHub: en la PR fusionada, botón «Delete branch»; o activando en los ajustes del repositorio
«Automatically delete head branches», que las borra solas al fusionar.

## Cómo comprobar lo que hay

```
git ls-remote --heads https://github.com/antoniofcano/mis-cosas.git
```

## Ramas locales de los agentes

Las copias de trabajo de los agentes (`.claude/worktrees/…`) son locales a cada sesión y no se suben; se quitan con
`git worktree remove` al integrar su trabajo.
