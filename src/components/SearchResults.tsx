'use client';

import { useState, useEffect } from 'react';
import { Check, ExternalLink, ArrowRight, Loader2 } from 'lucide-react';

interface SearchResult {
  id: string;
  title: string;
  url: string;
  snippet: string;
  displayLink: string;
}

interface SearchResultsProps {
  keyword: string;
  country: string;
  onNext: (selectedResults: SearchResult[]) => void;
}

export default function SearchResults({ keyword, country, onNext }: SearchResultsProps) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedResults, setSelectedResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInfo, setSearchInfo] = useState<{source: string, totalResults: number, searchTime: string} | null>(null);

  useEffect(() => {
    fetchSearchResults();
  }, [keyword, country]);

  const fetchSearchResults = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ keyword, country }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch search results');
      }

      const data = await response.json();
      setResults(data.results);
      setSearchInfo({
        source: data.source,
        totalResults: data.totalResults,
        searchTime: data.searchTime
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleResultSelect = (result: SearchResult) => {
    if (selectedResults.find(r => r.id === result.id)) {
      setSelectedResults(selectedResults.filter(r => r.id !== result.id));
    } else if (selectedResults.length < 5) {
      setSelectedResults([...selectedResults, result]);
    }
  };

  const handleNext = () => {
    if (selectedResults.length > 0) {
      onNext(selectedResults);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-3 text-lg text-gray-600">Searching...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">Error: {error}</div>
        <button
          onClick={fetchSearchResults}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Search Results for "{keyword}"
          </h2>
          <p className="text-gray-600 mt-1">
            Select up to 5 results to analyze ({selectedResults.length}/5 selected)
          </p>
          {searchInfo && (
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <span>
                {searchInfo.totalResults.toLocaleString()} results in {searchInfo.searchTime}s
              </span>
              <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                🔍 Google Search
              </span>
            </div>
          )}
        </div>
        <button
          onClick={handleNext}
          disabled={selectedResults.length === 0}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
        >
          Analyze Selected
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>

      <div className="grid gap-4">
        {results.map((result) => {
          const isSelected = selectedResults.find(r => r.id === result.id);
          const canSelect = selectedResults.length < 5 || isSelected;

          return (
            <div
              key={result.id}
              className={`p-4 border rounded-lg cursor-pointer transition-all ${
                isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : canSelect
                  ? 'border-gray-200 hover:border-gray-300 bg-white'
                  : 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
              }`}
              onClick={() => canSelect && handleResultSelect(result)}
            >
              <div className="flex items-start gap-3">
                <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  isSelected
                    ? 'bg-blue-600 border-blue-600'
                    : 'border-gray-300'
                }`}>
                  {isSelected && <Check className="h-4 w-4 text-white" />}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-medium text-blue-600 hover:text-blue-800">
                      {result.title}
                    </h3>
                    <ExternalLink className="h-4 w-4 text-gray-400" />
                  </div>
                  <p className="text-sm text-green-600 mb-1">{result.displayLink}</p>
                  <p className="text-gray-600 text-sm leading-relaxed">{result.snippet}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedResults.length > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">Selected for Analysis:</h3>
          <div className="space-y-1">
            {selectedResults.map((result) => (
              <div key={result.id} className="text-sm text-blue-800">
                • {result.title}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}