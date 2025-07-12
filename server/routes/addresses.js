const express = require('express');
const router = express.Router();

// Rate limiting for address generation
const rateLimit = require('express-rate-limit');

const addressGenerationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 address generations per minute
  message: 'Too many address generation requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Get the services from the main server
let emailStorage;
let emailGenerator;

// Initialize the services (will be set by the main server)
function initializeServices(storage, generator) {
  emailStorage = storage;
  emailGenerator = generator;
}

// Generate a new email address
router.post('/generate', addressGenerationLimiter, (req, res) => {
  try {
    const { pattern } = req.body;
    
    let emailAddress;
    if (pattern && emailGenerator) {
      emailAddress = emailGenerator.generateWithPattern(pattern);
    } else {
      emailAddress = emailStorage.generateEmailAddress();
    }
    
    const metadata = emailStorage.getEmailAddressMetadata(emailAddress);
    
    res.json({
      emailAddress,
      metadata: {
        id: metadata.id,
        createdAt: metadata.createdAt,
        expiresAt: metadata.expiresAt,
        emailCount: metadata.emailCount
      }
    });
  } catch (error) {
    console.error('Error generating email address:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Generate multiple email addresses
router.post('/generate-multiple', (req, res) => {
  try {
    const { count = 1, pattern } = req.body;
    const numAddresses = Math.min(parseInt(count), 10); // Limit to 10 addresses max
    
    const addresses = [];
    
    for (let i = 0; i < numAddresses; i++) {
      let emailAddress;
      if (pattern && emailGenerator) {
        emailAddress = emailGenerator.generateWithPattern(pattern);
      } else {
        emailAddress = emailStorage.generateEmailAddress();
      }
      
      const metadata = emailStorage.getEmailAddressMetadata(emailAddress);
      
      addresses.push({
        emailAddress,
        metadata: {
          id: metadata.id,
          createdAt: metadata.createdAt,
          expiresAt: metadata.expiresAt,
          emailCount: metadata.emailCount
        }
      });
    }
    
    res.json({ addresses });
  } catch (error) {
    console.error('Error generating multiple email addresses:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get email address information
router.get('/:emailAddress', (req, res) => {
  try {
    const { emailAddress } = req.params;
    
    const metadata = emailStorage.getEmailAddressMetadata(emailAddress);
    
    if (!metadata) {
      return res.status(404).json({ error: 'Email address not found' });
    }
    
    const emails = emailStorage.getEmails(emailAddress);
    
    res.json({
      emailAddress,
      metadata: {
        id: metadata.id,
        createdAt: metadata.createdAt,
        expiresAt: metadata.expiresAt,
        lastActivity: metadata.lastActivity,
        emailCount: emails.length,
        isValid: emailStorage.isValidEmailAddress(emailAddress)
      },
      emails: emails.map(email => ({
        id: email.id,
        from: email.from,
        subject: email.subject,
        timestamp: email.timestamp,
        read: email.read
      }))
    });
  } catch (error) {
    console.error('Error fetching email address info:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete an email address
router.delete('/:emailAddress', (req, res) => {
  try {
    const { emailAddress } = req.params;
    
    const metadata = emailStorage.getEmailAddressMetadata(emailAddress);
    
    if (!metadata) {
      return res.status(404).json({ error: 'Email address not found' });
    }
    
    emailStorage.deleteEmailAddress(emailAddress);
    
    res.json({ message: 'Email address deleted successfully' });
  } catch (error) {
    console.error('Error deleting email address:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get available patterns for email generation
router.get('/patterns/available', (req, res) => {
  try {
    if (!emailGenerator) {
      return res.status(500).json({ error: 'Email generator not available' });
    }
    
    const stats = emailGenerator.getStats();
    
    res.json({
      patterns: stats.availablePatterns,
      stats: {
        totalDomains: stats.totalDomains,
        totalAdjectives: stats.totalAdjectives,
        totalNouns: stats.totalNouns,
        totalColors: stats.totalColors,
        totalAnimals: stats.totalAnimals,
        totalNumbers: stats.totalNumbers
      }
    });
  } catch (error) {
    console.error('Error fetching available patterns:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get available domains
router.get('/domains/available', (req, res) => {
  try {
    if (!emailGenerator) {
      return res.status(500).json({ error: 'Email generator not available' });
    }
    
    const domains = emailGenerator.getAvailableDomains();
    
    res.json({ domains });
  } catch (error) {
    console.error('Error fetching available domains:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add a new domain
router.post('/domains', (req, res) => {
  try {
    const { domain } = req.body;
    
    if (!domain) {
      return res.status(400).json({ error: 'Domain is required' });
    }
    
    if (!emailGenerator) {
      return res.status(500).json({ error: 'Email generator not available' });
    }
    
    emailGenerator.addDomain(domain);
    
    res.json({ message: 'Domain added successfully', domain });
  } catch (error) {
    console.error('Error adding domain:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Remove a domain
router.delete('/domains/:domain', (req, res) => {
  try {
    const { domain } = req.params;
    
    if (!emailGenerator) {
      return res.status(500).json({ error: 'Email generator not available' });
    }
    
    emailGenerator.removeDomain(domain);
    
    res.json({ message: 'Domain removed successfully', domain });
  } catch (error) {
    console.error('Error removing domain:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get email address statistics
router.get('/stats/addresses', (req, res) => {
  try {
    const stats = emailStorage.getStats();
    const recentActivity = emailStorage.getRecentActivity(5);
    
    res.json({
      overview: stats,
      recentActivity
    });
  } catch (error) {
    console.error('Error fetching address statistics:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Validate email address format
router.post('/validate', (req, res) => {
  try {
    const { emailAddress } = req.body;
    
    if (!emailAddress) {
      return res.status(400).json({ error: 'Email address is required' });
    }
    
    if (!emailGenerator) {
      return res.status(500).json({ error: 'Email generator not available' });
    }
    
    const isValidFormat = emailGenerator.validateEmailFormat(emailAddress);
    const isValidAddress = emailStorage.isValidEmailAddress(emailAddress);
    const metadata = emailStorage.getEmailAddressMetadata(emailAddress);
    
    res.json({
      emailAddress,
      isValidFormat,
      isValidAddress,
      metadata: metadata ? {
        createdAt: metadata.createdAt,
        expiresAt: metadata.expiresAt,
        emailCount: metadata.emailCount
      } : null
    });
  } catch (error) {
    console.error('Error validating email address:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Extend email address expiration
router.patch('/:emailAddress/extend', (req, res) => {
  try {
    const { emailAddress } = req.params;
    const { hours = 24 } = req.body;
    
    const metadata = emailStorage.getEmailAddressMetadata(emailAddress);
    
    if (!metadata) {
      return res.status(404).json({ error: 'Email address not found' });
    }
    
    // Extend expiration by specified hours
    const newExpiresAt = new Date(metadata.expiresAt.getTime() + (hours * 60 * 60 * 1000));
    metadata.expiresAt = newExpiresAt;
    
    emailStorage.emailAddresses.set(emailAddress, metadata);
    
    res.json({
      message: 'Email address expiration extended',
      emailAddress,
      newExpiresAt
    });
  } catch (error) {
    console.error('Error extending email address expiration:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = { router, initializeServices }; 