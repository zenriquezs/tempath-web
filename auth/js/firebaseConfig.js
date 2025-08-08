import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBeiQGHxd4DDM-IZkDHm7qbmDOZqKmrMec",
  authDomain: "tempathwe-site.firebaseapp.com",
  projectId: "tempathwe-site",
  storageBucket: "tempathwe-site.firebasestorage.app",
  messagingSenderId: "298316460458",
  appId: "1:298316460458:web:ac174c0eb882d7fda3bbd3"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

export { auth, db };
