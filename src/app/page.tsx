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

export default function Home() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    keyword: '',
    country: 'US'
  });
  const [selectedResults, setSelectedResults] = useState<SearchResult[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.keyword.trim()) {
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
        />
      </div>
    );
  }

  return null;
}
