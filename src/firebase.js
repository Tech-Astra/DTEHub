import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBU6ZehW1Je1bltxVyYIKyF5BPBzK7fEzw",
  authDomain: "dte-hub.firebaseapp.com",
  databaseURL: "https://dte-hub-default-rtdb.firebaseio.com/",
  projectId: "dte-hub",
  storageBucket: "dte-hub.firebasestorage.app",
  messagingSenderId: "553851844913",
  appId: "1:553851844913:web:855506917d04d5db271810",
  measurementId: "G-KV4ERD7Z2S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const database = getDatabase(app);

export { app, analytics, auth, googleProvider, database };
