// Test OAuth configuration
const { testSupabaseConnection, debugOAuthFlow } = require('./src/lib/supabaseFixed.ts');

async function testOAuth() {
  console.log('🧪 Testing OAuth configuration...');
  
  try {
    // Test Supabase connection
    const connectionResult = await testSupabaseConnection();
    console.log('📊 Connection test result:', connectionResult);
    
    // Test OAuth flow
    const oauthResult = await debugOAuthFlow();
    console.log('📊 OAuth test result:', oauthResult);
    
    if (connectionResult.auth && !oauthResult.oauthError) {
      console.log('✅ OAuth configuration looks good!');
    } else {
      console.log('❌ OAuth configuration has issues');
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testOAuth();
