// MainPage.js
import React, { useState } from 'react';

function MainPage() {
  const [events, setEvents] = useState([]);


const handleCreateEvent = () => {
  fetch(`${process.env.REACT_APP_SERVER_URL}/google/schedule_event`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      // Include other headers as needed
    },
    body: JSON.stringify({
      // Your event data here
    }),
  })
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
};

    // const today = new Date();
    // const date = today.toISOString().split('T')[0];

    const handleGetEvents = async () => {
      try {
        const date = '2024-03-29'; // Use dynamic date as needed
        const response = await fetch(`${process.env.REACT_APP_SERVER_URL}/google/get_events?date=${date}`);
  
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
  
        const data = await response.json();
        console.log('Events:', data); // For debugging
        setEvents(data);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

  return (
    <div>
      <button onClick={handleCreateEvent}>Create Event</button>
      <button onClick={handleGetEvents}>Get Events</button>
      {/* Display the events here */}
    </div>
  );
}

export default MainPage;
