CREATE SCHEMA IF NOT EXISTS coordination;
CREATE TABLE IF NOT EXISTS coordination.namespaces (
  namespace_id text PRIMARY KEY,
  schema_version integer NOT NULL DEFAULT 1,
  revision bigint NOT NULL DEFAULT 0,
  event_sequence bigint NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS coordination.grants (
  namespace_id text NOT NULL REFERENCES coordination.namespaces(namespace_id),
  task_id text NOT NULL,
  record jsonb NOT NULL,
  PRIMARY KEY(namespace_id, task_id)
);
CREATE TABLE IF NOT EXISTS coordination.receipts (
  namespace_id text NOT NULL REFERENCES coordination.namespaces(namespace_id),
  submission_id text NOT NULL,
  submission jsonb NOT NULL,
  result jsonb NOT NULL,
  PRIMARY KEY(namespace_id, submission_id)
);
CREATE TABLE IF NOT EXISTS coordination.events (
  namespace_id text NOT NULL REFERENCES coordination.namespaces(namespace_id),
  sequence bigint NOT NULL,
  type text NOT NULL,
  at timestamptz NOT NULL,
  payload jsonb NOT NULL,
  PRIMARY KEY(namespace_id, sequence)
);
