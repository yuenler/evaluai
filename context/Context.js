// context/TranscriptContext.js
import { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const ContextProvider = ({ children }) => {
  const [test, setTest] = useState(null);
  const [rubric, setRubric] = useState({});
  const [profile, setProfile] = useState({});


  return (
    <AppContext.Provider value={{
      test,
      setTest,
      rubric,
      setRubric,
      profile,
      setProfile
    }}>
      {children}
    </AppContext.Provider>
  );
};
