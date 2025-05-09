const express = require('express');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;
const session = require('express-session');
const config = require('../config.json');
const router = express.Router();

// In-memory user storage for demo purposes
const users = [];

// Initialize passport and session
module.exports = (app) => {
  // Setup session middleware
  app.use(session({
    secret: 'airbnb-app-secret',
    resave: false,
    saveUninitialized: true,
    cookie: { 
      secure: false, // set to true if using https
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  }));

  // Initialize passport
  app.use(passport.initialize());
  app.use(passport.session());

  // Serialize/deserialize user
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    const user = users.find(u => u.id === id);
    done(null, user);
  });

  const serverUrl = `http://${config.server_host}:${config.server_port}`;

  // Configure Google Strategy
  passport.use(new GoogleStrategy({
    clientID: '788989317564-3bvthqu293tu7inviorkhksl8r0erd94.apps.googleusercontent.com',
    clientSecret: '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',
    callbackURL: `${serverUrl}/auth/google/callback`,
  }, (accessToken, refreshToken, profile, done) => {
    console.log("Google authentication callback received", profile);
    // Check if user exists
    let user = users.find(u => u.provider === 'google' && u.providerId === profile.id);
    
    // If not, create a new user
    if (!user) {
      user = {
        id: Date.now().toString(),
        provider: 'google',
        providerId: profile.id,
        displayName: profile.displayName,
        email: profile.emails && profile.emails[0]?.value,
      };
      users.push(user);
      console.log("New Google user created:", user);
    }
    
    return done(null, user);
  }));

  // Configure Twitter Strategy
  passport.use(new TwitterStrategy({
    consumerKey: 'aWtlenp4clBSV1A3TS1CV21SWk86MTpjaQ',
    consumerSecret: 'c0x2ZeNKQ2RGDycLikblSfrnKT-_JHyeIKE0A5i7drj0YgS8CD',
    callbackURL: `${serverUrl}/auth/twitter/callback`,
  }, (token, tokenSecret, profile, done) => {
    console.log("Twitter authentication callback received", profile);
    // Check if user exists
    let user = users.find(u => u.provider === 'twitter' && u.providerId === profile.id);
    
    // If not, create a new user
    if (!user) {
      user = {
        id: Date.now().toString(),
        provider: 'twitter',
        providerId: profile.id,
        displayName: profile.displayName,
        username: profile.username,
      };
      users.push(user);
      console.log("New Twitter user created:", user);
    }
    
    return done(null, user);
  }));

  // Google auth routes
  router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
  }));

  router.get('/google/callback', 
    passport.authenticate('google', { 
      failureRedirect: `http://${config.server_host}:3000/login`, 
      successRedirect: `http://${config.server_host}:3000/` 
    })
  );

  // Twitter auth routes
  router.get('/twitter', passport.authenticate('twitter'));

  router.get('/twitter/callback', 
    passport.authenticate('twitter', { 
      failureRedirect: `http://${config.server_host}:3000/login`, 
      successRedirect: `http://${config.server_host}:3000/` 
    })
  );

  // Regular signup route
  router.post('/signup', express.json(), (req, res) => {
    console.log("Signup request received:", req.body);
    const { username, password } = req.body;
    
    // Validate input
    if (!username || !password) {
      console.log("Signup validation failed: missing username or password");
      return res.status(400).json({ message: 'Username and password are required' });
    }
    
    // Check if username already exists
    if (users.find(u => u.username === username)) {
      console.log("Signup failed: username already exists");
      return res.status(400).json({ message: 'Username already exists' });
    }
    
    // Create new user
    const newUser = {
      id: Date.now().toString(),
      provider: 'local',
      username,
      password,
      displayName: username
    };
    
    users.push(newUser);
    console.log("New user created:", newUser);
    
    // Log in the user
    req.login(newUser, (err) => {
      if (err) {
        console.log("Login after signup failed:", err);
        return res.status(500).json({ message: 'Error logging in' });
      }
      console.log("User logged in after signup");
      return res.json({ 
        authenticated: true, 
        user: { id: newUser.id, username: newUser.username, displayName: newUser.displayName } 
      });
    });
  });

  // Regular login route
  router.post('/login', express.json(), (req, res) => {
    console.log("Login request received:", req.body);
    const { username, password } = req.body;
    
    // Validate input
    if (!username || !password) {
      console.log("Login validation failed: missing username or password");
      return res.status(400).json({ message: 'Username and password are required' });
    }
    
    // Find user
    const user = users.find(u => u.username === username && u.password === password);
    
    if (!user) {
      console.log("Login failed: invalid credentials");
      return res.status(401).json({ message: 'Invalid username or password' });
    }
    
    // Log in the user
    req.login(user, (err) => {
      if (err) {
        console.log("Login failed:", err);
        return res.status(500).json({ message: 'Error logging in' });
      }
      console.log("User logged in:", user);
      return res.json({ 
        authenticated: true, 
        user: { id: user.id, username: user.username, displayName: user.displayName } 
      });
    });
  });

  // Get current authenticated user
  router.get('/user', (req, res) => {
    console.log("Auth check request received, isAuthenticated:", req.isAuthenticated());
    if (req.isAuthenticated()) {
      return res.json({
        authenticated: true,
        user: {
          id: req.user.id,
          username: req.user.username,
          displayName: req.user.displayName,
          provider: req.user.provider
        }
      });
    } else {
      return res.json({ authenticated: false });
    }
  });

  // Logout route
  router.get('/logout', (req, res) => {
    console.log("Logout request received");
    req.logout(function(err) {
      if (err) { 
        console.log("Logout failed:", err);
        return res.status(500).json({ message: 'Error logging out' }); 
      }
      console.log("User logged out successfully");
      res.json({ success: true });
    });
  });

  // Debug route to see all users
  router.get('/debug/users', (req, res) => {
    // Only in development!
    console.log("All registered users:", users);
    return res.json({ users: users.map(u => ({...u, password: undefined })) });
  });

  return router;
}; 