class AntiAbuseService {
  constructor() {
    this.spamPatterns = [
      /viagra/i,
      /casino/i,
      /loan/i,
      /credit/i,
      /weight loss/i,
      /diet pill/i,
      /make money fast/i,
      /work from home/i,
      /enlarge/i,
      /penis/i,
      /sex/i,
      /porn/i,
      /adult/i,
      /nude/i,
      /xxx/i,
      /free money/i,
      /lottery/i,
      /inheritance/i,
      /nigerian prince/i,
      /urgent action required/i,
      /account suspended/i,
      /verify your account/i,
      /click here to claim/i,
      /limited time offer/i,
      /act now/i,
      /don't miss out/i,
      /exclusive offer/i,
      /guaranteed/i,
      /risk-free/i,
      /no obligation/i
    ];
    
    this.suspiciousHeaders = [
      'x-spam-flag',
      'x-spam-status',
      'x-spam-score',
      'x-virus-scanned',
      'x-authentication-warning',
      'x-mailer',
      'x-priority',
      'x-msmail-priority'
    ];
    
    this.maxEmailSize = 10 * 1024 * 1024; // 10MB
    this.maxSubjectLength = 200;
    this.maxFromLength = 100;
    
    // Rate limiting per email address
    this.emailCounts = new Map(); // emailAddress -> { count: number, resetTime: Date }
    this.maxEmailsPerHour = 50;
    
    // Known spam domains
    this.spamDomains = new Set([
      'spam.com',
      'malware.com',
      'virus.com',
      'phishing.com'
    ]);
    
    // Cleanup old rate limiting data every hour
    setInterval(() => {
      this.cleanupRateLimits();
    }, 60 * 60 * 1000);
  }

