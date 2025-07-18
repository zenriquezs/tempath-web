document.addEventListener("DOMContentLoaded", function () {
  // Variables globales
  const form = document.getElementById("businessSetupForm");
  const socialOptions = document.querySelectorAll(".social-option");
  const socialFieldsContainer = document.getElementById(
    "socialFieldsContainer"
  );
  const logoutBtn = document.querySelector(".btn-logout");
  const addedSocials = new Set(); // Para evitar duplicados

  // Inicializar AOS (Animate On Scroll)
  AOS.init({
    once: true,
    duration: 800,
  });

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


  // Logout
  logoutBtn.addEventListener("click", function (e) {
    e.preventDefault();
    // Aquí iría la lógica real de logout
    localStorage.removeItem("isLoggedIn");
    window.location.href = "auth/login.html";
  });

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
