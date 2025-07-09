'use client';

import { useState } from 'react';
import { Search, MapPin, ArrowRight } from 'lucide-react';
import SearchResults from '@/components/SearchResults';
import AnalysisView from '@/components/AnalysisView';

interface SearchResult {
  id: string;
  title: string;
  url: string;
  snippet: string;
  displayLink: string;
}

interface SEMrushData {
  keyword: string;
  country: string;
  search_volume: number;
  keyword_difficulty: number;
  intent: string[];
  cpc: number;
  global_volume_data: Array<{
    country: string;
    search_volume: number;
  }>;
}

export default function Home() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    keyword: '',
    country: 'US'
  });
  const [selectedResults, setSelectedResults] = useState<SearchResult[]>([]);
  const [semrushData, setSemrushData] = useState<SEMrushData | null>(null);
  const [loadingSemrush, setLoadingSemrush] = useState(false);

  const fetchSemrushData = async () => {
    setLoadingSemrush(true);
    try {
      const response = await fetch('/api/semrush', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          keyword: formData.keyword,
          country: formData.country
        }),
      });
      
      const result = await response.json();
      if (result.success) {
        setSemrushData(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch SEMrush data:', error);
    } finally {
      setLoadingSemrush(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.keyword.trim()) {
      fetchSemrushData();
      setStep(2);
    }
  };

  const handleResultsSelected = (results: SearchResult[]) => {
    setSelectedResults(results);
    setStep(3);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const countries = [
    { code: 'US', name: 'United States' },
    { code: 'UK', name: 'United Kingdom' },
    { code: 'CA', name: 'Canada' },
    { code: 'AU', name: 'Australia' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
    { code: 'IN', name: 'India' },
    { code: 'JP', name: 'Japan' },
  ];

  if (step === 1) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">SEO Research Wizard</h1>
            <p className="text-gray-600">Enter your keyword and target country to begin your SEO research</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="keyword" className="block text-sm font-medium text-gray-700 mb-2">
                Keyword
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  id="keyword"
                  value={formData.keyword}
                  onChange={(e) => setFormData({ ...formData, keyword: e.target.value })}
                  placeholder="Enter your target keyword"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                Target Country
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <select
                  id="country"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                >
                  {countries.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center justify-center gap-2"
            >
              Start Research
              <ArrowRight className="h-5 w-5" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (step === 2) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-8">
          {semrushData && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">SEMrush Keyword Analysis</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{semrushData.search_volume?.toLocaleString() || 'N/A'}</div>
                  <div className="text-sm text-gray-600">Search Volume</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{semrushData.keyword_difficulty || 'N/A'}</div>
                  <div className="text-sm text-gray-600">Keyword Difficulty</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">${semrushData.cpc?.toFixed(2) || 'N/A'}</div>
                  <div className="text-sm text-gray-600">CPC</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-600">{semrushData.intent?.join(', ') || 'N/A'}</div>
                  <div className="text-sm text-gray-600">Intent</div>
                </div>
              </div>
            </div>
          )}
          {loadingSemrush && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading SEMrush data...</span>
              </div>
            </div>
          )}
          <SearchResults
            keyword={formData.keyword}
            country={formData.country}
            onNext={handleResultsSelected}
          />
        </div>
      </div>
    );
  }

  if (step === 3) {
    return (
      <div className="max-w-7xl mx-auto">
        <AnalysisView
          selectedResults={selectedResults}
          keyword={formData.keyword}
          onBack={handleBack}
          semrushData={semrushData}
        />
      </div>
    );
  }

  return null;
}
