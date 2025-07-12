const express = require('express');
const router = express.Router();

// Get the email storage instance from the main server
let emailStorage;
let emailGenerator;

// Initialize the services (will be set by the main server)
function initializeServices(storage, generator) {
  emailStorage = storage;
  emailGenerator = generator;
}

// Get all emails for an email address
router.get('/:emailAddress', (req, res) => {
  try {
    const { emailAddress } = req.params;
    
    if (!emailStorage.isValidEmailAddress(emailAddress)) {
      return res.status(404).json({ error: 'Email address not found or expired' });
    }
    
    const emails = emailStorage.getEmails(emailAddress);
    const metadata = emailStorage.getEmailAddressMetadata(emailAddress);
    
    res.json({
      emailAddress,
      emails,
      metadata: {
        emailCount: emails.length,
        createdAt: metadata.createdAt,
        expiresAt: metadata.expiresAt,
        lastActivity: metadata.lastActivity
      }
    });
  } catch (error) {
    console.error('Error fetching emails:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a specific email
router.get('/:emailAddress/:emailId', (req, res) => {
  try {
    const { emailAddress, emailId } = req.params;
    
    if (!emailStorage.isValidEmailAddress(emailAddress)) {
      return res.status(404).json({ error: 'Email address not found or expired' });
    }
    
    const email = emailStorage.getEmail(emailAddress, emailId);
    
    if (!email) {
      return res.status(404).json({ error: 'Email not found' });
    }
    
    // Mark email as read
    emailStorage.markEmailAsRead(emailAddress, emailId);
    
    res.json(email);
  } catch (error) {
    console.error('Error fetching email:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete an email
router.delete('/:emailAddress/:emailId', (req, res) => {
  try {
    const { emailAddress, emailId } = req.params;
    
    if (!emailStorage.isValidEmailAddress(emailAddress)) {
      return res.status(404).json({ error: 'Email address not found or expired' });
    }
    
    const email = emailStorage.getEmail(emailAddress, emailId);
    
    if (!email) {
      return res.status(404).json({ error: 'Email not found' });
    }
    
    emailStorage.deleteEmail(emailAddress, emailId);
    
    res.json({ message: 'Email deleted successfully' });
  } catch (error) {
    console.error('Error deleting email:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark email as read
router.patch('/:emailAddress/:emailId/read', (req, res) => {
  try {
    const { emailAddress, emailId } = req.params;
    
    if (!emailStorage.isValidEmailAddress(emailAddress)) {
      return res.status(404).json({ error: 'Email address not found or expired' });
    }
    
    const email = emailStorage.getEmail(emailAddress, emailId);
    
    if (!email) {
      return res.status(404).json({ error: 'Email not found' });
    }
    
    emailStorage.markEmailAsRead(emailAddress, emailId);
    
    res.json({ message: 'Email marked as read' });
  } catch (error) {
    console.error('Error marking email as read:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get email statistics
router.get('/stats/overview', (req, res) => {
  try {
    const stats = emailStorage.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get recent activity
router.get('/stats/recent-activity', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const activity = emailStorage.getRecentActivity(limit);
    res.json(activity);
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Search emails by content
router.get('/:emailAddress/search', (req, res) => {
  try {
    const { emailAddress } = req.params;
    const { q: query } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    if (!emailStorage.isValidEmailAddress(emailAddress)) {
      return res.status(404).json({ error: 'Email address not found or expired' });
    }
    
    const emails = emailStorage.getEmails(emailAddress);
    const searchResults = emails.filter(email => {
      const searchText = query.toLowerCase();
      return (
        email.subject.toLowerCase().includes(searchText) ||
        email.from.toLowerCase().includes(searchText) ||
        email.body.toLowerCase().includes(searchText)
      );
    });
    
    res.json({
      emailAddress,
      query,
      results: searchResults,
      totalResults: searchResults.length
    });
  } catch (error) {
    console.error('Error searching emails:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Export emails (for backup/download)
router.get('/:emailAddress/export', (req, res) => {
  try {
    const { emailAddress } = req.params;
    const { format = 'json' } = req.query;
    
    if (!emailStorage.isValidEmailAddress(emailAddress)) {
      return res.status(404).json({ error: 'Email address not found or expired' });
    }
    
    const emails = emailStorage.getEmails(emailAddress);
    const metadata = emailStorage.getEmailAddressMetadata(emailAddress);
    
    if (format === 'json') {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${emailAddress}-emails.json"`);
      res.json({
        emailAddress,
        metadata,
        emails,
        exportedAt: new Date().toISOString()
      });
    } else if (format === 'txt') {
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Content-Disposition', `attachment; filename="${emailAddress}-emails.txt"`);
      
      let exportText = `Email Export for: ${emailAddress}\n`;
      exportText += `Exported at: ${new Date().toISOString()}\n`;
      exportText += `Total emails: ${emails.length}\n\n`;
      
      emails.forEach((email, index) => {
        exportText += `=== Email ${index + 1} ===\n`;
        exportText += `From: ${email.from}\n`;
        exportText += `Subject: ${email.subject}\n`;
        exportText += `Date: ${email.timestamp.toISOString()}\n`;
        exportText += `Read: ${email.read ? 'Yes' : 'No'}\n`;
        exportText += `Body:\n${email.body}\n\n`;
      });
      
      res.send(exportText);
    } else {
      res.status(400).json({ error: 'Unsupported export format' });
    }
  } catch (error) {
    console.error('Error exporting emails:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = { router, initializeServices }; 