import React, { useState } from 'react';
import { Copy, Check, RefreshCw, Plus, Clock, Mail } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

const EmailAddressDisplay = ({ emailAddress, metadata, onGenerateNew, onRefresh }) => {
  const [copied, setCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(emailAddress);
      setCopied(true);
      toast.success('Email address copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy email address');
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
      toast.success('Inbox refreshed!');
    } catch (error) {
      toast.error('Failed to refresh inbox');
    } finally {
      setIsRefreshing(false);
    }
  };

  const getTimeUntilExpiry = () => {
    if (!metadata?.expiresAt) return null;
    return formatDistanceToNow(new Date(metadata.expiresAt), { addSuffix: true });
  };

  const getTimeSinceCreated = () => {
    if (!metadata?.createdAt) return null;
    return formatDistanceToNow(new Date(metadata.createdAt), { addSuffix: true });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Your Email Address</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            title="Refresh inbox"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={onGenerateNew}
            className="flex items-center space-x-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <Plus className="h-4 w-4" />
            <span>New Address</span>
          </button>
        </div>
      </div>

      {/* Email Address */}
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Mail className="h-5 w-5 text-gray-500" />
            <span className="font-mono text-lg text-gray-900 break-all">
              {emailAddress}
            </span>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1 bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium copy-button"
            title="Copy email address"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-green-600" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Metadata */}
      {metadata && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center space-x-2 text-gray-600">
            <Clock className="h-4 w-4" />
            <div>
              <div className="font-medium">Created</div>
              <div>{getTimeSinceCreated()}</div>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <Clock className="h-4 w-4" />
            <div>
              <div className="font-medium">Expires</div>
              <div className="text-orange-600">{getTimeUntilExpiry()}</div>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <Mail className="h-4 w-4" />
            <div>
              <div className="font-medium">Emails</div>
              <div>{metadata.emailCount || 0} received</div>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">How to use:</h3>
        <ol className="text-sm text-blue-800 space-y-1">
          <li>1. Copy the email address above</li>
          <li>2. Use it to sign up for services or receive emails</li>
          <li>3. Emails will appear in your inbox automatically</li>
          <li>4. This address expires in 48 hours for your privacy</li>
        </ol>
      </div>
    </div>
  );
};

export default EmailAddressDisplay; 