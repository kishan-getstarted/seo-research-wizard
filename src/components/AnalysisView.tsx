'use client';

import { useState, useEffect } from 'react';
import { 
  Eye, 
  Download, 
  Loader2, 
  AlertTriangle, 
  BarChart3,
  Hash,
  FileText,
  Code,
  Edit3,
  Plus,
  X
} from 'lucide-react';

interface SearchResult {
  id: string;
  title: string;
  url: string;
  snippet: string;
  displayLink: string;
}

interface AnalysisData {
  url: string;
  title: string;
  metadata: {
    description: string;
    keywords: string;
    h1Tags: string[];
    h2Tags: string[];
    openGraph: any;
    twitter: any;
  };
  schema: any[];
  keywordAnalysis: {
    keyword: string;
    count: number;
    density: number;
    totalWords: number;
  };
  highlightedContent: string;
  status: 'pending' | 'loading' | 'success' | 'error';
  error?: string;
}

interface AnalysisViewProps {
  selectedResults: SearchResult[];
  keyword: string;
  onBack: () => void;
}

export default function AnalysisView({ selectedResults, keyword, onBack }: AnalysisViewProps) {
  const [analysisData, setAnalysisData] = useState<AnalysisData[]>([]);
  const [overallLoading, setOverallLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [showConsolidated, setShowConsolidated] = useState(false);
  const [customData, setCustomData] = useState({
    keywords: '',
    meta: '',
    schema: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  
  // Custom entries for each section
  const [customH1Tags, setCustomH1Tags] = useState<string[]>([]);
  const [customKeywords, setCustomKeywords] = useState<string[]>([]);
  const [customSchemas, setCustomSchemas] = useState<string[]>([]);
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [newEntryValue, setNewEntryValue] = useState('');

  // Functions for managing custom entries
  const handleAddEntry = (section: string) => {
    setAddingTo(section);
    setNewEntryValue('');
  };

  const handleSaveEntry = () => {
    if (!newEntryValue.trim() || !addingTo) return;

    switch (addingTo) {
      case 'h1':
        setCustomH1Tags(prev => [...prev, newEntryValue.trim()]);
        break;
      case 'keywords':
        setCustomKeywords(prev => [...prev, newEntryValue.trim()]);
        break;
      case 'schemas':
        setCustomSchemas(prev => [...prev, newEntryValue.trim()]);
        break;
    }

    setAddingTo(null);
    setNewEntryValue('');
  };

  const handleCancelEntry = () => {
    setAddingTo(null);
    setNewEntryValue('');
  };

  const handleRemoveEntry = (section: string, index: number) => {
    switch (section) {
      case 'h1':
        setCustomH1Tags(prev => prev.filter((_, i) => i !== index));
        break;
      case 'keywords':
        setCustomKeywords(prev => prev.filter((_, i) => i !== index));
        break;
      case 'schemas':
        setCustomSchemas(prev => prev.filter((_, i) => i !== index));
        break;
    }
  };

  useEffect(() => {
    initializeAndAnalyze();
  }, [selectedResults, keyword]);

  const initializeAndAnalyze = async () => {
    // Initialize all items with pending status
    const initialData: AnalysisData[] = selectedResults.map(result => ({
      url: result.url,
      title: result.title,
      metadata: {
        description: '',
        keywords: '',
        h1Tags: [],
        h2Tags: [],
        openGraph: {},
        twitter: {}
      },
      schema: [],
      keywordAnalysis: {
        keyword,
        count: 0,
        density: 0,
        totalWords: 0
      },
      highlightedContent: '',
      status: 'pending' as const
    }));

    setAnalysisData(initialData);
    setOverallLoading(true);

    // Analyze each URL individually
    await analyzeResultsIndividually(initialData);
    setOverallLoading(false);
  };

  const analyzeResultsIndividually = async (initialData: AnalysisData[]) => {
    for (let i = 0; i < selectedResults.length; i++) {
      const result = selectedResults[i];
      
      // Update status to loading
      setAnalysisData(prev => prev.map((item, index) => 
        index === i ? { ...item, status: 'loading' as const } : item
      ));

      try {
        console.log(`Starting analysis for: ${result.url}`);
        
        const response = await fetch('/api/scrape', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: result.url, keyword }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.details || `HTTP ${response.status}`);
        }

        const analysisResult = await response.json();
        
        // Update with successful result
        setAnalysisData(prev => prev.map((item, index) => 
          index === i ? { 
            ...analysisResult, 
            status: 'success' as const,
            error: undefined
          } : item
        ));

        console.log(`Successfully analyzed: ${result.url}`);

      } catch (error) {
        console.error(`Failed to analyze ${result.url}:`, error);
        
        // Update with error status but keep the item
        setAnalysisData(prev => prev.map((item, index) => 
          index === i ? { 
            ...item, 
            status: 'error' as const,
            error: error instanceof Error ? error.message : 'Unknown error'
          } : item
        ));
      }

      // Small delay between requests to be respectful
      if (i < selectedResults.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  };

  const retryAnalysis = async (index: number) => {
    const result = selectedResults[index];
    
    // Update status to loading
    setAnalysisData(prev => prev.map((item, idx) => 
      idx === index ? { ...item, status: 'loading' as const, error: undefined } : item
    ));

    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: result.url, keyword }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || `HTTP ${response.status}`);
      }

      const analysisResult = await response.json();
      
      // Update with successful result
      setAnalysisData(prev => prev.map((item, idx) => 
        idx === index ? { 
          ...analysisResult, 
          status: 'success' as const,
          error: undefined
        } : item
      ));

    } catch (error) {
      // Update with error status
      setAnalysisData(prev => prev.map((item, idx) => 
        idx === index ? { 
          ...item, 
          status: 'error' as const,
          error: error instanceof Error ? error.message : 'Unknown error'
        } : item
      ));
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: analysisData,
          keyword,
          customData
        }),
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `seo-research-${keyword.replace(/[^a-zA-Z0-9]/g, '-')}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
    }
  };

  // Show progress while initial loading
  if (overallLoading && analysisData.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-3 text-lg text-gray-600">Initializing analysis...</span>
      </div>
    );
  }

  // Get counts for progress display
  const completedCount = analysisData.filter(item => item.status === 'success').length;
  const errorCount = analysisData.filter(item => item.status === 'error').length;
  const loadingCount = analysisData.filter(item => item.status === 'loading').length;
  const totalCount = analysisData.length;

  // Only use successfully scraped data for consolidation
  const successfulData = analysisData.filter(data => data.status === 'success');
  
  const consolidatedData = {
    allH1Tags: [...successfulData.flatMap(data => data.metadata.h1Tags), ...customH1Tags],
    allKeywords: [...new Set([
      ...successfulData.flatMap(data => 
        data.metadata.keywords.split(',').map(k => k.trim()).filter(k => k)
      ),
      ...customKeywords
    ])],
    allSchemas: [...successfulData.flatMap(data => data.schema), ...customSchemas.map(schema => ({ '@type': schema }))],
    avgKeywordDensity: successfulData.length > 0 
      ? successfulData.reduce((sum, data) => sum + data.keywordAnalysis.density, 0) / successfulData.length 
      : 0
  };

  if (showConsolidated) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Consolidated Analysis</h2>
          <div className="flex gap-3">
            <button
              onClick={() => setShowConsolidated(false)}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              Back to Individual
            </button>
            <button
              onClick={handleExport}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export Report
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Hash className="h-5 w-5 text-blue-600" />
                All H1 Tags ({consolidatedData.allH1Tags.length})
              </h3>
              <button
                onClick={() => handleAddEntry('h1')}
                className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 flex items-center gap-1 text-sm"
              >
                <Plus className="h-4 w-4" />
                Add
              </button>
            </div>
            
            {addingTo === 'h1' && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <input
                  type="text"
                  value={newEntryValue}
                  onChange={(e) => setNewEntryValue(e.target.value)}
                  placeholder="Enter H1 tag text..."
                  className="w-full p-2 border rounded-lg mb-2"
                  onKeyPress={(e) => e.key === 'Enter' && handleSaveEntry()}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveEntry}
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancelEntry}
                    className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {consolidatedData.allH1Tags.map((h1, index) => (
                <div key={index} className="p-2 bg-gray-50 rounded text-sm flex justify-between items-center group">
                  <span>{h1}</span>
                  {index >= successfulData.flatMap(data => data.metadata.h1Tags).length && (
                    <button
                      onClick={() => handleRemoveEntry('h1', index - successfulData.flatMap(data => data.metadata.h1Tags).length)}
                      className="text-red-600 hover:text-red-800 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="h-5 w-5 text-green-600" />
                All Keywords ({consolidatedData.allKeywords.length})
              </h3>
              <button
                onClick={() => handleAddEntry('keywords')}
                className="bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 flex items-center gap-1 text-sm"
              >
                <Plus className="h-4 w-4" />
                Add
              </button>
            </div>
            
            {addingTo === 'keywords' && (
              <div className="mb-4 p-3 bg-green-50 rounded-lg">
                <input
                  type="text"
                  value={newEntryValue}
                  onChange={(e) => setNewEntryValue(e.target.value)}
                  placeholder="Enter keyword..."
                  className="w-full p-2 border rounded-lg mb-2"
                  onKeyPress={(e) => e.key === 'Enter' && handleSaveEntry()}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveEntry}
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancelEntry}
                    className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            
            <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto">
              {consolidatedData.allKeywords.map((keyword, index) => {
                const originalKeywords = [...new Set(successfulData.flatMap(data => 
                  data.metadata.keywords.split(',').map(k => k.trim()).filter(k => k)
                ))];
                const isCustom = !originalKeywords.includes(keyword);
                
                return (
                  <span key={index} className="px-2 py-1 bg-green-100 text-green-800 rounded text-sm flex items-center gap-1 group">
                    {keyword}
                    {isCustom && (
                      <button
                        onClick={() => handleRemoveEntry('keywords', customKeywords.indexOf(keyword))}
                        className="text-red-600 hover:text-red-800 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </span>
                );
              })}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Code className="h-5 w-5 text-purple-600" />
                Schema Types ({consolidatedData.allSchemas.length})
              </h3>
              <button
                onClick={() => handleAddEntry('schemas')}
                className="bg-purple-600 text-white px-3 py-1 rounded-lg hover:bg-purple-700 flex items-center gap-1 text-sm"
              >
                <Plus className="h-4 w-4" />
                Add
              </button>
            </div>
            
            {addingTo === 'schemas' && (
              <div className="mb-4 p-3 bg-purple-50 rounded-lg">
                <input
                  type="text"
                  value={newEntryValue}
                  onChange={(e) => setNewEntryValue(e.target.value)}
                  placeholder="Enter schema type..."
                  className="w-full p-2 border rounded-lg mb-2"
                  onKeyPress={(e) => e.key === 'Enter' && handleSaveEntry()}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveEntry}
                    className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancelEntry}
                    className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {consolidatedData.allSchemas.map((schema, index) => {
                const originalSchemas = successfulData.flatMap(data => data.schema);
                const isCustom = index >= originalSchemas.length;
                
                return (
                  <div key={index} className="p-2 bg-gray-50 rounded text-sm flex justify-between items-center group">
                    <span>{schema['@type'] || 'Unknown Schema'}</span>
                    {isCustom && (
                      <button
                        onClick={() => handleRemoveEntry('schemas', index - originalSchemas.length)}
                        className="text-red-600 hover:text-red-800 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-orange-600" />
              Keyword Density Analysis
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Average Density:</span>
                <span className="text-lg font-bold text-orange-600">
                  {consolidatedData.avgKeywordDensity.toFixed(2)}%
                </span>
              </div>
              {analysisData.map((data, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <span className="truncate flex-1 mr-2">{data.title}</span>
                  <span className="font-medium">{data.keywordAnalysis.density.toFixed(2)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Edit3 className="h-5 w-5 text-blue-600" />
              Custom Data
            </h3>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="text-blue-600 hover:text-blue-800"
            >
              {isEditing ? 'Save' : 'Edit'}
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Custom Keywords</label>
              {isEditing ? (
                <textarea
                  value={customData.keywords}
                  onChange={(e) => setCustomData({...customData, keywords: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                  rows={3}
                  placeholder="Enter custom keywords..."
                />
              ) : (
                <div className="p-2 bg-gray-50 rounded-lg min-h-[80px]">
                  {customData.keywords || 'No custom keywords added'}
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Custom Meta</label>
              {isEditing ? (
                <textarea
                  value={customData.meta}
                  onChange={(e) => setCustomData({...customData, meta: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                  rows={3}
                  placeholder="Enter custom meta data..."
                />
              ) : (
                <div className="p-2 bg-gray-50 rounded-lg min-h-[80px]">
                  {customData.meta || 'No custom meta added'}
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Custom Schema</label>
              {isEditing ? (
                <textarea
                  value={customData.schema}
                  onChange={(e) => setCustomData({...customData, schema: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                  rows={3}
                  placeholder="Enter custom schema..."
                />
              ) : (
                <div className="p-2 bg-gray-50 rounded-lg min-h-[80px]">
                  {customData.schema || 'No custom schema added'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Website Analysis</h2>
          <div className="flex items-center gap-4 mt-2 text-sm">
            <span className="text-green-600">✅ {completedCount} completed</span>
            {errorCount > 0 && <span className="text-red-600">❌ {errorCount} failed</span>}
            {loadingCount > 0 && <span className="text-blue-600">🔄 {loadingCount} analyzing</span>}
            <span className="text-gray-600">({completedCount + errorCount}/{totalCount} finished)</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
          >
            Back
          </button>
          <button
            onClick={() => setShowConsolidated(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            disabled={completedCount === 0}
          >
            Consolidate Data
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b">
          <div className="flex overflow-x-auto">
            {analysisData.map((data, index) => {
              const getStatusIcon = () => {
                switch (data.status) {
                  case 'success': return '✅';
                  case 'error': return '❌';
                  case 'loading': return '🔄';
                  default: return '⏳';
                }
              };

              return (
                <button
                  key={index}
                  onClick={() => setActiveTab(index)}
                  className={`px-4 py-3 text-sm font-medium whitespace-nowrap flex items-center gap-2 ${
                    activeTab === index
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <span>{getStatusIcon()}</span>
                  <span>{data.title.substring(0, 25)}...</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-6">
          {analysisData[activeTab] && (
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold mb-2">{analysisData[activeTab].title}</h3>
                  <p className="text-blue-600 hover:underline">
                    <a href={analysisData[activeTab].url} target="_blank" rel="noopener noreferrer">
                      {analysisData[activeTab].url}
                    </a>
                  </p>
                  {analysisData[activeTab].status === 'loading' && (
                    <div className="flex items-center gap-2 mt-2 text-blue-600">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Analyzing...</span>
                    </div>
                  )}
                  {analysisData[activeTab].status === 'error' && (
                    <div className="mt-2">
                      <div className="flex items-center gap-2 text-red-600 mb-2">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="text-sm">Analysis failed</span>
                      </div>
                      <p className="text-red-600 text-sm mb-2">{analysisData[activeTab].error}</p>
                      <button
                        onClick={() => retryAnalysis(activeTab)}
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                      >
                        Retry Analysis
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => window.open(analysisData[activeTab].url, '_blank')}
                    className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    View Page
                  </button>
                  {analysisData[activeTab].status === 'success' && (
                    <button
                      onClick={() => retryAnalysis(activeTab)}
                      className="bg-gray-600 text-white px-3 py-1 rounded-lg hover:bg-gray-700 text-sm"
                    >
                      Re-analyze
                    </button>
                  )}
                </div>
              </div>

              {analysisData[activeTab].status === 'success' && (

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Metadata</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Description:</span>
                        <p className="text-gray-600">{analysisData[activeTab].metadata.description || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="font-medium">Keywords:</span>
                        <p className="text-gray-600">{analysisData[activeTab].metadata.keywords || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">H1 Tags ({analysisData[activeTab].metadata.h1Tags.length})</h4>
                    <div className="space-y-1">
                      {analysisData[activeTab].metadata.h1Tags.map((h1, index) => (
                        <div key={index} className="text-sm p-2 bg-white rounded border">
                          {h1}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Keyword Analysis</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Keyword:</span>
                        <span className="font-medium">{analysisData[activeTab].keywordAnalysis.keyword}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Count:</span>
                        <span className="font-medium">{analysisData[activeTab].keywordAnalysis.count}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Density:</span>
                        <span className="font-medium">{analysisData[activeTab].keywordAnalysis.density.toFixed(2)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Words:</span>
                        <span className="font-medium">{analysisData[activeTab].keywordAnalysis.totalWords}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Schema Markup ({analysisData[activeTab].schema.length})</h4>
                    <div className="space-y-1">
                      {analysisData[activeTab].schema.length > 0 ? (
                        analysisData[activeTab].schema.map((schema, index) => (
                          <div key={index} className="text-sm p-2 bg-white rounded border">
                            {schema['@type'] || 'Unknown Schema'}
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-600 text-sm">No schema markup found</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              )}

              {analysisData[activeTab].status === 'pending' && (
                <div className="text-center py-12">
                  <div className="text-gray-500">Waiting to analyze...</div>
                </div>
              )}

              {analysisData[activeTab].status === 'loading' && (
                <div className="text-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
                  <div className="text-gray-600">Analyzing website content...</div>
                </div>
              )}

              {analysisData[activeTab].status === 'error' && (
                <div className="text-center py-12">
                  <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                  <div className="text-red-600 mb-2">Failed to analyze this website</div>
                  <div className="text-gray-600 text-sm mb-4">{analysisData[activeTab].error}</div>
                  <button
                    onClick={() => retryAnalysis(activeTab)}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                  >
                    Retry Analysis
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}