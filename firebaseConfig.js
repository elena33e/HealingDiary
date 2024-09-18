// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, } from "firebase/firestore";
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
//import { getAuth } from "@firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBAKoodDir9QQB8Hld1SOBmvD9Xgd15Wak",
  authDomain: "healingnotes-f21bb.firebaseapp.com",
  projectId: "healingnotes-f21bb",
  storageBucket: "healingnotes-f21bb.appspot.com",
  messagingSenderId: "149302568524",
  appId: "1:149302568524:web:84f64e25609b2a2e19b6e9"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});


