import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { keyword, country = 'IN' } = await request.json();

    if (!keyword) {
      return NextResponse.json({ error: 'Keyword is required' }, { status: 400 });
    }

    const response = await fetch('https://www.semrush.com/free-tools/api/v1/keyword-search-volume-checker/', {
      method: 'POST',
      headers: {
        'accept': '*/*',
        'accept-language': 'en-US,en;q=0.9,la;q=0.8',
        'content-type': 'application/json',
        'cookie': 'PHPSESSID=a06c454b53c64b5df90c31bf7d6741b2; SSO-JWT=eyJhbGciOiJFUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhMDZjNDU0YjUzYzY0YjVkZjkwYzMxYmY3ZDY3NDFiMiIsImlhdCI6MTc1MjA0MjgwNCwiaXNzIjoic3NvIn0.0-yuJBbiPJZzDLi585UWF3kP7Od-JNUdLUPREarE43JmOZgOgA6oyfJ94-Ayd5H_82qb9dJT6hf1FM1aQA1c3w; GCLB=COT_9r3i56HlFBAD; visit_first=1752042810345; _vwo_uuid_v2=DF3B14A864CF73C0FC39DD459D6198577|8fbe90edd3efaec8f1404b6a39156f5b; _vwo_uuid=DF3B14A864CF73C0FC39DD459D6198577; _vwo_ds=3%241752042809%3A8.66398665%3A%3A; _vwo_sn=0%3A1; ref_code=__default__; refer_source=""; _vis_opt_s=1%7C; _vis_opt_test_cookie=1; _sm_bot=28f27e418a5402aac0c99328f4e81f3bbbf59bb68a8ec1bd733b9b0ea4c06b02; _sm_bot_verify=5341978816634322303:13f63a05fb186348a4790cf71f1771bdd4f23a119f152d366d541f2b277b7d54daa4343eb1dadcce7ef52a799478808fbf12b4fb0d9c3f08ad945dd9d054f9d8061ee61715fd218865dbe83b2e5fa7623622a6fc0af17e17033784339d6418a39c1f5779c6e32971bff596e83c13babd',
        'origin': 'https://www.semrush.com',
        'priority': 'u=1, i',
        'referer': 'https://www.semrush.com/free-tools/keyword-search-volume-checker/',
        'sec-ch-ua': '"Not)A;Brand";v="8", "Chromium";v="138", "Google Chrome";v="138"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Linux"',
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36'
      },
      body: JSON.stringify({
        keyword,
        country: country.toUpperCase()
      })
    });

    if (!response.ok) {
      throw new Error(`SEMrush API error: ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json({
      success: true,
      data: {
        keyword: data.data.keyword,
        country: data.data.country,
        search_volume: data.data.search_volume,
        keyword_difficulty: data.data.keyword_difficulty_index,
        intent: data.data.intent,
        cpc: data.data.cpc,
        global_volume_data: data.data.global_volume_data
      }
    });

  } catch (error) {
    console.error('SEMrush API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch SEMrush data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}