"use client";

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCRTUGdGh74nI-k7TWKSAnJLRggftJ78Pc",
  authDomain: "chat-form-7def7.firebaseapp.com",
  projectId: "chat-form-7def7",
  storageBucket: "chat-form-7def7.firebasestorage.app",
  messagingSenderId: "775857315214",
  appId: "1:775857315214:web:13bd9c0564803fcf5718df",
  measurementId: "G-JKFKFCT484",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
