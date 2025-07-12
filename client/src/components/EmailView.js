import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useEmail } from '../contexts/EmailContext';
import { toast } from 'react-hot-toast';
import Header from './Header';
import LoadingSpinner from './LoadingSpinner';

const EmailView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchEmail, deleteEmail, currentEmailAddress } = useEmail();
  const [email, setEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadEmail = async () => {
      try {
        setLoading(true);
        const emailData = await fetchEmail(id);
        setEmail(emailData);
      } catch (err) {
        setError('Failed to load email');
        toast.error('Failed to load email');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadEmail();
    }
  }, [id, fetchEmail]);

  const handleDelete = async () => {
    if (!email) return;

    if (window.confirm('Are you sure you want to delete this email?')) {
      try {
        await deleteEmail(email.id);
        toast.success('Email deleted successfully');
        navigate('/');
      } catch (err) {
        toast.error('Failed to delete email');
      }
    }
  };

  const handleCopyEmailAddress = () => {
    if (currentEmailAddress) {
      navigator.clipboard.writeText(currentEmailAddress);
      toast.success('Email address copied to clipboard!');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error || !email) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error || 'Email not found'}
            </div>
            <div className="mt-4">
              <Link 
                to="/" 
                className="text-blue-600 hover:text-blue-800 underline"
              >
                ← Back to Inbox
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Navigation */}
          <div className="mb-6">
            <Link 
              to="/" 
              className="text-blue-600 hover:text-blue-800 underline flex items-center"
            >
              ← Back to Inbox
            </Link>
          </div>

          {/* Email Content */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Email Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {email.subject || '(No Subject)'}
                  </h1>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>From:</strong> {email.from}</p>
                    <p><strong>To:</strong> {email.to}</p>
                    <p><strong>Date:</strong> {formatDate(email.timestamp)}</p>
                    {email.cc && <p><strong>CC:</strong> {email.cc}</p>}
                    {email.bcc && <p><strong>BCC:</strong> {email.bcc}</p>}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleCopyEmailAddress}
                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Copy Address
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>

            {/* Email Body */}
            <div className="p-6">
              {email.html ? (
                <div 
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: email.html }}
                />
              ) : (
                <div className="whitespace-pre-wrap text-gray-900">
                  {email.text || 'No content'}
                </div>
              )}
            </div>

            {/* Attachments */}
            {email.attachments && email.attachments.length > 0 && (
              <div className="p-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Attachments ({email.attachments.length})
                </h3>
                <div className="space-y-2">
                  {email.attachments.map((attachment, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {attachment.filename}
                        </p>
                        <p className="text-sm text-gray-600">
                          {attachment.contentType} • {attachment.size} bytes
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          // Handle attachment download
                          toast.info('Attachment download not implemented in demo');
                        }}
                        className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
                      >
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default EmailView; 