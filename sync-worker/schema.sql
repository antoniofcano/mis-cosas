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

-- Recordatorio diario por push (nautica/docs/AVISOS.md): una fila por aparato con el aviso activado.
-- endpoint, p256dh, auth: la suscripción de push del navegador (el endpoint es una URL secreta del servicio de push).
-- zona: zona horaria IANA (lista cerrada) · hora: 9, 13, 18 o 21 (local) · renovado: última alta o cambio (ms)
-- aviso: instante del último aviso enviado (ms) · dia: día local de ese aviso (nunca dos el mismo día)
-- seguidos: avisos seguidos sin que el alumno estudie (a los 5 se pausa hasta que vuelva).
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
CREATE INDEX IF NOT EXISTS avisos_franja ON avisos(hora, zona);
CREATE INDEX IF NOT EXISTS avisos_alumno ON avisos(alumno);
