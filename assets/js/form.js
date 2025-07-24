import { db } from '../../auth/js/firebaseConfig.js';
import { ref, push, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js';

const form = () => {
  const contactForm = document.querySelector(".contactForm");
  const responseMessage = document.querySelector(".response");

  if (!contactForm || !responseMessage) {
    console.warn("No se encontró formulario .contactForm o .response");
    return;
  }

  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    
    // Obtener los datos del formulario
    const contactData = {
      name: formData.get('name'),
      email: formData.get('email'),
      message: formData.get('message'),
      timestamp: serverTimestamp(),
      createdAt: new Date().toISOString()
    };

    responseMessage.classList.add("open");
    responseMessage.textContent = "Enviando mensaje...";

    try {
      // Guardar en Firebase
      const contactsRef = ref(db, 'contactos');
      await push(contactsRef, contactData);
      
      responseMessage.textContent = "¡Mensaje enviado exitosamente! Te contactaremos pronto.";
      responseMessage.style.color = "#28a745"; // Verde para éxito
      
      // Limpiar el formulario
      form.reset();
      
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      responseMessage.textContent = "Error al enviar el mensaje. Por favor, inténtalo de nuevo.";
      responseMessage.style.color = "#dc3545"; // Rojo para error
    }

    // Ocultar mensaje después de 5 segundos
    setTimeout(() => {
      responseMessage.classList.remove("open");
      responseMessage.style.color = ""; // Resetear color
    }, 5000);
  });
};

export default form;
