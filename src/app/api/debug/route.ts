import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const googleApiKey = process.env.GOOGLE_API_KEY;
    const googleSearchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;

    const debugInfo = {
      hasApiKey: !!googleApiKey,
      apiKeyLength: googleApiKey ? googleApiKey.length : 0,
      apiKeyPrefix: googleApiKey ? googleApiKey.substring(0, 8) + '...' : 'Not set',
      hasSearchEngineId: !!googleSearchEngineId,
      searchEngineIdLength: googleSearchEngineId ? googleSearchEngineId.length : 0,
      searchEngineIdPrefix: googleSearchEngineId ? googleSearchEngineId.substring(0, 8) + '...' : 'Not set',
      envPath: process.cwd() + '/.env.local'
    };

    return NextResponse.json(debugInfo);
  } catch (error) {
    return NextResponse.json({ error: 'Debug endpoint error' }, { status: 500 });
  }
}