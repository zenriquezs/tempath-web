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

  // Funcion para inicializar los dropzones
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

    // Dropzone para im]agenes del negocio
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

  // Funcion para manejar la subida del logo
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

    // Mostrar previsualizacino
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

  // Funcion para manejar la subida de im]agenes
  function handleImagesUpload(files) {
    const imagesPreview = document.getElementById('imagesPreview');
    const currentImages = imagesPreview.querySelectorAll('.uploaded-image').length;
    
    // Validar cantidad m]axima (6 imagenes)
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

      // Mostrar previsualizaci]ono
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageId = Date.now();
        const imageDiv = document.createElement('div');
        imageDiv.className = 'uploaded-image';
        imageDiv.innerHTML = `
          <img src="${e.target.result}" alt="Image preview">
          <button type="button" class="remove-image" onclick="removeImage('${imageId}')">×</button>
        `;
        imageDiv.dataset.id = imageId;
        imageDiv.dataset.name = file.name;
        imagesPreview.appendChild(imageDiv);
      };
      reader.readAsDataURL(file);
    });
  }

  // Funcio]n para eliminar el logo
  function removeLogo() {
    document.getElementById('logoPreview').innerHTML = '';
    document.querySelector('#logoDropzone input[type="file"]').value = '';
  }

  // Funcion para eliminar una imagen
  function removeImage(id) {
    const imageToRemove = document.querySelector(`.uploaded-image[data-id="${id}"]`);
    if (imageToRemove) {
      imageToRemove.remove();
    }
  }

  // Funci]on para mostrar errores
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
    // Aqui debe de ir la lgica real de logout
    localStorage.removeItem("isLoggedIn");
    window.location.href = "auth/login.html";
  });

  // Funciones para el multi-step form
  function initMultiStepForm() {
    showStep(currentStep);
    initDropzones();

    // Event listeners para botones de navegacion
    nextBtn.addEventListener("click", nextStep);
    prevBtn.addEventListener("click", prevStep);

    // Event listener para el env[io del formulario
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

    // Actualizar botones de navegaci]on
    if (stepIndex === 0) {
      // Primer paso - ocultar boton de regresar
      prevBtn.style.display = "none";
      nextBtn.style.display = "block";
      submitBtn.style.display = "none";
    } else if (stepIndex === steps.length - 1) {
      // Último paso - ocultar boton de siguiente, mostrar boton de enviar
      prevBtn.style.display = "block";
      nextBtn.style.display = "none";
      submitBtn.style.display = "block";
    } else {
      // Pasos intermedios - mostrar ambos botones
      prevBtn.style.display = "block";
      nextBtn.style.display = "block";
      submitBtn.style.display = "none";
    }

    // Forzar nueva animaci]no AOS al cambiar de paso
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
      // Desplazarse al primer campo invlaido
      const firstInvalid = steps[stepIndex].querySelector(".invalid");
      if (firstInvalid) {
        firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }

    return isValid;
  }

  function handleFormSubmit(e) {
    e.preventDefault();

    // Validar todos los pasos antes de enviar
    let allValid = true;
    for (let i = 0; i < steps.length; i++) {
      if (!validateStep(i)) {
        allValid = false;
        // Ir al primer paso invalido
        currentStep = i;
        showStep(currentStep);
        break;
      }
    }

    if (allValid) {
      // El formulario es valido, proceder con el envío
      const formData = collectFormData();
      console.log("Datos del formulario a enviar:", formData);

      // Aquí se deben de enviar los datos al servidor
      // Por ahora solo muestra un mensaje de exito
      showSuccessMessage("¡Tu sitio web se está generando! Serás redirigido al panel de control.");

      // Se simula envio del formulario
      setTimeout(() => {
        window.location.href = "dashboard.html"; // Cambiar a pagina de dashboard cuando se implemente
      }, 3000);
    }
  }

  function refreshAOS() {
    AOS.refresh();
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
        logo: document.getElementById("businessLogo").value,
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


