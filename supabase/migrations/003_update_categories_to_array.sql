-- Migration: Update categories field from text to text[] array
-- This improves category filtering performance and reliability

-- 1. Add new categories_array column
ALTER TABLE news_items 
ADD COLUMN categories_array TEXT[];

-- 2. Convert existing text categories to array format
-- Split comma-separated categories and convert to array
UPDATE news_items 
SET categories_array = string_to_array(
  COALESCE(categories, ''), 
  ','
);

-- 3. Clean up the array (remove empty strings and trim whitespace)
UPDATE news_items 
SET categories_array = array_remove(
  array(
    SELECT DISTINCT trim(unnest(categories_array))
    WHERE unnest(categories_array) != ''
  ), 
  ''
);

-- 4. Create GIN index for better array search performance
CREATE INDEX IF NOT EXISTS idx_news_items_categories_array 
ON news_items USING GIN(categories_array);

-- 5. Drop the old text-based index
DROP INDEX IF EXISTS idx_news_items_categories;

-- 6. Add a function to help with category filtering
CREATE OR REPLACE FUNCTION get_articles_by_categories(
  category_list TEXT[],
  page_number INTEGER DEFAULT 0,
  page_size INTEGER DEFAULT 50
)
RETURNS TABLE(
  id TEXT,
  title TEXT,
  body TEXT,
  url TEXT,
  imageurl TEXT,
  source_name TEXT,
  published_on BIGINT,
  categories_array TEXT[],
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ni.id,
    ni.title,
    ni.body,
    ni.url,
    ni.imageurl,
    ni.source_name,
    ni.published_on,
    ni.categories_array,
    ni.created_at,
    ni.updated_at
  FROM news_items ni
  WHERE 
    -- If no categories specified, return all articles
    (category_list IS NULL OR array_length(category_list, 1) IS NULL)
    OR
    -- If categories specified, check for overlap
    (ni.categories_array && category_list)
  ORDER BY ni.published_on DESC
  LIMIT page_size
  OFFSET page_number * page_size;
END;
$$ LANGUAGE plpgsql;

-- 7. Add comment explaining the new structure
COMMENT ON COLUMN news_items.categories_array IS 'Array of categories for efficient filtering. Use GIN index for fast searches.';
COMMENT ON FUNCTION get_articles_by_categories IS 'Helper function for paginated category-based article retrieval.';
