BEGIN;
-- Роли
CREATE ROLE tracer_public LOGIN PASSWORD 'changeme';
CREATE ROLE tracer_internal LOGIN PASSWORD 'changeme2';

-- Схема
CREATE SCHEMA IF NOT EXISTS tracer AUTHORIZATION CURRENT_USER;
SET search_path = tracer, public;

-- Таблицы
CREATE TABLE IF NOT EXISTS catalog (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT,
  topic TEXT,
  tags TEXT[],
  status TEXT,
  lang TEXT,
  url TEXT,
  summary TEXT,
  updated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ,
  author TEXT,
  last_editor TEXT
);
CREATE INDEX IF NOT EXISTS idx_catalog_topic ON catalog USING btree(topic);
CREATE INDEX IF NOT EXISTS idx_catalog_tags ON catalog USING gin(tags);
CREATE INDEX IF NOT EXISTS idx_catalog_status ON catalog(status);
CREATE INDEX IF NOT EXISTS idx_catalog_lang ON catalog(lang);
CREATE INDEX IF NOT EXISTS idx_catalog_updated ON catalog(updated_at DESC);

CREATE TABLE IF NOT EXISTS cases (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  date_start DATE,
  client_url TEXT,
  keys TEXT,
  terms TEXT,
  status TEXT,
  price TEXT,
  url TEXT,
  updated_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);
CREATE INDEX IF NOT EXISTS idx_cases_date ON cases(date_start);

CREATE TABLE IF NOT EXISTS publishing (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  ownership TEXT,
  type TEXT,
  channel TEXT,
  pub_date DATE,
  venue TEXT,
  citation_style TEXT,
  submission_status TEXT,
  due_date DATE,
  doi TEXT,
  tags TEXT[],
  lang TEXT,
  notes TEXT,
  url TEXT,
  updated_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_publishing_due ON publishing(due_date);
CREATE INDEX IF NOT EXISTS idx_publishing_submission ON publishing(submission_status);

-- Права
REVOKE ALL ON SCHEMA tracer FROM PUBLIC;
GRANT USAGE ON SCHEMA tracer TO tracer_public, tracer_internal;
GRANT SELECT ON catalog, cases, publishing TO tracer_public;
GRANT SELECT, INSERT, UPDATE, DELETE ON catalog, cases, publishing TO tracer_internal;
COMMIT;
