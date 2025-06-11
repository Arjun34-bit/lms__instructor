// src/firebaseConfig.js
import { initializeApp } from "firebase/app";
import {
  FacebookAuthProvider,
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBa_nvuocb7atvfwioFA2LNJMZBkL2rc2w",
  authDomain: "pcc-mobile-app-84266.firebaseapp.com",
  projectId: "pcc-mobile-app-84266",
  storageBucket: "pcc-mobile-app-84266.appspot.com",
  messagingSenderId: "30873318956",
  appId: "1:30873318956:web:35aae1bc2cc6c97ac18389",
  measurementId: "G-1572PJXEVT",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Function to handle Google Sign-In
export const signInWithGoogle = async () => {
  try {
    const googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({
      prompt: "select_account",
    });
    const result = await signInWithPopup(auth, googleProvider);
    return result.user; // Returns user details
  } catch (error) {
    console.error("Google Sign-In Error:", error);
    throw error;
  }
};

// Function to handle Facebook login
export const signInWithFacebook = async () => {
  try {
    const provider = new FacebookAuthProvider();
    provider.addScope("email"); // Request email from Facebook
    provider.addScope("public_profile"); // Request public profile

    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    console.error("Facebook Sign-In Error", error.message);
    throw error;
  }
};

// Function to handle Sign-Out
export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Sign-Out Error:", error);
  }
};

export { auth };
