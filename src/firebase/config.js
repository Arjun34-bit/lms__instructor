import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBa_nvuocb7atvfwioFA2LNJMZBkL2rc2w",
  authDomain: "pcc-mobile-app-84266.firebaseapp.com",
  projectId: "pcc-mobile-app-84266",
  storageBucket: "pcc-mobile-app-84266.appspot.com",
  messagingSenderId: "30873318956",
  appId: "1:30873318956:web:35aae1bc2cc6c97ac18389",
  measurementId: "G-1572PJXEVT"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);