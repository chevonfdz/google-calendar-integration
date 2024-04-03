import React, { useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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

  function StudentInputPage() {
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

  const handlePreferredStudyTimesChange = (timeSlot) => {
    setFormData(prev => ({
      ...prev,
      preferredStudyTimes: {
        ...prev.preferredStudyTimes,
        [timeSlot]: !prev.preferredStudyTimes[timeSlot]
      }
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
    <div className="min-h-screen bg-gray-800 text-white flex items-center justify-center p-4">
      <div className="max-w-3xl w-full">
        <h2 className="text-3xl font-bold text-center mb-6">Student Details</h2>
        <form onSubmit={handleSubmit} className="bg-gray-700 rounded-lg p-8 space-y-4">
          <div className="flex flex-col">
            <label htmlFor="stream" className="font-semibold">Study Stream:</label>
            <select 
              id="stream"
              className="bg-gray-600 text-white p-2 rounded focus:ring-2 focus:ring-blue-500"
              value={formData.stream} 
              onChange={handleStreamChange}
            >
              <option value="">Select Stream</option>
              {Object.keys(STREAMS_SUBJECTS).map(stream => (
                <option key={stream} value={stream}>{stream}</option>
              ))}
            </select>
          </div>

          <fieldset className="space-y-2">
            <legend className="font-semibold">Preferred Study Times:</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {STUDY_TIMES.map(timeSlot => (
                <label key={timeSlot} className="flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox h-5 w-5 text-blue-600"
                    checked={formData.preferredStudyTimes[timeSlot]}
                    onChange={() => handlePreferredStudyTimesChange(timeSlot)}
                  />
                  <span className="ml-2">{timeSlot}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="flex flex-wrap -mx-2 space-y-4 md:space-y-0">
            <div className="px-2 w-full md:w-1/2">
              <label htmlFor="maxContinuousStudyDuration" className="font-semibold">
                Max Continuous Study Duration (min):
              </label>
              <input
                id="maxContinuousStudyDuration"
                type="number"
                className="bg-gray-600 text-white p-2 rounded focus:ring-2 focus:ring-blue-500 w-full"
                value={formData.maxContinuousStudyDuration}
                onChange={handleMaxContinuousStudyDurationChange}
                min="30"
                max="90"
              />
            </div>
            
            <div className="px-2 w-full md:w-1/2">
              <label htmlFor="breakDuration" className="font-semibold">
                Break Duration (min):
              </label>
              <input
                id="breakDuration"
                type="number"
                className="bg-gray-600 text-white p-2 rounded focus:ring-2 focus:ring-blue-500 w-full"
                value={formData.breakDuration}
                onChange={handleBreakDurationChange}
                min="5"
                max="20"
              />
            </div>
          </div>

          <div className="space-y-4">
          {formData.subjects.map(subject => (
        <div key={subject} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <label className="block">
            <span className="text-gray-700">{`Previous marks for ${subject}`}</span>
            <input
              type="number"
              className="mt-1 block w-full rounded-md bg-gray-200 border-transparent focus:border-gray-500 focus:bg-white focus:ring-0"
              placeholder="Enter previous marks"
              value={formData.previousMarks[subject]}
              onChange={(e) => handleInputChange(e, 'previousMarks', subject)}
              min="0"
              max="100"
            />
          </label>
          <label className="block">
            <span className="text-gray-700">{`Difficulty level for ${subject}`}</span>
            <input
              type="number"
              className="mt-1 block w-full rounded-md bg-gray-200 border-transparent focus:border-gray-500 focus:bg-white focus:ring-0"
              placeholder="Enter difficulty level"
              value={formData.difficultyLevels[subject]}
              onChange={(e) => handleInputChange(e, 'difficultyLevels', subject)}
              min="1"
              max="5"
            />
          </label>
          <label className="block">
            <span className="text-gray-700">{`Desired marks for ${subject}`}</span>
            <input
              type="number"
              className="mt-1 block w-full rounded-md bg-gray-200 border-transparent focus:border-gray-500 focus:bg-white focus:ring-0"
              placeholder="Enter desired marks"
              value={formData.desiredMarks[subject]}
              onChange={(e) => handleInputChange(e, 'desiredMarks', subject)}
              min="0"
              max="100"
            />
          </label>
          <label className="block">
            <span className="text-gray-700">{`Target date for ${subject}`}</span>
            <input
              type="date"
              className="mt-1 block w-full rounded-md bg-gray-200 border-transparent focus:border-gray-500 focus:bg-white focus:ring-0"
              value={formData.targetDates[subject]}
              onChange={(e) => handleDateChange(e, subject)}
            />
          </label>
        </div>
      ))}
          </div>

          <button 
            type="submit" 
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full transition-colors duration-300"
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
}

export default StudentInputPage;
