import express from 'express';
const router = express.Router();

export default function eventRoutes(calendar) {
  router.post('/schedule_event', async (req, res) => {
    try {
      const event = req.body;
      const result = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: event
      });
      res.json({ message: 'Event created successfully', eventId: result.data.id });
    } catch (error) {
      console.error('Error creating event:', error);
      res.status(500).send('Error creating event');
    }
  });

  router.get('/get_events', async (req, res) => {
    const date = req.query.date;
    if (!date) {
      return res.status(400).send('Date parameter is required');
    }
    const startDate = new Date(date + 'T00:00:00+05:30');
    const endDate = new Date(date + 'T23:59:59+05:30');
    try {
      const response = await calendar.events.list({
        calendarId: 'primary',
        timeMin: startDate.toISOString(),
        timeMax: endDate.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
      });
      res.json(response.data.items);
    } catch (error) {
      console.error('Error retrieving events:', error);
      res.status(500).send('Error retrieving events');
    }
  });

  return router;
}
