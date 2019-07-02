const helmet = require('helmet');
const log4js = require('log4js');
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const flash = require('connect-flash');
const localStrategy = require('passport-local');
const methodOverride = require('method-override');
const expressSanitizer = require('express-sanitizer');
const User = require('./models/user');
const keys = require('./configs/keys');

// Import Routes files
const indexRoutes = require('./routes/index');
const usersRoutes = require('./routes/users');
const commentRoutes = require('./routes/comments');
const sessionsRoutes = require('./routes/sessions');
const campgroundsRoutes = require('./routes/campgrounds');

// Express Settings
const app = express();
app.set('view engine', 'ejs');
app.use(flash());
app.use(helmet());
app.use(methodOverride('_method'));
app.use(expressSanitizer());
app.use(express.static(__dirname + '/public'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Connect to Database
const MONGODB_URI = keys.mongoURI;
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true); // Deal with "DeprecationWarning: collection.ensureIndex is deprecated.""
mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

mongoose.connection.on('connected', () =>
  console.log(`Database connected to: ${MONGODB_URI}`)
);
mongoose.connection.on('disconnected', () =>
  console.log(`Database disconnected`)
);
mongoose.connection.on('error', err =>
  console.log(`Database connect with error: ${err.message}`)
);

// Passport Configuration
app.use(
  require('express-session')({
    secret: '5566ThEbEsT',
    resave: false,
    saveUninitialized: false
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Middleware
app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.error = req.flash('error');
  res.locals.success = req.flash('success');
  res.locals.info = req.flash('info');
  res.locals.moment = require('moment');
  next();
});

// Routes
app.use('/', indexRoutes);
app.use('/users', usersRoutes);
app.use('/sessions', sessionsRoutes);
app.use('/campgrounds', campgroundsRoutes);
app.use('/campgrounds/:id/comments', commentRoutes);

app.route('/*').get((req, res) => {
  res.redirect('/');
});

// Log
const layout = {
  type: 'pattern',
  pattern: '- * %p * %x{time} * %c * %f * %l * %m',
  tokens: {
    time: logEvent => {
      return new Date()
        .toISOString()
        .replace('T', ' ')
        .split('.')[0];
    }
  }
};

log4js.configure({
  appenders: {
    file: {
      type: 'dateFile',
      layout: layout,
      filename: 'app.log',
      keepFileExt: true
    },
    stream: { type: 'stdout', layout: layout }
  },
  categories: {
    default: { appenders: ['stream'], level: 'info', enableCallStack: false },
    app: { appenders: ['stream', 'file'], level: 'info', enableCallStack: true }
  }
});

// Server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('┌──────────────────────────────────┐');
  console.log('│   Yelp Camp Server Started...    │');
  console.log(`│   Listening on the port ${PORT}     │`);
  console.log('│                      (´･ω･`)     │');
  console.log('└──────────────────────────────────┘');
});
