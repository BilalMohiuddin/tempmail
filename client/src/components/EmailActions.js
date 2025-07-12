import React, { useState } from 'react';
import { useEmail } from '../contexts/EmailContext';
import { Download, Trash2, Clock, Settings } from 'lucide-react';
import { toast } from 'react-hot-toast';

const EmailActions = ({ emailAddress, emailCount, onRefresh }) => {
  const { exportEmails, extendEmailAddress } = useEmail();
  const [isExporting, setIsExporting] = useState(false);
  const [isExtending, setIsExtending] = useState(false);

  const handleExport = async (format) => {
    setIsExporting(true);
    try {
      await exportEmails(format);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExtendExpiration = async () => {
    setIsExtending(true);
    try {
      await extendEmailAddress(24); // Extend by 24 hours
    } catch (error) {
      console.error('Extension failed:', error);
    } finally {
      setIsExtending(false);
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to delete all emails? This action cannot be undone.')) {
      // This would need to be implemented in the backend
      toast.info('Clear all functionality coming soon');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            {emailCount} email{emailCount !== 1 ? 's' : ''} in inbox
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => handleExport('json')}
              disabled={isExporting || emailCount === 0}
              className="flex items-center space-x-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              title="Export emails"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
            {isExporting && (
              <div className="absolute inset-0 bg-white bg-opacity-75 rounded-lg flex items-center justify-center">
                <div className="spinner"></div>
              </div>
            )}
          </div>

          {/* Extend Expiration */}
          <button
            onClick={handleExtendExpiration}
            disabled={isExtending}
            className="flex items-center space-x-1 bg-orange-100 text-orange-700 px-3 py-2 rounded-lg hover:bg-orange-200 transition-colors text-sm font-medium disabled:opacity-50"
            title="Extend email address expiration"
          >
            <Clock className="h-4 w-4" />
            <span>Extend</span>
          </button>

          {/* Clear All */}
          <button
            onClick={handleClearAll}
            disabled={emailCount === 0}
            className="flex items-center space-x-1 bg-red-100 text-red-700 px-3 py-2 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            title="Delete all emails"
          >
            <Trash2 className="h-4 w-4" />
            <span>Clear All</span>
          </button>

          {/* Settings */}
          <button
            className="flex items-center space-x-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
            title="Settings"
          >
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="text-gray-900 font-medium">{emailCount}</div>
            <div className="text-gray-500">Total Emails</div>
          </div>
          <div className="text-center">
            <div className="text-blue-600 font-medium">
              {emailCount > 0 ? Math.round((emailCount / (emailCount + 1)) * 100) : 0}%
            </div>
            <div className="text-gray-500">Inbox Full</div>
          </div>
          <div className="text-center">
            <div className="text-green-600 font-medium">Active</div>
            <div className="text-gray-500">Status</div>
          </div>
          <div className="text-center">
            <div className="text-orange-600 font-medium">48h</div>
            <div className="text-gray-500">Expires In</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailActions; 