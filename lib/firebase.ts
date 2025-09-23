import { initializeApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

const firebaseConfig = {
  apiKey: "AIzaSyCCLE5YaaA19xEQjhxnuYRDY16kmz5CpUM",
  authDomain: "nexora-79493.firebaseapp.com",
  databaseURL: "https://nexora-79493-default-rtdb.firebaseio.com",
  projectId: "nexora-79493",
  storageBucket: "nexora-79493.firebasestorage.app",
  messagingSenderId: "592841812290",
  appId: "1:592841812290:web:909d532853040ce6a9c0db",
  measurementId: "G-RWCLYDZMPW",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

export default app
