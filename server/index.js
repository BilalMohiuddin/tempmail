const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { createServer: createHttpsServer } = require('https');
const { Server } = require('socket.io');
const SMTPServer = require('smtp-server').SMTPServer;
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');

const EmailStorage = require('./services/emailStorage');
const EmailGenerator = require('./services/emailGenerator');
const AntiAbuseService = require('./services/antiAbuseService');

const app = express();

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// Create server based on environment
let server;
if (process.env.NODE_ENV === 'production' && process.env.SSL_KEY_PATH && process.env.SSL_CERT_PATH) {
  // Production with SSL
  const privateKey = fs.readFileSync(process.env.SSL_KEY_PATH, 'utf8');
  const certificate = fs.readFileSync(process.env.SSL_CERT_PATH, 'utf8');
  const credentials = { key: privateKey, cert: certificate };
  server = createHttpsServer(credentials, app);
} else {
  // Development or production without SSL (handled by Nginx)
  server = createServer(app);
}

const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? false : "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Initialize services
const emailStorage = new EmailStorage();
const emailGenerator = new EmailGenerator();
const antiAbuseService = new AntiAbuseService();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(compression());
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs (increased for development)
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// More specific rate limiting for address generation
const addressGenerationLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 address generations per minute
  message: 'Too many address generation requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? false : "http://localhost:3000",
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
const emailsRoutes = require('./routes/emails');
const addressesRoutes = require('./routes/addresses');

// Initialize routes with services
emailsRoutes.initializeServices(emailStorage, emailGenerator);
addressesRoutes.initializeServices(emailStorage, emailGenerator);

app.use('/api/emails', emailsRoutes.router);
app.use('/api/addresses', addressesRoutes.router);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve static files (React app)
app.use(express.static(path.join(__dirname, '../client/build')));
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../client/build/index.html'));
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('join-email-room', (emailAddress) => {
    socket.join(emailAddress);
    console.log(`Client ${socket.id} joined room for ${emailAddress}`);
  });
  
  socket.on('leave-email-room', (emailAddress) => {
    socket.leave(emailAddress);
    console.log(`Client ${socket.id} left room for ${emailAddress}`);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// SMTP Server setup
const smtpServer = new SMTPServer({
  secure: false,
  authOptional: true,
  onData(stream, session, callback) {
    let mailData = '';
    
    stream.on('data', (chunk) => {
      mailData += chunk;
    });
    
    stream.on('end', () => {
      const emailAddress = session.envelope.rcptTo[0].address;
      
      // Check if this is a valid temporary email address
      if (emailStorage.isValidEmailAddress(emailAddress)) {
        // Anti-abuse check
        if (antiAbuseService.checkEmail(emailAddress, mailData)) {
          const email = {
            id: uuidv4(),
            to: emailAddress,
            from: session.envelope.mailFrom.address,
            subject: extractSubject(mailData),
            body: mailData,
            timestamp: new Date(),
            read: false
          };
          
          emailStorage.addEmail(emailAddress, email);
          
          // Notify connected clients
          io.to(emailAddress).emit('new-email', email);
          
          console.log(`Email received for ${emailAddress}: ${email.subject}`);
        } else {
          console.log(`Email blocked for ${emailAddress} due to abuse protection`);
        }
      }
      
      callback();
    });
    
    stream.on('error', (err) => {
      console.error('SMTP stream error:', err);
      callback(err);
    });
  },
  
  onRcptTo(address, session, callback) {
    const emailAddress = address.address;
    
    // Check if this is a valid temporary email address
    if (emailStorage.isValidEmailAddress(emailAddress)) {
      callback();
    } else {
      callback(new Error('Invalid email address'));
    }
  }
});

// Helper function to extract subject from email data
function extractSubject(mailData) {
  const subjectMatch = mailData.match(/^Subject:\s*(.+)$/m);
  return subjectMatch ? subjectMatch[1].trim() : 'No Subject';
}

// Start SMTP server
const SMTP_PORT = process.env.SMTP_PORT || 2525;
smtpServer.listen(SMTP_PORT, () => {
  console.log(`SMTP server running on port ${SMTP_PORT}`);
});

// Start HTTP server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`SMTP server running on port ${SMTP_PORT}`);
});

// Cleanup expired emails every hour
setInterval(() => {
  emailStorage.cleanupExpiredEmails();
}, 60 * 60 * 1000);

module.exports = { app, io, emailStorage, emailGenerator }; 