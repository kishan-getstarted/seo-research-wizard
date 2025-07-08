import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

// Country mapping for Google search
const countryMapping: { [key: string]: string } = {
  'US': 'us',
  'UK': 'uk',
  'CA': 'ca',
  'AU': 'au',
  'DE': 'de',
  'FR': 'fr',
  'IN': 'in',
  'JP': 'jp'
};

export async function POST(request: NextRequest) {
  try {
    const { keyword, country } = await request.json();

    if (!keyword) {
      return NextResponse.json({ error: 'Keyword is required' }, { status: 400 });
    }

    // Check if Google Custom Search API is configured
    const googleApiKey = process.env.GOOGLE_API_KEY;
    const googleSearchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;
    
    if (!googleApiKey || !googleSearchEngineId) {
      return NextResponse.json({ 
        error: 'Google Custom Search API is not configured. Please set GOOGLE_API_KEY and GOOGLE_SEARCH_ENGINE_ID environment variables.' 
      }, { status: 500 });
    }

    try {
      const customsearch = google.customsearch('v1');
      
      const searchResult = await customsearch.cse.list({
        auth: googleApiKey,
        cx: googleSearchEngineId,
        q: keyword,
        num: 10,
        gl: countryMapping[country] || 'us',
        hl: 'en',
        safe: 'active'
      });

      if (!searchResult.data.items || searchResult.data.items.length === 0) {
        return NextResponse.json({ 
          error: 'No search results found for the given keyword.' 
        }, { status: 404 });
      }

      const results = searchResult.data.items.map((item: any, index: number) => ({
        id: (index + 1).toString(),
        title: item.title || '',
        url: item.link || '',
        snippet: item.snippet || '',
        displayLink: item.displayLink || new URL(item.link || '').hostname
      }));

      return NextResponse.json({
        results,
        totalResults: parseInt(searchResult.data.searchInformation?.totalResults || '0'),
        searchTime: searchResult.data.searchInformation?.searchTime || '0.42',
        source: 'google-custom-search'
      });

    } catch (googleError: any) {
      console.error('Google Custom Search API error:', googleError);
      
      // Provide more specific error messages
      let errorMessage = 'Google Custom Search API error occurred.';
      
      if (googleError.code === 403) {
        errorMessage = 'Google API quota exceeded or invalid API key. Please check your API key and quota limits.';
      } else if (googleError.code === 400) {
        errorMessage = 'Invalid search parameters. Please check your search engine configuration.';
      } else if (googleError.code === 401) {
        errorMessage = 'Invalid API key. Please check your Google API key configuration.';
      }

      return NextResponse.json({ 
        error: errorMessage,
        details: googleError.message 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}