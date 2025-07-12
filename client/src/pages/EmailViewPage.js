import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useEmail } from '../contexts/EmailContext';
import { formatDistanceToNow } from 'date-fns';
import { ArrowLeft, Trash2, Copy } from 'lucide-react';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';

const EmailViewPage = () => {
  const { emailAddress, emailId } = useParams();
  const navigate = useNavigate();
  const { fetchEmail, deleteEmail, markEmailAsRead } = useEmail();
  const [email, setEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadEmail = async () => {
      try {
        setLoading(true);
        const emailData = await fetchEmail(emailId);
        setEmail(emailData);
        await markEmailAsRead(emailId);
      } catch (error) {
        console.error('Failed to load email:', error);
        setError('Failed to load email');
      } finally {
        setLoading(false);
      }
    };

    if (emailId) {
      loadEmail();
    }
  }, [emailId, fetchEmail, markEmailAsRead]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this email?')) {
      try {
        await deleteEmail(emailId);
        toast.success('Email deleted successfully');
        navigate(`/email/${emailAddress}`);
      } catch (error) {
        toast.error('Failed to delete email');
      }
    }
  };

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(email.from);
      toast.success('Email address copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy email address');
    }
  };

  const extractSenderName = (from) => {
    const match = from.match(/^([^<]+)\s*<(.+)>$/);
    if (match) {
      return match[1].trim();
    }
    return from.split('@')[0];
  };

  const extractSenderEmail = (from) => {
    const match = from.match(/<(.+)>/);
    if (match) {
      return match[1];
    }
    return from;
  };

  const formatEmailBody = (body) => {
    // Try to extract HTML content if present
    const htmlMatch = body.match(/Content-Type: text\/html[\s\S]*?\r?\n\r?\n([\s\S]*)/i);
    if (htmlMatch) {
      return htmlMatch[1];
    }

    // Try to extract plain text content
    const textMatch = body.match(/Content-Type: text\/plain[\s\S]*?\r?\n\r?\n([\s\S]*)/i);
    if (textMatch) {
      return textMatch[1];
    }

    // Fallback to the entire body
    return body;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner text="Loading email..." />
      </div>
    );
  }

  if (error || !email) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Email Not Found</h2>
        <p className="text-gray-600 mb-4">{error || 'The email you are looking for does not exist.'}</p>
        <Link
          to={`/email/${emailAddress}`}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Back to Inbox
        </Link>
      </div>
    );
  }

  const emailBody = formatEmailBody(email.body);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <Link
              to={`/email/${emailAddress}`}
              className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Inbox</span>
            </Link>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleCopyEmail}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Copy sender email"
              >
                <Copy className="h-4 w-4" />
              </button>
              <button
                onClick={handleDelete}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete email"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Email Details */}
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {email.subject || 'No Subject'}
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <div className="text-sm font-medium text-gray-500 mb-1">From</div>
              <div className="flex items-center space-x-2">
                <span className="text-gray-900">{extractSenderName(email.from)}</span>
                <span className="text-gray-500">({extractSenderEmail(email.from)})</span>
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-500 mb-1">Date</div>
              <div className="text-gray-900">
                {new Date(email.timestamp).toLocaleString()}
                <span className="text-gray-500 ml-2">
                  ({formatDistanceToNow(new Date(email.timestamp), { addSuffix: true })})
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Email Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="email-content">
            {emailBody.includes('<html') || emailBody.includes('<body') ? (
              <div 
                dangerouslySetInnerHTML={{ 
                  __html: emailBody 
                }}
                className="prose prose-sm max-w-none"
              />
            ) : (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeRaw, rehypeSanitize]}
                className="prose prose-sm max-w-none"
              >
                {emailBody}
              </ReactMarkdown>
            )}
          </div>
        </div>
      </div>

      {/* Raw Email Data (for debugging) */}
      {process.env.NODE_ENV === 'development' && (
        <details className="mt-6 bg-gray-50 rounded-lg p-4">
          <summary className="cursor-pointer font-medium text-gray-700 mb-2">
            Raw Email Data (Development Only)
          </summary>
          <pre className="text-xs text-gray-600 overflow-x-auto whitespace-pre-wrap">
            {JSON.stringify(email, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
};

export default EmailViewPage; 