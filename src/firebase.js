// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBsP71XUX5ECHfNyVGHj0vrvh4soOVbF1Y",
  authDomain: "stockmaster-e31de.firebaseapp.com",
  projectId: "stockmaster-e31de",
  storageBucket: "stockmaster-e31de.firebasestorage.app",
  messagingSenderId: "879379979572",
  appId: "1:879379979572:web:b32e1dc0817bb58f6bd961",
  measurementId: "G-NEZGQV5MMM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

export default db;