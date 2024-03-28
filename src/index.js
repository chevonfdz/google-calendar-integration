import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import { google } from 'googleapis';

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

// Create an Express application
const app = express();

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
        res.send("You have successfully authenticated!");
    } catch (error) {
        console.error('Error getting tokens:', error);
        res.status(500).send("Authentication failed");
    }
});

// Route to schedule an event
app.get('/google/schedule_event', async (req, res) => {
    try {
        // Set the event details
        const event = {
            summary: 'Test Event',
            description: 'This is a test event',
            start: {
                dateTime: '2024-03-28T09:00:00+05:30',
                timeZone: 'Asia/Colombo'
            },
            end: {
                dateTime: '2024-03-28T17:00:00+05:30',
                timeZone: 'Asia/Colombo'
            }
        };

        // Insert the event into the calendar
        const result = await calendar.events.insert({
            calendarId: 'primary',
            auth: oauth2Client,
            requestBody: event
        });

        res.send('Event created successfully');
    } catch (error) {
        console.error('Error creating event:', error);
        res.status(500).send('Error creating event');
    }
});

app.get('/google/get_events', async (req, res) => {
    // Ensure the format of the date is 'YYYY-MM-DD'
    const date = req.query.date; // e.g., '2024-03-28'
    if (!date) {
        return res.status(400).send('Date parameter is required');
    }
    
    const startDate = new Date(date + 'T00:00:00+05:30'); // Start of the day in local time
    const endDate = new Date(date + 'T23:59:59+05:30'); // End of the day in local time

    try {
        // Use the authenticated oauth2Client
        const response = await calendar.events.list({
            calendarId: 'primary',
            timeMin: startDate.toISOString(),
            timeMax: endDate.toISOString(),
            singleEvents: true,
            orderBy: 'startTime', // Orders events by start time (ascending).
        });

        const events = response.data.items;
        res.send(events);
    } catch (error) {
        console.error('Error retrieving events:', error.response ? error.response.data : error.message);
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
