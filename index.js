const express = require('express');
require('dotenv').config();
const path = require('path');
const session = require('express-session');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const http = require('http');
const { Server } = require('socket.io');
const User = require('./models/User');
const Notification = require('./models/Notification');
const errorHandler = require('./middleware/errorHandler');
const compression = require('compression');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

global.io = io;

io.on('connection', socket => {
  console.log('User connected:', socket.id);

  socket.on('join', userId => {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined room`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// ==================
// DATABASE CONNECTION
// ==================
require('./init');

// ==================
// BODY PARSERS
// ==================
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ==================
// SECURITY & PERFORMANCE MIDDLEWARE
// ==================
app.use(compression());
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "cdn.jsdelivr.net", "cdn.quilljs.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "cdn.jsdelivr.net", "cdn.quilljs.com", "fonts.googleapis.com"],
        fontSrc: ["'self'", "fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "blob:", "res.cloudinary.com", "*.gstatic.com", "*.googleusercontent.com"],
        connectSrc: ["'self'"],
      },
    },
  })
);
app.use(cors());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api', limiter);

// ==================
// STATIC FILES
// ==================

app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// ==================
// SESSION CONFIG
// ==================
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'blogsecret',
    resave: false,
    saveUninitialized: false,
  })
);

const passport = require('./config/passport');
app.use(passport.initialize());
app.use(passport.session());

// ==================
// GLOBAL VARIABLES FOR EJS
// ==================
app.use(async (req, res, next) => {
  res.locals.req = req;
  try {
    if (req.session?.userId) {
      res.locals.user = await User.findById(req.session.userId);
      res.locals.notifications = await Notification.find({
        user: req.session.userId,
        isRead: false,
      }).limit(5);
    } else {
      res.locals.user = null;
      res.locals.notifications = [];
    }
    next();
  } catch (err) {
    next(err);
  }
});

// ==================
// VIEW ENGINE
// ==================
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ==================
// ROUTES
// ==================
app.use('/', require('./routes/auth'));
app.use('/', require('./routes/blog'));
app.use('/', require('./routes/follow'));
app.use('/', require('./routes/profile'));
app.use('/', require('./routes/like'));
app.use('/', require('./routes/newsletter'));
app.use('/', require('./routes/comment'));
app.use('/', require('./routes/seo'));
app.use('/', require('./routes/admin'));
app.use('/', require('./routes/dashboard'));
app.use('/api', require('./routes/upload'));

// ==================
// ERROR HANDLER
// ==================
app.use(errorHandler);

// 404 Handler
app.use((req, res) => {
  res.status(404).render('404');
});

// Centralized Error Handler (500)
app.use((err, req, res, next) => {
  console.error('Critical Server Error:', err.stack);
  res.status(500).render('blogs/error', { 
    message: 'We encountered an internal error. Our team has been notified.' 
  });
});

// ==================
// SERVER
// ==================
if (require.main === module) {
  server.listen(process.env.PORT || 3001, () => {
    console.log(`Server running on http://localhost:${process.env.PORT || 3001}`);
  });
}

module.exports = app;
