// Import the functions you need from the SDKs you need
import { getAnalytics } from "firebase/analytics"
import { initializeApp } from "firebase/app"
import { ref, set } from "firebase/database"
import { getDatabase } from "firebase/database"
import { getFirestore } from "firebase/firestore"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB_4tdcZyCAXTgb7nYXmRTfre5YBQJpDeM",
  authDomain: "ternary-search-438fe.firebaseapp.com",
  projectId: "ternary-search-438fe",
  storageBucket: "ternary-search-438fe.appspot.com",
  messagingSenderId: "831440717730",
  appId: "1:831440717730:web:92408046a02ede908254fb",
  measurementId: "G-57SZHY0JH4",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
// const analytics = getAnalytics(app)
// export const db = getFirestore(app)
// export const dbRef = ref(getDatabase(), "rooms")
export const db = getDatabase(app)
// const reference = ref(db, "rooms/" + roomId)
