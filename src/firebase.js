// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBdm8dyQeVQ3NBdqGSDnPbz3UZ2SKM9pNk",
  authDomain: "citizengrievance-757e5.firebaseapp.com",
  projectId: "citizengrievance-757e5",
  storageBucket: "citizengrievance-757e5.firebasestorage.app",
  messagingSenderId: "765489875675",
  appId: "1:765489875675:web:ddfd1f95a5a09062badafe",
  measurementId: "G-2SKFV26SRP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app); 