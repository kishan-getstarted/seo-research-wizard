# Google Custom Search API Setup

This application requires Google Custom Search API to function. Since you already have a Google Search Engine ID, you just need to create an API key.

## Required Setup Steps

### 1. Enable the Custom Search API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project or create a new one
3. Go to "APIs & Services" → "Library"
4. Search for "Custom Search API" and enable it

### 2. Create API Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "API Key"
3. Copy your API key
4. (Optional) Restrict the API key to only allow Custom Search API for security

### 3. Configure Environment Variables

1. Open the `.env.local` file in your project root
2. Add your Google API credentials:
   ```env
   GOOGLE_API_KEY=your_actual_api_key_here
   GOOGLE_SEARCH_ENGINE_ID=your_existing_search_engine_id
   ```

### 4. Restart the Development Server

```bash
npm run dev
```

That's it! Your application will now use real Google search results.

## Testing the Setup

1. **Start the application:**
   ```bash
   npm run dev
   ```

2. **Test search functionality:**
   - Go to [http://localhost:3000](http://localhost:3000)
   - Enter a keyword (e.g., "Next.js")
   - Select a country
   - Click "Start Research"

3. **Verify Google search results:**
   - Look for "🔍 Google Search" badge on the results page
   - You should see real Google search results specific to your selected country
   - If you get an error, check your API key configuration

## API Limits and Pricing

### Google Custom Search API:
- **Free Tier**: 100 searches/day
- **Paid**: $5 per 1,000 queries (up to 10k/day)
- **Rate Limits**: 100 queries per 100 seconds per user

## Error Messages

If the API is not configured properly, you'll see specific error messages:

- **"Google Custom Search API is not configured"**: Missing API key or Search Engine ID
- **"Google API quota exceeded"**: You've hit your daily limit (100 searches/day on free tier)
- **"Invalid API key"**: Your API key is incorrect or not authorized
- **"No search results found"**: The keyword returned no results (try a different keyword)

## Troubleshooting

### Common Issues:

1. **Configuration errors:**
   - Check that your `.env.local` file is in the project root
   - Verify both `GOOGLE_API_KEY` and `GOOGLE_SEARCH_ENGINE_ID` are set
   - Restart the development server after making changes

2. **API errors:**
   - Check your API key is valid and not expired
   - Ensure you haven't exceeded rate limits (100 searches/day free)
   - Verify the Custom Search API is enabled in Google Cloud Console

3. **No search results:**
   - Try a different keyword (some keywords may not return results)
   - Check if the country parameter is supported
   - Verify your search engine configuration at [cse.google.com](https://cse.google.com)

### Debug Mode:

To see detailed API responses and errors, check the browser console and server logs when performing searches.

## Production Deployment

For production deployment:

1. **Set environment variables** in your hosting platform (Vercel, Netlify, etc.)
2. **Monitor API usage** to avoid exceeding limits
3. **Implement caching** to reduce API calls
4. **Add rate limiting** to prevent abuse
5. **Consider upgrading** to paid API plans for higher limits

## Security Notes

- Never commit API keys to your repository
- Use environment variables for all sensitive data
- Restrict your API key to only Custom Search API in Google Cloud Console
- Consider implementing API key rotation for production

## Support

If you encounter issues:
- Check the [Google Custom Search documentation](https://developers.google.com/custom-search/v1/overview)
- Review the browser console for errors
- Verify your API key permissions and limits
- Test with simple keywords first