-- 1. News Items Table
CREATE TABLE IF NOT EXISTS news_items (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  url TEXT NOT NULL,
  imageurl TEXT,
  source_name TEXT NOT NULL,
  published_on BIGINT NOT NULL,
  categories TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. User Favorites Table
CREATE TABLE IF NOT EXISTS favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  news_id TEXT NOT NULL REFERENCES news_items(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, news_id)
);

-- 3. User Preferences Table
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  preferred_categories TEXT[] DEFAULT ARRAY['All', 'Bitcoin', 'Ethereum', 'Altcoins'],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 4. User Interactions Table
CREATE TABLE IF NOT EXISTS user_interactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  news_id TEXT NOT NULL REFERENCES news_items(id) ON DELETE CASCADE,
  interaction_type TEXT CHECK (interaction_type IN ('view', 'like', 'dislike', 'share', 'favorite')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Enable Row Level Security
ALTER TABLE news_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_interactions ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS Policies
-- News items - allow all reads
CREATE POLICY "Allow all reads on news_items" ON news_items
  FOR SELECT USING (true);

-- Favorites policies
CREATE POLICY "Users can view their own favorites" ON favorites
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own favorites" ON favorites
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can delete their own favorites" ON favorites
  FOR DELETE USING (true);

-- User preferences policies
CREATE POLICY "Users can view their own preferences" ON user_preferences
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own preferences" ON user_preferences
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own preferences" ON user_preferences
  FOR UPDATE USING (true);

-- User interactions policies
CREATE POLICY "Users can view their own interactions" ON user_interactions
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own interactions" ON user_interactions
  FOR INSERT WITH CHECK (true);

-- 7. Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_news_items_published_on ON news_items(published_on DESC);
CREATE INDEX IF NOT EXISTS idx_news_items_categories ON news_items(categories);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_news_id ON favorites(news_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_categories ON user_preferences USING GIN(preferred_categories);
CREATE INDEX IF NOT EXISTS idx_user_interactions_user_id ON user_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_news_id ON user_interactions(news_id);

-- 8. Create Updated At Trigger Function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 9. Add Triggers
CREATE TRIGGER update_news_items_updated_at
  BEFORE UPDATE ON news_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();