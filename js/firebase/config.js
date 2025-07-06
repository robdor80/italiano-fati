// js/firebase/config.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBCzpHpbGPV_KwStxzIk30IutH2G6c00M4",
  authDomain: "italiano-fati.firebaseapp.com",
  projectId: "italiano-fati",
  storageBucket: "italiano-fati.firebasestorage.app",
  messagingSenderId: "1040989423439",
  appId: "1:1040989423439:web:a2adc758374cf1b906a73a"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db, firebaseConfig };
