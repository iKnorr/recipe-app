ALTER TABLE recipes
  ADD COLUMN categories text[] NOT NULL DEFAULT '{}';
