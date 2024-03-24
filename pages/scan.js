import React, { useEffect, useState } from 'react';
import { useAppContext } from './context/Context';
import { ThreeDots } from 'react-loader-spinner';
import { useRouter } from 'next/router';

// take in rubric and uploaded student test => compare and grade
function CriteriaFulfillmentPage() {
  const [image, setImage] = useState(null);
  const [url, setUrl] = useState("");

  const handleChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    const imageRef = ref(storage, `images/${image.name}`);
    uploadBytes(imageRef, image).then((snapshot) => {
      getDownloadURL(snapshot.ref).then((downloadURL) => {
        setUrl(downloadURL);
        console.log('File available at', downloadURL);
      });
    });
  };

  const { courses, profile } = useAppContext();

  const router = useRouter();

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!profile.concentration) {
          G
          router.push('/profile');
          return;
        }
        if (!courses) {
          router.push('/courses');
          return;
        }
        const response = await fetch('/api/criteria-fulfillment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            courses,
            year: profile.year,
            subject: profile.subject,
            additionalInfo: profile.additionalInfo,
          }),
        });
        const data = await response.json();
        setsFulfillment(data);
      } catch (error) {
        console.error('Error fetching requirement fulfillments:', error);
      }
    };

    fetchData();
  }, [courses, profile]);

  if (!fulfillments) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="flex flex-col justify-center items-center">
          <p className="text-lg font-semibold mb-2">Analyzing what concentration requirements you've fulfilled...</p>
          <ThreeDots color="#00BFFF" height={80} width={80} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <input type="file" onChange={handleChange} />
      <button onClick={handleUpload}>Upload Image</button>
      {url && <p>Image URL: {url}</p>}
    </div>
  );
}

export default RequirementFulfillmentPage;
