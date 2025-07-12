class EmailGenerator {
  constructor() {
    this.domains = [
      'tempiemail.com',
      'temp-mail.org',
      'disposable.email',
      'throwaway.mail',
      'quickmail.temp',
      'instant.email',
      'fastmail.temp',
      'quick.email',
      'temp.mail',
      'disposable.mail'
    ];
    
    this.adjectives = [
      'quick', 'fast', 'instant', 'rapid', 'swift', 'speedy', 'hasty', 'brisk',
      'temporary', 'disposable', 'throwaway', 'one-time', 'single-use', 'ephemeral',
      'random', 'unique', 'special', 'custom', 'personal', 'private', 'secure',
      'safe', 'clean', 'fresh', 'new', 'modern', 'smart', 'clever', 'bright'
    ];
    
    this.nouns = [
      'mail', 'email', 'message', 'letter', 'note', 'communication',
      'box', 'inbox', 'folder', 'container', 'holder', 'receiver',
      'user', 'person', 'individual', 'account', 'profile', 'identity',
      'service', 'system', 'platform', 'tool', 'utility', 'helper',
      'time', 'moment', 'instant', 'period', 'session', 'duration'
    ];
    
    this.colors = [
      'red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'brown',
      'black', 'white', 'gray', 'silver', 'gold', 'navy', 'teal', 'lime',
      'coral', 'indigo', 'violet', 'maroon', 'olive', 'cyan', 'magenta'
    ];
    
    this.animals = [
      'cat', 'dog', 'bird', 'fish', 'rabbit', 'hamster', 'mouse', 'rat',
      'lion', 'tiger', 'bear', 'wolf', 'fox', 'deer', 'elephant', 'giraffe',
      'penguin', 'dolphin', 'whale', 'shark', 'octopus', 'butterfly', 'bee'
    ];
    
    this.numbers = [
      'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
      'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth'
    ];
  }

  // Generate a random email address
  generateEmailAddress() {
    const patterns = [
      this.generateAdjectiveNounPattern,
      this.generateColorAnimalPattern,
      this.generateNumberAdjectivePattern,
      this.generateRandomStringPattern,
      this.generateTimestampPattern,
      this.generateMixedPattern
    ];
    
    const pattern = patterns[Math.floor(Math.random() * patterns.length)];
    const username = pattern.call(this);
    const domain = this.domains[Math.floor(Math.random() * this.domains.length)];
    
    return `${username}@${domain}`;
  }

  // Generate adjective + noun pattern
  generateAdjectiveNounPattern() {
    const adjective = this.adjectives[Math.floor(Math.random() * this.adjectives.length)];
    const noun = this.nouns[Math.floor(Math.random() * this.nouns.length)];
    const randomNum = Math.floor(Math.random() * 999) + 1;
    
    return `${adjective}${noun}${randomNum}`;
  }

  // Generate color + animal pattern
  generateColorAnimalPattern() {
    const color = this.colors[Math.floor(Math.random() * this.colors.length)];
    const animal = this.animals[Math.floor(Math.random() * this.animals.length)];
    const randomNum = Math.floor(Math.random() * 999) + 1;
    
    return `${color}${animal}${randomNum}`;
  }

  // Generate number + adjective pattern
  generateNumberAdjectivePattern() {
    const number = this.numbers[Math.floor(Math.random() * this.numbers.length)];
    const adjective = this.adjectives[Math.floor(Math.random() * this.adjectives.length)];
    const randomNum = Math.floor(Math.random() * 999) + 1;
    
    return `${number}${adjective}${randomNum}`;
  }

  // Generate random string pattern
  generateRandomStringPattern() {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    
    // Generate 8-12 character random string
    const length = Math.floor(Math.random() * 5) + 8;
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    return result;
  }

  // Generate timestamp-based pattern
  generateTimestampPattern() {
    const timestamp = Date.now().toString(36);
    const randomChars = Math.random().toString(36).substring(2, 6);
    
    return `temp${timestamp}${randomChars}`;
  }

  // Generate mixed pattern
  generateMixedPattern() {
    const patterns = [
      () => this.generateAdjectiveNounPattern(),
      () => this.generateColorAnimalPattern(),
      () => this.generateRandomStringPattern()
    ];
    
    const pattern1 = patterns[Math.floor(Math.random() * patterns.length)];
    const pattern2 = patterns[Math.floor(Math.random() * patterns.length)];
    
    const part1 = pattern1.call(this);
    const part2 = pattern2.call(this);
    
    return `${part1}${part2}`.substring(0, 20); // Limit length
  }

  // Generate multiple email addresses
  generateMultipleAddresses(count = 1) {
    const addresses = [];
    for (let i = 0; i < count; i++) {
      addresses.push(this.generateEmailAddress());
    }
    return addresses;
  }

  // Generate email address with specific pattern
  generateWithPattern(pattern) {
    switch (pattern) {
      case 'adjective-noun':
        return this.generateAdjectiveNounPattern();
      case 'color-animal':
        return this.generateColorAnimalPattern();
      case 'number-adjective':
        return this.generateNumberAdjectivePattern();
      case 'random':
        return this.generateRandomStringPattern();
      case 'timestamp':
        return this.generateTimestampPattern();
      case 'mixed':
        return this.generateMixedPattern();
      default:
        return this.generateEmailAddress();
    }
  }

  // Validate email address format
  validateEmailFormat(email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }

  // Extract username from email address
  extractUsername(email) {
    const atIndex = email.indexOf('@');
    return atIndex !== -1 ? email.substring(0, atIndex) : null;
  }

  // Extract domain from email address
  extractDomain(email) {
    const atIndex = email.indexOf('@');
    return atIndex !== -1 ? email.substring(atIndex + 1) : null;
  }

  // Get available domains
  getAvailableDomains() {
    return [...this.domains];
  }

  // Add a new domain
  addDomain(domain) {
    if (!this.domains.includes(domain)) {
      this.domains.push(domain);
    }
  }

  // Remove a domain
  removeDomain(domain) {
    const index = this.domains.indexOf(domain);
    if (index > -1) {
      this.domains.splice(index, 1);
    }
  }

  // Get statistics about generated patterns
  getStats() {
    return {
      totalDomains: this.domains.length,
      totalAdjectives: this.adjectives.length,
      totalNouns: this.nouns.length,
      totalColors: this.colors.length,
      totalAnimals: this.animals.length,
      totalNumbers: this.numbers.length,
      availablePatterns: [
        'adjective-noun',
        'color-animal',
        'number-adjective',
        'random',
        'timestamp',
        'mixed'
      ]
    };
  }
}

module.exports = EmailGenerator; 