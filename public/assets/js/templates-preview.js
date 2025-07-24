import { getUserBusinessData, generateTemplate, loadTemplate } from './template-generator.js';
import { auth } from '../../auth/js/firebaseConfig.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {
  let businessData = null;
  let currentUserId = null;

  // Verificar autenticación y cargar datos
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      currentUserId = user.uid;
      await loadBusinessDataForPreviews();
      await loadRealTemplatePreviews(); // ✅ NUEVA FUNCIÓN
      setupPreviewButtons();
    } else {
      alert("Debes iniciar sesión para ver las plantillas.");
      window.location.href = "auth/login.html";
    }
  });

  // Cargar datos del negocio para las previsualizaciones
  // Cargar datos del negocio para las previsualizaciones
  async function loadBusinessDataForPreviews() {
    try {
      businessData = await getUserBusinessData(currentUserId);
      
      // ✅ DEBUG: Verificar datos cargados
      console.log('Datos del negocio cargados:', businessData);
      
      if (!businessData) {
        alert("No se encontraron datos del negocio. Completa el formulario primero.");
        window.location.href = "business-setup.html";
      }
    } catch (error) {
      console.error('Error cargando datos para previsualizaciones:', error);
    }
  }

  // ✅ NUEVA FUNCIÓN: Cargar plantillas HTML reales como previsualizaciones
  // ✅ FUNCIÓN MEJORADA: Cargar plantillas HTML reales como previsualizaciones
  async function loadRealTemplatePreviews() {
    if (!businessData) return;
  
    const templateMap = {
      'moderna': 'modern',
      'clasica': 'classic', 
      'creativa': 'minimal'
    };
  
    // Cargar cada plantilla real
    for (const [displayName, templateName] of Object.entries(templateMap)) {
      try {
        // Generar plantilla completa con datos reales
        const generatedHtml = await generateTemplate(templateName, businessData);
        
        if (generatedHtml) {
          // Crear iframe para mostrar la plantilla en miniatura
          const previewContainer = document.querySelector(`[data-template="${displayName}"] .template-preview`);
          
          if (previewContainer) {
            // Limpiar contenido predeterminado
            previewContainer.innerHTML = '';
            
            // Crear iframe para la previsualización
            const iframe = document.createElement('iframe');
            iframe.style.cssText = `
              width: 100%;
              height: 400px;
              border: none;
              border-radius: 0;
              transform: scale(1);
              transform-origin: top left;
              pointer-events: none;
              background: white;
              overflow: hidden;
            `;
            
            // ✅ CARGAR CSS Y CONTENIDO CORRECTAMENTE
            iframe.onload = async function() {
              const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
              
              // Escribir el HTML generado
              iframeDoc.open();
              iframeDoc.write(generatedHtml);
              iframeDoc.close();
              
              // ✅ CARGAR CSS ESPECÍFICO DE LA PLANTILLA
              const cssLink = iframeDoc.createElement('link');
              cssLink.rel = 'stylesheet';
              cssLink.href = `../../templates/css/${templateName}.css`;
              iframeDoc.head.appendChild(cssLink);
              
              // ✅ ESTILOS MEJORADOS PARA PREVISUALIZACIÓN COMPLETA
              const previewStyle = iframeDoc.createElement('style');
              previewStyle.textContent = `
                body { 
                  margin: 0; 
                  padding: 0;
                  font-size: 12px;
                  overflow-x: hidden;
                  overflow-y: hidden;
                  zoom: 0.9;
                  height: 400px;
                }
                .container { 
                  max-width: none;
                  padding: 10px;
                  width: 100%;
                }
                /* ✅ NAVBAR OPTIMIZADA PARA PREVIEW COMPLETA */
                .navbar {
                  position: relative !important;
                  top: 0 !important;
                  width: 100% !important;
                  margin-bottom: 8px !important;
                  z-index: 1 !important;
                  padding: 8px 0 !important;
                }
                .navbar .container {
                  padding: 5px 15px !important;
                }
                .nav-title {
                  font-size: 16px !important;
                }
                .nav-link {
                  font-size: 11px !important;
                  padding: 4px 8px !important;
                }
                .nav-logo {
                  width: 30px !important;
                  height: 30px !important;
                }
                .nav-menu {
                  gap: 10px !important;
                }
                .nav-toggle {
                  display: none !important;
                }
                /* Hero section optimizado */
                .hero-section {
                  min-height: 180px !important;
                  padding: 15px 0 !important;
                  display: flex !important;
                  align-items: center !important;
                }
                .hero-title {
                  font-size: 20px !important;
                  margin: 6px 0 !important;
                }
                .hero-subtitle {
                  font-size: 14px !important;
                  margin: 4px 0 !important;
                }
                .hero-description {
                  font-size: 11px !important;
                  margin: 6px 0 !important;
                  line-height: 1.4 !important;
                }
                .hero-logo {
                  width: 70px !important;
                  height: 70px !important;
                  margin-bottom: 8px !important;
                }
                .hero-buttons {
                  gap: 10px !important;
                  margin-top: 12px !important;
                }
                .btn {
                  padding: 8px 16px !important;
                  font-size: 10px !important;
                  border-radius: 20px !important;
                }
                /* Services section */
                .services-section {
                  padding: 15px 0 !important;
                }
                .services-grid {
                  grid-template-columns: repeat(2, 1fr) !important;
                  gap: 8px !important;
                }
                .service-card {
                  padding: 12px 8px !important;
                  margin: 3px 0 !important;
                }
                .service-icon {
                  font-size: 18px !important;
                  margin-bottom: 6px !important;
                }
                .service-card h3 {
                  font-size: 12px !important;
                  margin: 4px 0 !important;
                }
                .service-card p {
                  font-size: 9px !important;
                  line-height: 1.3 !important;
                }
                .service-features {
                  display: none !important;
                }
                .service-badge {
                  font-size: 8px !important;
                  padding: 2px 6px !important;
                }
                /* Stats section */
                .stats-section {
                  padding: 12px 0 !important;
                }
                .stats-grid {
                  grid-template-columns: repeat(3, 1fr) !important;
                  gap: 6px !important;
                }
                .stat-number {
                  font-size: 14px !important;
                  margin-bottom: 2px !important;
                }
                .stat-label {
                  font-size: 8px !important;
                }
                .stat-icon {
                  font-size: 12px !important;
                  margin-bottom: 3px !important;
                }
                /* Gallery optimizada */
                .gallery-section {
                  padding: 12px 0 !important;
                }
                .gallery-grid {
                  grid-template-columns: repeat(3, 1fr) !important;
                  gap: 4px !important;
                }
                .gallery-item {
                  height: 50px !important;
                }
                .gallery-item img {
                  height: 50px !important;
                  object-fit: cover;
                  width: 100%;
                }
                .gallery-overlay {
                  display: none !important;
                }
                .gallery-filter {
                  display: none !important;
                }
                /* Testimonials compactos */
                .testimonials-section {
                  padding: 12px 0 !important;
                }
                .testimonial-card {
                  padding: 10px 8px !important;
                  margin: 3px 0 !important;
                }
                .testimonial-content p {
                  font-size: 9px !important;
                  line-height: 1.3 !important;
                }
                .author-avatar {
                  width: 25px !important;
                  height: 25px !important;
                }
                .author-avatar img {
                  width: 25px !important;
                  height: 25px !important;
                }
                .testimonial-controls {
                  display: none !important;
                }
                .rating {
                  font-size: 9px !important;
                }
                .quote-icon {
                  font-size: 14px !important;
                }
                /* Contact section */
                .contact-section {
                  padding: 12px 0 !important;
                }
                .contact-grid {
                  grid-template-columns: 1fr !important;
                  gap: 8px !important;
                }
                .contact-item {
                  padding: 6px !important;
                  margin: 2px 0 !important;
                }
                .contact-icon {
                  width: 25px !important;
                  height: 25px !important;
                  font-size: 11px !important;
                }
                .contact-details h4 {
                  font-size: 10px !important;
                  margin-bottom: 1px !important;
                }
                .contact-details span {
                  font-size: 8px !important;
                }
                .contact-form {
                  padding: 10px 8px !important;
                }
                .contact-form h3 {
                  font-size: 11px !important;
                  margin-bottom: 6px !important;
                }
                .contact-form input,
                .contact-form textarea {
                  font-size: 8px !important;
                  padding: 4px !important;
                  margin-bottom: 4px !important;
                }
                .contact-form button {
                  font-size: 9px !important;
                  padding: 6px 12px !important;
                }
                /* Footer compacto */
                .footer {
                  padding: 8px 0 !important;
                  margin-top: 10px !important;
                }
                .footer p {
                  font-size: 8px !important;
                  margin: 2px 0 !important;
                }
                .footer-wave {
                  display: none !important;
                }
                /* Ocultar elementos innecesarios */
                .whatsapp-float {
                  display: none !important;
                }
                .lightbox {
                  display: none !important;
                }
                .modal {
                  display: none !important;
                }
                /* Ajustes generales para mejor visualización */
                h1, h2, h3, h4, h5, h6 {
                  line-height: 1.2 !important;
                }
                p {
                  line-height: 1.3 !important;
                }
                .section {
                  margin-bottom: 8px !important;
                }
                /* Asegurar que todo el contenido sea visible */
                * {
                  box-sizing: border-box !important;
                }
              `;
              iframeDoc.head.appendChild(previewStyle);
            };
            
            previewContainer.appendChild(iframe);
          }
        }
      } catch (error) {
        console.error(`Error cargando previsualización de ${displayName}:`, error);
        // Mantener contenido predeterminado si hay error
      }
    }
  }

  // Actualizar las tarjetas de previsualización con datos reales
  function updatePreviewCards() {
    if (!businessData) return;

    // Actualizar nombres del negocio
    document.querySelectorAll('.template-business-name').forEach(element => {
      element.textContent = businessData.businessName || 'Tu Negocio';
    });

    // Actualizar descripciones
    document.querySelectorAll('.template-business-desc').forEach(element => {
      element.textContent = businessData.businessDescription || 'Descripción de tu negocio';
    });

    // Actualizar teléfonos
    document.querySelectorAll('.template-phone, .template-phone-quick').forEach(element => {
      element.textContent = `📞 ${businessData.contactPhone || 'Tu teléfono'}`;
    });

    // Actualizar direcciones
    document.querySelectorAll('.template-address').forEach(element => {
      if (businessData.businessAddress) {
        element.textContent = `📍 ${businessData.businessAddress}`;
        element.style.display = 'block';
      } else {
        element.textContent = '📍 Tu dirección';
        element.style.opacity = '0.5';
      }
    });

    // Actualizar horarios
    document.querySelectorAll('.template-hours').forEach(element => {
      if (businessData.businessHours) {
        element.textContent = `🕒 ${businessData.businessHours}`;
        element.style.display = 'block';
      } else {
        element.textContent = '🕒 Tus horarios';
        element.style.opacity = '0.5';
      }
    });

    // Actualizar logos si existe
    if (businessData.logoUrl) {
      document.querySelectorAll('.template-logo').forEach(element => {
        element.innerHTML = `<img src="${businessData.logoUrl}" alt="${businessData.businessName}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;">`;
      });
    }

    // Generar iconos de redes sociales
    generateSocialIconsPreview();
  }

  // Generar iconos de redes sociales para las previsualizaciones
  function generateSocialIconsPreview() {
    const socialNetworks = ['instagram', 'facebook', 'linkedin', 'tiktok'];
    const availableNetworks = socialNetworks.slice(0, 3);

    document.querySelectorAll('.social-icons-preview').forEach(container => {
      container.innerHTML = '';
      availableNetworks.forEach(network => {
        const icon = document.createElement('a');
        icon.className = `social-icon-preview ${network}`;
        icon.href = '#';
        icon.textContent = getNetworkIcon(network);
        icon.style.cssText = `
          display: inline-block;
          width: 30px;
          height: 30px;
          margin: 0 5px;
          background: #333;
          color: white;
          text-align: center;
          line-height: 30px;
          border-radius: 50%;
          text-decoration: none;
          font-size: 14px;
        `;
        container.appendChild(icon);
      });
    });
  }

  function getNetworkIcon(network) {
    const icons = {
      instagram: '📷',
      facebook: '📘',
      linkedin: '💼',
      tiktok: '🎵'
    };
    return icons[network] || '🌐';
  }

  // Configurar botones de previsualización completa
  function setupPreviewButtons() {
    // Botones "Ver vista completa"
    document.querySelectorAll('.template-preview-btn, .template-preview').forEach(element => {
      element.addEventListener('click', async function(e) {
        e.preventDefault();
        const templateType = this.dataset.template || this.closest('.template-card').dataset.template;
        await showFullPreview(templateType);
      });
    });

    // Modal controls
    const modal = document.getElementById('templateModal');
    const closeBtn = document.querySelector('.modal-close');
    const backBtn = document.querySelector('.modal-back');
    const selectBtn = document.getElementById('modalSelectBtn');

    closeBtn.addEventListener('click', closeModal);
    backBtn.addEventListener('click', closeModal);
    
    selectBtn.addEventListener('click', function() {
      const templateType = this.dataset.template;
      if (templateType) {
        selectTemplate(templateType);
      }
    });

    // Cerrar modal al hacer click fuera
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        closeModal();
      }
    });
  }

  // Mostrar previsualización completa usando template-generator.js
  async function showFullPreview(templateType) {
    try {
      const modal = document.getElementById('templateModal');
      const modalTitle = document.getElementById('modalTitle');
      const fullPreview = document.getElementById('fullTemplatePreview');
      const selectBtn = document.getElementById('modalSelectBtn');

      // Mapear nombres de plantillas
      const templateMap = {
        'moderna': 'modern',
        'clasica': 'classic', 
        'creativa': 'minimal'
      };

      const actualTemplateName = templateMap[templateType] || 'modern';

      modalTitle.textContent = `Vista Completa - Plantilla ${templateType.charAt(0).toUpperCase() + templateType.slice(1)}`;
      selectBtn.textContent = `Seleccionar plantilla ${templateType}`;
      selectBtn.dataset.template = templateType;

      // Mostrar loading
      fullPreview.innerHTML = '<div style="text-align: center; padding: 2rem;"><p>Cargando previsualización...</p></div>';
      
      // Generar plantilla completa usando template-generator.js
      const generatedHtml = await generateTemplate(actualTemplateName, businessData);
      
      if (generatedHtml) {
        // ✅ CREAR IFRAME PARA LA VISTA COMPLETA CON ESTILOS CORREGIDOS
        const iframe = document.createElement('iframe');
        iframe.style.cssText = `
          width: 100%;
          height: 600px;
          border: none;
          border-radius: 8px;
          background: white;
        `;
        
        // Limpiar contenedor y agregar iframe
        fullPreview.innerHTML = '';
        fullPreview.appendChild(iframe);
        
        // Cargar contenido en el iframe
        iframe.onload = function() {
          const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
          
          // Escribir el HTML generado
          iframeDoc.open();
          iframeDoc.write(generatedHtml);
          iframeDoc.close();
          
          // ✅ CARGAR CSS ESPECÍFICO DE LA PLANTILLA
          const cssLink = iframeDoc.createElement('link');
          cssLink.rel = 'stylesheet';
          cssLink.href = `../../templates/css/${actualTemplateName}.css`;
          iframeDoc.head.appendChild(cssLink);
          
          // ✅ ESTILOS PARA CORREGIR EL NAVBAR EN VISTA COMPLETA
          const modalStyle = iframeDoc.createElement('style');
          modalStyle.textContent = `
            body {
              margin: 0;
              padding: 0;
              overflow-x: hidden;
            }
            /* ✅ CORREGIR NAVBAR PARA VISTA COMPLETA */
            .navbar {
              position: relative !important;
              top: 0 !important;
              width: 100% !important;
              z-index: 1000 !important;
              margin-bottom: 0 !important;
            }
            .navbar.fixed {
              position: relative !important;
            }
            /* Asegurar que el contenido se vea correctamente */
            .container {
              max-width: 1200px;
              margin: 0 auto;
              padding: 0 20px;
            }
            /* Ajustar hero section para compensar */
            .hero-section {
              padding-top: 20px !important;
            }
            /* Ocultar elementos que pueden causar problemas */
            .whatsapp-float {
              display: none !important;
            }
            .lightbox {
              display: none !important;
            }
            /* Mejorar la visualización general */
            * {
              box-sizing: border-box;
            }
          `;
          iframeDoc.head.appendChild(modalStyle);
        };
        
        // Inicializar el iframe
        iframe.src = 'about:blank';
      } else {
        fullPreview.innerHTML = '<div style="text-align: center; padding: 2rem; color: red;"><p>Error al cargar la previsualización</p></div>';
      }

      modal.classList.add('show');
      modal.style.display = 'block';
    } catch (error) {
      console.error('Error mostrando previsualización:', error);
      alert('Error al mostrar la previsualización. Inténtalo de nuevo.');
    }
  }

  // Cerrar modal
  function closeModal() {
    const modal = document.getElementById('templateModal');
    modal.classList.remove('show');
    modal.style.display = 'none';
  }

  // Seleccionar plantilla
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