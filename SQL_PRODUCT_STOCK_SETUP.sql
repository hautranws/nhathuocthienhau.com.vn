-- Explicit availability flag managed by the price synchronization workflow.
-- Existing products are considered available unless explicitly marked out of stock.
ALTER TABLE products
ADD COLUMN IF NOT EXISTS is_out_of_stock boolean NOT NULL DEFAULT false;

UPDATE products
SET is_out_of_stock = false
WHERE is_out_of_stock IS NULL;
