import React, { useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import StudentInputPage from './StudentInputPage'; 
import 'react-toastify/dist/ReactToastify.css';

function MainPage() {
  const [events, setEvents] = useState([]);

  const handleCreateEvent = async () => {
    const eventDuration = 90; // Duration in minutes
    const now = new Date();
    const startTime = now.toISOString();
    const endTime = new Date(now.getTime() + eventDuration * 60000).toISOString();

    const eventDetails = {
      summary: 'Dynamic Event',
      description: 'This is a dynamically created event.',
      start: { dateTime: startTime, timeZone: 'Asia/Colombo' },
      end: { dateTime: endTime, timeZone: 'Asia/Colombo' },
    };

    try {
      const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/google/schedule_event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventDetails),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      toast.success('Event created successfully!');
      setEvents([...events, data]); // Assuming `data` is the new event object
    } catch (error) {
      toast.error('Error creating event');
      console.error('Error creating event:', error);
    }
  };

  const handleGetEvents = async () => {
    try {
      const today = new Date();
      const localDate = new Date(today.getTime() - (today.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
      const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/google/get_events?date=${localDate}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setEvents(data);
      toast.info('Events fetched successfully!'+ localDate);
    } catch (error) {
      toast.error('Error fetching events.');
      console.error('Error fetching events:', error);
    }
  };

  return (
    <div>
      <ToastContainer position="top-center" autoClose={5000} hideProgressBar={false} />
      <StudentInputPage />
      <button onClick={handleCreateEvent}>Create Event</button>
      <button onClick={handleGetEvents}>Get Events</button>
      <div>
        {events.length > 0 ? (
          events.map((event, index) => (
            <div key={index}>
              <h3>{event.summary}</h3>
              <p>{event.description}</p>
              {/* Format dates and other event properties as needed */}
            </div>
          ))
        ) : (
          <p>No events to show</p>
        )}
      </div>
    </div>
  );
}

export default MainPage;
