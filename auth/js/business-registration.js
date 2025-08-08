import { auth, db } from "./firebaseConfig.js";
import { ref, push, set } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("businessSetupForm");

  onAuthStateChanged(auth, (user) => {
    if (user) {
      form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const data = {
          businessName: form.businessName.value,
          businessDescription: form.businessDescription.value,
          contactPhone: form.contactPhone.value,
          businessAddress: form.businessAddress.value,
          googleMaps: form.googleMaps.value,
          businessHours: form.businessHours.value,
          primaryColor: form.primaryColor.value,
          secondaryColor: form.secondaryColor.value,
          createdAt: new Date().toISOString(),
          userId: user.uid 
        };

        try {        
          const userClientesRef = ref(db, `Informacion-Usuarios/${user.uid}`);  
          const newClienteRef = push(userClientesRef);      
          await set(newClienteRef, data);
          alert("Datos enviados correctamente ");
          form.reset();
        } catch (error) {
          console.error("Error al guardar:", error);
          alert("Error al enviar datos. Intenta de nuevo.");
        }
      });
    } else {  
      alert("Debes iniciar sesión para registrar clientes.");    
      window.location.href = "auth/login.html";
    }
  });
});
