import { NextRequest, NextResponse } from 'next/server';
import { chromium } from 'playwright';
import * as cheerio from 'cheerio';

async function scrapeWithRetry(url: string, maxRetries: number = 3): Promise<string> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    let browser = null;
    let page = null;
    
    try {
      // Launch browser with robust configuration
      browser = await chromium.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
          '--disable-extensions'
        ]
      });

      const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        viewport: { width: 1280, height: 720 },
        extraHTTPHeaders: {
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        }
      });

      page = await context.newPage();

      // Try different wait strategies based on attempt
      let waitStrategy: 'load' | 'domcontentloaded' | 'networkidle' = 'load';
      let timeout = 15000; // 15 seconds

      if (attempt === 1) {
        waitStrategy = 'networkidle';
        timeout = 30000; // 30 seconds for first attempt
      } else if (attempt === 2) {
        waitStrategy = 'load';
        timeout = 20000; // 20 seconds for second attempt  
      } else {
        waitStrategy = 'domcontentloaded';
        timeout = 10000; // 10 seconds for final attempt
      }

      console.log(`Attempt ${attempt}: Scraping ${url} with strategy ${waitStrategy}`);
      
      await page.goto(url, { 
        waitUntil: waitStrategy,
        timeout: timeout
      });

      // Wait a bit more for dynamic content
      await page.waitForTimeout(2000);
      
      const content = await page.content();
      
      if (content && content.length > 100) {
        console.log(`Successfully scraped ${url} on attempt ${attempt}`);
        return content;
      } else {
        throw new Error('Page content too short or empty');
      }

    } catch (error) {
      lastError = error as Error;
      console.error(`Attempt ${attempt} failed for ${url}:`, error);
      
      // Wait before retry (exponential backoff)
      if (attempt < maxRetries) {
        const waitTime = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
        console.log(`Waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    } finally {
      try {
        if (page) await page.close();
        if (browser) await browser.close();
      } catch (cleanupError) {
        console.error('Cleanup error:', cleanupError);
      }
    }
  }
  
  throw lastError || new Error('All scraping attempts failed');
}

export async function POST(request: NextRequest) {
  try {
    const { url, keyword } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    console.log(`Starting scrape for: ${url}`);
    const content = await scrapeWithRetry(url);

    const $ = cheerio.load(content);
    
    // Extract metadata
    const title = $('title').text().trim();
    const metaDescription = $('meta[name="description"]').attr('content') || '';
    const metaKeywords = $('meta[name="keywords"]').attr('content') || '';
    
    // Extract H1 tags
    const h1Tags = $('h1').map((_, el) => $(el).text().trim()).get();
    
    // Extract H2 tags
    const h2Tags = $('h2').map((_, el) => $(el).text().trim()).get();
    
    // Extract schema.org data
    const schemaData = $('script[type="application/ld+json"]').map((_, el) => {
      try {
        return JSON.parse($(el).html() || '{}');
      } catch {
        return null;
      }
    }).get().filter(Boolean);

    // Calculate keyword density
    const bodyText = $('body').text().toLowerCase();
    const totalWords = bodyText.split(/\s+/).filter(word => word.length > 0).length;
    const keywordCount = keyword ? 
      (bodyText.match(new RegExp(keyword.toLowerCase(), 'g')) || []).length : 0;
    const keywordDensity = totalWords > 0 ? (keywordCount / totalWords) * 100 : 0;

    // Extract Open Graph data
    const ogData = {
      title: $('meta[property="og:title"]').attr('content') || '',
      description: $('meta[property="og:description"]').attr('content') || '',
      image: $('meta[property="og:image"]').attr('content') || '',
      url: $('meta[property="og:url"]').attr('content') || ''
    };

    // Extract Twitter Card data
    const twitterData = {
      title: $('meta[name="twitter:title"]').attr('content') || '',
      description: $('meta[name="twitter:description"]').attr('content') || '',
      image: $('meta[name="twitter:image"]').attr('content') || '',
      card: $('meta[name="twitter:card"]').attr('content') || ''
    };

    // Generate highlighted content
    let highlightedContent = $('body').html() || '';
    if (keyword) {
      const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      highlightedContent = highlightedContent.replace(regex, '<mark style="background-color: yellow; padding: 2px 4px; border-radius: 3px;">$&</mark>');
    }

    return NextResponse.json({
      url,
      title,
      metadata: {
        description: metaDescription,
        keywords: metaKeywords,
        h1Tags,
        h2Tags,
        openGraph: ogData,
        twitter: twitterData
      },
      schema: schemaData,
      keywordAnalysis: {
        keyword,
        count: keywordCount,
        density: keywordDensity,
        totalWords
      },
      highlightedContent: highlightedContent.substring(0, 50000) // Limit content size
    });

  } catch (error) {
    console.error('Scraping error:', error);
    return NextResponse.json({ 
      error: 'Failed to scrape website', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}