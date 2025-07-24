import { auth, db } from '../../auth/js/firebaseConfig.js';
import { ref, get, push, set } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

// Importar funciones de subida desde business-registration.js
import { uploadImageToCloudinary, uploadMultipleImages } from '../../auth/js/business-registration.js';

document.addEventListener("DOMContentLoaded", function () {
  // Variables globales
  const form = document.getElementById("businessSetupForm");
  const socialOptions = document.querySelectorAll(".social-option");
  const socialFieldsContainer = document.getElementById("socialFieldsContainer");
  const logoutBtn = document.querySelector(".btn-logout");
  const addedSocials = new Set(); // Para evitar duplicados
  
  // Variables para el multi-step form
  const steps = document.querySelectorAll(".form-step");
  const stepIndicators = document.querySelectorAll(".steps .step");
  const prevBtn = document.querySelector(".btn-prev");
  const nextBtn = document.querySelector(".btn-next");
  const submitBtn = document.querySelector(".btn-submit");
  let currentStep = 0;
  
  // Verificar si es modo edición
  const urlParams = new URLSearchParams(window.location.search);
  const isEditMode = urlParams.get('edit') === 'true';
  
  // Verificar autenticación y cargar datos si es modo edición
  onAuthStateChanged(auth, async (user) => {
    if (user && isEditMode) {
      await loadExistingData(user.uid);
    }
  });

  // Inicializar AOS (Animate On Scroll)
  AOS.init({
    once: true,
    duration: 800,
  });

  // Inicializar el formulario multi-step
  initMultiStepForm();

  // Manejo de redes sociales
  socialOptions.forEach((option) => {
    option.addEventListener("click", function () {
      const socialType = this.dataset.social;

      if (!addedSocials.has(socialType)) {
        addSocialField(socialType);
        addedSocials.add(socialType);
        this.classList.add("added");
      }
    });
  });

  // Función para inicializar los dropzones
  function initDropzones() {
    // Dropzone para el logo
    const logoDropzone = document.getElementById('logoDropzone');
    const logoInput = document.querySelector('#logoDropzone input[type="file"]');
    const logoPreview = document.getElementById('logoPreview');

    logoDropzone.addEventListener('click', () => logoInput.click());
    
    logoDropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      logoDropzone.classList.add('active');
    });
    
    logoDropzone.addEventListener('dragleave', () => {
      logoDropzone.classList.remove('active');
    });
    
    logoDropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      logoDropzone.classList.remove('active');
      if (e.dataTransfer.files.length) {
        handleLogoUpload(e.dataTransfer.files[0]);
      }
    });
    
    logoInput.addEventListener('change', () => {
      if (logoInput.files.length) {
        handleLogoUpload(logoInput.files[0]);
      }
    });

    // Dropzone para imágenes del negocio
    const imagesDropzone = document.getElementById('imagesDropzone');
    const imagesInput = document.querySelector('#imagesDropzone input[type="file"]');
    const imagesPreview = document.getElementById('imagesPreview');

    imagesDropzone.addEventListener('click', () => imagesInput.click());
    
    imagesDropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      imagesDropzone.classList.add('active');
    });
    
    imagesDropzone.addEventListener('dragleave', () => {
      imagesDropzone.classList.remove('active');
    });
    
    imagesDropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      imagesDropzone.classList.remove('active');
      if (e.dataTransfer.files.length) {
        handleImagesUpload(Array.from(e.dataTransfer.files));
      }
    });
    
    imagesInput.addEventListener('change', () => {
      if (imagesInput.files.length) {
        handleImagesUpload(Array.from(imagesInput.files));
      }
    });
  }

  // Función para manejar la subida del logo
  function handleLogoUpload(file) {
    // Validar tamaño (25MB)
    if (file.size > 25 * 1024 * 1024) {
      showError('El logo no puede pesar más de 25MB');
      return;
    }

    // Validar tipo de archivo
    const validTypes = ['image/jpeg', 'image/png', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      showError('Formato de archivo no válido para el logo. Use JPG, PNG o SVG');
      return;
    }

    // Mostrar previsualización
    const reader = new FileReader();
    reader.onload = (e) => {
      const logoPreview = document.getElementById('logoPreview');
      logoPreview.innerHTML = `
        <div class="uploaded-image">
          <img src="${e.target.result}" alt="Logo preview">
          <button type="button" class="remove-image" onclick="removeLogo()">×</button>
        </div>
      `;
    };
    reader.readAsDataURL(file);
  }

  // Función para manejar la subida de imágenes
  // Agregar una variable global para almacenar los archivos de galería
  let galleryFiles = [];

  // Modificar la función handleImagesUpload
  function handleImagesUpload(files) {
    const imagesPreview = document.getElementById('imagesPreview');
    const currentImages = imagesPreview.querySelectorAll('.uploaded-image').length;
    
    // Validar cantidad máxima (6 imágenes)
    if (currentImages + files.length > 6) {
      showError('Solo puedes subir un máximo de 6 imágenes');
      return;
    }
  
    // Procesar cada archivo
    files.forEach(file => {
      // Validar tamaño (25MB)
      if (file.size > 25 * 1024 * 1024) {
        showError(`La imagen ${file.name} supera el límite de 25MB`);
        return;
      }
  
      // Validar tipo de archivo
      const validTypes = ['image/jpeg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        showError(`Formato no válido para ${file.name}. Use JPG o PNG`);
        return;
      }
  
      // Agregar archivo al array global
      galleryFiles.push(file);
  
      // Mostrar previsualización
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageId = Date.now() + Math.random();
        const imageDiv = document.createElement('div');
        imageDiv.className = 'uploaded-image';
        imageDiv.innerHTML = `
          <img src="${e.target.result}" alt="Image preview">
          <button type="button" class="remove-image" onclick="removeImage('${imageId}', '${file.name}')">×</button>
        `;
        imageDiv.dataset.id = imageId;
        imageDiv.dataset.name = file.name;
        imagesPreview.appendChild(imageDiv);
      };
      reader.readAsDataURL(file);
    });
  
    // Actualizar el input file con todos los archivos
    updateFileInput();
  }
  
  // Nueva función para actualizar el input file
  function updateFileInput() {
    const imagesInput = document.getElementById('businessImages');
    const dt = new DataTransfer();
    
    galleryFiles.forEach(file => {
      dt.items.add(file);
    });
    
    imagesInput.files = dt.files;
  }

  // Modificar la función removeImage para manejar el array global
  window.removeImage = function(id, fileName) {
    const imageToRemove = document.querySelector(`.uploaded-image[data-id="${id}"]`);
    if (imageToRemove) {
      imageToRemove.remove();
      
      // Remover del array global
      galleryFiles = galleryFiles.filter(file => file.name !== fileName);
      
      // Actualizar el input file
      updateFileInput();
    }
  }

  // Modificar la función initDropzones para manejar el input change
  function initDropzones() {
    // Dropzone para el logo
    const logoDropzone = document.getElementById('logoDropzone');
    const logoInput = document.querySelector('#logoDropzone input[type="file"]');
    const logoPreview = document.getElementById('logoPreview');

    logoDropzone.addEventListener('click', () => logoInput.click());
    
    logoDropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      logoDropzone.classList.add('active');
    });
    
    logoDropzone.addEventListener('dragleave', () => {
      logoDropzone.classList.remove('active');
    });
    
    logoDropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      logoDropzone.classList.remove('active');
      if (e.dataTransfer.files.length) {
        handleLogoUpload(e.dataTransfer.files[0]);
      }
    });
    
    logoInput.addEventListener('change', () => {
      if (logoInput.files.length) {
        handleLogoUpload(logoInput.files[0]);
      }
    });

    // Dropzone para las imágenes de galería
    const imagesDropzone = document.getElementById('imagesDropzone');
    const imagesInput = document.getElementById('businessImages');

    imagesDropzone.addEventListener('click', () => imagesInput.click());
    
    imagesDropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      imagesDropzone.classList.add('active');
    });
    
    imagesDropzone.addEventListener('dragleave', () => {
      imagesDropzone.classList.remove('active');
    });
    
    imagesDropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      imagesDropzone.classList.remove('active');
      if (e.dataTransfer.files.length) {
        handleImagesUpload(Array.from(e.dataTransfer.files));
      }
    });
    
    // Manejar cuando se seleccionan archivos desde el input
    imagesInput.addEventListener('change', () => {
      if (imagesInput.files.length) {
        // Limpiar archivos previos y agregar los nuevos
        galleryFiles = [];
        const imagesPreview = document.getElementById('imagesPreview');
        imagesPreview.innerHTML = '';
        
        handleImagesUpload(Array.from(imagesInput.files));
      }
    });
  }

  // Función para eliminar el logo
  window.removeLogo = function() {
    document.getElementById('logoPreview').innerHTML = '';
    document.querySelector('#logoDropzone input[type="file"]').value = '';
  }

  // Función para eliminar una imagen
  window.removeImage = function(id) {
    const imageToRemove = document.querySelector(`.uploaded-image[data-id="${id}"]`);
    if (imageToRemove) {
      imageToRemove.remove();
    }
  }

  // Función para mostrar errores
  function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
      errorDiv.remove();
    }, 5000);
  }

  // Logout
  logoutBtn.addEventListener("click", function (e) {
    e.preventDefault();
    localStorage.removeItem("isLoggedIn");
    window.location.href = "auth/login.html";
  });

  // Funciones para el multi-step form
  function initMultiStepForm() {
    showStep(currentStep);
    initDropzones();

    // Event listeners para botones de navegación
    nextBtn.addEventListener("click", nextStep);
    prevBtn.addEventListener("click", prevStep);

    // Event listener para el envío del formulario
    form.addEventListener("submit", handleFormSubmit);
  }

  function showStep(stepIndex) {
    // Ocultar todos los pasos
    steps.forEach((step, index) => {
      step.classList.remove("active");
      if (index === stepIndex) {
        step.classList.add("active");
      }
    });

    // Actualizar indicadores de paso
    stepIndicators.forEach((indicator, index) => {
      indicator.classList.remove("active");
      if (index <= stepIndex) {
        indicator.classList.add("active");
      }
    });

    // Actualizar botones de navegación
    if (stepIndex === 0) {
      // Primer paso - ocultar botón de regresar
      prevBtn.style.display = "none";
      nextBtn.style.display = "block";
      submitBtn.style.display = "none";
    } else if (stepIndex === steps.length - 1) {
      // Último paso - ocultar botón de siguiente, mostrar botón de enviar
      prevBtn.style.display = "block";
      nextBtn.style.display = "none";
      submitBtn.style.display = "block";
    } else {
      // Pasos intermedios - mostrar ambos botones
      prevBtn.style.display = "block";
      nextBtn.style.display = "block";
      submitBtn.style.display = "none";
    }

    // Forzar nueva animación AOS al cambiar de paso
    refreshAOS();
  }

  function nextStep() {
    // Validar el paso actual antes de continuar
    if (validateStep(currentStep)) {
      if (currentStep < steps.length - 1) {
        currentStep++;
        showStep(currentStep);
      }
    }
  }

  function prevStep() {
    if (currentStep > 0) {
      currentStep--;
      showStep(currentStep);
    }
  }

  function validateStep(stepIndex) {
    let isValid = true;
    const currentStepFields = steps[stepIndex].querySelectorAll("[required]");

    currentStepFields.forEach(field => {
      if (!field.value.trim()) {
        field.classList.add("invalid");
        isValid = false;
      } else {
        field.classList.remove("invalid");
      }
    });

    if (!isValid) {
      // Desplazarse al primer campo inválido
      const firstInvalid = steps[stepIndex].querySelector(".invalid");
      if (firstInvalid) {
        firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
    return isValid;
  }

  // Agregar al inicio del archivo, después de las importaciones de Firebase
  const CLOUDINARY_CLOUD_NAME = "dxsksjyxk";
  const CLOUDINARY_UPLOAD_PRESET = "business_logos";
  
  // Función para subir imagen a Cloudinary
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
        throw new Error(`Error de Cloudinary: ${result.error?.message || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error subiendo imagen:', error);
      throw error;
    }
  }
  
  // Función para subir múltiples imágenes
  async function uploadMultipleImages(files) {
    const uploadPromises = [];
    const maxImages = 6;
    
    // Limitar a máximo 6 imágenes
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

  async function handleFormSubmit(e) {
    e.preventDefault();
  
    if (!validateStep(currentStep)) {
      return;
    }
  
    const form = document.getElementById('businessSetupForm');
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
  
    try {
      submitBtn.textContent = 'Subiendo imágenes y creando sitio...';
      submitBtn.disabled = true;
      
      let logoUrl = null;
      let galleryUrls = [];
      
      // Subir logo si existe
      const logoInput = document.getElementById('businessLogo');
      if (logoInput && logoInput.files[0]) {
        console.log('Subiendo logo...');
        logoUrl = await uploadImageToCloudinary(logoInput.files[0]);
      }
      
      // Subir imágenes de galería si existen
      if (galleryFiles && galleryFiles.length > 0) {
        console.log('Subiendo galería de imágenes...');
        galleryUrls = await uploadMultipleImages(galleryFiles);
      }
      
      // Recopilar datos del formulario
      const formData = collectFormData();
      
      // Agregar URLs de imágenes
      const finalData = {
        businessName: formData.businessInfo.name,
        businessDescription: formData.businessInfo.description,
        contactPhone: formData.businessInfo.phone,
        businessAddress: formData.location.address || null,
        googleMaps: formData.location.maps || null,
        businessHours: formData.location.hours || null,
        primaryColor: formData.customization.primaryColor,
        secondaryColor: formData.customization.secondaryColor,
        logoUrl: logoUrl,
        galleryUrls: galleryUrls,
        socialMedia: formData.socialMedia,
        createdAt: new Date().toISOString(),
        userId: auth.currentUser.uid
      };
      
      console.log("Datos finales a guardar:", finalData);
      
      // Guardar en Firebase usando push() para crear campos separados
      const user = auth.currentUser;
      if (user) {
        const userRef = ref(db, `Informacion-Usuarios/${user.uid}`);
        const newEntryRef = push(userRef);
        await set(newEntryRef, finalData);
        
        console.log('Datos guardados exitosamente');
        
        // Redirigir a selección de plantillas
        window.location.href = 'templates-selection.html';
      }
      
    } catch (error) {
      console.error("Error al guardar:", error);
      
      if (error.message.includes('Cloudinary')) {
        showError(`Error al subir las imágenes: ${error.message}`);
      } else {
        showError("Error al enviar datos. Intenta de nuevo.");
      }
      
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  }

  function refreshAOS() {
    AOS.refresh();
  }

  // Función para cargar datos existentes (actualizada)
  async function loadExistingData(userId) {
    try {
      const userDataRef = ref(db, `Informacion-Usuarios/${userId}`);
      const snapshot = await get(userDataRef);
      
      if (snapshot.exists()) {
        const businessData = snapshot.val();
        fillFormWithData(businessData);
      }
    } catch (error) {
      console.error("Error al cargar datos existentes:", error);
    }
  }
  
  // Función para llenar el formulario con datos existentes (actualizada)
  function fillFormWithData(data) {
    console.log('Llenando formulario con datos:', data);
    
    // Campos básicos
    if (data.businessName) document.getElementById('businessName').value = data.businessName;
    if (data.businessDescription) document.getElementById('businessDescription').value = data.businessDescription;
    if (data.contactPhone) document.getElementById('contactPhone').value = data.contactPhone;
    if (data.businessAddress) document.getElementById('businessAddress').value = data.businessAddress;
    if (data.googleMaps) document.getElementById('googleMaps').value = data.googleMaps;
    if (data.businessHours) document.getElementById('businessHours').value = data.businessHours;
    if (data.primaryColor) document.getElementById('primaryColor').value = data.primaryColor;
    if (data.secondaryColor) document.getElementById('secondaryColor').value = data.secondaryColor;
    
    // Logo existente
    if (data.logoUrl) {
      showExistingLogo(data.logoUrl);
    }
    
    // Redes sociales (estructura actualizada)
    if (data.socialMedia) {
      Object.keys(data.socialMedia).forEach(platform => {
        if (data.socialMedia[platform]) {
          addSocialFieldWithValue(platform, data.socialMedia[platform]);
        }
      });
    }
    
    // Cambiar el texto del botón si es modo edición
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.textContent = 'Actualizar Información';
    }
    
    // Cambiar el título si es modo edición
    const pageTitle = document.querySelector('h1');
    if (pageTitle) {
      pageTitle.textContent = 'Editar Información del Negocio';
    }
  }
  
  // Función para mostrar logo existente
  function showExistingLogo(logoUrl) {
    const logoPreview = document.getElementById('logoPreview');
    logoPreview.innerHTML = `
      <div class="uploaded-image">
        <img src="${logoUrl}" alt="Logo actual">
        <button type="button" class="remove-image" onclick="removeLogo()">×</button>
      </div>
    `;
  }

  // Funciones auxiliares
  function addSocialField(socialType) {
    const socialName = {
      instagram: "Instagram",
      facebook: "Facebook",
      linkedin: "LinkedIn",
      tiktok: "TikTok",
    }[socialType];

    const fieldId = `${socialType}-${Date.now()}`;

    const fieldHTML = `
      <div class="social-field" data-social="${socialType}" id="${fieldId}" data-aos="fade-up">
        <input type="url" name="${socialType}_url" placeholder="Ingresa tu ${socialName}" required>
        <button type="button" class="remove-social" data-field="${fieldId}">✕</button>
      </div>
    `;

    socialFieldsContainer.insertAdjacentHTML("beforeend", fieldHTML);

    // Agregar evento para eliminar el campo
    document
      .querySelector(`[data-field="${fieldId}"]`)
      .addEventListener("click", function () {
        const fieldToRemove = document.getElementById(fieldId);
        fieldToRemove.remove();
        addedSocials.delete(socialType);

        // Rehabilitar el botón de la red social
        document
          .querySelector(`.social-option[data-social="${socialType}"]`)
          .classList.remove("added");
      });
  }

  // Función específica para agregar campos de redes sociales con valores (modo edición)
  function addSocialFieldWithValue(platform, value) {
    if (addedSocials.has(platform)) return;
    
    addedSocials.add(platform);
    
    const socialName = {
      instagram: "Instagram",
      facebook: "Facebook",
      linkedin: "LinkedIn",
      tiktok: "TikTok",
    }[platform] || platform;

    const fieldId = `${platform}-${Date.now()}`;

    const fieldHTML = `
      <div class="social-field" data-social="${platform}" id="${fieldId}" data-aos="fade-up">
        <input type="url" name="${platform}_url" value="${value}" placeholder="Ingresa tu ${socialName}" required>
        <button type="button" class="remove-social" data-field="${fieldId}">✕</button>
      </div>
    `;

    socialFieldsContainer.insertAdjacentHTML("beforeend", fieldHTML);

    // Agregar evento para eliminar el campo
    document
      .querySelector(`[data-field="${fieldId}"]`)
      .addEventListener("click", function () {
        const fieldToRemove = document.getElementById(fieldId);
        fieldToRemove.remove();
        addedSocials.delete(platform);

        // Rehabilitar el botón de la red social
        const socialOption = document.querySelector(`.social-option[data-social="${platform}"]`);
        if (socialOption) {
          socialOption.classList.remove("added");
        }
      });
      
    // Marcar el botón como agregado
    const socialOption = document.querySelector(`.social-option[data-social="${platform}"]`);
    if (socialOption) {
      socialOption.classList.add("added");
    }
  }

  function collectFormData() {
    const formData = {
      businessInfo: {
        name: document.getElementById("businessName").value,
        description: document.getElementById("businessDescription").value,
        phone: document.getElementById("contactPhone").value,
      },
      socialMedia: {},
      location: {
        address: document.getElementById("businessAddress").value,
        maps: document.getElementById("googleMaps").value,
        hours: document.getElementById("businessHours").value,
      },
      customization: {
        primaryColor: document.getElementById("primaryColor").value,
        secondaryColor: document.getElementById("secondaryColor").value,
      }
    };

    // Recoger redes sociales
    document.querySelectorAll(".social-field").forEach((field) => {
      const socialType = field.dataset.social;
      const url = field.querySelector("input").value;
      formData.socialMedia[socialType] = url;
    });

    return formData;
  }

  function showSuccessMessage(message) {
    const responseDiv = document.createElement("div");
    responseDiv.className = "response open";
    responseDiv.textContent = message;
    document.body.appendChild(responseDiv);

    setTimeout(() => {
      responseDiv.classList.remove("open");
      setTimeout(() => responseDiv.remove(), 500);
    }, 3000);
  }
});
