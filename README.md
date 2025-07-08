# SEO Research Wizard

   A comprehensive SEO research tool built with Next.js, TypeScript, and Playwright for advanced web scraping and analysis.

## Features

### 🔍 Step 1: Search Configuration
- Enter target keyword
- Select target country from 8 supported countries
- Clean, intuitive interface

### 📊 Step 2: Search Results Selection
- Displays mock Google search results (10 results)
- Select up to 5 results for detailed analysis
- Visual selection with checkboxes
- Real-time selection counter

### 🔬 Step 3: Detailed Analysis
- **Tabbed Interface**: Navigate between selected websites
- **Metadata Extraction**: Title, description, keywords, H1/H2 tags
- **Keyword Analysis**: Keyword density, count, total words
- **Schema Markup**: Detects and displays structured data
- **SEO Metrics**: Open Graph and Twitter Card data
- **Keyword Highlighting**: Highlights search terms in webpage content

### 📈 Step 4: Consolidated View
- **All H1 Tags**: Consolidated list from all analyzed pages
- **All Keywords**: Unique keywords from all meta tags
- **Schema Overview**: All schema types found
- **Keyword Density Comparison**: Side-by-side comparison
- **Custom Data Entry**: Add custom keywords, meta, and schema
- **Editable Fields**: Modify and enhance analysis data

### 📄 Step 5: Export Functionality
- **Word Document Export**: Professional SEO report in .docx format
- **Comprehensive Report**: Includes all analysis data
- **Executive Summary**: High-level overview
- **Individual Site Analysis**: Detailed breakdown per website
- **Consolidated Analysis**: Combined insights

## Technical Stack

- **Frontend**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Lucide React icons
- **Web Scraping**: Playwright for browser automation
- **HTML Parsing**: Cheerio for server-side DOM manipulation
- **Document Generation**: docx library for Word export
- **API Routes**: Next.js API routes for backend functionality

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Install Playwright browsers:
   ```bash
   npx playwright install
   ```

4. **Configure Google Custom Search API** (see [SETUP.md](SETUP.md) for details)
   - **REQUIRED**: Get Google API key and use your existing Search Engine ID
   - Add to `.env.local`: `GOOGLE_API_KEY=your_key` and `GOOGLE_SEARCH_ENGINE_ID=your_id`
   - The application requires these credentials to function

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Search Functionality

- **🔍 Google Search**: Uses Google Custom Search API for real search results
- **Country-specific results**: Returns localized results based on selected country
- **Real-time data**: Live search results with actual Google ranking and snippets
- **No fallback modes**: Application requires Google API configuration to function

## API Endpoints

### POST /api/search
- **Purpose**: Real Google search results using Custom Search API
- **Input**: `{ keyword: string, country: string }`
- **Output**: Array of search results with title, URL, snippet, and search metadata
- **Requirements**: GOOGLE_API_KEY and GOOGLE_SEARCH_ENGINE_ID must be configured

### POST /api/scrape
- **Purpose**: Analyze webpage content
- **Input**: `{ url: string, keyword: string }`
- **Output**: Metadata, schema, keyword analysis, highlighted content

### POST /api/export
- **Purpose**: Generate Word document report
- **Input**: `{ data: AnalysisData[], keyword: string }`
- **Output**: .docx file download

## Key Features in Detail

### Metadata Extraction
- Page title and meta description
- Meta keywords
- H1 and H2 headings
- Open Graph properties
- Twitter Card data

### Keyword Analysis
- Keyword frequency count
- Keyword density percentage
- Total word count
- Highlighted keyword instances

### Schema Markup Detection
- JSON-LD structured data
- Schema.org types identification
- Comprehensive schema analysis

### Document Export
- Professional report formatting
- Executive summary
- Individual site breakdowns
- Consolidated analysis
- Custom data integration

## Security Considerations

- Input validation on all API endpoints
- Rate limiting recommended for production
- Content sanitization for XSS prevention
- Error handling for malformed URLs

## Production Deployment

For production use, consider:
- Implementing real Google Custom Search API
- Adding authentication and user management
- Setting up proper error monitoring
- Implementing caching for better performance
- Adding rate limiting for API endpoints

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge

## System Requirements

- Node.js 18+
- 2GB RAM minimum
- Modern browser with JavaScript enabled

## Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## License

MIT License - feel free to use for personal and commercial projects.
