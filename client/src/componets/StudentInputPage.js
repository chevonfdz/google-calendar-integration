import React, { useState } from 'react';
import { toast } from 'react-toastify';

const STREAMS_SUBJECTS = {
  'Physical Science': ['Mathematics', 'Physics', 'Chemistry'],
  'Physical Science - ICT': ['Mathematics', 'Physics', 'ICT'],
  'Biological Science': ['Biology', 'Physics', 'Chemistry'],
  'Biological Science - Agri': ['Biology', 'Chemistry', 'Agriculture'],
  'Commerce': ['Accounting', 'Economics', 'Business Studies'],
  'Commerce - ICT': ['Accounting', 'Economics', 'ICT']
};

const STUDY_TIMES = [
    'Early Morning - 4.00 AM - 8.00AM',
    'Morning - 8.00AM - 12NOON',
    'Afternoon - 12NOON - 4.00PM',
    'Evening - 4.00PM - 8.00PM',
    'Night - 8.00PM - 12MID',
    'Late Night - 12MID - 4.00AM'
  ];

  function StudentInputPage( {onStudentDetailsChange} ) {
    const [formData, setFormData] = useState({
      stream: '',
      subjects: [],
      previousMarks: {},
      difficultyLevels: {},
      desiredMarks: {},
      targetDates: {},
      preferredStudyTimes: STUDY_TIMES.reduce((times, time) => ({ ...times, [time]: false }), {}),
      maxContinuousStudyDuration: 30,
      breakDuration: 5,
    });

    const handleStreamChange = (event) => {
      const stream = event.target.value;
      const subjects = STREAMS_SUBJECTS[stream];
  
      setFormData(prev => ({
        ...prev,
        stream,
        subjects,
        previousMarks: subjects.reduce((acc, subject) => ({ ...acc, [subject]: '' }), {}),
        difficultyLevels: subjects.reduce((acc, subject) => ({ ...acc, [subject]: 3 }), {}),
        desiredMarks: subjects.reduce((acc, subject) => ({ ...acc, [subject]: '' }), {}),
        targetDates: subjects.reduce((acc, subject) => ({ ...acc, [subject]: '' }), {})
      }));
    };

  const handleInputChange = (event, type, subject) => {
    const value = event.target.value;
    setFormData(prev => {
      const newFormData = {
        ...prev,
        [type]: {
          ...prev[type],
          [subject]: value
        }
      };

      // Call the function passed from MainPage
      onStudentDetailsChange(newFormData);

      return newFormData;
    });
  };

  const handleDateChange = (event, subject) => {
    handleInputChange(event, 'targetDates', subject);
  };

  const handlePreferredStudyTimesChange = (timeSlot) => {
    setFormData(prev => ({
      ...prev,
      preferredStudyTimes: {
        ...prev.preferredStudyTimes,
        [timeSlot]: !prev.preferredStudyTimes[timeSlot]
      }
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    // Here, you would validate the formData before sending to your backend
    // For example, ensure that all desired marks are greater than previous marks
    for (const subject of formData.subjects) {
      if (parseFloat(formData.desiredMarks[subject]) <= parseFloat(formData.previousMarks[subject])) {
        toast.error(`Desired marks for ${subject} must be greater than previous marks.`);
        return; // Prevent form submission if validation fails
      }
    }
    console.log(formData); 
    toast.success('Student details submitted!');
  };

  return (
    <div>
      <h2>Student Details</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="stream">Study Stream:</label>
        <select id="stream" value={formData.stream} onChange={handleStreamChange}>
          <option value="">Select Stream</option>
          {Object.keys(STREAMS_SUBJECTS).map(stream => (
            <option key={stream} value={stream}>{stream}</option>
          ))}
        </select>

        <fieldset>
          <legend>Preferred Study Times:</legend>
          {STUDY_TIMES.map(timeSlot => (
            <div key={timeSlot}>
              <label>
                <input
                  type="checkbox"
                  checked={formData.preferredStudyTimes[timeSlot]}
                  onChange={() => handlePreferredStudyTimesChange(timeSlot)}
                />
                {timeSlot}
              </label>
            </div>
          ))}
        </fieldset>

        {formData.subjects.map(subject => (
          <div key={subject}>
            <h3>{subject}</h3>
            <input
              type="number"
              placeholder={`Previous marks for ${subject}`}
              value={formData.previousMarks[subject]}
              onChange={(e) => handleInputChange(e, 'previousMarks', subject)}
              min="0"
              max="100"
            />
            <input
              type="number"
              placeholder={`Difficulty level for ${subject}`}
              value={formData.difficultyLevels[subject]}
              onChange={(e) => handleInputChange(e, 'difficultyLevels', subject)}
              min="1"
              max="5"
            />
            <input
              type="number"
              placeholder={`Desired marks for ${subject}`}
              value={formData.desiredMarks[subject]}
              onChange={(e) => handleInputChange(e, 'desiredMarks', subject)}
              min="0"
              max="100"
            />
            <input
              type="date"
              placeholder={`Target date for ${subject}`}
              value={formData.targetDates[subject]}
              onChange={(e) => handleDateChange(e, subject)}
            />
          </div>
        ))}
      </form>
    </div>
  );
}

export default StudentInputPage;
