import express from 'express';
import { google } from 'googleapis';

const router = express.Router();

export default function authRoutes(oauth2Client) {
  router.get('/google', (req, res) => {
    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'
      ]
    });
    res.redirect(url);
  });

  router.get('/google/redirect', async (req, res) => {
    const { code } = req.query;
    try {
      const { tokens } = await oauth2Client.getToken(code);
      oauth2Client.setCredentials(tokens);
      res.redirect('http://localhost:3001/main');
    } catch (error) {
      console.error('Error during Google auth:', error);
      res.status(500).send("Authentication failed");
    }
  });

  return router;
}
