export interface NewsItem {
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
  Data: NewsItem[];
  Message?: string;
  Type?: number;
}

export class CryptoApi {
  private static instance: CryptoApi;
  private baseUrl: string;
  private apiKey: string;

  private constructor() {
    this.baseUrl = process.env.EXPO_PUBLIC_CRYPTO_API_BASE_URL || 'https://min-api.cryptocompare.com/data/v2';
    this.apiKey = process.env.EXPO_PUBLIC_CRYPTO_API_KEY || 'a69a4ddcb181c18e05869ab13eaa2ab1b3dfcb02e808966e7b5db786960666e5';
  }

  static getInstance(): CryptoApi {
    if (!CryptoApi.instance) {
      CryptoApi.instance = new CryptoApi();
    }
    return CryptoApi.instance;
  }

  async getNews(limit: number = 50): Promise<NewsItem[]> {
    try {
      const url = `${this.baseUrl}/news/?lang=EN&api_key=${this.apiKey}&limit=${limit}`;
      
      console.log('🔄 Fetching crypto news from:', url.replace(this.apiKey, '***'));
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: CryptoCompareResponse = await response.json();
      
      if (data.Type === 1 && data.Message) {
        throw new Error(data.Message);
      }

      if (!data.Data || !Array.isArray(data.Data)) {
        throw new Error('Invalid response format');
      }

      console.log(`✅ Successfully fetched ${data.Data.length} news items`);
      
      return data.Data;
    } catch (error) {
      console.error('❌ Error fetching crypto news:', error);
      throw error;
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const news = await this.getNews(1);
      return news.length > 0;
    } catch (error) {
      console.error('API connection test failed:', error);
      return false;
    }
  }
}