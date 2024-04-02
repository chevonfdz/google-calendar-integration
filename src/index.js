import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import { google } from 'googleapis';
import session from 'express-session';
import cors from 'cors';

// Create an Express application
const app = express();

// Use CORS and session middleware
app.use(cors());
app.use(session({
    secret: process.env.CLIENT_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV !== 'development' }
}));
app.use(express.json());

// Configure a Google OAuth2 client
const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI
);

// Instantiate the Google Calendar API
const calendar = google.calendar({
    version: 'v3',
    auth: oauth2Client // Make sure to authenticate before using
});

// Make sure the environment variables are loaded correctly
console.log('Environment Variables:', {
    CLIENT_ID: process.env.CLIENT_ID,
    CLIENT_SECRET: process.env.CLIENT_SECRET,
    REDIRECT_URI: process.env.REDIRECT_URI,
  });

// Specify the port to listen on
const PORT = process.env.PORT || 3000;

// Define scopes required for the Google Calendar API
const scopes = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email'
];

// Route to initiate Google OAuth2 login
app.get('/google', (req, res) => {
    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes
    });
    res.redirect(url);
});

// Route for Google OAuth2 callback
app.get('/google/redirect', async (req, res) => {
    const { code } = req.query;
    try {
      const { tokens } = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(tokens);
      // Set up session here
      res.redirect('http://localhost:3001/main'); // Redirect to the main page in React
    } catch (error) {
      console.error('Error during Google auth:', error);
      res.status(500).send("Authentication failed");
    }
  });
  

// Route to schedule an event
app.post('/google/schedule_event', async (req, res) => {
  try {
      const event = req.body; // Use the event details from the request body

      const result = await calendar.events.insert({
          calendarId: 'primary',
          auth: oauth2Client,
          requestBody: event // Use the dynamic event details
      });

      res.json({ message: 'Event created successfully', eventId: result.data.id });
  } catch (error) {
      console.error('Error creating event:', error);
      res.status(500).send('Error creating event');
  }
});


app.get('/google/get_events', async (req, res) => {
  const date = req.query.date;
  if (!date) {
    return res.status(400).send('Date parameter is required');
  }

  console.log(`Received date: ${date}`); // Log received date

  const startDate = new Date(date + 'T00:00:00+05:30'); 
  const endDate = new Date(date + 'T23:59:59+05:30'); 

  console.log(`Fetching events from ${startDate.toISOString()} to ${endDate.toISOString()}`); // Log start and end date

  try {
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: startDate.toISOString(),
      timeMax: endDate.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });

    console.log('Events:', response.data.items); // Log the events returned by the API
    res.json(response.data.items);
  } catch (error) {
    console.error('Error retrieving events:', error);
    res.status(500).send('Error retrieving events');
  }
});


// Root route
app.get('/', (req, res) => {
    res.send('Welcome to the TimeTune Frontend!');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
