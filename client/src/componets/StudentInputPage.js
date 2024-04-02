import React, { useState } from 'react';
import { toast } from 'react-toastify';

const STREAMS_SUBJECTS = {
  'Physical Science': [
    ['Mathematics', 'Physics', 'Chemistry'],
    ['Mathematics', 'Physics', 'ICT']
  ],
  'Biological Science': [
    ['Biology', 'Physics', 'Chemistry'],
    ['Biology', 'Chemistry', 'Agriculture']
  ],
  'Commerce': [
    ['Accounting', 'Economics', 'Business Studies'],
    ['Accounting', 'Economics', 'ICT']
  ]
};

const STUDY_TIMES = [
    'Early Morning - 4.00 AM - 8.00AM',
    'Morning - 8.00AM - 12NOON',
    'Afternoon - 12NOON - 4.00PM',
    'Evening - 4.00PM - 8.00PM',
    'Night - 8.00PM - 12MID',
    'Late Night - 12MID - 4.00AM'
  ];

function StudentInputPage() {
    const [formData, setFormData] = useState({
      stream: '',
      categoryIndex: 0,
      subjects: [],
      previousMarks: {},
      difficultyLevels: {},
      desiredMarks: {},
      targetDates: {},
      preferredStudyTimes: '',
      maxContinuousStudyDuration: 30, // default to minimum 30 minutes
      breakDuration: 5,
    });

  const handleStreamChange = (event) => {
    const stream = event.target.value;
    const categories = STREAMS_SUBJECTS[stream] || [[]];
    const subjects = categories[0];

    setFormData(prev => ({
      ...prev,
      stream,
      categoryIndex: 0,
      subjects,
      previousMarks: subjects.reduce((acc, subject) => ({ ...acc, [subject]: '' }), {}),
      difficultyLevels: subjects.reduce((acc, subject) => ({ ...acc, [subject]: 3 }), {}),
      desiredMarks: subjects.reduce((acc, subject) => ({ ...acc, [subject]: '' }), {}),
      targetDates: subjects.reduce((acc, subject) => ({ ...acc, [subject]: '' }), {})
    }));
  };

  const handleCategoryChange = (event) => {
    const index = Number(event.target.value);
    const subjects = STREAMS_SUBJECTS[formData.stream][index];

    setFormData(prev => ({
      ...prev,
      categoryIndex: index,
      subjects,
      previousMarks: subjects.reduce((acc, subject) => ({ ...acc, [subject]: '' }), {}),
      difficultyLevels: subjects.reduce((acc, subject) => ({ ...acc, [subject]: 3 }), {}),
      desiredMarks: subjects.reduce((acc, subject) => ({ ...acc, [subject]: '' }), {}),
      targetDates: subjects.reduce((acc, subject) => ({ ...acc, [subject]: '' }), {})
    }));
  };

  const handleInputChange = (event, type, subject) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [subject]: value
      }
    }));
  };

  const handleDateChange = (event, subject) => {
    handleInputChange(event, 'targetDates', subject);
  };

  const handlePreferredStudyTimesChange = (event) => {
    setFormData(prev => ({
      ...prev,
      preferredStudyTimes: event.target.value
    }));
  };

  const handleMaxContinuousStudyDurationChange = (event) => {
    const duration = Math.max(30, Math.min(Number(event.target.value), 90));
    setFormData(prev => ({
      ...prev,
      maxContinuousStudyDuration: duration
    }));
  };

  const handleBreakDurationChange = (event) => {
    const duration = Math.max(5, Math.min(Number(event.target.value), 20));
    setFormData(prev => ({
      ...prev,
      breakDuration: duration
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
        <label>Study Stream:</label>
        <select value={formData.stream} onChange={handleStreamChange}>
          <option value="">Select Stream</option>
          {Object.keys(STREAMS_SUBJECTS).map(stream => (
            <option key={stream} value={stream}>{stream}</option>
          ))}
        </select>
        
        {formData.stream && (
          <select value={formData.categoryIndex} onChange={handleCategoryChange}>
            <option value="0">Category 1</option>
            <option value="1">Category 2</option>
          </select>
        )}

        <label htmlFor="preferredStudyTimes">Preferred Study Times:</label>
        <select
          id="preferredStudyTimes"
          value={formData.preferredStudyTimes}
          onChange={handlePreferredStudyTimesChange}
        >
          {STUDY_TIMES.map(timeSlot => (
            <option key={timeSlot} value={timeSlot}>{timeSlot}</option>
          ))}
        </select>

        <label htmlFor="maxContinuousStudyDuration">
          Maximum time period that you can study continuously? (30-90 minutes)
        </label>
        <input
          id="maxContinuousStudyDuration"
          type="number"
          value={formData.maxContinuousStudyDuration}
          onChange={handleMaxContinuousStudyDurationChange}
          min="30"
          max="90"
        />

        <label htmlFor="breakDuration">
          How much break time is needed for in-between study sessions? (5-20 minutes)
        </label>
        <input
          id="breakDuration"
          type="number"
          value={formData.breakDuration}
          onChange={handleBreakDurationChange}
          min="5"
          max="20"
        />

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
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default StudentInputPage;
