import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEmail } from '../contexts/EmailContext';
import { useSocket } from '../contexts/SocketContext';
import Header from './Header';
import EmailAddressDisplay from './EmailAddressDisplay';
import EmailList from './EmailList';
import EmailSearch from './EmailSearch';
import EmailActions from './EmailActions';
import LoadingSpinner from './LoadingSpinner';

const HomePage = () => {
  const navigate = useNavigate();
  const { 
    currentEmailAddress, 
    emails, 
    loading, 
    error,
    generateEmailAddress, 
    fetchEmails,
    markEmailAsRead 
  } = useEmail();
  const { isConnected } = useSocket();
  const [hasTriedGenerate, setHasTriedGenerate] = useState(false);

  // Generate email address on component mount if none exists
  useEffect(() => {
    if (!currentEmailAddress && !loading && !hasTriedGenerate) {
      setHasTriedGenerate(true);
      // Add a small delay to prevent rapid requests
      const timer = setTimeout(async () => {
        try {
          await generateEmailAddress();
        } catch (error) {
          if (error.response?.status === 429) {
            // If rate limited, wait and retry once
            setTimeout(async () => {
              try {
                await generateEmailAddress();
              } catch (retryError) {
                console.error('Retry failed:', retryError);
              }
            }, 2000); // Wait 2 seconds before retry
          }
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [currentEmailAddress, loading, generateEmailAddress, hasTriedGenerate]);

  // Fetch emails when email address changes
  useEffect(() => {
    if (currentEmailAddress) {
      fetchEmails();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentEmailAddress]); // Remove fetchEmails from dependencies

  const handleEmailClick = async (email) => {
    if (!email.read) {
      await markEmailAsRead(email.id);
    }
    navigate(`/email/${email.id}`);
  };

  const handleGenerateNewAddress = async () => {
    try {
      setHasTriedGenerate(false); // Reset the flag
      await generateEmailAddress();
    } catch (error) {
      console.error('Manual retry failed:', error);
    }
  };

  if (loading && !currentEmailAddress) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Connection Status */}
          <div className={`mb-4 p-3 rounded-lg text-sm ${
            isConnected 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
          </div>

          {/* Email Address Display */}
          <EmailAddressDisplay 
            emailAddress={currentEmailAddress}
            onGenerateNew={handleGenerateNewAddress}
          />

          {/* Search Bar */}
          <EmailSearch />

          {/* Email Actions */}
          <EmailActions />

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              <div className="flex justify-between items-center">
                <span>{error}</span>
                <button
                  onClick={handleGenerateNewAddress}
                  disabled={loading}
                  className={`px-3 py-1 text-sm rounded ${
                    loading 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-red-600 hover:bg-red-700'
                  } text-white`}
                >
                  {loading ? 'Retrying...' : 'Retry'}
                </button>
              </div>
            </div>
          )}

          {/* Email List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Inbox {emails.length > 0 && `(${emails.length})`}
              </h2>
            </div>
            
            {loading ? (
              <div className="p-8 text-center">
                <LoadingSpinner />
              </div>
            ) : emails.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <div className="text-6xl mb-4">📧</div>
                <p className="text-lg">No emails yet</p>
                <p className="text-sm">Emails sent to your address will appear here</p>
              </div>
            ) : (
              <EmailList 
                emails={emails} 
                onEmailClick={handleEmailClick}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default HomePage; 