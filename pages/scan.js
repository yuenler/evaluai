import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/Context';
import { ThreeDots } from 'react-loader-spinner';
import { storage } from '../firebase-config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Select from 'react-select';
import { useRouter } from 'next/router';




function ScanTests() {
  const [image, setImage] = useState(null);
  const [url, setUrl] = useState("");
  const { rubric, profile } = useAppContext();
  const [rubricOptions, setRubricOptions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [scores, setScores] = useState(rubric);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState('');


  // Function to calculate total score
  const calculateTotalScore = () => {
    let totalScore = 0;
    let totalMaxPoints = 0;
    Object.values(scores).forEach((criteriaScores) => {
      criteriaScores.forEach((criteria) => {
        if (criteria.score !== undefined) {
          totalScore += criteria.score;
          totalMaxPoints += criteria.maxPoints;
        } else {
          totalMaxPoints += criteria.maxPoints;
        }
      });
    });
    return { totalScore, totalMaxPoints };
  };

  const { totalScore, totalMaxPoints } = calculateTotalScore();
  const gradingComplete = totalScore !== 0 && totalScore === totalMaxPoints;

  useEffect(() => {
    const formattedRubric = Object.keys(rubric).map((questionNumber) => ({
      value: questionNumber,
      label: `Question ${questionNumber}`,
    }));
    setRubricOptions(formattedRubric);
  }, [rubric]);

  useEffect(() => {
    const initialScores = {};
    Object.keys(rubric).forEach((questionNumber) => {
      initialScores[questionNumber] = rubric[questionNumber].map((criteria) => ({
        criteria: criteria.criteria,
        score: undefined,
        maxPoints: criteria.maxPoints,
      }));
    });
    setScores(initialScores);
  }, [rubric]);


  useEffect(() => {
    if (!rubric || Object.keys(rubric).length === 0) {
      router.push('/profile');
    }
  }, []);

  const handleChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const gradeIt = async (url, questionNumber) => {
    try {
      setLoading(true);
      const response = await fetch('https://evaluai.vercel.app/api/grade-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          year: profile.year,
          subject: profile.subject,
          additionalInfo: profile.additionalInfo,
          url,
          rubric: rubric[questionNumber],
        }),
      });
      const data = await response.json();
      const updatedScores = { ...scores };

      updatedScores[questionNumber] = data.map((score, index) => ({
        ...score,
        maxPoints: rubric[questionNumber][index].maxPoints,
      }));
      setScores(updatedScores);
    } catch (error) {
      console.error('Error grading test:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = () => {
    if (!selectedQuestion) {
      setErrorMessage('Please select a question to grade');
      return;
    }
    if (!image) {
      setErrorMessage('Please select an image to upload');
      return;
    }
    const imageRef = ref(storage, `images/${image.name}`);
    uploadBytes(imageRef, image).then((snapshot) => {
      getDownloadURL(snapshot.ref).then((downloadURL) => {
        setUrl(downloadURL);
        gradeIt(downloadURL, selectedQuestion.value);
      });
    });
  };
  return (
    <div className="p-4 max-w-4xl mx-auto">
      {loading ? (
        <div className="flex justify-center items-center h-screen">
          <div className="flex flex-col justify-center items-center">
            <p className="text-lg font-semibold mb-2">Grading test question...</p>
            <ThreeDots color="#00BFFF" height={80} width={80} />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <Select
            options={rubricOptions}
            onChange={setSelectedQuestion}
            placeholder="Select a Question"
            isClearable
            isSearchable
            className="basic-single"
            classNamePrefix="select"
          />
          <div className="mb-4">
            <input type="file" onChange={handleChange} className="file:mr-4 file:py-2 file:px-4 file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
            <button onClick={handleUpload} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Grade Question</button>
          </div>

          {errorMessage && <p className="text-red-500">{errorMessage}</p>}

          <div className="mt-4">
            {Object.entries(scores).map(([questionNumber, criteriaScores]) => {
              // Determine if the question is fully graded by checking if any score is undefined
              const isFullyGraded = criteriaScores.every(criteria => criteria.score !== undefined);

              // Assign background classes based on whether the question is fully graded
              let bgClass = "from-gray-400 to-gray-300"; // Default for not graded
              if (isFullyGraded) {
                bgClass = "from-blue-400 to-blue-200"; // Fully graded
              }

              return (
                <div key={questionNumber} className={`mb-4 p-4 bg-gradient-to-r ${bgClass} rounded-lg shadow-lg`}>
                  <div className="font-bold text-white">Question {questionNumber}:</div>
                  <ul className="ml-4">
                    {criteriaScores.map((criteria, index) => (
                      <li key={index} className="mt-1 text-white">
                        {criteria.criteria}: {criteria.score !== undefined ? `${criteria.score}/${criteria.maxPoints}` : `?/${criteria.maxPoints} (Not scored yet)`}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}

            <div className="mt-6 pt-4 border-t border-blue-200">
              <p className="text-lg font-semibold">Total Score: {totalScore}/{totalMaxPoints} {gradingComplete ? '(Complete)' : '(Not done scoring)'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );



}

export default ScanTests;
