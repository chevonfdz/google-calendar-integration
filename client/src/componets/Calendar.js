import React from 'react';

const Calendar = ({ events }) => {
  return (
    <div>
      <h2>Your Calendar</h2>
      <ul>
        {events.map(event => (
          <li key={event.id}>{event.summary} - {new Date(event.start.dateTime).toLocaleString()}</li>
        ))}
      </ul>
    </div>
  );
};

export default Calendar;
