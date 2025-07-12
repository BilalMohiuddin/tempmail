# Temp Mail - Disposable Email Service

A modern, secure temporary email service similar to temp-mail.org, built with Node.js and React. Generate disposable email addresses instantly, receive emails in real-time, and protect your privacy online.

## Features

### 🚀 Core Features
- **Instant Email Generation**: Create disposable email addresses instantly with no registration
- **Real-time Inbox**: Live email updates via WebSocket connections
- **Email Management**: Read, delete, and search through received emails
- **Auto-expiration**: Email addresses expire after 48 hours for privacy
- **Email Expiration**: Individual emails are deleted after 24 hours

### 🛡️ Security & Anti-Abuse
- **Spam Protection**: Advanced filtering against spam and malicious content
- **Rate Limiting**: Prevents abuse with intelligent rate limiting
- **Content Filtering**: Blocks suspicious attachments and HTML injection attempts
- **Domain Blacklisting**: Automatic blocking of known spam domains

### 📱 User Experience
- **Mobile-Friendly**: Responsive design that works on all devices
- **Modern UI**: Clean, intuitive interface with smooth animations
- **Copy to Clipboard**: One-click email address copying
- **Search Functionality**: Search through emails by content, sender, or subject
- **Export Options**: Download emails in JSON or TXT format

### 🔧 Technical Features
- **SMTP Server**: Built-in SMTP server for receiving emails
- **WebSocket Support**: Real-time updates without page refresh
- **RESTful API**: Clean API for all operations
- **In-Memory Storage**: Fast email storage with automatic cleanup

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Socket.IO** - Real-time communication
- **SMTP Server** - Email receiving
- **Helmet** - Security middleware
- **Rate Limiting** - Anti-abuse protection

### Frontend
- **React** - UI framework
- **React Router** - Client-side routing
- **Socket.IO Client** - Real-time updates
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **React Hot Toast** - Notifications

## Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd temp-mail-service
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   npm install
   
   # Install frontend dependencies
   cd client
   npm install
   cd ..
   ```

3. **Start the development servers**
   ```bash
   # Start both backend and frontend
   npm run dev
   
   # Or start them separately:
   npm run server    # Backend only (port 5000)
   npm run client    # Frontend only (port 3000)
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - SMTP Server: localhost:2525

## Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=5000
SMTP_PORT=2525
NODE_ENV=development

# Security
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Email Settings
EMAIL_EXPIRATION_HOURS=24
ADDRESS_EXPIRATION_HOURS=48
MAX_EMAILS_PER_ADDRESS=100
MAX_EMAIL_SIZE=10485760
```

### SMTP Configuration

The built-in SMTP server runs on port 2525 by default. You can configure it to work with your domain by:

1. Setting up DNS MX records pointing to your server
2. Configuring the SMTP server to listen on port 25 (requires root privileges)
3. Setting up SSL/TLS certificates for secure email delivery

## API Endpoints

### Email Addresses
- `POST /api/addresses/generate` - Generate new email address
- `GET /api/addresses/:emailAddress` - Get address info
- `DELETE /api/addresses/:emailAddress` - Delete address
- `PATCH /api/addresses/:emailAddress/extend` - Extend expiration

### Emails
- `GET /api/emails/:emailAddress` - Get all emails for address
- `GET /api/emails/:emailAddress/:emailId` - Get specific email
- `DELETE /api/emails/:emailAddress/:emailId` - Delete email
- `PATCH /api/emails/:emailAddress/:emailId/read` - Mark as read
- `GET /api/emails/:emailAddress/search?q=query` - Search emails
- `GET /api/emails/:emailAddress/export?format=json` - Export emails

### Statistics
- `GET /api/emails/stats/overview` - System statistics
- `GET /api/emails/stats/recent-activity` - Recent activity

## Usage

### For Users

1. **Generate Email Address**
   - Visit the homepage
   - Click "Generate Email Address"
   - Copy the generated address

2. **Receive Emails**
   - Use the email address for signups or testing
   - Emails appear in your inbox automatically
   - Real-time updates via WebSocket

3. **Manage Emails**
   - Click on emails to read them
   - Use search to find specific emails
   - Delete unwanted emails
   - Export emails for backup

### For Developers

The service can be integrated into applications via the REST API:

```javascript
// Generate email address
const response = await fetch('/api/addresses/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' }
});
const { emailAddress } = await response.json();

// Get emails
const emails = await fetch(`/api/emails/${emailAddress}`);
```

## Security Considerations

### Anti-Abuse Measures
- Rate limiting per IP address
- Email size limits
- Content filtering for spam and malicious content
- Automatic cleanup of expired data
- Domain blacklisting

### Privacy Features
- No user registration required
- Automatic data expiration
- No personal information collection
- Secure email handling

### Production Deployment

1. **Set up a production server**
   ```bash
   npm run build
   npm start
   ```

2. **Configure reverse proxy (nginx)**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

3. **Set up SSL/TLS certificates**
4. **Configure DNS MX records**
5. **Set up monitoring and logging**

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Create an issue on GitHub
- Check the documentation
- Review the API endpoints

## Roadmap

- [ ] Database persistence (Redis/PostgreSQL)
- [ ] Email forwarding
- [ ] Custom domains
- [ ] API rate limiting improvements
- [ ] Advanced spam filtering
- [ ] Email templates
- [ ] Multi-language support
- [ ] Dark mode
- [ ] PWA support # tempmail
