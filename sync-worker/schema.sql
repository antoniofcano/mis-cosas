-- Esquema de la base de datos D1 de patron-sync: el mismo que dejan las migraciones de migrations/ aplicadas en orden
-- (un test lo comprueba). El servidor no fusiona: guarda las operaciones de cada alumno y las reenvía a sus otros
-- aparatos.

-- Un alumno = un código. Del código solo se guarda su hash SHA-256 con el pepper secreto (nunca el código).
-- seq: número de la última operación guardada (las operaciones de un alumno se numeran 1, 2, 3… sin huecos, así que
-- también es cuántas tiene).
CREATE TABLE IF NOT EXISTS alumnos (
  id      INTEGER PRIMARY KEY,
  hash    TEXT    NOT NULL UNIQUE,
  creado  INTEGER NOT NULL,
  ultimo  INTEGER NOT NULL,
  seq     INTEGER NOT NULL DEFAULT 0
);

-- Operaciones de cada alumno, tal como llegan (JSON validado). (alumno, op_id) es única: reenviar no duplica.
CREATE TABLE IF NOT EXISTS operaciones (
  alumno    INTEGER NOT NULL REFERENCES alumnos(id),
  seq       INTEGER NOT NULL,
  op_id     TEXT    NOT NULL,
  tipo      TEXT    NOT NULL,
  instante  INTEGER NOT NULL,
  json      TEXT    NOT NULL,
  recibido  INTEGER NOT NULL,
  PRIMARY KEY (alumno, seq),
  UNIQUE (alumno, op_id)
);

-- Límites de peticiones: un contador por clave (IP con hash, alumno, intentos fallidos, altas) y su ventana (el
-- instante en que acaba, en ms). Las ventanas pasadas se borran de vez en cuando.
CREATE TABLE IF NOT EXISTS limites (
  clave    TEXT    PRIMARY KEY,
  ventana  INTEGER NOT NULL,
  n        INTEGER NOT NULL
);
