import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import StudentInputPage from "./StudentInputPage";
import "react-toastify/dist/ReactToastify.css";

function MainPage() {
  const [events, setEvents] = useState([]);
  const [studentDetails, setStudentDetails] = useState({ preferredStudyTimes: {} });
  const [isScheduleGenerated, setIsScheduleGenerated] = useState(false);

  useEffect(() => {
    handleGetEvents();
  }, []);

  const handleCreateEvent = async (eventDetails) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/google/schedule_event`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(eventDetails),
        }
      );

      if (!response.ok) throw new Error("Network response was not ok");
      const data = await response.json();
      setEvents((prevEvents) => [...prevEvents, data]);
      toast.success("Event created successfully!");
    } catch (error) {
      toast.error("Error creating event: " + error.message);
      console.error("Error creating event:", error);
    }
  };

  const handleGetEvents = async () => {
    try {
      const today = new Date();
      const localDate = new Date(
        today.getTime() - today.getTimezoneOffset() * 60000
      )
        .toISOString()
        .split("T")[0];
      const response = await fetch(
        `${process.env.REACT_APP_SERVER_URL}/google/get_events?date=${localDate}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setEvents(data);
      toast.info("Events fetched successfully!");
    } catch (error) {
      toast.error("Error fetching events.");
      console.error("Error fetching events:", error);
    }
  };

  const updateStudentDetails = (newDetails) => {
    const updatedDetails = {
      ...newDetails,
      preferredStudyTimes: newDetails.preferredStudyTimes || {}
    };

    setStudentDetails(updatedDetails);
  };

  const handleGenerateSchedule = async () => {
    if (!studentDetails || Object.keys(studentDetails).length === 0) {
      toast.error("Please fill out the student details first.");
      return;
    }

    try {
      const mlModelResponse = await fetch(`${process.env.REACT_APP_SERVER_URL}/generate-schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentDetails),
      });

      if (!mlModelResponse.ok) throw new Error("Failed to receive schedule from ML model.");
      const studyRecommendations = await mlModelResponse.json(); // Ensure this matches the expected format for allocateStudySessions

      // Proceed with existing logic to calculate free time slots and allocate study sessions
      const freeTimeSlots = calculateFreeTimeSlots(events, studentDetails);
      const studySessions = allocateStudySessions(freeTimeSlots, studyRecommendations, studentDetails);

      // Create calendar events for each allocated study session
      for (const session of studySessions) {
        await handleCreateEvent(session);
      }

      setIsScheduleGenerated(true);
      toast.success("Study schedule generated successfully!");
    } catch (error) {
      console.error("Error generating schedule:", error);
      toast.error(`Failed to generate schedule: ${error.message}`);
    }
  };



  // This function finds the intersections between free time slots and preferred study times
  function calculateFreeTimeSlots(events, studentDetails) {
    const currentTime = new Date();
    const nextDay = new Date(currentTime.getTime() + 24 * 60 * 60 * 1000);
    const endOfNextDay = new Date(nextDay.getFullYear(), nextDay.getMonth(), nextDay.getDate(), 23, 59, 59, 999);

    const relevantEvents = events.filter(event => {
      const eventEnd = new Date(event.end.dateTime);
      return eventEnd >= currentTime && eventEnd <= endOfNextDay;
    });

    const preferredStudyTimes = studentDetails.preferredStudyTimes || {};
    const freeTimeSlots = findFreeSlots(relevantEvents, nextDay, endOfNextDay, preferredStudyTimes);
    const preferredTimeSlots = convertPreferredTimesToRanges(preferredStudyTimes, nextDay, endOfNextDay);

    const availableStudySlots = freeTimeSlots.filter(slot =>
      preferredTimeSlots.some(preferredSlot =>
        slot.end > preferredSlot.start && slot.start < preferredSlot.end
      )
    );

    // Map to get only the overlapping times
    return availableStudySlots.map(slot => {
      const overlappingRanges = preferredTimeSlots
        .filter(preferredSlot => slot.end > preferredSlot.start && slot.start < preferredSlot.end)
        .map(preferredSlot => ({
          start: slot.start > preferredSlot.start ? slot.start : preferredSlot.start,
          end: slot.end < preferredSlot.end ? slot.end : preferredSlot.end,
        }));

      // Combine the overlapping ranges if they are adjacent or overlapping
      return overlappingRanges.reduce((acc, current) => {
        // If the current slot starts before the previous one ends, it's overlapping
        if (acc.length && current.start <= acc[acc.length - 1].end) {
          const last = acc.pop();
          acc.push({
            start: last.start,
            end: current.end > last.end ? current.end : last.end,
          });
        } else {
          acc.push(current);
        }
        return acc;
      }, []);
    }).flat();
  }

  function findFreeSlots(events, today, endOfDay, preferredStudyTimes) {
    let freeTimeSlots = [];
    if (events.length === 0 && Object.keys(preferredStudyTimes).length > 0) {
      freeTimeSlots = convertPreferredTimesToRanges(preferredStudyTimes, today);
    } else {
      let lastEventEnd = today;
      lastEventEnd.setHours(0, 0, 0, 0);

      events.forEach(event => {
        const eventStart = new Date(event.start.dateTime);
        const eventEnd = new Date(event.end.dateTime);

        if (eventStart > lastEventEnd) {
          freeTimeSlots.push({ start: lastEventEnd, end: eventStart });
        }

        lastEventEnd = eventEnd;
      });

      if (lastEventEnd < endOfDay) {
        freeTimeSlots.push({ start: lastEventEnd, end: endOfDay });
      }
    }

    return freeTimeSlots;
  }

  function convertPreferredTimesToRanges(preferredStudyTimes = {}, referenceDate) {
    if (!preferredStudyTimes || typeof preferredStudyTimes !== 'object') {
      console.error('Invalid preferredStudyTimes:', preferredStudyTimes);
      return [];
    }
    return Object.keys(preferredStudyTimes)
      .filter(key => preferredStudyTimes[key]) // Filter out times that are not preferred
      .map(key => parseLabelToTimes(key, referenceDate))
      .filter(range => range); // Filter out any null ranges
  }

  function parseLabelToTimes(timeLabel, referenceDate) {

    const labelKey = timeLabel.split(' - ')[0].trim();

    const timeMappings = {
      "Early Morning": { startHour: 4, endHour: 8 },
      "Morning": { startHour: 8, endHour: 12 },
      "Afternoon": { startHour: 12, endHour: 16 },
      "Evening": { startHour: 16, endHour: 20 },
      "Night": { startHour: 20, endHour: 24 },
      "Late Night": { startHour: 0, endHour: 4 }
    };

    const timeRange = timeMappings[labelKey];
    if (!timeRange) {
      console.error("Unhandled time label:", timeLabel);
      return null;
    }

    // Calculate the start and end times using the extracted label
    const startDate = new Date(referenceDate.setHours(timeRange.startHour, 0, 0, 0));
    const endDate = new Date(referenceDate.setHours(timeRange.endHour, 0, 0, 0));

    return { start: startDate, end: endDate };
  }

  function allocateStudySessions(freeTimeSlots, studyDurations) {
    const MAX_STUDY_DURATION = 45; // Maximum continuous study duration in minutes
    const BREAK_TIME = 10; // Break time in minutes
    const studySessions = [];

    Object.entries(studyDurations).forEach(([subject, requiredDuration]) => {
      let remainingDuration = requiredDuration;

      while (remainingDuration > 0) {
        // Find the first slot that can accommodate the session
        const slotIndex = freeTimeSlots.findIndex(slot => {
          const slotDuration = (new Date(slot.end) - new Date(slot.start)) / 60000;
          return slotDuration >= MAX_STUDY_DURATION;
        });

        if (slotIndex !== -1) {
          const currentStudyDuration = Math.min(MAX_STUDY_DURATION, remainingDuration);
          const slot = freeTimeSlots[slotIndex];
          const startDateTime = new Date(slot.start);
          const endDateTime = new Date(startDateTime.getTime() + currentStudyDuration * 60000);

          // Push the study session
          studySessions.push({
            summary: `Study ${subject}`,
            description: `Dedicated time to study ${subject}`,
            start: { dateTime: startDateTime.toISOString() },
            end: { dateTime: endDateTime.toISOString() },
          });

          // Update remaining duration and the slot start time to reflect the booked session
          remainingDuration -= currentStudyDuration;
          slot.start = new Date(endDateTime.getTime() + BREAK_TIME * 60000).toISOString();

          // If there is remaining duration, check if we need to add a break
          if (remainingDuration > 0 && currentStudyDuration === MAX_STUDY_DURATION) {
            // Consider break time
            const breakEndDateTime = new Date(slot.start).getTime() + BREAK_TIME * 60000;
            slot.start = new Date(breakEndDateTime).toISOString();
          }
        } else {
          // No suitable slot found, warn the user
          toast.warn(`Not enough time to schedule study for ${subject}.`);
          break;
        }
      }
    });

    return studySessions;
  }

  return (
    <div>
      <ToastContainer
        position="top-center"
        autoClose={5000}
        hideProgressBar={false}
      />
      <StudentInputPage onStudentDetailsChange={updateStudentDetails} />
      <button onClick={handleGenerateSchedule}>Generate Study Schedule</button>
    </div>
  );
}

export default MainPage;
