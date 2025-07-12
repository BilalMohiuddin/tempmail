import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { useSocket } from './SocketContext';
import { toast } from 'react-hot-toast';
import axios from 'axios';

const EmailContext = createContext();

const initialState = {
  currentEmailAddress: localStorage.getItem('tempMail_currentEmailAddress') || null,
  emails: [],
  loading: false,
  error: null,
  metadata: null,
  selectedEmail: null
};

const emailReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'SET_EMAIL_ADDRESS':
      // Save to localStorage when setting email address
      if (action.payload) {
        localStorage.setItem('tempMail_currentEmailAddress', action.payload);
      } else {
        localStorage.removeItem('tempMail_currentEmailAddress');
      }
      return { 
        ...state, 
        currentEmailAddress: action.payload,
        emails: [],
        selectedEmail: null,
        metadata: null
      };
    
    case 'SET_EMAILS':
      return { 
        ...state, 
        emails: action.payload.emails,
        metadata: action.payload.metadata,
        loading: false,
        error: null
      };
    
    case 'ADD_EMAIL':
      return {
        ...state,
        emails: [action.payload, ...state.emails],
        metadata: state.metadata ? {
          ...state.metadata,
          emailCount: state.metadata.emailCount + 1
        } : null
      };
    
    case 'UPDATE_EMAIL':
      return {
        ...state,
        emails: state.emails.map(email => 
          email.id === action.payload.id ? { ...email, ...action.payload } : email
        )
      };
    
    case 'DELETE_EMAIL':
      return {
        ...state,
        emails: state.emails.filter(email => email.id !== action.payload),
        metadata: state.metadata ? {
          ...state.metadata,
          emailCount: Math.max(0, state.metadata.emailCount - 1)
        } : null
      };
    
    case 'SET_SELECTED_EMAIL':
      return { ...state, selectedEmail: action.payload };
    
    case 'CLEAR_EMAILS':
      return { ...state, emails: [], selectedEmail: null, metadata: null };
    
    default:
      return state;
  }
};

