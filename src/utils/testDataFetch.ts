// Test script to verify if we're getting real data from CryptoCompare
import { NewsService } from '@/services/newsService';
import { CryptoApi } from '@/lib/api';

export async function testDataFetch() {
  console.log('🔍 Testing data sources...\n');
  
  // Test 1: Direct CryptoCompare API
  console.log('1️⃣ Testing CryptoCompare API directly...');
  try {
    const cryptoApi = CryptoApi.getInstance();
    const apiNews = await cryptoApi.getNews(5);
    
    if (apiNews && apiNews.length > 0) {
      console.log('✅ CryptoCompare API is working!');
      console.log(`   Found ${apiNews.length} articles`);
      console.log(`   Sample article: "${apiNews[0].title.substring(0, 50)}..."`);
      console.log(`   Source: ${apiNews[0].source_info.name}`);
      console.log(`   Published: ${new Date(apiNews[0].published_on * 1000).toLocaleDateString()}\n`);
    } else {
      console.log('❌ No data from CryptoCompare API\n');
    }
  } catch (error) {
    console.log('❌ CryptoCompare API error:', error.message, '\n');
  }
  
  // Test 2: News Service (with database)
  console.log('2️⃣ Testing News Service (Supabase + API)...');
  try {
    const newsService = NewsService.getInstance();
    const news = await newsService.fetchNews();
    
    if (news && news.length > 0) {
      console.log('✅ News Service is working!');
      console.log(`   Found ${news.length} articles`);
      console.log(`   Sample article: "${news[0].title.substring(0, 50)}..."`);
      console.log(`   Is this real news: ${!news[0].title.includes('Breaking') ? 'YES' : 'Possibly Mock'}\n`);
    } else {
      console.log('❌ No data from News Service\n');
    }
  } catch (error) {
    console.log('❌ News Service error:', error.message, '\n');
  }
  
  console.log('📊 Summary:');
  console.log('- If you see real article titles above, you\'re getting REAL data');
  console.log('- If you see "Breaking: Bitcoin Surges..." it\'s likely MOCK data');
}

// Export for use in components
export default testDataFetch;