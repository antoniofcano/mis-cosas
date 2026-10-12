-- Migración 0002: recordatorio diario por push (nautica/docs/AVISOS.md). Solo añade; no toca lo de 0001.
-- Una fila por aparato con el aviso activado. Topes: 3 por alumno y 500 en total (src/avisos.js, LIMITES_AVISOS).
CREATE TABLE IF NOT EXISTS avisos (
  id        INTEGER PRIMARY KEY,
  alumno    INTEGER NOT NULL REFERENCES alumnos(id),
  endpoint  TEXT    NOT NULL UNIQUE,
  p256dh    TEXT    NOT NULL,
  auth      TEXT    NOT NULL,
  zona      TEXT    NOT NULL,
  hora      INTEGER NOT NULL,
  renovado  INTEGER NOT NULL,
  aviso     INTEGER NOT NULL DEFAULT 0,
  dia       TEXT    NOT NULL DEFAULT '',
  seguidos  INTEGER NOT NULL DEFAULT 0
);
-- La consulta del cron: las de unas (hora, zona) concretas.
CREATE INDEX IF NOT EXISTS avisos_franja ON avisos(hora, zona);
-- El tope por alumno al darse de alta.
CREATE INDEX IF NOT EXISTS avisos_alumno ON avisos(alumno);