export const EmailProvider = ({ children }) => {
  const [state, dispatch] = useReducer(emailReducer, initialState);
  const { socket } = useSocket();

  // Validate stored email address on startup
  useEffect(() => {
    const storedEmail = localStorage.getItem('tempMail_currentEmailAddress');
    if (storedEmail) {
      // Validate the stored email address with the server
      const validateStoredEmail = async () => {
        try {
          const response = await axios.get(`/api/addresses/${storedEmail}`);
          if (response.data.metadata?.isValid) {
            // Email is still valid, set it as current
            dispatch({ type: 'SET_EMAIL_ADDRESS', payload: storedEmail });
          } else {
            // Email is no longer valid, remove from localStorage
            localStorage.removeItem('tempMail_currentEmailAddress');
            dispatch({ type: 'SET_EMAIL_ADDRESS', payload: null });
          }
        } catch (error) {
          // Email validation failed, remove from localStorage
          localStorage.removeItem('tempMail_currentEmailAddress');
          dispatch({ type: 'SET_EMAIL_ADDRESS', payload: null });
        }
      };
      
      validateStoredEmail();
    }
  }, []);

  // Listen for new emails via WebSocket
  useEffect(() => {
    if (!socket || !state.currentEmailAddress) return;

    socket.emit('join-email-room', state.currentEmailAddress);

    socket.on('new-email', (email) => {
      dispatch({ type: 'ADD_EMAIL', payload: email });
      toast.success(`New email received: ${email.subject}`);
    });

    return () => {
      socket.emit('leave-email-room', state.currentEmailAddress);
      socket.off('new-email');
    };
  }, [socket, state.currentEmailAddress]);

  // Generate new email address
  const generateEmailAddress = useCallback(async (pattern = null) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await axios.post('/api/addresses/generate', { pattern });
      const { emailAddress } = response.data;
      
      dispatch({ type: 'SET_EMAIL_ADDRESS', payload: emailAddress });
      toast.success('New email address generated!');
      
      return emailAddress;
    } catch (error) {
      console.error('Error generating email address:', error);
      
      if (error.response?.status === 429) {
        // Rate limited - show specific message
        dispatch({ type: 'SET_ERROR', payload: 'Rate limit exceeded. Please wait a moment and try again.' });
        toast.error('Rate limit exceeded. Please wait a moment and try again.');
      } else {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to generate email address' });
        toast.error('Failed to generate email address');
      }
      
      throw error;
    }
  }, []);

  // Fetch emails for current address
  const fetchEmails = useCallback(async (emailAddress = state.currentEmailAddress) => {
    if (!emailAddress) return;

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await axios.get(`/api/emails/${emailAddress}`);
      const { emails, metadata } = response.data;
      
      dispatch({ type: 'SET_EMAILS', payload: { emails, metadata } });
    } catch (error) {
      console.error('Error fetching emails:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch emails' });
      toast.error('Failed to fetch emails');
    }
  }, [state.currentEmailAddress]);

  // Fetch specific email
  const fetchEmail = useCallback(async (emailId) => {
    if (!state.currentEmailAddress) return;

    try {
      const response = await axios.get(`/api/emails/${state.currentEmailAddress}/${emailId}`);
      dispatch({ type: 'SET_SELECTED_EMAIL', payload: response.data });
      return response.data;
    } catch (error) {
      console.error('Error fetching email:', error);
      toast.error('Failed to fetch email');
      throw error;
    }
  }, [state.currentEmailAddress]);

  // Mark email as read
  const markEmailAsRead = useCallback(async (emailId) => {
    if (!state.currentEmailAddress) return;

    try {
      await axios.patch(`/api/emails/${state.currentEmailAddress}/${emailId}/read`);
      dispatch({ 
        type: 'UPDATE_EMAIL', 
        payload: { id: emailId, read: true } 
      });
    } catch (error) {
      console.error('Error marking email as read:', error);
    }
  }, [state.currentEmailAddress]);

  // Delete email
  const deleteEmail = useCallback(async (emailId) => {
    if (!state.currentEmailAddress) return;

    try {
      await axios.delete(`/api/emails/${state.currentEmailAddress}/${emailId}`);
      dispatch({ type: 'DELETE_EMAIL', payload: emailId });
      toast.success('Email deleted successfully');
    } catch (error) {
      console.error('Error deleting email:', error);
      toast.error('Failed to delete email');
    }
  }, [state.currentEmailAddress]);

  // Search emails
  const searchEmails = async (query) => {
    if (!state.currentEmailAddress || !query) return [];

    try {
      const response = await axios.get(`/api/emails/${state.currentEmailAddress}/search?q=${encodeURIComponent(query)}`);
      return response.data.results;
    } catch (error) {
      console.error('Error searching emails:', error);
      toast.error('Failed to search emails');
      return [];
    }
  };

  // Export emails
  const exportEmails = async (format = 'json') => {
    if (!state.currentEmailAddress) return;

    try {
      const response = await axios.get(`/api/emails/${state.currentEmailAddress}/export?format=${format}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${state.currentEmailAddress}-emails.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success(`Emails exported successfully as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Error exporting emails:', error);
      toast.error('Failed to export emails');
    }
  };

  // Extend email address expiration
  const extendEmailAddress = async (hours = 24) => {
    if (!state.currentEmailAddress) return;

    try {
      const response = await axios.patch(`/api/addresses/${state.currentEmailAddress}/extend`, { hours });
      toast.success(`Email address expiration extended by ${hours} hours`);
      return response.data.newExpiresAt;
    } catch (error) {
      console.error('Error extending email address:', error);
      toast.error('Failed to extend email address expiration');
    }
  };

  // Clear current email data
  const clearEmails = () => {
    dispatch({ type: 'CLEAR_EMAILS' });
  };

  // Clear email address (for "New Address" button)
  const clearEmailAddress = () => {
    localStorage.removeItem('tempMail_currentEmailAddress');
    dispatch({ type: 'SET_EMAIL_ADDRESS', payload: null });
  };

  const value = {
    ...state,
    generateEmailAddress,
    fetchEmails,
    fetchEmail,
    markEmailAsRead,
    deleteEmail,
    searchEmails,
    exportEmails,
    extendEmailAddress,
    clearEmails,
    clearEmailAddress
  };

  return (
    <EmailContext.Provider value={value}>
      {children}
    </EmailContext.Provider>
  );
};

export const useEmail = () => {
  const context = useContext(EmailContext);
  if (!context) {
    throw new Error('useEmail must be used within an EmailProvider');
  }
  return context;
}; 