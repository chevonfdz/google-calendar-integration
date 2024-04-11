import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import StudentInputPage from "./StudentInputPage";
import "react-toastify/dist/ReactToastify.css";
import '../css/StudentInputPage.css'

function MainPage() {
  const [events, setEvents] = useState([]);
  const [studentDetails, setStudentDetails] = useState({ preferredStudyTimes: {} });
  const [isScheduleGenerated, setIsScheduleGenerated] = useState(false);
  const [studySessions, setStudySessions] = useState([]);

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
      const studySessions = allocateStudySessions(freeTimeSlots, studyRecommendations);
      setStudySessions(studySessions);

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

  function calculateFreeTimeSlots(events, studentDetails) {
    const today = new Date();
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
    const preferredStudyTimes = studentDetails.preferredStudyTimes || {};
    const freeTimeSlots = findFreeSlots(events, today, endOfDay, preferredStudyTimes);
    const preferredTimeSlots = convertPreferredTimesToRanges(preferredStudyTimes, today);
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
      // Additional logic can be added here to merge time slots as needed
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
  };

  function convertPreferredTimesToRanges(preferredStudyTimes = {}, referenceDate) {
    if (!preferredStudyTimes || typeof preferredStudyTimes !== 'object') {
      console.error('Invalid preferredStudyTimes:', preferredStudyTimes);
      return [];
    }
    return Object.keys(preferredStudyTimes)
      .filter(key => preferredStudyTimes[key]) // Filter out times that are not preferred
      .map(key => parseLabelToTimes(key, referenceDate))
      .filter(range => range); // Filter out any null ranges
  };

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
  };

  function allocateStudySessions(freeTimeSlots, studyDurations) {
    const MAX_STUDY_DURATION = 60; // Maximum continuous study duration in minutes
    const BREAK_TIME = 5; // Break time in minutes
    const studySessions = [];
  
    Object.entries(studyDurations).forEach(([subject, requiredDuration]) => {
      let remainingDuration = requiredDuration;
  
      while (remainingDuration > 0) {
        let slotIndex = freeTimeSlots.findIndex(slot => {
          const slotDuration = (new Date(slot.end) - new Date(slot.start)) / 60000;
          return slotDuration >= Math.min(MAX_STUDY_DURATION, remainingDuration);
        });
  
        if (slotIndex !== -1) {
          let currentStudyDuration = Math.min(MAX_STUDY_DURATION, remainingDuration);
          let slot = freeTimeSlots[slotIndex];
          let startDateTime = new Date(slot.start);
          let endDateTime = new Date(startDateTime.getTime() + currentStudyDuration * 60000);
  
          // Schedule the study session
          studySessions.push({
            summary: `Study ${subject}`,
            description: `Dedicated time to study ${subject}`,
            start: { dateTime: startDateTime.toISOString() },
            end: { dateTime: endDateTime.toISOString() },
          });
  
          remainingDuration -= currentStudyDuration;
  
          // If there is remaining duration and we've just scheduled a full session, add a break
          if (remainingDuration > 0 && currentStudyDuration === MAX_STUDY_DURATION) {
            endDateTime = new Date(endDateTime.getTime() + BREAK_TIME * 60000);
          }
  
          // Adjust the current slot's start time or split the slot if there's remaining time
          if (endDateTime < new Date(slot.end)) {
            // There's still time left in this slot, so adjust the start time for the next session
            slot.start = endDateTime;
          } else {
            // This slot is fully used, so remove it
            freeTimeSlots.splice(slotIndex, 1);
          }
        } else {
          // No suitable slot found, warn the user
          toast.warn(`Not enough time to schedule study for ${subject}. Remaining duration: ${remainingDuration} minutes.`);
          break; // Break out of the while loop; we can't schedule any more sessions for this subject
        }
      }
    });
  
    return studySessions;
  };
  
  return (
    <div>
      <ToastContainer position="top-right" autoClose={1500} hideProgressBar={false} />
      <StudentInputPage onStudentDetailsChange={updateStudentDetails} studySessions={studySessions} />
      <div className="bottom-bar">
        <button
          type="button"
          className="generate-schedule-button"
          onClick={handleGenerateSchedule}
        >
          Generate Study Schedules
        </button>
      </div>
    </div>
  );
}

export default MainPage;
