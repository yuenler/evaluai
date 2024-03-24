import { useEffect, useState } from 'react';
import { useAppContext } from './context/Context';
import { ThreeDots } from 'react-loader-spinner';
import { useRouter } from 'next/router';

function Rubric() {
  const [loading, setLoading] = useState(false);
  const [editState, setEditState] = useState({});
  const [editNames, setEditNames] = useState({}); // [questionNumber-criteria: newName]
  const { test, rubric, setRubric } = useAppContext();

  const router = useRouter();

  useEffect(() => {
    const fetchRubric = async () => {
      if (!test) {
        router.push('/profile');
        return;
      }
      setLoading(true);

      const formData = new FormData();
      formData.append('file', test);
      const response = await fetch('/api/create-rubric', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      console.log('Rubric data:', data);
      setRubric(data);
      setLoading(false);
    };

    fetchRubric();
  }, [test]);

  const scanStudentTests = () => {
    router.push('/scan');
  }

  const toggleEdit = (questionNumber, criteria) => {
    const currentEditState = { ...editState };
    const editKey = `${questionNumber}-${criteria}`;
    currentEditState[editKey] = !currentEditState[editKey];
    setEditState(currentEditState);
  };

  const handleEdit = (questionNumber, questionCriteria, newValue) => {
    const updatedRubric = { ...rubric };
    const index = updatedRubric[questionNumber].findIndex(criteria => criteria.criteria === questionCriteria);
    if (index !== -1) {
      updatedRubric[questionNumber][index].name = newValue;
      setRubric(updatedRubric);
      toggleEdit(questionNumber, questionCriteria); // Toggle off edit mode
    }
  };

  const handleDelete = (questionNumber, questionCriteria) => {
    const updatedRubric = { ...rubric };
    updatedRubric[questionNumber] = updatedRubric[questionNumber].filter(criteria => criteria.criteria !== questionCriteria);
    if (!updatedRubric[questionNumber].length) delete updatedRubric[questionNumber];
    setRubric(updatedRubric);
  };

  const handleAddCriteria = (questionNumber) => {
    const criteria = prompt('Enter grading criteria:');
    const maxPoints = prompt('Enter maximum number of points:');
    if (!criteria || !maxPoints) return;

    const newCriteria = { criteria, maxPoints };
    const updatedRubric = { ...rubric };
    if (!updatedRubric[questionNumber]) {
      updatedRubric[questionNumber] = [newCriteria];
    } else {
      updatedRubric[questionNumber].push(newCriteria);
    }
    setRubric(updatedRubric);
  };

  const handleAddQuestion = () => {
    const questionNumber = prompt('Enter question number:');
    if (!questionNumber) return;

    const updatedRubric = { ...rubric };
    if (!updatedRubric[questionNumber]) {
      updatedRubric[questionNumber] = [];
      setRubric(updatedRubric);
    } else {
      console.log('Question number already exists.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="flex flex-col justify-center items-center">
          <p className="text-lg font-semibold mb-2">Making a rubric for your test...</p>
          <ThreeDots color="#00BFFF" height={80} width={80} />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-5" style={{ maxWidth: '60em' }}>
      <h1 className="text-2xl font-bold mb-4">Your Rubric</h1>
      <div>
        <p
          className='text-lg mb-4'
        >
          Look at the rubric extracted from your uploaded test. You can edit, delete, or add questions and grading criteria as needed. Once you've confirm your rubric, you can proceed to the next step and see whether you have met your concentration requirements.
        </p>
        <button
          onClick={() => scanStudentTests()}
          className="mt-3 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Upload student tests
        </button>
      </div>
      <button
        onClick={handleAddQuestion}
        className="mt-10 mb-4 bg-purple-500 hover:bg-purple-700 text-white font-bold py-1 px-2 rounded"
      >
        Add Question number
      </button>
      {Object.keys(rubric).length > 0 ? (
        Object.keys(rubric).map((questionNumber, questionNumberIndex) => (
          <div key={questionNumber} className={`mb-8 ${questionNumberIndex > 0 ? 'mt-8' : ''}`}>
            <h2 className="text-xl font-semibold mb-2">{questionNumber}</h2>
            <button
              onClick={() => handleAddCriteria(questionNumber)}
              className="mb-2 bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded"
            >
              Add Criteria
            </button>
            <table className="min-w-full table-auto">
              <thead className="border-b">
                <tr>
                  <th className="text-left px-4 py-2 w-2/3">Criteria</th>
                  <th className="text-left px-4 py-2">Max points</th>
                  <th className="text-right px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rubric[questionNumber].map((criteria, index) => (
                  <tr key={index} className="border-b">
                    <td className="px-4 py-2">{criteria.criteria}</td>
                    <td className="px-4 py-2">
                      {editState[`${questionNumber}-${criteria.criteria}`] ? (
                        <input
                          type="text"
                          defaultValue={criteria.maxPoints}
                          onChange={(e) => {
                            setEditNames({ ...editNames, [`${questionNumber}-${criteria.criteria}`]: e.target.value })
                          }}
                          className="text-left rounded border-2 border-blue-500 w-full"
                          autoFocus
                        />
                      ) : (
                        criteria.maxPoints
                      )}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <button
                        onClick={() => {
                          if (editState[`${questionNumber}-${criteria.criteria}`]) {
                            handleEdit(questionNumber, criteria.criteria, editNames[`${questionNumber}-${criteria.criteria}`]);
                          }
                          else {
                            toggleEdit(questionNumber, criteria.criteria);
                            setEditNames({ ...editNames, [`${questionNumber}-${criteria.criteria}`]: criteria.maxPoints });
                          }
                        }}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded mr-2"
                      >
                        {editState[`${questionNumber}-${criteria.criteria}`] ? 'Save' : 'Edit'}
                      </button>
                      <button
                        onClick={() => handleDelete(questionNumber, criteria.criteria)}
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      ) : (
        <p>No rubric found. Please upload your blank test.</p>
      )}
      <button
        onClick={() => scanStudentTests()}
        className="mt-10 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Scan Student Tests
      </button>
    </div>
  );
}

export default Rubric;
