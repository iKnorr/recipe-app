CREATE TABLE recipes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text NOT NULL,
  description text,
  ingredients jsonb NOT NULL DEFAULT '[]'::jsonb,
  steps       jsonb NOT NULL DEFAULT '[]'::jsonb,
  prep_time   integer,
  cook_time   integer,
  servings    integer,
  source_url  text,
  image_url   text,
  tags        text[] DEFAULT '{}',
  notes       text,
  is_favorite boolean DEFAULT false,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

-- Auto-update updated_at on row change
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER recipes_updated_at
  BEFORE UPDATE ON recipes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Index for text search
CREATE INDEX recipes_title_idx ON recipes USING gin(to_tsvector('english', title));
CREATE INDEX recipes_tags_idx ON recipes USING gin(tags);
