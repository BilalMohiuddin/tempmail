import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { useEmail } from '../contexts/EmailContext';

const EmailSearch = () => {
  const { searchEmails } = useEmail();
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim().length >= 2) {
        setIsSearching(true);
        try {
          const results = await searchEmails(query);
          setSearchResults(results);
          setShowResults(true);
        } catch (error) {
          console.error('Search failed:', error);
          setSearchResults([]);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query, searchEmails]);

  const handleClear = () => {
    setQuery('');
    setSearchResults([]);
    setShowResults(false);
  };

  const handleResultClick = () => {
    setShowResults(false);
  };

  const truncateText = (text, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const highlightText = (text, query) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200">$1</mark>');
  };

  return (
    <div className="relative">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search emails..."
          className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* Search Results */}
      {showResults && (
        <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
          {isSearching ? (
            <div className="p-4 text-center text-gray-500">
              <div className="spinner mx-auto mb-2"></div>
              Searching...
            </div>
          ) : searchResults.length > 0 ? (
            <div className="py-2">
              <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide border-b border-gray-200">
                {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
              </div>
              {searchResults.map((email) => (
                <div
                  key={email.id}
                  onClick={handleResultClick}
                  className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium text-gray-900">
                          {email.from}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(email.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <div 
                        className="text-sm font-medium text-gray-900 mb-1"
                        dangerouslySetInnerHTML={{
                          __html: highlightText(email.subject || 'No Subject', query)
                        }}
                      />
                      <div 
                        className="text-sm text-gray-600"
                        dangerouslySetInnerHTML={{
                          __html: highlightText(truncateText(email.body.replace(/<[^>]*>/g, ''), 150), query)
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : query.trim().length >= 2 ? (
            <div className="p-4 text-center text-gray-500">
              No emails found matching "{query}"
            </div>
          ) : null}
        </div>
      )}

      {/* Search Tips */}
      {!query && (
        <div className="mt-2 text-xs text-gray-500">
          Search by sender, subject, or content. Type at least 2 characters to search.
        </div>
      )}
    </div>
  );
};

export default EmailSearch; 