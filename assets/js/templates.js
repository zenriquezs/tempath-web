import { auth, db } from '../../auth/js/firebaseConfig.js';
import { ref, get } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
 
  AOS.init({
    once: true,
    duration: 800,
  });

  let businessData = null;
  let currentTemplate = null;

   
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      await loadBusinessData(user.uid);
      populateTemplates();
      setupEventListeners();
    } else {
      alert("Debes iniciar sesión para ver las plantillas.");
      window.location.href = "auth/login.html";
    }
  });

  
  async function loadBusinessData(userId) {
    try {
      const userDataRef = ref(db, `Informacion-Usuarios/${userId}`);
      const snapshot = await get(userDataRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        
        const keys = Object.keys(data);
        if (keys.length > 0) {
          
          let latestKey = keys[0];
          let latestTime = data[keys[0]].createdAt || 0;
          
          keys.forEach(key => {
            const entryTime = data[key].createdAt || 0;
            if (entryTime > latestTime) {
              latestTime = entryTime;
              latestKey = key;
            }
          });
          
          businessData = data[latestKey];
        }
      } else {
        alert("No se encontraron datos del negocio. Por favor, completa el formulario primero.");
        window.location.href = "business-setup.html";
      }
    } catch (error) {
      console.error("Error al cargar datos:", error);
      alert("Error al cargar la información del negocio.");
    }
  }

 
  function populateTemplates() {
    if (!businessData) return;

 
    document.querySelectorAll('.template-business-name').forEach(element => {
      element.textContent = businessData.businessName || 'Tu Negocio';
    });

  
    document.querySelectorAll('.template-business-desc').forEach(element => {
      element.textContent = businessData.businessDescription || 'Descripción de tu negocio';
    });

 
    document.querySelectorAll('.template-phone, .template-phone-quick').forEach(element => {
      element.textContent = ` ${businessData.contactPhone || 'Tu teléfono'}`;
    });

 
    document.querySelectorAll('.template-address').forEach(element => {
      if (businessData.businessAddress) {
        element.textContent = ` ${businessData.businessAddress}`;
        element.style.display = 'block';
      } else {
        element.textContent = ' Tu dirección';
        element.style.opacity = '0.5';
      }
    });
 
    document.querySelectorAll('.template-hours').forEach(element => {
      if (businessData.businessHours) {
        element.textContent = ` ${businessData.businessHours}`;
        element.style.display = 'block';
      } else {
        element.textContent = ' Tus horarios';
        element.style.opacity = '0.5';
      }
    });

   
    generateSocialIcons();

    
    if (businessData.primaryColor || businessData.secondaryColor) {
      updateTemplateColors();
    }
  }

  
  function generateSocialIcons() {
    const socialNetworks = ['instagram', 'facebook', 'linkedin', 'tiktok'];
    const availableNetworks = socialNetworks.slice(0, 3);  

    document.querySelectorAll('.social-icons-preview').forEach(container => {
      container.innerHTML = '';
      availableNetworks.forEach(network => {
        const icon = document.createElement('a');
        icon.className = `social-icon-preview ${network}`;
        icon.href = '#';
        icon.textContent = getNetworkIcon(network);
        container.appendChild(icon);
      });
    });
  }

  function getNetworkIcon(network) {
    const icons = {
      instagram: '',
      facebook: '',
      linkedin: '',
      tiktok: ''
    };
    return icons[network] || '';
  }

  
  function updateTemplateColors() {
    const primaryColor = businessData.primaryColor || '#0c1618';
    const secondaryColor = businessData.secondaryColor || '#6f1d1b';

 
    document.querySelectorAll('.template-section h4').forEach(element => {
      element.style.color = primaryColor;
    });
  }

 
  function setupEventListeners() {
     
    document.querySelectorAll('.template-preview, .template-preview-btn').forEach(element => {
      element.addEventListener('click', function(e) {
        e.preventDefault();
        const templateType = this.dataset.template || this.closest('.template-card').dataset.template;
        showFullPreview(templateType);
      });
    });

 
    const modal = document.getElementById('templateModal');
    const closeBtn = document.querySelector('.modal-close');
    const backBtn = document.querySelector('.modal-back');
    const selectBtn = document.getElementById('modalSelectBtn');

    closeBtn.addEventListener('click', closeModal);
    backBtn.addEventListener('click', closeModal);
    
    selectBtn.addEventListener('click', function() {
      if (currentTemplate) {
        selectTemplate(currentTemplate);
      }
    });

 
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        closeModal();
      }
    });
 
    const logoutBtn = document.querySelector('.btn-logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('selectedTemplate');
        localStorage.removeItem('businessData');
        window.location.href = "auth/login.html";
      });
    }
  }

 
  function showFullPreview(templateType) {
    currentTemplate = templateType;
    const modal = document.getElementById('templateModal');
    const modalTitle = document.getElementById('modalTitle');
    const fullPreview = document.getElementById('fullTemplatePreview');
    const selectBtn = document.getElementById('modalSelectBtn');

    modalTitle.textContent = `Vista Completa - Plantilla ${templateType.charAt(0).toUpperCase() + templateType.slice(1)}`;
    selectBtn.textContent = `Seleccionar plantilla ${templateType}`;
    selectBtn.dataset.template = templateType;

 
    fullPreview.innerHTML = generateFullTemplate(templateType);

    modal.classList.add('show');
    modal.style.display = 'block';
  }

 
  function generateFullTemplate(templateType) {
    const templates = {
      moderna: generateModernTemplate(),
      clasica: generateClassicTemplate(),
      creativa: generateCreativeTemplate()
    };

    return templates[templateType] || templates.moderna;
  }

  function generateModernTemplate() {
    return `
      <div style="font-family: 'Poppins', sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; min-height: 500px;">
        <div style="padding: 3rem 2rem; text-align: center;">
          <div style="font-size: 4rem; margin-bottom: 1rem;"></div>
          <h1 style="font-size: 3rem; margin-bottom: 1rem; font-weight: 600;">${businessData.businessName}</h1>
          <p style="font-size: 1.3rem; margin-bottom: 2rem; opacity: 0.9;">${businessData.businessDescription}</p>
          
          <div style="background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); border-radius: 20px; padding: 2rem; margin: 2rem auto; max-width: 600px;">
            <h2 style="margin-bottom: 1.5rem; font-size: 1.5rem;">Información de Contacto</h2>
            <div style="display: grid; gap: 1rem; text-align: left;">
              <div style="display: flex; align-items: center; gap: 1rem; font-size: 1.1rem;">
                <span style="font-size: 1.5rem;"></span>
                <span>${businessData.contactPhone}</span>
              </div>
              ${businessData.businessAddress ? `
                <div style="display: flex; align-items: center; gap: 1rem; font-size: 1.1rem;">
                  <span style="font-size: 1.5rem;"></span>
                  <span>${businessData.businessAddress}</span>
                </div>
              ` : ''}
              ${businessData.businessHours ? `
                <div style="display: flex; align-items: center; gap: 1rem; font-size: 1.1rem;">
                  <span style="font-size: 1.5rem;"></span>
                  <span>${businessData.businessHours}</span>
                </div>
              ` : ''}
            </div>
            
            <div style="margin-top: 2rem; text-align: center;">
              <button style="background: white; color: #667eea; border: none; padding: 1rem 2rem; border-radius: 50px; font-weight: 600; font-size: 1.1rem; cursor: pointer;">Contáctanos Ahora</button>
            </div>
          </div>
          
          <div style="margin-top: 2rem;">
            <h3 style="margin-bottom: 1rem;">Síguenos en redes sociales</h3>
            <div style="display: flex; gap: 1rem; justify-content: center;">
              ${generateSocialButtons()}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function generateClassicTemplate() {
    return `
      <div style="font-family: 'Poppins', sans-serif; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; min-height: 500px;">
        <div style="padding: 3rem 2rem;">
          <div style="text-align: center; margin-bottom: 3rem;">
            <div style="font-size: 4rem; margin-bottom: 1rem;"></div>
            <h1 style="font-size: 3rem; margin-bottom: 1rem; font-weight: 600;">${businessData.businessName}</h1>
            <p style="font-size: 1.3rem; opacity: 0.9;">${businessData.businessDescription}</p>
          </div>
          
          <div style="background: white; color: #333; border-radius: 15px; padding: 2rem; margin: 2rem auto; max-width: 700px; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
            <h2 style="text-align: center; margin-bottom: 2rem; color: #f5576c;">Información del Negocio</h2>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem;">
              <div style="text-align: center; padding: 1rem; background: #f8f9fa; border-radius: 10px;">
                <div style="font-size: 2rem; margin-bottom: 0.5rem;">📞</div>
                <h4 style="margin-bottom: 0.5rem; color: #f5576c;">Teléfono</h4>
                <p>${businessData.contactPhone}</p>
              </div>
              
              ${businessData.businessAddress ? `
                <div style="text-align: center; padding: 1rem; background: #f8f9fa; border-radius: 10px;">
                  <div style="font-size: 2rem; margin-bottom: 0.5rem;">📍</div>
                  <h4 style="margin-bottom: 0.5rem; color: #f5576c;">Dirección</h4>
                  <p>${businessData.businessAddress}</p>
                </div>
              ` : ''}
              
              ${businessData.businessHours ? `
                <div style="text-align: center; padding: 1rem; background: #f8f9fa; border-radius: 10px;">
                  <div style="font-size: 2rem; margin-bottom: 0.5rem;">🕒</div>
                  <h4 style="margin-bottom: 0.5rem; color: #f5576c;">Horarios</h4>
                  <p>${businessData.businessHours}</p>
                </div>
              ` : ''}
            </div>
            
            <div style="text-align: center; margin-top: 2rem;">
              <button style="background: linear-gradient(45deg, #f093fb, #f5576c); color: white; border: none; padding: 1rem 2rem; border-radius: 50px; font-weight: 600; font-size: 1.1rem; cursor: pointer;">Visítanos</button>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 2rem;">
            <h3 style="margin-bottom: 1rem;">Conecta con nosotros</h3>
            <div style="display: flex; gap: 1rem; justify-content: center;">
              ${generateSocialButtons()}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function generateCreativeTemplate() {
    return `
      <div style="font-family: 'Poppins', sans-serif; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; min-height: 500px; position: relative; overflow: hidden;">
        <div style="padding: 3rem 2rem; position: relative; z-index: 2;">
          <div style="text-align: center; margin-bottom: 3rem;">
            <div style="font-size: 4rem; margin-bottom: 1rem; animation: bounce 2s infinite;">🎨</div>
            <h1 style="font-size: 3rem; margin-bottom: 1rem; font-weight: 600;">${businessData.businessName}</h1>
            <p style="font-size: 1.3rem; opacity: 0.9;">${businessData.businessDescription}</p>
          </div>
          
          <div style="display: flex; flex-wrap: wrap; gap: 1rem; justify-content: center; margin: 2rem 0;">
            <div style="background: rgba(255,255,255,0.2); backdrop-filter: blur(10px); border-radius: 25px; padding: 1rem 1.5rem; transform: rotate(-5deg);">
              <span style="font-size: 1.2rem;">${businessData.contactPhone}</span>
            </div>
            
            ${businessData.businessAddress ? `
              <div style="background: rgba(255,255,255,0.2); backdrop-filter: blur(10px); border-radius: 25px; padding: 1rem 1.5rem; transform: rotate(3deg);">
                <span style="font-size: 1.2rem;"> ${businessData.businessAddress}</span>
              </div>
            ` : ''}
            
            ${businessData.businessHours ? `
              <div style="background: rgba(255,255,255,0.2); backdrop-filter: blur(10px); border-radius: 25px; padding: 1rem 1.5rem; transform: rotate(-2deg);">
                <span style="font-size: 1.2rem;"> ${businessData.businessHours}</span>
              </div>
            ` : ''}
          </div>
          
          <div style="text-align: center; margin: 3rem 0;">
            <button style="background: white; color: #4facfe; border: none; padding: 1.5rem 3rem; border-radius: 50px; font-weight: 600; font-size: 1.2rem; cursor: pointer; box-shadow: 0 10px 30px rgba(0,0,0,0.2); transform: scale(1); transition: transform 0.3s ease;">¡Conecta con nosotros!</button>
          </div>
          
          <div style="text-align: center;">
            <h3 style="margin-bottom: 1rem;">Síguenos en nuestras redes</h3>
            <div style="display: flex; gap: 1rem; justify-content: center;">
              ${generateSocialButtons()}
            </div>
          </div>
        </div>
        
        <!-- Elementos decorativos -->
        <div style="position: absolute; top: 10%; left: 10%; width: 100px; height: 100px; background: rgba(255,255,255,0.1); border-radius: 50%; z-index: 1;"></div>
        <div style="position: absolute; bottom: 20%; right: 15%; width: 150px; height: 150px; background: rgba(255,255,255,0.1); border-radius: 50%; z-index: 1;"></div>
      </div>
    `;
  }

  function generateSocialButtons() {
    const networks = [
      { name: 'Instagram', icon: '', color: '#E4405F' },
      { name: 'Facebook', icon: '', color: '#1877F2' },
      { name: 'LinkedIn', icon: '', color: '#0077B5' }
    ];

    return networks.map(network => `
      <a href="#" style="display: inline-flex; align-items: center; justify-content: center; width: 50px; height: 50px; background: ${network.color}; color: white; border-radius: 50%; text-decoration: none; font-size: 1.5rem; transition: transform 0.3s ease;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
        ${network.icon}
      </a>
    `).join('');
  }

 
  function closeModal() {
    const modal = document.getElementById('templateModal');
    modal.classList.remove('show');
    modal.style.display = 'none';
    currentTemplate = null;
  }

 
  function selectTemplate(templateType) {
    const confirmation = confirm(`¿Estás seguro de que quieres seleccionar la plantilla ${templateType}?\n\nEsto generará tu sitio web con esta plantilla.`);
    
    if (confirmation) {
 
      localStorage.setItem('selectedTemplate', templateType);
      localStorage.setItem('businessData', JSON.stringify(businessData));
      
      alert(`¡Excelente! Has seleccionado la plantilla ${templateType}.\n\nTu sitio web se está generando...`);
      
      closeModal();
      
   
      window.location.href = "index.html";
    }
  }
});