// firebaseConfig.js
// Import the functions you need from the SDKs you need
const { initializeApp } = require('firebase/app');
const { getAuth } = require('firebase/auth');

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBEuwhND_8BnNMGfbFCwy_-CJ2oCETwH0Y",
    authDomain: "proyecto-terminal-896bb.firebaseapp.com",
    projectId: "proyecto-terminal-896bb",
    storageBucket: "proyecto-terminal-896bb.appspot.com",
    messagingSenderId: "785416266190",
    appId: "1:785416266190:web:06a839663f1a7e52134b9f"
  };
  
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

module.exports = { auth };
