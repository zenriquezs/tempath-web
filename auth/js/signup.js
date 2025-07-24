// js/signup.js
import { auth, db } from './firebaseConfig.js';
import { createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { ref, set } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";

const signupForm = document.getElementById('signupForm');

signupForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const fullname = signupForm.fullname.value.trim();
  const email = signupForm.email.value.trim();
  const password = signupForm.password.value;
  const confirmPassword = signupForm.confirmPassword.value;
  const termsAccepted = signupForm.terms.checked;

  if (password !== confirmPassword) {
    alert("Las contraseñas no coinciden");
    return;
  }

  if (!termsAccepted) {
    alert("Debes aceptar los Términos y Condiciones");
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    await set(ref(db, 'usuarios/' + user.uid), {
      nombreCompleto: fullname,
      email: email,
      fechaRegistro: new Date().toISOString()
    });
    alert("Registro exitoso. Ahora puedes iniciar sesión.");
     window.location.href = "login.html";

  } catch (error) {
    alert("Error en el registro: " + error.message);
  }
});
