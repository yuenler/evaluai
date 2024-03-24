import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDnB1NFtUs_zRvmTzd54KvWf6TUAORnWeI",
  authDomain: "evalu-ai.firebaseapp.com",
  projectId: "evalu-ai",
  storageBucket: "evalu-ai.appspot.com",
  messagingSenderId: "62142742476",
  appId: "1:62142742476:web:2f75b16c01291eb0366769",
  measurementId: "G-895HYY9C8Y"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export { storage };
