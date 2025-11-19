ALTER TABLE reservation
ALTER COLUMN category_id
DROP NOT NULL;
ALTER TABLE reservation
DROP CONSTRAINT fk_category_id,
ADD CONSTRAINT fk_category_id FOREIGN KEY (category_id) REFERENCES category (id) ON DELETE SET NULL ON UPDATE CASCADE;


-- Pricing table for stripe integration
-- Based off of prices api, but includes product
-- each facility has at least 3 prices, one being free for staff so not on stripe
CREATE TABLE IF NOT EXISTS pricing (
  id TEXT NOT NULL PRIMARY KEY, -- either price id from stripe or generated uuid. distinguishable by price_ prefix
  product_id TEXT NOT NULL, -- product id from stripe
  category_id BIGINT NOT NULL, -- pricing category
  unit_label TEXT DEFAULT 'hour'::text NOT NULL
);

ALTER TABLE facility 
ADD COLUMN IF NOT EXISTS product_id TEXT;

ALTER TABLE reservation
ADD COLUMN IF NOT EXISTS price_id TEXT;
