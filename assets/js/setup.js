import { auth, db } from '../../auth/js/firebaseConfig.js';
import { ref, get, push, set } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", function () {
  
  const form = document.getElementById("businessSetupForm");
  const socialOptions = document.querySelectorAll(".social-option");
  const socialFieldsContainer = document.getElementById("socialFieldsContainer");
  const logoutBtn = document.querySelector(".btn-logout");
  const addedSocials = new Set();  
  const servicesList = document.getElementById("servicesList");
  const addServiceBtn = document.getElementById("addServiceBtn");
  
  let galleryFiles = [];
  let services = [];
  
  const steps = document.querySelectorAll(".form-step");
  const stepIndicators = document.querySelectorAll(".steps .step");
  const prevBtn = document.querySelector(".btn-prev");
  const nextBtn = document.querySelector(".btn-next");
  const submitBtn = document.querySelector(".btn-submit");
  let currentStep = 0;
  
  const urlParams = new URLSearchParams(window.location.search);
  const isEditMode = urlParams.get('edit') === 'true';
  
  onAuthStateChanged(auth, async (user) => {
    if (user && isEditMode) {
      await loadExistingData(user.uid);
    }
  });

  AOS.init({
    once: true,
    duration: 800,
  });

  // Inicializar el selector de teléfono internacional
  const phoneInput = document.querySelector("#contactPhone");
  const iti = window.intlTelInput(phoneInput, {
    initialCountry: "mx",
    separateDialCode: true,
    utilsScript: "https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js",
  });

  initMultiStepForm();

  // Agregar servicio
  addServiceBtn.addEventListener("click", function() {
    addServiceField();
  });

  function addServiceField(serviceData = { name: "", description: "", icon: "fas fa-cog" }) {
    const serviceId = Date.now();
    const serviceHTML = `
      <div class="service-item" data-id="${serviceId}">
        <input type="text" name="serviceName" placeholder="Nombre del servicio" value="${serviceData.name}" required>
        <input type="text" name="serviceDescription" placeholder="Descripción" value="${serviceData.description}">
        <select name="serviceIcon" class="service-icon-select">
          <option value="fas fa-cog" ${serviceData.icon === 'fas fa-cog' ? 'selected' : ''}>Configuración</option>
          <option value="fas fa-paint-brush" ${serviceData.icon === 'fas fa-paint-brush' ? 'selected' : ''}>Diseño</option>
          <option value="fas fa-code" ${serviceData.icon === 'fas fa-code' ? 'selected' : ''}>Desarrollo</option>
          <option value="fas fa-shopping-cart" ${serviceData.icon === 'fas fa-shopping-cart' ? 'selected' : ''}>Ventas</option>
          <option value="fas fa-wrench" ${serviceData.icon === 'fas fa-wrench' ? 'selected' : ''}>Reparación</option>
          <option value="fas fa-heart" ${serviceData.icon === 'fas fa-heart' ? 'selected' : ''}>Salud</option>
          <option value="fas fa-utensils" ${serviceData.icon === 'fas fa-utensils' ? 'selected' : ''}>Comida</option>
        </select>
        <button type="button" class="remove-service" onclick="removeService('${serviceId}')">×</button>
      </div>
    `;
    servicesList.insertAdjacentHTML("beforeend", serviceHTML);
  }

  window.removeService = function(id) {
    const serviceToRemove = document.querySelector(`.service-item[data-id="${id}"]`);
    if (serviceToRemove) {
      serviceToRemove.remove();
    }
  }

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

  function initDropzones() {
    // Logo Dropzone
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

    // Hero Image Dropzone
    const heroDropzone = document.getElementById('heroDropzone');
    const heroInput = document.querySelector('#heroDropzone input[type="file"]');
    const heroPreview = document.getElementById('heroPreview');

    heroDropzone.addEventListener('click', () => heroInput.click());
    
    heroDropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      heroDropzone.classList.add('active');
    });
    
    heroDropzone.addEventListener('dragleave', () => {
      heroDropzone.classList.remove('active');
    });
    
    heroDropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      heroDropzone.classList.remove('active');
      if (e.dataTransfer.files.length) {
        handleHeroUpload(e.dataTransfer.files[0]);
      }
    });
    
    heroInput.addEventListener('change', () => {
      if (heroInput.files.length) {
        handleHeroUpload(heroInput.files[0]);
      }
    });

    // About Image Dropzone
    const aboutDropzone = document.getElementById('aboutDropzone');
    const aboutInput = document.querySelector('#aboutDropzone input[type="file"]');
    const aboutPreview = document.getElementById('aboutPreview');

    aboutDropzone.addEventListener('click', () => aboutInput.click());
    
    aboutDropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      aboutDropzone.classList.add('active');
    });
    
    aboutDropzone.addEventListener('dragleave', () => {
      aboutDropzone.classList.remove('active');
    });
    
    aboutDropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      aboutDropzone.classList.remove('active');
      if (e.dataTransfer.files.length) {
        handleAboutUpload(e.dataTransfer.files[0]);
      }
    });
    
    aboutInput.addEventListener('change', () => {
      if (aboutInput.files.length) {
        handleAboutUpload(aboutInput.files[0]);
      }
    });

    // Gallery Images Dropzone
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

  function handleLogoUpload(file) {
    if (file.size > 25 * 1024 * 1024) {
      showError('El logo no puede pesar más de 25MB');
      return;
    }
  
    const validTypes = ['image/jpeg', 'image/png', 'image/svg+xml'];
    if (!validTypes.includes(file.type)) {
      showError('Formato de archivo no válido para el logo. Use JPG, PNG o SVG');
      return;
    }
  
    const logoPreview = document.getElementById('logoPreview');
    logoPreview.innerHTML = '';
  
    const reader = new FileReader();
    reader.onload = (e) => {
      logoPreview.innerHTML = `
        <div class="uploaded-image">
          <img src="${e.target.result}" alt="Logo preview">
          <button type="button" class="remove-image" onclick="removeLogo()">×</button>
        </div>
      `;
    };
    reader.readAsDataURL(file);
  }

  function handleHeroUpload(file) {
    if (file.size > 25 * 1024 * 1024) {
      showError('La imagen principal no puede pesar más de 25MB');
      return;
    }
  
    const validTypes = ['image/jpeg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      showError('Formato de archivo no válido para la imagen principal. Use JPG o PNG');
      return;
    }
  
    const heroPreview = document.getElementById('heroPreview');
    heroPreview.innerHTML = '';
  
    const reader = new FileReader();
    reader.onload = (e) => {
      heroPreview.innerHTML = `
        <div class="uploaded-image">
          <img src="${e.target.result}" alt="Hero image preview">
          <button type="button" class="remove-image" onclick="removeHero()">×</button>
        </div>
      `;
    };
    reader.readAsDataURL(file);
  }

  function handleAboutUpload(file) {
    if (file.size > 25 * 1024 * 1024) {
      showError('La imagen sobre nosotros no puede pesar más de 25MB');
      return;
    }
  
    const validTypes = ['image/jpeg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      showError('Formato de archivo no válido para la imagen sobre nosotros. Use JPG o PNG');
      return;
    }
  
    const aboutPreview = document.getElementById('aboutPreview');
    aboutPreview.innerHTML = '';
  
    const reader = new FileReader();
    reader.onload = (e) => {
      aboutPreview.innerHTML = `
        <div class="uploaded-image">
          <img src="${e.target.result}" alt="About image preview">
          <button type="button" class="remove-image" onclick="removeAbout()">×</button>
        </div>
      `;
    };
    reader.readAsDataURL(file);
  }

  function handleImagesUpload(files) {
    const imagesPreview = document.getElementById('imagesPreview');
    const currentImages = imagesPreview.querySelectorAll('.uploaded-image').length;
 
    if (currentImages + files.length > 6) {
      showError('Solo puedes subir un máximo de 6 imágenes');
      return;
    }

    files.forEach(file => {
      if (file.size > 15 * 1024 * 1024) {
        showError(`La imagen ${file.name} supera el límite de 15MB`);
        return;
      }
  
      const validTypes = ['image/jpeg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        showError(`Formato no válido para ${file.name}. Use JPG o PNG`);
        return;
      }
  
      galleryFiles.push(file);
  
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageId = Date.now() + Math.random();
        const imageDiv = document.createElement('div');
        imageDiv.className = 'uploaded-image';
        imageDiv.innerHTML = `
          <img src="${e.target.result}" alt="Image preview">
          <button type="button" class="remove-image" onclick="removeGalleryImage('${imageId}', '${file.name}')">×</button>
        `;
        imageDiv.dataset.id = imageId;
        imageDiv.dataset.name = file.name;
        imagesPreview.appendChild(imageDiv);
      };
      reader.readAsDataURL(file);
    });

    updateFileInput();
  }

  function updateFileInput() {
    const imagesInput = document.getElementById('businessImages');
    if (imagesInput) {
      const dt = new DataTransfer();
      
      galleryFiles.forEach(file => {
        dt.items.add(file);
      });
      
      imagesInput.files = dt.files;
    }
  }

  window.removeLogo = function() {
    const logoPreview = document.getElementById('logoPreview');
    logoPreview.innerHTML = '';
    const logoInput = document.querySelector('#logoDropzone input[type="file"]');
    if (logoInput) {
      logoInput.value = '';
    }
  }

  window.removeHero = function() {
    const heroPreview = document.getElementById('heroPreview');
    heroPreview.innerHTML = '';
    const heroInput = document.querySelector('#heroDropzone input[type="file"]');
    if (heroInput) {
      heroInput.value = '';
    }
  }

  window.removeAbout = function() {
    const aboutPreview = document.getElementById('aboutPreview');
    aboutPreview.innerHTML = '';
    const aboutInput = document.querySelector('#aboutDropzone input[type="file"]');
    if (aboutInput) {
      aboutInput.value = '';
    }
  }

  window.removeGalleryImage = function(id, fileName) {
    const imageToRemove = document.querySelector(`.uploaded-image[data-id="${id}"]`);
    if (imageToRemove) {
      imageToRemove.remove();
      
      galleryFiles = galleryFiles.filter(file => file.name !== fileName);
      
      updateFileInput();
    }
  }

  function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
      errorDiv.remove();
    }, 5000);
  }

  logoutBtn.addEventListener("click", function (e) {
    e.preventDefault();
    localStorage.removeItem("isLoggedIn");
    window.location.href = "auth/login.html";
  });

  function initMultiStepForm() {
    showStep(currentStep);
    initDropzones();

    nextBtn.addEventListener("click", nextStep);
    prevBtn.addEventListener("click", prevStep);

    form.addEventListener("submit", handleFormSubmit);
  }

  function showStep(stepIndex) {
    steps.forEach((step, index) => {
      step.classList.remove("active");
      if (index === stepIndex) {
        step.classList.add("active");
      }
    });

    stepIndicators.forEach((indicator, index) => {
      indicator.classList.remove("active");
      if (index <= stepIndex) {
        indicator.classList.add("active");
      }
    });

    if (stepIndex === 0) {
      prevBtn.style.display = "none";
      nextBtn.style.display = "block";
      submitBtn.style.display = "none";
    } else if (stepIndex === steps.length - 1) {
      prevBtn.style.display = "block";
      nextBtn.style.display = "none";
      submitBtn.style.display = "block";
      generateSummary();
    } else {
      prevBtn.style.display = "block";
      nextBtn.style.display = "block";
      submitBtn.style.display = "none";
    }

    refreshAOS();
  }

  function generateSummary() {
    const summaryContent = document.getElementById('summaryContent');
    summaryContent.innerHTML = '';
    
    // Información básica
    addSummaryItem('Nombre del negocio', document.getElementById('businessName').value);
    addSummaryItem('Eslogan', document.getElementById('businessSlogan').value);
    addSummaryItem('Descripción', document.getElementById('businessDescription').value);
    addSummaryItem('Teléfono', iti.getNumber());
    addSummaryItem('Correo electrónico', document.getElementById('contactEmail').value);
    
    // Ubicación
    addSummaryItem('Dirección', document.getElementById('businessAddress').value);
    addSummaryItem('Google Maps', document.getElementById('googleMaps').value);
    addSummaryItem('Horario', getBusinessHoursSummary());
    
    // Redes sociales
    const socialFields = document.querySelectorAll('.social-field');
    if (socialFields.length > 0) {
      let socials = '';
      socialFields.forEach(field => {
        const socialType = field.dataset.social;
        const url = field.querySelector('input').value;
        socials += `${socialType}: ${url}<br>`;
      });
      addSummaryItem('Redes sociales', socials);
    }
    
    // Servicios
    const serviceItems = document.querySelectorAll('.service-item');
    if (serviceItems.length > 0) {
      let servicesHtml = '';
      serviceItems.forEach(item => {
        const name = item.querySelector('input[name="serviceName"]').value;
        const desc = item.querySelector('input[name="serviceDescription"]').value;
        servicesHtml += `<strong>${name}</strong>: ${desc}<br>`;
      });
      addSummaryItem('Servicios', servicesHtml);
    }
  }

  function addSummaryItem(label, value) {
    if (!value) return;
    
    const summaryItem = document.createElement('div');
    summaryItem.className = 'summary-item';
    summaryItem.innerHTML = `<strong>${label}:</strong> ${value}`;
    document.getElementById('summaryContent').appendChild(summaryItem);
  }

  function getBusinessHoursSummary() {
    const days = Array.from(document.querySelectorAll('input[name="businessDays"]:checked')).map(el => el.value);
    const openingTime = document.getElementById('openingTime').value;
    const closingTime = document.getElementById('closingTime').value;
    
    if (days.length === 0 || !openingTime || !closingTime) return '';
    
    if (days.length === 7) {
      return `Todos los días: ${formatTime(openingTime)} - ${formatTime(closingTime)}`;
    } else if (days.length === 5 && 
               days.includes('Lunes') && 
               days.includes('Martes') && 
               days.includes('Miércoles') && 
               days.includes('Jueves') && 
               days.includes('Viernes')) {
      return `Lunes a Viernes: ${formatTime(openingTime)} - ${formatTime(closingTime)}`;
    } else {
      return `${days.join(', ')}: ${formatTime(openingTime)} - ${formatTime(closingTime)}`;
    }
  }

  function formatTime(time) {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'pm' : 'am';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  }

  function nextStep() {
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
      const firstInvalid = steps[stepIndex].querySelector(".invalid");
      if (firstInvalid) {
        firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
    return isValid;
  }

  function refreshAOS() {
    AOS.refresh();
  }

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
  
  function fillFormWithData(data) {
    console.log('Llenando formulario con datos:', data);
    
    // Campos básicos
    if (data.businessName) document.getElementById('businessName').value = data.businessName;
    if (data.businessSlogan) document.getElementById('businessSlogan').value = data.businessSlogan;
    if (data.businessDescription) document.getElementById('businessDescription').value = data.businessDescription;
    if (data.businessShortDescription) document.getElementById('businessShortDescription').value = data.businessShortDescription;
    if (data.contactPhone) {
      document.getElementById('contactPhone').value = data.contactPhone;
      iti.setNumber(data.contactPhone);
    }
    if (data.contactEmail) document.getElementById('contactEmail').value = data.contactEmail;
    if (data.aboutUs) document.getElementById('aboutUs').value = data.aboutUs;
    if (data.servicesDescription) document.getElementById('servicesDescription').value = data.servicesDescription;
    if (data.yearsExperience) document.getElementById('yearsExperience').value = data.yearsExperience;
    if (data.happyClients) document.getElementById('happyClients').value = data.happyClients;
    if (data.businessAddress) document.getElementById('businessAddress').value = data.businessAddress;
    if (data.googleMaps) document.getElementById('googleMaps').value = data.googleMaps;
    if (data.primaryColor) document.getElementById('primaryColor').value = data.primaryColor;
    if (data.secondaryColor) document.getElementById('secondaryColor').value = data.secondaryColor;
    
    // Logo existente
    if (data.logoUrl) {
      showExistingLogo(data.logoUrl);
    }
    
    // Hero Image
    if (data.heroImageUrl) {
      showExistingHero(data.heroImageUrl);
    }
    
    // About Image
    if (data.aboutImageUrl) {
      showExistingAbout(data.aboutImageUrl);
    }
    
    // Redes sociales
    if (data.socialMedia) {
      Object.keys(data.socialMedia).forEach(platform => {
        if (data.socialMedia[platform]) {
          addSocialFieldWithValue(platform, data.socialMedia[platform]);
        }
      });
    }
    
    // Servicios
    if (data.services && data.services.length > 0) {
      data.services.forEach(service => {
        addServiceField(service);
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
  
  function showExistingLogo(logoUrl) {
    const logoPreview = document.getElementById('logoPreview');
    logoPreview.innerHTML = `
      <div class="uploaded-image">
        <img src="${logoUrl}" alt="Logo actual">
        <button type="button" class="remove-image" onclick="removeLogo()">×</button>
      </div>
    `;
  }

  function showExistingHero(heroUrl) {
    const heroPreview = document.getElementById('heroPreview');
    heroPreview.innerHTML = `
      <div class="uploaded-image">
        <img src="${heroUrl}" alt="Hero image actual">
        <button type="button" class="remove-image" onclick="removeHero()">×</button>
      </div>
    `;
  }

  function showExistingAbout(aboutUrl) {
    const aboutPreview = document.getElementById('aboutPreview');
    aboutPreview.innerHTML = `
      <div class="uploaded-image">
        <img src="${aboutUrl}" alt="About image actual">
        <button type="button" class="remove-image" onclick="removeAbout()">×</button>
      </div>
    `;
  }

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

    document.querySelector(`[data-field="${fieldId}"]`)
      .addEventListener("click", function () {
        const fieldToRemove = document.getElementById(fieldId);
        fieldToRemove.remove();
        addedSocials.delete(socialType);

        document.querySelector(`.social-option[data-social="${socialType}"]`)
          .classList.remove("added");
      });
  }

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

    document.querySelector(`[data-field="${fieldId}"]`)
      .addEventListener("click", function () {
        const fieldToRemove = document.getElementById(fieldId);
        fieldToRemove.remove();
        addedSocials.delete(platform);

        const socialOption = document.querySelector(`.social-option[data-social="${platform}"]`);
        if (socialOption) {
          socialOption.classList.remove("added");
        }
      });
      
    const socialOption = document.querySelector(`.social-option[data-social="${platform}"]`);
    if (socialOption) {
      socialOption.classList.add("added");
    }
  }

  function collectFormData() {
    const formData = {
      businessInfo: {
        name: document.getElementById("businessName").value,
        slogan: document.getElementById("businessSlogan").value,
        description: document.getElementById("businessDescription").value,
        shortDescription: document.getElementById("businessShortDescription").value,
        phone: iti.getNumber(),
        email: document.getElementById("contactEmail").value,
        aboutUs: document.getElementById("aboutUs").value,
        servicesDescription: document.getElementById("servicesDescription").value,
        yearsExperience: document.getElementById("yearsExperience").value,
        happyClients: document.getElementById("happyClients").value
      },
      socialMedia: {},
      location: {
        address: document.getElementById("businessAddress").value,
        maps: document.getElementById("googleMaps").value,
        hours: getBusinessHoursSummary()
      },
      customization: {
        primaryColor: document.getElementById("primaryColor").value,
        secondaryColor: document.getElementById("secondaryColor").value
      },
      services: []
    };

    // Recopilar servicios
    document.querySelectorAll(".service-item").forEach((item) => {
      formData.services.push({
        name: item.querySelector("input[name='serviceName']").value,
        description: item.querySelector("input[name='serviceDescription']").value,
        icon: item.querySelector("select[name='serviceIcon']").value
      });
    });

    // Recopilar redes sociales
    document.querySelectorAll(".social-field").forEach((field) => {
      const socialType = field.dataset.social;
      const url = field.querySelector("input").value;
      formData.socialMedia[socialType] = url;
    });

    return formData;
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
      let heroUrl = null;
      let aboutUrl = null;
      let galleryUrls = [];
      
      // Subir logo si existe
      const logoInput = document.getElementById('businessLogo');
      if (logoInput && logoInput.files[0]) {
        console.log('Subiendo logo...');
        logoUrl = await uploadImageToCloudinary(logoInput.files[0]);
      }
      
      // Subir hero image si existe
      const heroInput = document.getElementById('heroImage');
      if (heroInput && heroInput.files[0]) {
        console.log('Subiendo hero image...');
        heroUrl = await uploadImageToCloudinary(heroInput.files[0]);
      }
      
      // Subir about image si existe
      const aboutInput = document.getElementById('aboutImage');
      if (aboutInput && aboutInput.files[0]) {
        console.log('Subiendo about image...');
        aboutUrl = await uploadImageToCloudinary(aboutInput.files[0]);
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
        ...formData.businessInfo,
        ...formData.location,
        ...formData.customization,
        logoUrl: logoUrl,
        heroImageUrl: heroUrl,
        aboutImageUrl: aboutUrl,
        galleryUrls: galleryUrls,
        socialMedia: formData.socialMedia,
        services: formData.services,
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

  const CLOUDINARY_CLOUD_NAME = "dxsksjyxk";
  const CLOUDINARY_UPLOAD_PRESET = "business_logos";
  
  async function uploadImageToCloudinary(file) {
    try {
      console.log('Subiendo archivo:', file.name, 'Tamaño:', file.size, 'Tipo:', file.type);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      formData.append('folder', 'business-logos');
      
      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.secure_url) {
        console.log('Imagen subida exitosamente:', result.secure_url);
        return result.secure_url;
      } else {
        throw new Error(`Error de Cloudinary: ${result.error?.message || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error subiendo imagen:', error);
      if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        throw new Error('Error de conexión. Verifica tu conexión a internet y que Cloudinary esté disponible.');
      }
      throw error;
    }
  }
  
  async function uploadMultipleImages(files) {
    const uploadPromises = [];
    const maxImages = 6;
    
    const filesToUpload = Array.from(files).slice(0, maxImages);
    
    const urls = [];
    for (let i = 0; i < filesToUpload.length; i++) {
      const file = filesToUpload[i];
      try {
        const url = await uploadImageToCloudinary(file);
        urls.push(url);
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error(`Error subiendo imagen ${file.name}:`, error);
        throw error;
      }
    }
    
    console.log(`${urls.length} imágenes subidas exitosamente:`, urls);
    return urls;
  }
});