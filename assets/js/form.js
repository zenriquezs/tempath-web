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
  
      const contactsRef = ref(db, 'contactos');
      await push(contactsRef, contactData);
      
      responseMessage.textContent = "¡Mensaje enviado exitosamente! Te contactaremos pronto.";
      responseMessage.style.color = "#28a745"; 
      

      form.reset();
      
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      responseMessage.textContent = "Error al enviar el mensaje. Por favor, inténtalo de nuevo.";
      responseMessage.style.color = "#dc3545";
    }

    
    setTimeout(() => {
      responseMessage.classList.remove("open");
      responseMessage.style.color = ""; 
    }, 5000);
  });
};

export default form;
