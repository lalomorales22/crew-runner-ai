interface TavilySearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
  published_date?: string;
}

interface TavilyResponse {
  query: string;
  follow_up_questions?: string[];
  answer: string;
  images?: string[];
  results: TavilySearchResult[];
  response_time: number;
}

class TavilyService {
  private apiKey: string | null = null;
  private baseUrl = 'https://api.tavily.com';

  constructor() {
    this.apiKey = import.meta.env.VITE_TAVILY_API_KEY;
  }

  isConfigured(): boolean {
    return !!this.apiKey;
  }

  async search(query: string, options: {
    searchDepth?: 'basic' | 'advanced';
    includeImages?: boolean;
    includeAnswer?: boolean;
    maxResults?: number;
    includeDomains?: string[];
    excludeDomains?: string[];
  } = {}): Promise<TavilyResponse> {
    if (!this.apiKey) {
      throw new Error('Tavily API key not configured. Please add VITE_TAVILY_API_KEY to your environment variables.');
    }

    const {
      searchDepth = 'basic',
      includeImages = false,
      includeAnswer = true,
      maxResults = 5,
      includeDomains = [],
      excludeDomains = []
    } = options;

    try {
      const response = await fetch(`${this.baseUrl}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: this.apiKey,
          query,
          search_depth: searchDepth,
          include_images: includeImages,
          include_answer: includeAnswer,
          max_results: maxResults,
          include_domains: includeDomains.length > 0 ? includeDomains : undefined,
          exclude_domains: excludeDomains.length > 0 ? excludeDomains : undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Tavily API error: ${response.status} - ${errorData.error || response.statusText}`);
      }

      const data: TavilyResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Tavily search error:', error);
      throw error;
    }
  }

  async qnaSearch(query: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('Tavily API key not configured');
    }

    try {
      const response = await fetch(`${this.baseUrl}/qna-search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: this.apiKey,
          query,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Tavily QnA API error: ${response.status} - ${errorData.error || response.statusText}`);
      }

      const data = await response.json();
      return data.answer || 'No answer found';
    } catch (error) {
      console.error('Tavily QnA search error:', error);
      throw error;
    }
  }

  formatSearchResults(results: TavilySearchResult[]): string {
    if (!results || results.length === 0) {
      return 'No search results found.';
    }

    return results.map((result, index) => {
      return `${index + 1}. **${result.title}**
   - URL: ${result.url}
   - Content: ${result.content.slice(0, 200)}${result.content.length > 200 ? '...' : ''}
   - Relevance Score: ${result.score.toFixed(2)}
   ${result.published_date ? `- Published: ${result.published_date}` : ''}
`;
    }).join('\n');
  }

  async performWebSearch(query: string, context?: string): Promise<string> {
    try {
      const searchResults = await this.search(query, {
        searchDepth: 'advanced',
        includeAnswer: true,
        maxResults: 8,
        includeImages: false
      });

      let formattedResponse = `# Web Search Results for: "${query}"\n\n`;
      
      if (searchResults.answer) {
        formattedResponse += `## AI Summary\n${searchResults.answer}\n\n`;
      }

      formattedResponse += `## Detailed Results\n\n`;
      formattedResponse += this.formatSearchResults(searchResults.results);

      if (searchResults.follow_up_questions && searchResults.follow_up_questions.length > 0) {
        formattedResponse += `\n## Related Questions\n`;
        searchResults.follow_up_questions.forEach((question, index) => {
          formattedResponse += `${index + 1}. ${question}\n`;
        });
      }

      formattedResponse += `\n---\n*Search completed in ${searchResults.response_time}ms*`;

      return formattedResponse;
    } catch (error) {
      console.error('Web search failed:', error);
      return `# Web Search Failed\n\nError: ${error.message}\n\nQuery: "${query}"\n\nPlease check your Tavily API configuration and try again.`;
    }
  }
}

export const tavilyService = new TavilyService();