  // Main method to check if an email should be allowed
  checkEmail(emailAddress, emailData) {
    try {
      // Check email size
      if (emailData.length > this.maxEmailSize) {
        console.log(`Email blocked: too large (${emailData.length} bytes)`);
        return false;
      }
      
      // Check rate limiting
      if (!this.checkRateLimit(emailAddress)) {
        console.log(`Email blocked: rate limit exceeded for ${emailAddress}`);
        return false;
      }
      
      // Check for spam patterns in subject and body
      if (this.containsSpamPatterns(emailData)) {
        console.log(`Email blocked: contains spam patterns`);
        return false;
      }
      
      // Check for suspicious headers
      if (this.hasSuspiciousHeaders(emailData)) {
        console.log(`Email blocked: suspicious headers detected`);
        return false;
      }
      
      // Check sender domain
      const senderDomain = this.extractSenderDomain(emailData);
      if (senderDomain && this.spamDomains.has(senderDomain)) {
        console.log(`Email blocked: sender domain in spam list`);
        return false;
      }
      
      // Check for excessive links
      if (this.hasExcessiveLinks(emailData)) {
        console.log(`Email blocked: excessive links detected`);
        return false;
      }
      
      // Check for suspicious attachments
      if (this.hasSuspiciousAttachments(emailData)) {
        console.log(`Email blocked: suspicious attachments detected`);
        return false;
      }
      
      // Check for HTML injection attempts
      if (this.containsHtmlInjection(emailData)) {
        console.log(`Email blocked: HTML injection attempt detected`);
        return false;
      }
      
      // Check for script injection attempts
      if (this.containsScriptInjection(emailData)) {
        console.log(`Email blocked: script injection attempt detected`);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error in anti-abuse check:', error);
      return false; // Block on error for safety
    }
  }

  // Check rate limiting for email address
  checkRateLimit(emailAddress) {
    const now = new Date();
    const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    
    const currentData = this.emailCounts.get(emailAddress) || { count: 0, resetTime: hourAgo };
    
    // Reset counter if an hour has passed
    if (now > currentData.resetTime) {
      currentData.count = 0;
      currentData.resetTime = new Date(now.getTime() + 60 * 60 * 1000);
    }
    
    // Check if limit exceeded
    if (currentData.count >= this.maxEmailsPerHour) {
      return false;
    }
    
    // Increment counter
    currentData.count++;
    this.emailCounts.set(emailAddress, currentData);
    
    return true;
  }

  // Check for spam patterns in email content
  containsSpamPatterns(emailData) {
    const content = emailData.toLowerCase();
    
    // Check subject line
    const subjectMatch = emailData.match(/^Subject:\s*(.+)$/m);
    if (subjectMatch) {
      const subject = subjectMatch[1].toLowerCase();
      for (const pattern of this.spamPatterns) {
        if (pattern.test(subject)) {
          return true;
        }
      }
    }
    
    // Check body content
    for (const pattern of this.spamPatterns) {
      if (pattern.test(content)) {
        return true;
      }
    }
    
    return false;
  }

  // Check for suspicious headers
  hasSuspiciousHeaders(emailData) {
    const lines = emailData.split('\n');
    
    for (const line of lines) {
      const headerMatch = line.match(/^([^:]+):\s*(.+)$/);
      if (headerMatch) {
        const headerName = headerMatch[1].toLowerCase();
        if (this.suspiciousHeaders.includes(headerName)) {
          return true;
        }
      }
    }
    
    return false;
  }

  // Extract sender domain from email
  extractSenderDomain(emailData) {
    const fromMatch = emailData.match(/^From:\s*[^<]*<([^>]+)>/m) || 
                     emailData.match(/^From:\s*([^\s]+)/m);
    
    if (fromMatch) {
      const email = fromMatch[1];
      const domainMatch = email.match(/@(.+)$/);
      return domainMatch ? domainMatch[1].toLowerCase() : null;
    }
    
    return null;
  }

  // Check for excessive links
  hasExcessiveLinks(emailData) {
    const linkPattern = /https?:\/\/[^\s<>"]+/g;
    const links = emailData.match(linkPattern) || [];
    
    // Block if more than 10 links in a single email
    return links.length > 10;
  }

  // Check for suspicious attachments
  hasSuspiciousAttachments(emailData) {
    const suspiciousExtensions = [
      '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js',
      '.jar', '.msi', '.dmg', '.app', '.deb', '.rpm'
    ];
    
    const contentDispositionMatch = emailData.match(/Content-Disposition:\s*attachment[^]*?filename\s*=\s*["']?([^"'\r\n]+)/gi);
    
    if (contentDispositionMatch) {
      for (const match of contentDispositionMatch) {
        const filenameMatch = match.match(/filename\s*=\s*["']?([^"'\r\n]+)/i);
        if (filenameMatch) {
          const filename = filenameMatch[1].toLowerCase();
          for (const ext of suspiciousExtensions) {
            if (filename.endsWith(ext)) {
              return true;
            }
          }
        }
      }
    }
    
    return false;
  }

  // Check for HTML injection attempts
  containsHtmlInjection(emailData) {
    const dangerousHtmlPatterns = [
      /<script[^>]*>/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /<iframe[^>]*>/i,
      /<object[^>]*>/i,
      /<embed[^>]*>/i,
      /<form[^>]*>/i,
      /<input[^>]*>/i,
      /<textarea[^>]*>/i,
      /<select[^>]*>/i
    ];
    
    for (const pattern of dangerousHtmlPatterns) {
      if (pattern.test(emailData)) {
        return true;
      }
    }
    
    return false;
  }

  // Check for script injection attempts
  containsScriptInjection(emailData) {
    const scriptPatterns = [
      /eval\s*\(/i,
      /setTimeout\s*\(/i,
      /setInterval\s*\(/i,
      /Function\s*\(/i,
      /document\.write/i,
      /innerHTML\s*=/i,
      /outerHTML\s*=/i,
      /insertAdjacentHTML/i
    ];
    
    for (const pattern of scriptPatterns) {
      if (pattern.test(emailData)) {
        return true;
      }
    }
    
    return false;
  }

  // Cleanup old rate limiting data
  cleanupRateLimits() {
    const now = new Date();
    const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    
    for (const [emailAddress, data] of this.emailCounts.entries()) {
      if (data.resetTime < hourAgo) {
        this.emailCounts.delete(emailAddress);
      }
    }
  }

  // Add a domain to the spam list
  addSpamDomain(domain) {
    this.spamDomains.add(domain.toLowerCase());
  }

  // Remove a domain from the spam list
  removeSpamDomain(domain) {
    this.spamDomains.delete(domain.toLowerCase());
  }

  // Get statistics
  getStats() {
    return {
      spamDomainsCount: this.spamDomains.size,
      spamPatternsCount: this.spamPatterns.length,
      maxEmailsPerHour: this.maxEmailsPerHour,
      maxEmailSize: this.maxEmailSize,
      activeRateLimits: this.emailCounts.size
    };
  }
}

module.exports = AntiAbuseService; 