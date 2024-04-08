import React, { useState } from 'react';
import { toast } from 'react-toastify';
import '../css/StudentInputPage.css'
import TimeTuneLogo from '../logo/Group60.svg';

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

function StudentInputPage({ onStudentDetailsChange, studySessions }) {
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

  const getCurrentDate = () => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date().toLocaleDateString('en-US', options);
  };

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="logo-container">
          <img src={TimeTuneLogo} alt="TimeTune Logo" className="logo" />
        </div>
        <nav className="navigation">
          <a href="#dashboard" className="nav-link active">Dashboard</a>
          {/* Other navigation links */}
        </nav>
        <div className="user-info">
          <div className="user-icon">👤</div>
          <div className="username">Chevon Fernando</div>
        </div>
      </aside>

      <main className="main-content">
        <header className="top-bar">
          <div className="welcome-message">Welcome To The TimeTune</div>
          <div className="current-date">{getCurrentDate()}</div>
        </header>
        <div className="student-input-page bg-white shadow-lg rounded-lg p-8">
          <header className="page-header bg-teal-800 text-white p-4 rounded-t-lg">
            <h2 className="page-title text-xl">Study Shedules Generator</h2>
          </header>
          <form onSubmit={handleSubmit} className="student-details-form mt-4">
            <div className="form-group mb-4">
              <label htmlFor="stream" className="form-label font-semibold">Select Your A/L Study Stream:</label>
              <select id="stream" className="form-select w-full p-2 rounded-md" value={formData.stream} onChange={handleStreamChange}>
                <option value="">Select Stream</option>
                {Object.keys(STREAMS_SUBJECTS).map(stream => (
                  <option key={stream} value={stream}>{stream}</option>
                ))}
              </select>
            </div>
            <fieldset className="study-times-fieldset">
              <legend className="fieldset-legend">Select Your Preferred Study Times Ranges</legend>
              <div className="checkbox-group">
                {STUDY_TIMES.map((timeSlot, index) => (
                  <div key={index} className="checkbox-wrapper">
                    <input
                      id={`timeSlot-${index}`}
                      type="checkbox"
                      className="checkbox-input"
                      checked={formData.preferredStudyTimes[timeSlot]}
                      onChange={() => handlePreferredStudyTimesChange(timeSlot)}
                    />
                    <label htmlFor={`timeSlot-${index}`} className="checkbox-label">
                      {timeSlot}
                    </label>
                  </div>
                ))}
              </div>
            </fieldset>
            {formData.subjects.map(subject => (
              <div className="subject-details mb-4 p-4 rounded-md bg-gray-100">
                <h3 className="subject-title font-semibold text-lg mb-2">{subject}</h3>
                <div className="subject-metrics grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="metric previous-marks">
                    <label htmlFor={`previousMarks-${subject}`} className="metric-label">Previous Test Marks</label>
                    <div className="slider-container">
                      <input
                        type="range"
                        className="metric-slider"
                        id={`previousMarks-${subject}`}
                        min="0"
                        max="100"
                        value={formData.previousMarks[subject]}
                        onChange={(e) => handleInputChange(e, 'previousMarks', subject)}
                      />
                      <span className="slider-value">{formData.previousMarks[subject]}%</span>
                    </div>
                  </div>
                  <div className="metric difficulty-level">
                    <label htmlFor={`difficultyLevel-${subject}`} className="metric-label">Subject Difficulty Level</label>
                    <div className="slider-container">
                      <input
                        type="range"
                        className="metric-slider"
                        id={`difficultyLevel-${subject}`}
                        min="1"
                        max="5"
                        value={formData.difficultyLevels[subject]}
                        onChange={(e) => handleInputChange(e, 'difficultyLevels', subject)}
                      />
                      <span className="slider-value">{formData.difficultyLevels[subject]}</span>
                    </div>
                  </div>
                  <div className="metric targeted-marks">
                    <label htmlFor={`targetedMarks-${subject}`} className="metric-label">Targeted Test Marks</label>
                    <div className="slider-container">
                      <input
                        type="range"
                        className="metric-slider"
                        id={`targetedMarks-${subject}`}
                        min="0"
                        max="100"
                        value={formData.desiredMarks[subject]}
                        onChange={(e) => handleInputChange(e, 'desiredMarks', subject)}
                      />
                      <span className="slider-value">{formData.desiredMarks[subject]}%</span>
                    </div>
                  </div>
                  <div className="metric target-date">
                    <label htmlFor={`targetDate-${subject}`} className="metric-label">Target Test Date</label>
                    <div className="slider-container">
                      <input
                        type="date"
                        className="metric-input"
                        id={`targetDate-${subject}`}
                        value={formData.targetDates[subject]}
                        onChange={(e) => handleDateChange(e, subject)}
                      />
                    </div>
                  </div>
                </div>
                <div className="study-sessions-list mt-4">
                  <h4 className="sessions-title font-semibold text-lg mb-2">Study Sessions for {subject}:</h4>
                  {studySessions.filter(session => session.summary.includes(subject)).map((session, index) => (
                    <div key={index} className="session-details">
                      <strong className="session-summary">{session.summary}</strong>
                      <p className="session-time">
                        Start: {new Date(session.start.dateTime).toLocaleTimeString()} -
                        End: {new Date(session.end.dateTime).toLocaleTimeString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </form>
        </div>
      </main>
    </div>
  );
}

export default StudentInputPage;
