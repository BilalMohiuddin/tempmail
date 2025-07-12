import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEmail } from '../contexts/EmailContext';
import { useSocket } from '../contexts/SocketContext';
import EmailAddressDisplay from '../components/EmailAddressDisplay';
import EmailList from '../components/EmailList';
import EmailActions from '../components/EmailActions';
import EmailSearch from '../components/EmailSearch';
import LoadingSpinner from '../components/LoadingSpinner';
import { Mail, Shield, Clock, Zap } from 'lucide-react';

const HomePage = () => {
  const { emailAddress } = useParams();
  const navigate = useNavigate();
  const { isConnected } = useSocket();
  const {
    currentEmailAddress,
    emails,
    loading,
    error,
    metadata,
    generateEmailAddress,
    fetchEmails
  } = useEmail();

  // Initialize email address from URL or generate new one
  useEffect(() => {
    if (emailAddress && emailAddress !== currentEmailAddress) {
      // Navigate to the email address from URL
      navigate(`/email/${emailAddress}`, { replace: true });
    } else if (!currentEmailAddress && !emailAddress) {
      // Generate new email address on first load
      handleGenerateNewAddress();
    }
  }, [emailAddress, currentEmailAddress, navigate, handleGenerateNewAddress]);

  // Fetch emails when email address changes
  useEffect(() => {
    if (currentEmailAddress) {
      fetchEmails(currentEmailAddress);
    }
  }, [currentEmailAddress, fetchEmails]);

  const handleGenerateNewAddress = async () => {
    try {
      const newAddress = await generateEmailAddress();
      navigate(`/email/${newAddress}`, { replace: true });
    } catch (error) {
      console.error('Failed to generate email address:', error);
    }
  };

  const handleRefresh = () => {
    if (currentEmailAddress) {
      fetchEmails(currentEmailAddress);
    }
  };

  if (loading && !currentEmailAddress) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner />
      </div>
    );
  }

  if (error && !currentEmailAddress) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <Mail className="h-12 w-12 mx-auto" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Service</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={handleGenerateNewAddress}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      {!currentEmailAddress && (
        <div className="text-center py-12 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl">
          <div className="max-w-3xl mx-auto px-4">
            <Mail className="h-16 w-16 text-blue-600 mx-auto mb-6" />
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Temporary Email Service
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Generate disposable email addresses instantly. No registration required.
            </p>
            <button
              onClick={handleGenerateNewAddress}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg"
            >
              Generate Email Address
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      {currentEmailAddress && (
        <>
          {/* Email Address Display */}
          <EmailAddressDisplay
            emailAddress={currentEmailAddress}
            metadata={metadata}
            onGenerateNew={handleGenerateNewAddress}
            onRefresh={handleRefresh}
          />

          {/* Connection Status */}
          {!isConnected && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                <span className="text-yellow-800 text-sm">
                  Real-time updates are currently unavailable. Emails will still be received.
                </span>
              </div>
            </div>
          )}

          {/* Email Actions */}
          <EmailActions
            emailAddress={currentEmailAddress}
            emailCount={emails.length}
            onRefresh={handleRefresh}
          />

          {/* Email Search */}
          <EmailSearch />

          {/* Email List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Inbox</h2>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>{emails.length} email{emails.length !== 1 ? 's' : ''}</span>
                  {metadata && (
                    <span>
                      Expires: {new Date(metadata.expiresAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {loading ? (
              <div className="p-8 text-center">
                <LoadingSpinner />
                <p className="text-gray-500 mt-2">Loading emails...</p>
              </div>
            ) : emails.length === 0 ? (
              <div className="p-8 text-center">
                <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No emails yet</h3>
                <p className="text-gray-500 mb-4">
                  Emails sent to this address will appear here automatically.
                </p>
                <div className="flex items-center justify-center space-x-6 text-sm text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Shield className="h-4 w-4" />
                    <span>Spam Protected</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>Auto-expires</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Zap className="h-4 w-4" />
                    <span>Real-time</span>
                  </div>
                </div>
              </div>
            ) : (
              <EmailList emails={emails} />
            )}
          </div>
        </>
      )}

      {/* Features Section */}
      <div id="features" className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Features</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Zap className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Instant Generation</h3>
            <p className="text-gray-600">
              Generate disposable email addresses instantly with no registration required.
            </p>
          </div>
          <div className="text-center">
            <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Spam Protection</h3>
            <p className="text-gray-600">
              Advanced anti-spam filters protect you from unwanted emails and malicious content.
            </p>
          </div>
          <div className="text-center">
            <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Auto-Expiration</h3>
            <p className="text-gray-600">
              Email addresses automatically expire after 48 hours for your privacy and security.
            </p>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div id="about" className="bg-gray-50 rounded-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">About Temp Mail</h2>
        <div className="max-w-3xl mx-auto text-center text-gray-600 space-y-4">
          <p>
            Temp Mail is a free, secure, and private temporary email service that allows you to 
            create disposable email addresses instantly. Perfect for testing, avoiding spam, 
            and protecting your privacy online.
          </p>
          <p>
            All emails are automatically deleted after 24 hours, and email addresses expire 
            after 48 hours. No personal information is collected or stored.
          </p>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 