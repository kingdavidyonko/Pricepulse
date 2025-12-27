-- PricePulse schema
-- Tables: products, countries, baselines, price_submissions, aggregates_weekly

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL
);

CREATE TABLE IF NOT EXISTS countries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  iso2 char(2) UNIQUE NOT NULL,
  name text NOT NULL,
  lat double precision,
  lng double precision
);

CREATE TABLE IF NOT EXISTS baselines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  country_id uuid REFERENCES countries(id) ON DELETE CASCADE,
  price_local numeric NOT NULL,
  currency char(3) NOT NULL,
  updated_at timestamptz DEFAULT now(),
  UNIQUE (product_id, country_id)
);

CREATE TABLE IF NOT EXISTS price_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  country_id uuid REFERENCES countries(id) ON DELETE CASCADE,
  price_local numeric NOT NULL,
  currency char(3) NOT NULL,
  price_usd numeric NOT NULL,
  reporter text,
  created_at timestamptz DEFAULT now(),
  metadata jsonb
);

CREATE INDEX IF NOT EXISTS idx_price_submissions_created_at ON price_submissions(created_at);
CREATE INDEX IF NOT EXISTS idx_price_submissions_country_product ON price_submissions(country_id, product_id);

CREATE TABLE IF NOT EXISTS aggregates_weekly (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country_id uuid REFERENCES countries(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  week_start date NOT NULL,
  sample_count int NOT NULL,
  median_price_usd numeric NOT NULL,
  inflation_pct_vs_prev_week numeric,
  rolling_avg_4wk numeric,
  confidence_score numeric,
  created_at timestamptz DEFAULT now(),
  UNIQUE(country_id, product_id, week_start)
);

CREATE INDEX IF NOT EXISTS idx_aggregates_week ON aggregates_weekly(country_id, product_id, week_start);

-- Optional extension helpers
CREATE EXTENSION IF NOT EXISTS pgcrypto;
