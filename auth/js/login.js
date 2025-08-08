import { auth, db } from './firebaseConfig.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
const loginForm = document.getElementById('loginForm');

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = loginForm.email.value;
  const password = loginForm.password.value;
  const redirectTo = loginForm.redirect.value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log('Usuario logueado:', user.email);

    if (redirectTo) {
      window.location.href = redirectTo;
    } else {
      window.location.href = "../business-setup.html"; 
    }
  } catch (error) {
    alert('Error al iniciar sesión: ' + error.message);
  }
});
 