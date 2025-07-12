import React from 'react';
import { Link } from 'react-router-dom';
import { useEmail } from '../contexts/EmailContext';
import { formatDistanceToNow } from 'date-fns';
import { Trash2, Mail, MailOpen } from 'lucide-react';

const EmailList = ({ emails }) => {
  const { deleteEmail, markEmailAsRead } = useEmail();

  const handleDelete = async (e, emailId) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this email?')) {
      await deleteEmail(emailId);
    }
  };

  const handleEmailClick = async (email) => {
    if (!email.read) {
      await markEmailAsRead(email.id);
    }
  };

  const truncateText = (text, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const extractSenderName = (from) => {
    // Extract name from "Name <email@domain.com>" format
    const match = from.match(/^([^<]+)\s*<(.+)>$/);
    if (match) {
      return match[1].trim();
    }
    return from.split('@')[0];
  };

  const extractSenderDomain = (from) => {
    const match = from.match(/@([^>]+)/);
    return match ? match[1] : from.split('@')[1];
  };

  if (emails.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        No emails to display
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {emails.map((email) => (
        <Link
          key={email.id}
          to={`/email/${email.to}/${email.id}`}
          onClick={() => handleEmailClick(email)}
          className={`block hover:bg-gray-50 transition-colors email-item ${email.read ? 'read' : 'unread'}`}
        >
          <div className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3 mb-2">
                  {email.read ? (
                    <MailOpen className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Mail className="h-4 w-4 text-blue-600" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className={`font-medium truncate ${email.read ? 'text-gray-900' : 'text-gray-900'}`}>
                        {extractSenderName(email.from)}
                      </span>
                      <span className="text-gray-500 text-sm">
                        @{extractSenderDomain(email.from)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <h3 className={`text-sm font-medium mb-1 ${email.read ? 'text-gray-700' : 'text-gray-900'}`}>
                  {email.subject || 'No Subject'}
                </h3>
                
                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                  {truncateText(email.body.replace(/<[^>]*>/g, ''), 150)}
                </p>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>
                    {formatDistanceToNow(new Date(email.timestamp), { addSuffix: true })}
                  </span>
                  {!email.read && (
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                      New
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-1 ml-4">
                <button
                  onClick={(e) => handleDelete(e, email.id)}
                  className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="Delete email"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default EmailList; 