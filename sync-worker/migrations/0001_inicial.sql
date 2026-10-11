-- Migración 0001: esquema inicial (alumnos, operaciones y límites). Ver schema.sql.
CREATE TABLE IF NOT EXISTS alumnos (
  id      INTEGER PRIMARY KEY,
  hash    TEXT    NOT NULL UNIQUE,
  creado  INTEGER NOT NULL,
  ultimo  INTEGER NOT NULL,
  seq     INTEGER NOT NULL DEFAULT 0
);

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

CREATE TABLE IF NOT EXISTS limites (
  clave    TEXT    PRIMARY KEY,
  ventana  INTEGER NOT NULL,
  n        INTEGER NOT NULL
);
