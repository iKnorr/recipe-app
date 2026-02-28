CREATE TABLE cooking_tips (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category    text NOT NULL,
  title       text NOT NULL,
  content     text NOT NULL,
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now()
);

CREATE TRIGGER cooking_tips_updated_at
  BEFORE UPDATE ON cooking_tips
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
