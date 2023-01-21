import { getAnalytics } from "firebase/analytics"
import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB0JN2YLV53lea3yVmTp-ZaYK8fM3A7reA",
  authDomain: "ternary-search.firebaseapp.com",
  databaseURL: "https://ternary-search-default-rtdb.firebaseio.com",
  projectId: "ternary-search",
  storageBucket: "ternary-search.appspot.com",
  messagingSenderId: "456296834940",
  appId: "1:456296834940:web:72a3167dc3457a480c66f9",
  measurementId: "G-Z0GZZGDSZ1",
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
