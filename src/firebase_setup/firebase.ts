import { getAnalytics } from "firebase/analytics"
import { initializeApp } from "firebase/app"
import firebase from "firebase/app"
import { getFirestore } from "firebase/firestore"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

// Initialize Firebase
const app = initializeApp(firebaseConfig)
// const analytics = getAnalytics(app)
// Initialize Firebase
// const app = initializeApp(firebaseConfig)
// const analytics = getAnalytics(app)
// export const db = getFirestore(app)
// export const dbRef = ref(getDatabase(), "rooms")
export const db = getFirestore(app)
// const reference = ref(db, "rooms/" + roomId)
