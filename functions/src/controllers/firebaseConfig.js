// firebaseConfig.js
// Import the functions you need from the SDKs you need
const { initializeApp } = require('firebase/app');
const { getAuth, } = require('firebase/auth');
//for analytics

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "your api key",
    authDomain: "your domain",
    projectId: "your proyect id",
    storageBucket: "your storage bucket",
    messagingSenderId: "your sender id",
    appId: "your app id"
  };
  
  
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

module.exports = { auth };
