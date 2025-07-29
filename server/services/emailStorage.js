const { v4: uuidv4 } = require('uuid');

class EmailStorage {
  constructor() {
    this.emails = new Map(); // emailAddress -> array of emails
    this.emailAddresses = new Map(); // emailAddress -> metadata
    this.emailExpirationHours = 24; // Emails expire after 24 hours
    this.addressExpirationHours = 48; // Email addresses expire after 48 hours
  }

  // Generate a new temporary email address
  generateEmailAddress() {
    const randomString = Math.random().toString(36).substring(2, 15);
    const timestamp = Date.now().toString(36);
    const emailAddress = `${randomString}${timestamp}@tempiemail.com`;
    
    const metadata = {
      id: uuidv4(),
      address: emailAddress,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + (this.addressExpirationHours * 60 * 60 * 1000)),
      emailCount: 0,
      lastActivity: new Date()
    };
    
    this.emailAddresses.set(emailAddress, metadata);
    this.emails.set(emailAddress, []);
    
    return emailAddress;
  }

  // Add an email to storage
  addEmail(emailAddress, email) {
    if (!this.emailAddresses.has(emailAddress)) {
      throw new Error('Invalid email address');
    }
    
    const emails = this.emails.get(emailAddress) || [];
    emails.unshift(email); // Add to beginning of array
    
    // Keep only the last 100 emails per address
    if (emails.length > 100) {
      emails.splice(100);
    }
    
    this.emails.set(emailAddress, emails);
    
    // Update metadata
    const metadata = this.emailAddresses.get(emailAddress);
    metadata.emailCount = emails.length;
    metadata.lastActivity = new Date();
    this.emailAddresses.set(emailAddress, metadata);
    
    return email;
  }

  // Get emails for an address
  getEmails(emailAddress) {
    if (!this.emailAddresses.has(emailAddress)) {
      return [];
    }
    
    const emails = this.emails.get(emailAddress) || [];
    return emails.filter(email => !this.isEmailExpired(email));
  }

  // Get a specific email
  getEmail(emailAddress, emailId) {
    const emails = this.getEmails(emailAddress);
    return emails.find(email => email.id === emailId);
  }

  // Mark email as read
  markEmailAsRead(emailAddress, emailId) {
    const emails = this.emails.get(emailAddress) || [];
    const email = emails.find(e => e.id === emailId);
    if (email) {
      email.read = true;
    }
  }

  // Delete an email
  deleteEmail(emailAddress, emailId) {
    const emails = this.emails.get(emailAddress) || [];
    const filteredEmails = emails.filter(email => email.id !== emailId);
    this.emails.set(emailAddress, filteredEmails);
    
    // Update metadata
    const metadata = this.emailAddresses.get(emailAddress);
    if (metadata) {
      metadata.emailCount = filteredEmails.length;
      this.emailAddresses.set(emailAddress, metadata);
    }
  }

  // Get email address metadata
  getEmailAddressMetadata(emailAddress) {
    return this.emailAddresses.get(emailAddress);
  }

  // Check if email address is valid
  isValidEmailAddress(emailAddress) {
    const metadata = this.emailAddresses.get(emailAddress);
    if (!metadata) {
      return false;
    }
    
    // Check if address has expired
    if (new Date() > metadata.expiresAt) {
      this.deleteEmailAddress(emailAddress);
      return false;
    }
    
    return true;
  }

  // Delete an email address and all its emails
  deleteEmailAddress(emailAddress) {
    this.emails.delete(emailAddress);
    this.emailAddresses.delete(emailAddress);
  }

  // Cleanup expired emails and addresses
  cleanupExpiredEmails() {
    const now = new Date();
    
    // Cleanup expired addresses
    for (const [emailAddress, metadata] of this.emailAddresses.entries()) {
      if (now > metadata.expiresAt) {
        this.deleteEmailAddress(emailAddress);
        console.log(`Cleaned up expired email address: ${emailAddress}`);
      }
    }
    
    // Cleanup expired emails
    for (const [emailAddress, emails] of this.emails.entries()) {
      const validEmails = emails.filter(email => !this.isEmailExpired(email));
      if (validEmails.length !== emails.length) {
        this.emails.set(emailAddress, validEmails);
        
        // Update metadata
        const metadata = this.emailAddresses.get(emailAddress);
        if (metadata) {
          metadata.emailCount = validEmails.length;
          this.emailAddresses.set(emailAddress, metadata);
        }
      }
    }
  }

  // Check if an email has expired
  isEmailExpired(email) {
    const expirationTime = new Date(email.timestamp.getTime() + (this.emailExpirationHours * 60 * 60 * 1000));
    return new Date() > expirationTime;
  }

  // Get statistics
  getStats() {
    const totalAddresses = this.emailAddresses.size;
    const totalEmails = Array.from(this.emails.values()).reduce((sum, emails) => sum + emails.length, 0);
    const activeAddresses = Array.from(this.emailAddresses.values()).filter(metadata => 
      new Date() <= metadata.expiresAt
    ).length;
    
    return {
      totalAddresses,
      activeAddresses,
      totalEmails,
      emailExpirationHours: this.emailExpirationHours,
      addressExpirationHours: this.addressExpirationHours
    };
  }

  // Get recent activity
  getRecentActivity(limit = 10) {
    const addresses = Array.from(this.emailAddresses.values())
      .sort((a, b) => b.lastActivity - a.lastActivity)
      .slice(0, limit);
    
    return addresses.map(metadata => ({
      address: metadata.address,
      emailCount: metadata.emailCount,
      lastActivity: metadata.lastActivity,
      createdAt: metadata.createdAt,
      expiresAt: metadata.expiresAt
    }));
  }
}

module.exports = EmailStorage; 