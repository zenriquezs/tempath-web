 
import { getUserBusinessData, generateTemplate, loadTemplate } from './template-generator.js';
import { auth, db } from '../../auth/js/firebaseConfig.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { ref, push, set, get } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";

class TemplateEditor {
  constructor() {
    this.currentTemplate = null;
    this.currentUserId = null;
    this.businessData = null;
    this.currentDevice = 'desktop';
    this.currentZoom = 100;
    this.isUpdating = false;
    this.frameLoaded = false;
    
    this.init();
  }

  async init() {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        this.currentUserId = user.uid;
        await this.loadFromURL();
        await this.loadBusinessData();
        await this.loadSelectedTemplate();
        this.setupEventListeners();
      } else {
        alert("Debes iniciar sesión para usar el editor.");
        window.location.href = "auth/login.html";
      }
    });
  }

  loadFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    this.currentTemplate = urlParams.get('template');
    
    if (!this.currentTemplate) {
      alert('No se especificó una plantilla.');
      window.location.href = 'templates-selection.html';
      return;
    }
    
    console.log('Plantilla seleccionada:', this.currentTemplate);
  }

  async loadBusinessData() {
    try {
      this.businessData = await getUserBusinessData(this.currentUserId);
      console.log('Datos del negocio cargados:', this.businessData);
      
      if (!this.businessData) {
        alert('No se encontraron datos del negocio.');
        window.location.href = 'business-setup.html';
      }
    } catch (error) {
      console.error('Error cargando datos del negocio:', error);
    }
  }

  async loadSelectedTemplate() {
    try {
      const templateHtml = await generateTemplate(this.currentTemplate, this.businessData);
      if (templateHtml) {
        await this.renderTemplate(templateHtml, this.currentTemplate);
        this.updateSidePanel();
      } else {
        console.error('No se pudo cargar la plantilla');
        alert('Error al cargar la plantilla.');
      }
    } catch (error) {
      console.error('Error cargando plantilla:', error);
      alert('Error al cargar la plantilla.');
    }
  }

  
  async renderTemplate(templateHtml, templateName) {
    const previewFrame = document.getElementById('preview-frame');
    
    if (previewFrame) {
  
      const newFrame = document.createElement('iframe');
      newFrame.id = 'preview-frame';
      newFrame.style.cssText = previewFrame.style.cssText;
      newFrame.className = previewFrame.className;
      
  
      previewFrame.parentNode.replaceChild(newFrame, previewFrame);
      
  
      const frameDoc = newFrame.contentDocument || newFrame.contentWindow.document;
      frameDoc.open();
      frameDoc.write(templateHtml);
      frameDoc.close();
      
 
      newFrame.style.transform = `scale(${this.currentZoom / 100})`;
      newFrame.style.transformOrigin = 'top left';
      
 
      newFrame.onload = () => {
        this.enableFrameInteractivity(frameDoc);
        console.log('Plantilla renderizada:', templateName);
        this.frameLoaded = true;
      };
    }
  }

  
  enableFrameInteractivity(frameDoc) {
    try {
  
      setTimeout(() => {
        this.initializeFrameEvents(frameDoc);
      }, 500);
    } catch (error) {
      console.log('Error habilitando interactividad:', error);
    }
  }

  
  initializeFrameEvents(frameDoc) {
    try {
  
      const navToggle = frameDoc.querySelector('.nav-toggle');
      const navMenu = frameDoc.querySelector('.nav-menu');
      if (navToggle && navMenu) {
        navToggle.addEventListener('click', (e) => {
          e.preventDefault();
          navMenu.classList.toggle('active');
        });
      }


      frameDoc.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
          e.preventDefault();
          const targetId = this.getAttribute('href').substring(1);
          const target = frameDoc.getElementById(targetId);
          if (target) {
            target.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          }
        });
      });

 
      const forms = frameDoc.querySelectorAll('.form, #contactForm');
      forms.forEach(form => {
        form.addEventListener('submit', function(e) {
          e.preventDefault();
          alert('¡Gracias por tu mensaje! Te contactaremos pronto.');
          this.reset();
        });
      });

 
      frameDoc.querySelectorAll('.gallery-item').forEach(item => {
        item.addEventListener('click', function() {
          const img = this.querySelector('img');
          if (img) {
            const lightbox = frameDoc.createElement('div');
            lightbox.style.cssText = `
              position: fixed; top: 0; left: 0; width: 100%; height: 100%;
              background: rgba(0,0,0,0.9); display: flex; align-items: center;
              justify-content: center; z-index: 9999; cursor: pointer;
            `;
            
            const imgElement = frameDoc.createElement('img');
            imgElement.src = img.src;
            imgElement.style.cssText = 'max-width: 90%; max-height: 90%; border-radius: 8px;';
            
            lightbox.appendChild(imgElement);
            frameDoc.body.appendChild(lightbox);
            
            lightbox.addEventListener('click', () => {
              frameDoc.body.removeChild(lightbox);
            });
          }
        });
      });

    } catch (error) {
      console.log('Error inicializando eventos del frame:', error);
    }
  }

  
  initializeTestimonialSlider(frameDoc) {
    let currentSlide = 0;
    const slides = frameDoc.querySelectorAll('.testimonial-card');
    const dots = frameDoc.querySelectorAll('.dot');

    function showSlide(index) {
      slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === index);
      });
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
      });
    }

    frameDoc.querySelector('.testimonial-next')?.addEventListener('click', () => {
      currentSlide = (currentSlide + 1) % slides.length;
      showSlide(currentSlide);
    });

    frameDoc.querySelector('.testimonial-prev')?.addEventListener('click', () => {
      currentSlide = (currentSlide - 1 + slides.length) % slides.length;
      showSlide(currentSlide);
    });

    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => {
        currentSlide = index;
        showSlide(currentSlide);
      });
    });
  }

 
  initializeGalleryLightbox(frameDoc) {
    const galleryItems = frameDoc.querySelectorAll('.gallery-item');
    
    galleryItems.forEach(item => {
      item.addEventListener('click', function() {
        const img = this.querySelector('img');
        if (img) {
          const lightbox = frameDoc.createElement('div');
          lightbox.className = 'lightbox';
          lightbox.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.9);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
          `;
          
          lightbox.innerHTML = `
            <div class="lightbox-content" style="position: relative; max-width: 90%; max-height: 90%;">
              <img src="${img.src}" alt="${img.alt}" style="width: 100%; height: auto; border-radius: 8px;">
              <span class="lightbox-close" style="position: absolute; top: -40px; right: 0; color: white; font-size: 30px; cursor: pointer;">&times;</span>
            </div>
          `;
          
          frameDoc.body.appendChild(lightbox);
          
          lightbox.addEventListener('click', function(e) {
            if (e.target === lightbox || e.target.className === 'lightbox-close') {
              frameDoc.body.removeChild(lightbox);
            }
          });
        }
      });
    });
  }

  updateSidePanel() {
    if (!this.businessData) return;
    
 
    const siteNameInput = document.getElementById('site-name');
    const siteDescriptionInput = document.getElementById('site-description');
    const sitePhoneInput = document.getElementById('site-phone');
 
    const siteAddressInput = document.getElementById('site-address');
    const businessHoursInput = document.getElementById('business-hours');
    const googleMapsInput = document.getElementById('google-maps');
    
    if (siteNameInput) siteNameInput.value = this.businessData.businessName || '';
    if (siteDescriptionInput) siteDescriptionInput.value = this.businessData.businessDescription || '';
    if (sitePhoneInput) sitePhoneInput.value = this.businessData.contactPhone || '';
   
    if (siteAddressInput) siteAddressInput.value = this.businessData.businessAddress || '';
    if (businessHoursInput) businessHoursInput.value = this.businessData.businessHours || '';
    if (googleMapsInput) googleMapsInput.value = this.businessData.googleMaps || '';
    
  
    const logoUrlInput = document.getElementById('logo-url');
    if (logoUrlInput) {
      logoUrlInput.value = this.businessData.logoUrl || '';
      this.updateLogoPreview(this.businessData.logoUrl);
    }
    
 
    const socialMedia = this.businessData.socialMedia || {};
    const facebookInput = document.getElementById('facebook-url');
    const instagramInput = document.getElementById('instagram-url');
    const tiktokInput = document.getElementById('tiktok-url');
    const linkedinInput = document.getElementById('linkedin-url');
    
    if (facebookInput) facebookInput.value = socialMedia.facebook || '';
    if (instagramInput) instagramInput.value = socialMedia.instagram || '';    
    if (tiktokInput) tiktokInput.value = socialMedia.tiktok || '';
    if (linkedinInput) linkedinInput.value = socialMedia.linkedin || '';
    const whatsappInput = document.getElementById('whatsapp-url');
    
    if (facebookInput) facebookInput.value = socialMedia.facebook || '';
    if (instagramInput) instagramInput.value = socialMedia.instagram || '';    
    if (linkedinInput) linkedinInput.value = socialMedia.linkedin || '';
    if (whatsappInput) whatsappInput.value = socialMedia.whatsapp || '';
    
    
    const galleryUrlsInput = document.getElementById('gallery-urls');
    if (galleryUrlsInput && this.businessData.galleryUrls) {
      galleryUrlsInput.value = this.businessData.galleryUrls.join('\n');
      this.updateGalleryPreview(this.businessData.galleryUrls);
    }
    
 
    const primaryColorInput = document.getElementById('primary-color');
    const secondaryColorInput = document.getElementById('secondary-color');
    
    if (primaryColorInput) primaryColorInput.value = this.businessData.primaryColor || '#2563eb';
    if (secondaryColorInput) secondaryColorInput.value = this.businessData.secondaryColor || '#1e40af';
  }

  setupEventListeners() {
    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        window.location.href = 'templates-selection.html';
      });
    }
    
   
    const deviceBtns = document.querySelectorAll('.device-btn');
    deviceBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const device = e.currentTarget.dataset.device;
        this.changeDevice(device);
      });
    });
    
    const zoomSlider = document.getElementById('zoom-slider');
    if (zoomSlider) {
      zoomSlider.addEventListener('input', (e) => {
        this.changeZoom(e.target.value);
      });
    }
    
  
    const siteInputs = document.querySelectorAll('#site-info input, #site-info textarea');
    siteInputs.forEach(input => {
      let timeout;
      input.addEventListener('input', () => {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
          this.updatePreview();
        }, 500); 
      });
    });
    
    const colorInputs = document.querySelectorAll('#colors input[type="color"]');
    colorInputs.forEach(input => {
      input.addEventListener('change', () => {
        this.updateColors();
      });
    });
    
 
    const updateBtn = document.getElementById('update-site-btn');
    if (updateBtn) {
      updateBtn.addEventListener('click', () => {
        this.updateBusinessData();
      });
    }
    
    const publishBtns = document.querySelectorAll('.publish-btn');
    publishBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.handlePublish(e.target.dataset.platform);
      });
    });
    
    const shareBtn = document.getElementById('share-btn');
    if (shareBtn) {
      shareBtn.addEventListener('click', () => {
        this.openShareModal();
      });
    }
    
 
    const logoUrlInput = document.getElementById('logo-url');
    if (logoUrlInput) {
      logoUrlInput.addEventListener('input', (e) => {
        this.updateLogoPreview(e.target.value);
      });
    }
    
 
    const galleryUrlsInput = document.getElementById('gallery-urls');
    if (galleryUrlsInput) {
      galleryUrlsInput.addEventListener('input', (e) => {
        const urls = e.target.value.split('\n').filter(url => url.trim());
        this.updateGalleryPreview(urls);
      });
    }

    const saveBtn = document.getElementById('save-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        window.location.href = 'index.html'; 
      });
    }
  
  }

  updateLogoPreview(logoUrl) {
    const logoPreview = document.getElementById('logo-preview');
    const logoPreviewImg = document.getElementById('logo-preview-img');
    
    if (logoUrl && logoUrl.trim()) {
      logoPreviewImg.src = logoUrl;
      logoPreview.style.display = 'block';
    } else {
      logoPreview.style.display = 'none';
    }
  }

  updateGalleryPreview(urls) {
    const galleryPreview = document.getElementById('gallery-preview');
    if (!galleryPreview) return;
    
    galleryPreview.innerHTML = '';
    
    urls.forEach(url => {
      if (url.trim()) {
        const img = document.createElement('img');
        img.src = url;
        img.alt = 'Imagen de galería';
        galleryPreview.appendChild(img);
      }
    });
  }

  async updatePreview() {
    try {
      if (this.businessData && this.selectedTemplate) {
 
        const templateHtml = await generateTemplate(this.selectedTemplate, this.businessData);
        if (templateHtml) {
          await this.renderTemplate(templateHtml, this.selectedTemplate);
        }
      }
    } catch (error) {
      console.error('Error al actualizar vista previa:', error);
    }
  }

  updateColors() {
    const primaryColor = document.getElementById('primary-color')?.value;
    const secondaryColor = document.getElementById('secondary-color')?.value;
    
 
    const primaryValue = document.querySelector('#primary-color + .color-value');
    const secondaryValue = document.querySelector('#secondary-color + .color-value');
    
    if (primaryValue) primaryValue.textContent = primaryColor;
    if (secondaryValue) secondaryValue.textContent = secondaryColor;
    
 
    this.updatePreview();
  }

  changeDevice(device) {
    this.currentDevice = device;
    
 
    document.querySelectorAll('.device-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    
    const activeBtn = document.querySelector(`[data-device="${device}"]`);
    if (activeBtn) {
      activeBtn.classList.add('active');
    }
    
 
    const previewContainer = document.getElementById('preview-container');
    if (previewContainer) {
      previewContainer.className = `preview-container ${device}`;
    }
    
    console.log(`Dispositivo cambiado a: ${device}`);
  }

 
  changeZoom(zoom) {
    this.currentZoom = zoom;
    
 
    const zoomValue = document.getElementById('zoom-value');
    if (zoomValue) {
      zoomValue.textContent = `${zoom}%`;
    }
    
 
    const previewFrame = document.getElementById('preview-frame');
    if (previewFrame) {
      previewFrame.style.transform = `scale(${zoom / 100})`;
      previewFrame.style.transformOrigin = 'top left';
      
 
      const previewContainer = document.getElementById('preview-container');
      if (previewContainer && zoom !== 100) {
        const scale = zoom / 100;
        previewContainer.style.overflow = 'auto';
      }
    }
    
    console.log(`Zoom cambiado a: ${zoom}%`);
  }

  async updateBusinessData() {
    if (this.isUpdating) return;
    
    this.isUpdating = true;
    const updateBtn = document.getElementById('update-site-btn');
    
    try {
      updateBtn.disabled = true;
      updateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Actualizando...';
      this.showStatus('Guardando cambios...', 'loading');
      
     
      const socialMedia = {
        facebook: document.getElementById('facebook-url')?.value || '',
        instagram: document.getElementById('instagram-url')?.value || '',
        tiktok: document.getElementById('tiktok-url')?.value || '',
        linkedin: document.getElementById('linkedin-url')?.value || ''
      };
      
      
      Object.keys(socialMedia).forEach(key => {
        if (!socialMedia[key]) delete socialMedia[key];
      });
      
 
      const galleryUrlsText = document.getElementById('gallery-urls')?.value || '';
      const galleryUrls = galleryUrlsText.split('\n')
        .map(url => url.trim())
        .filter(url => url);
      
  
      const cleanValue = (value, fallback = '') => {
        return (value !== undefined && value !== null && value !== '') ? value : fallback;
      };

     
      const emailValue = document.getElementById('site-email')?.value || 
                        this.businessData.email || 
                        this.businessData.contactEmail || 
                        this.businessData.businessEmail || 
                        '';

      const updatedData = {
        ...this.businessData,
        businessName: cleanValue(document.getElementById('site-name')?.value, this.businessData.businessName),
        businessDescription: cleanValue(document.getElementById('site-description')?.value, this.businessData.businessDescription),
        contactPhone: cleanValue(document.getElementById('site-phone')?.value, this.businessData.contactPhone),
   
        businessAddress: cleanValue(document.getElementById('site-address')?.value, this.businessData.businessAddress),
        businessHours: cleanValue(document.getElementById('business-hours')?.value, this.businessData.businessHours),
        googleMaps: cleanValue(document.getElementById('google-maps')?.value, this.businessData.googleMaps),
        logoUrl: cleanValue(document.getElementById('logo-url')?.value, this.businessData.logoUrl),
        socialMedia: Object.keys(socialMedia).length > 0 ? socialMedia : (this.businessData.socialMedia || {}),
        galleryUrls: galleryUrls.length > 0 ? galleryUrls : (this.businessData.galleryUrls || []),
        primaryColor: cleanValue(document.getElementById('primary-color')?.value, this.businessData.primaryColor || '#2563eb'),
        secondaryColor: cleanValue(document.getElementById('secondary-color')?.value, this.businessData.secondaryColor || '#1e40af'),
        updatedAt: new Date().toISOString()
      };


      Object.keys(updatedData).forEach(key => {
        if (updatedData[key] === undefined || updatedData[key] === null) {
          if (key === 'email') {
            updatedData[key] = ''; 
          } else {
            delete updatedData[key];
          }
        }
      });
      
      const userRef = ref(db, `Informacion-Usuarios/${this.currentUserId}`);
      const newEntryRef = push(userRef);
      await set(newEntryRef, updatedData);
      
      this.businessData = updatedData;
      await this.updatePreview();
      
      this.showStatus('¡Cambios guardados exitosamente!', 'success');
      
    } catch (error) {
      console.error('Error al actualizar datos:', error);
      this.showStatus('Error al guardar cambios', 'error');
    } finally {
      updateBtn.disabled = false;
      updateBtn.innerHTML = '<i class="fas fa-save"></i> Actualizar Información';
      this.isUpdating = false;
    }
  }

  showStatus(message, type) {
    const existingStatus = document.querySelector('.save-status');
    if (existingStatus) {
      existingStatus.remove();
    }
    
    const statusDiv = document.createElement('div');
    statusDiv.className = `save-status ${type}`;
    statusDiv.textContent = message;
    
    document.body.appendChild(statusDiv);
    
    setTimeout(() => {
      statusDiv.classList.add('show');
    }, 100);
    
    setTimeout(() => {
      statusDiv.classList.remove('show');
      setTimeout(() => {
        statusDiv.remove();
      }, 300);
    }, 3000);
  }

  handlePublish(platform) {
    console.log('Publicando en:', platform);
    alert(`Funcionalidad de ${platform} en desarrollo`);
  }

  openShareModal() {
    alert('Modal de compartir en desarrollo');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new TemplateEditor();
});
