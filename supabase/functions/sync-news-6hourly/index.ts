import "jsr:@supabase/functions-js/edge-runtime.d.ts";

interface NewsItem {
  id: string;
  title: string;
  body: string;
  url: string;
  imageurl?: string;
  source_info: {
    name: string;
  };
  published_on: number;
  categories: string;
}

interface CryptoCompareNewsItem {
  id: string;
  title: string;
  body: string;
  url: string;
  imageurl?: string;
  source_info: {
    name: string;
  };
  published_on: number;
  categories: string;
}

interface CryptoCompareResponse {
  Data: CryptoCompareNewsItem[];
  Message?: string;
  Type?: number;
}

interface DatabaseNewsItem {
  id: string;
  title: string;
  body: string;
  url: string;
  imageurl?: string;
  source_name: string;
  published_on: number;
  categories: string;
}

// CryptoCompare API functions
async function fetchLatestNews(limit: number = 50): Promise<NewsItem[]> {
  const apiKey = Deno.env.get('CRYPTO_API_KEY');
  const baseUrl = Deno.env.get('CRYPTO_API_BASE_URL') || 'https://min-api.cryptocompare.com/data/v2';
  
  if (!apiKey) {
    throw new Error('CRYPTO_API_KEY environment variable is required');
  }

  const url = `${baseUrl}/news/?lang=EN&api_key=${apiKey}&limit=${limit}`;
  
  console.log('📡 Fetching news from CryptoCompare API...');
  console.log('🔗 API URL:', url.replace(apiKey, '***'));
  
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`CryptoCompare API request failed: ${response.status} ${response.statusText}`);
  }

  const data: CryptoCompareResponse = await response.json();
  
  if (data.Type === 1 && data.Message) {
    throw new Error(data.Message);
  }

  if (!data.Data || !Array.isArray(data.Data)) {
    throw new Error('Invalid response format from CryptoCompare API');
  }

  console.log(`✅ Fetched ${data.Data.length} news items from API`);
  return data.Data.map(transformNewsItem);
}

function transformNewsItem(item: CryptoCompareNewsItem): NewsItem {
  return {
    id: item.id,
    title: item.title,
    body: item.body,
    url: item.url,
    imageurl: item.imageurl,
    source_info: {
      name: item.source_info.name,
    },
    published_on: item.published_on,
    categories: item.categories,
  };
}

// Database functions
async function saveNewsItems(newsItems: NewsItem[], supabaseUrl: string, supabaseKey: string): Promise<boolean> {
  try {
    console.log(`💾 Saving ${newsItems.length} news items to database...`);

    const dbNewsItems: DatabaseNewsItem[] = newsItems.map(item => ({
      id: item.id,
      title: item.title,
      body: item.body,
      url: item.url,
      imageurl: item.imageurl,
      source_name: item.source_info.name,
      published_on: item.published_on,
      categories: item.categories,
    }));

    // Use proper upsert to prevent duplicates
    const response = await fetch(`${supabaseUrl}/rest/v1/news_items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey,
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify(dbNewsItems)
    });

    if (!response.ok && response.status !== 409) {
      console.error(`❌ Failed to save news items:`, response.statusText);
      return false;
    }

    console.log(`✅ Successfully upserted ${newsItems.length} news items to database`);
    return true;
  } catch (error) {
    console.error('❌ Error saving news items:', error);
    return false;
  }
}

async function testConnection(supabaseUrl: string, supabaseKey: string): Promise<boolean> {
  try {
    console.log('🔄 Testing database connection...');
    const response = await fetch(`${supabaseUrl}/rest/v1/news_items?select=count&limit=1`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('❌ Database connection test failed:', response.statusText);
      return false;
    }

    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection test error:', error);
    return false;
  }
}

Deno.serve(async (req: Request) => {
  const { method } = req;
  
  // Handle CORS preflight requests
  if (method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    console.log('🔄 Starting automated news sync (every 6 hours)...');
    console.log('⏰ Sync timestamp:', new Date().toISOString());
    
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing required Supabase environment variables (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)');
    }

    // Test database connection first
    const dbConnected = await testConnection(supabaseUrl, supabaseKey);
    if (!dbConnected) {
      throw new Error('Database connection failed');
    }

    // Fetch latest news from CryptoCompare (50 articles every 6 hours)
    const newsItems = await fetchLatestNews(50);
    
    if (newsItems.length === 0) {
      console.log('🤷 No news items to sync');
      return new Response(JSON.stringify({ 
        success: true, 
        message: 'No news items to sync',
        synced: 0,
        timestamp: new Date().toISOString()
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Save to database
    const saveSuccess = await saveNewsItems(newsItems, supabaseUrl, supabaseKey);
    
    if (saveSuccess) {
      console.log(`✅ Successfully synced ${newsItems.length} news items`);
      return new Response(JSON.stringify({ 
        success: true, 
        message: `6-hourly news sync completed successfully`,
        synced: newsItems.length,
        timestamp: new Date().toISOString()
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      });
    } else {
      throw new Error('Failed to save news items to database');
    }

  } catch (error) {
    console.error('❌ 6-hourly news sync failed:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message,
      timestamp: new Date().toISOString()
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});