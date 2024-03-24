import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Select from 'react-select';
import TestUploader from '../components/TestUploader';
import {
  useAppContext
} from '../context/Context';

const yearOptions = [
  { value: 'freshman', label: 'Freshman' },
  { value: 'sophomore', label: 'Sophomore' },
  { value: 'junior', label: 'Junior' },
  { value: 'senior', label: 'Senior' },
];

const subjectOptions = [
  { value: 'computerScience', label: 'Computer Science' },
  { value: 'biology', label: 'Biology' },
  { value: 'history', label: 'History' },
  { value: 'economics', label: 'Economics' },
  { value: 'statistics', label: 'Statistics' },
  { value: 'mathematics', label: 'Mathematics' },
  { value: 'physics', label: 'Physics' },
  { value: 'chemistry', label: 'Chemistry' },

  // Add more options...
];

export default function Profile() {

  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [additionalInfo, setAdditionalInfo] = useState('');

  const { setTest, setProfile
  } = useAppContext();

  const onUploadComplete = (data) => {
    setTest(data);
  }

  const router = useRouter();

  const handleSubmit = (event) => {
    const userProfile = {
      year: selectedYear ? selectedYear.value : '',
      subject: selectedSubject ? selectedSubject.value : '',
      additionalInfo,
    };
    setProfile(userProfile);
    event.preventDefault();
    router.push('/rubric');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Enter test information
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Let's get some information to customize your academic grading plan.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <TestUploader onUploadComplete={onUploadComplete} />
            <div>
              <label htmlFor="year" className="block mb-2 mt-5 text-sm font-medium text-gray-700">What year are most of your students in?</label>
              <Select
                options={yearOptions}
                onChange={setSelectedYear}
                placeholder="Select Student Year"
                isClearable
              />
            </div>
            <div>
              <label htmlFor="subject" className="block mb-2 mt-5 text-sm font-medium text-gray-700">Subject</label>
              <Select
                options={subjectOptions}
                onChange={setSelectedSubject}
                placeholder="Select Subject"
                isClearable
                isSearchable
              />
            </div>
            <div>
              <label htmlFor="additionalInfo" className="block mb-2 mt-5 text-sm font-medium text-gray-700">Additional Information</label>
              <textarea
                type="text"
                id="additionalInfo"
                name="additionalInfo"
                className="p-2 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="Add anything else you want about the class or tests."
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
              />

            </div>
          </div>
          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-gray-800 bg-blue-200 hover:bg-blue-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-300"
            >
              Submit
            </button>

          </div>
        </form>
      </div>
    </div>
  );
}
