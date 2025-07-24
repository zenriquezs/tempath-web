import { auth, db } from './firebaseConfig.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";

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
      // Verificar si el usuario ya tiene datos guardados
      await checkUserDataAndRedirect(user.uid);
    }
  } catch (error) {
    alert('Error al iniciar sesión: ' + error.message);
  }
});

// Función para verificar datos del usuario y redirigir apropiadamente
async function checkUserDataAndRedirect(userId) {
  try {
    const userDataRef = ref(db, `Informacion-Usuarios/${userId}`);
    const snapshot = await get(userDataRef);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      const keys = Object.keys(data);
      
      if (keys.length > 0) {
        // El usuario ya tiene datos, redirigir a plantillas
        console.log('Usuario con datos existentes, redirigiendo a plantillas');
        window.location.href = "../templates-selection.html";
      } else {
        // No hay datos, redirigir al formulario
        console.log('Usuario sin datos, redirigiendo al formulario');
        window.location.href = "../business-setup.html";
      }
    } else {
      // No existe el nodo del usuario, redirigir al formulario
      console.log('Usuario nuevo, redirigiendo al formulario');
      window.location.href = "../business-setup.html";
    }
  } catch (error) {
    console.error('Error al verificar datos del usuario:', error);
    // En caso de error, redirigir al formulario por seguridad
    window.location.href = "../business-setup.html";
  }
}
 