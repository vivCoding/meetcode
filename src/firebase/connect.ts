import { getApps, initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: "ternary-search.firebaseapp.com",
  databaseURL: "https://ternary-search-default-rtdb.firebaseio.com",
  projectId: "ternary-search",
  storageBucket: "ternary-search.appspot.com",
  messagingSenderId: process.env.FIREBASE_MESSAGE_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
}

export default function initFirebase() {
  if (!getApps().length) {
    console.log("creating firestore")
    initializeApp(firebaseConfig)
  } else {
    console.log("alr got firestore")
    // getFirestore().app
  }
}
