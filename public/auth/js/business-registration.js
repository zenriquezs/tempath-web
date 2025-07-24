import { auth, db } from "./firebaseConfig.js";
import { ref, push, set, get } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

// Configuración de Cloudinary - usando la misma que funciona en tu test
const CLOUDINARY_CLOUD_NAME = "dxsksjyxk";
const CLOUDINARY_UPLOAD_PRESET = "business_logos";

// Función para subir imagen a Cloudinary - usando la estructura exacta que funciona
async function uploadImageToCloudinary(file) {
  try {
    console.log('Subiendo archivo:', file.name, 'Tamaño:', file.size, 'Tipo:', file.type);
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', 'business-logos');
    
    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: formData
    });
    
    const result = await response.json();
    
    if (result.secure_url) {
      console.log('Imagen subida exitosamente:', result.secure_url);
      return result.secure_url;
    } else {
      console.error('Error de Cloudinary:', result);
      throw new Error(`Error de Cloudinary: ${JSON.stringify(result)}`);
    }
    
  } catch (error) {
    console.error('Error subiendo imagen a Cloudinary:', error);
    throw error;
  }
}

// Función para recopilar datos de redes sociales
function getSocialMediaData() {
  const socialData = {};
  const socialFields = document.querySelectorAll('#socialFieldsContainer input');
  
  socialFields.forEach(field => {
    if (field.value.trim()) {
      socialData[field.name] = field.value.trim();
    }
  });
  
  return socialData;
}

// Función para cargar datos existentes del usuario
async function loadExistingData(userId, form) {
  try {
    const userRef = ref(db, `Informacion-Usuarios/${userId}`);
    const snapshot = await get(userRef);
    
    if (snapshot.exists()) {
      const userData = snapshot.val();
      // Obtener el último registro (más reciente)
      const lastKey = Object.keys(userData).pop();
      const lastData = userData[lastKey];
      
      // Autollenar campos del formulario
      if (lastData.businessName) form.businessName.value = lastData.businessName;
      if (lastData.businessDescription) form.businessDescription.value = lastData.businessDescription;
      if (lastData.contactPhone) form.contactPhone.value = lastData.contactPhone;
      if (lastData.businessAddress) form.businessAddress.value = lastData.businessAddress;
      if (lastData.googleMaps) form.googleMaps.value = lastData.googleMaps;
      if (lastData.businessHours) form.businessHours.value = lastData.businessHours;
      if (lastData.primaryColor) form.primaryColor.value = lastData.primaryColor;
      if (lastData.secondaryColor) form.secondaryColor.value = lastData.secondaryColor;
      
      // Autollenar redes sociales si existen
      if (lastData.socialMedia) {
        Object.keys(lastData.socialMedia).forEach(social => {
          const input = document.querySelector(`input[name="${social}"]`);
          if (input) {
            input.value = lastData.socialMedia[social];
          }
        });
      }
      
      console.log('Datos cargados automáticamente:', lastData);
      return lastData;
    }
  } catch (error) {
    console.error('Error cargando datos existentes:', error);
  }
  return null;
}

// Función para subir múltiples imágenes
async function uploadMultipleImages(files) {
  const uploadPromises = [];
  const maxImages = 5;
  
  // Limitar a máximo 5 imágenes
  const filesToUpload = Array.from(files).slice(0, maxImages);
  
  for (let i = 0; i < filesToUpload.length; i++) {
    const file = filesToUpload[i];
    uploadPromises.push(uploadImageToCloudinary(file));
  }
  
  try {
    const urls = await Promise.all(uploadPromises);
    console.log(`${urls.length} imágenes subidas exitosamente:`, urls);
    return urls;
  } catch (error) {
    console.error('Error subiendo múltiples imágenes:', error);
    throw error;
  }
}

// Evento DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("businessSetupForm");
  const logoInput = document.getElementById("businessLogo");
  
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      // Cargar datos existentes al iniciar
      await loadExistingData(user.uid, form);
      
      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        // Mostrar indicador de carga
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Subiendo imágenes y generando página...';
        submitBtn.disabled = true;

        try {
          let logoUrl = null;
          let galleryUrls = [];
          
          // Subir logo si se seleccionó uno
          const logoFile = logoInput.files[0];
          if (logoFile) {
            console.log('Iniciando subida de logo a Cloudinary...');
            logoUrl = await uploadImageToCloudinary(logoFile);
            console.log('Logo subido exitosamente:', logoUrl);
          }
          
          // Subir galería de imágenes
          const galleryInput = document.getElementById('businessGallery');
          if (galleryInput && galleryInput.files.length > 0) {
            console.log('Subiendo galería de imágenes...');
            galleryUrls = await uploadMultipleImages(galleryInput.files);
          }
          
          // Recopilar datos del formulario
          const socialMediaData = getSocialMediaData();
          
          const data = {
            businessName: form.businessName.value,
            businessDescription: form.businessDescription.value,
            contactPhone: form.contactPhone.value,
            businessAddress: form.businessAddress.value || null,
            googleMaps: form.googleMaps.value || null,
            businessHours: form.businessHours.value || null,
            primaryColor: form.primaryColor.value,
            secondaryColor: form.secondaryColor.value,
            logoUrl: logoUrl,
            galleryUrls: galleryUrls,
            socialMedia: socialMediaData,
            createdAt: new Date().toISOString(),
            userId: user.uid 
          };

          console.log('Guardando datos en Firebase:', data);
          
          // Guardar en Firebase
          const userClientesRef = ref(db, `Informacion-Usuarios/${user.uid}`);
          const newClienteRef = push(userClientesRef);
          await set(newClienteRef, data);
          
          // Mostrar mensaje de éxito
          alert("¡Datos guardados correctamente! Ahora te mostraremos las plantillas disponibles.");
          
          // Redirigir a la página de plantillas
          window.location.href = "../templates-selection.html";
          
        } catch (error) {
          console.error("Error al guardar:", error);
          
          // Mostrar error específico
          if (error.message.includes('Cloudinary')) {
            alert(`Error al subir la imagen: ${error.message}\n\nPuedes continuar sin logo o intentar con una imagen diferente.`);
          } else {
            alert("Error al enviar datos. Intenta de nuevo.");
          }
        } finally {
          // Restaurar botón
          submitBtn.textContent = originalText;
          submitBtn.disabled = false;
        }
      });
    } else {  
      alert("Debes iniciar sesión para registrar clientes.");    
      window.location.href = "login.html";
    }
  });
});

// Exportar funciones para uso en otros archivos
export { uploadImageToCloudinary, uploadMultipleImages };
