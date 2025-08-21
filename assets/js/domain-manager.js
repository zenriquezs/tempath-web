import { getUserBusinessData, generateTemplate } from './template-generator.js';
import { auth, db } from '../../auth/js/firebaseConfig.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";
import { ref, push, set, get, update } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";

class DomainManager {
  constructor() {
    this.currentUserId = null;
    this.businessData = null;
    this.currentTemplate = null;
    this.userMembership = 'free';
    this.generatedUrl = '';
    this.customUrl = '';
    
    this.init();
  }

  async init() {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        this.currentUserId = user.uid;
        await this.loadUserData();
        await this.loadTemplateFromURL();
        this.setupEventListeners();
        this.generateAutomaticUrl();
        this.loadExistingDomains();
      } else {
        alert("Debes iniciar sesión para gestionar dominios.");
        window.location.href = "auth/login.html";
      }
    });
  }

  async loadUserData() {
    try {
      // Cargar datos del negocio
      this.businessData = await getUserBusinessData(this.currentUserId);
      
      // Cargar información del usuario
      const userRef = ref(db, `users/${this.currentUserId}`);
      const userSnapshot = await get(userRef);
      
      if (userSnapshot.exists()) {
        const userData = userSnapshot.val();
        this.userMembership = userData.membership || 'free';
        
        // Actualizar UI
        document.getElementById('user-email').textContent = auth.currentUser.email;
        document.getElementById('membership-badge').textContent = 
          this.userMembership === 'premium' ? 'Premium' : 'Gratis';
        document.getElementById('membership-badge').className = 
          `membership-badge ${this.userMembership}`;
      }
      
      // Mostrar/ocultar sección de URL personalizada según membresía
      this.updatePremiumFeatures();
      
    } catch (error) {
      console.error('Error cargando datos del usuario:', error);
    }
  }

  loadTemplateFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    this.currentTemplate = urlParams.get('template') || 'modern';
    
    // Actualizar nombre de plantilla en UI
    const templateNames = {
      'modern': 'Plantilla Moderna',
      'classic': 'Plantilla Clásica',
      'elegant': 'Plantilla Elegante',
      'minimal': 'Plantilla Minimalista',
      'corporate': 'Plantilla Corporativa',
      'sport': 'Plantilla Deportiva'
    };
    
    document.getElementById('template-name').textContent = 
      templateNames[this.currentTemplate] || 'Plantilla Personalizada';
  }

  generateAutomaticUrl() {
    if (!this.businessData) return;
    
    // Generar URL basada en el nombre del negocio
    let businessName = this.businessData.businessName || 'mi-negocio';
    let urlSlug = businessName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remover caracteres especiales
      .replace(/\s+/g, '-') // Reemplazar espacios con guiones
      .replace(/-+/g, '-') // Remover guiones múltiples
      .substring(0, 50); // Limitar longitud
    
    // Agregar timestamp para unicidad
    const timestamp = Date.now().toString().slice(-6);
    this.generatedUrl = `https://tempath-sites.web.app/${urlSlug}-${timestamp}`;
    
    document.getElementById('generated-url').value = this.generatedUrl;
  }

  updatePremiumFeatures() {
    const customUrlSection = document.getElementById('custom-url-section');
    const premiumUpgrade = document.getElementById('premium-upgrade');
    
    if (this.userMembership === 'premium') {
      customUrlSection.style.display = 'block';
      premiumUpgrade.style.display = 'none';
    } else {
      customUrlSection.style.display = 'none';
      premiumUpgrade.style.display = 'block';
    }
  }

  setupEventListeners() {
    // Botón volver
    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
      backBtn.addEventListener('click', () => {        
        const templateParam = this.currentTemplate ? `?template=${this.currentTemplate}` : '';    
        window.location.replace(`template-editor.html${templateParam}`);
      });
    }

    // Copiar URL
    const copyUrlBtn = document.getElementById('copy-url-btn');
    if (copyUrlBtn) {
      copyUrlBtn.addEventListener('click', () => {
        this.copyToClipboard(this.generatedUrl);
      });
    }

    // URL personalizada
    const customUrlInput = document.getElementById('custom-url');
    if (customUrlInput) {
      customUrlInput.addEventListener('input', (e) => {
        this.validateCustomUrl(e.target.value);
      });
    }

    // Botón publicar
    const publishBtn = document.getElementById('publish-btn');
    if (publishBtn) {
      publishBtn.addEventListener('click', () => {
        this.showPublishModal();
      });
    }

    // Guardar borrador
    const saveDraftBtn = document.getElementById('save-draft-btn');
    if (saveDraftBtn) {
      saveDraftBtn.addEventListener('click', () => {
        this.saveDraft();
      });
    }

    this.setupModalListeners();

    const upgradeBtn = document.querySelector('.btn-upgrade');
    if (upgradeBtn) {
      upgradeBtn.addEventListener('click', () => {
        alert('Funcionalidad de upgrade en desarrollo');
      });
    }
  }

  setupModalListeners() {
    const modal = document.getElementById('publish-modal');
    const closeBtn = document.querySelector('.modal-close');
    const confirmBtn = document.getElementById('confirm-publish');
    const cancelBtn = document.getElementById('cancel-publish');

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.hidePublishModal();
      });
    }

    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        this.hidePublishModal();
      });
    }

    if (confirmBtn) {
      confirmBtn.addEventListener('click', () => {
        this.confirmPublish();
      });
    }

    // Cerrar modal al hacer clic fuera
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          this.hidePublishModal();
        }
      });
    }
  }

  validateCustomUrl(value) {
    const urlPattern = /^[a-z0-9-]{3,50}$/;
    const customUrlInput = document.getElementById('custom-url');
    
    if (value && !urlPattern.test(value)) {
      customUrlInput.style.borderColor = '#e74c3c';
      return false;
    } else {
      customUrlInput.style.borderColor = '#ddd';
      this.customUrl = value;
      return true;
    }
  }

  copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      this.showNotification('URL copiada al portapapeles', 'success');
    }).catch(() => {
      // Fallback para navegadores que no soportan clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      this.showNotification('URL copiada al portapapeles', 'success');
    });
  }

  showPublishModal() {
    const finalUrl = this.userMembership === 'premium' && this.customUrl 
      ? `https://misitio.com/${this.customUrl}`
      : this.generatedUrl;
    
    document.getElementById('final-url-display').textContent = finalUrl;
    document.getElementById('publish-modal').style.display = 'flex';
  }

  hidePublishModal() {
    document.getElementById('publish-modal').style.display = 'none';
  }

  async confirmPublish() {
    this.hidePublishModal();
    this.showLoadingOverlay();
    
    try {
      const finalUrl = this.userMembership === 'premium' && this.customUrl 
        ? `https://misitio.com/${this.customUrl}`
        : this.generatedUrl;
      
      // Generar HTML de la plantilla
      const templateHtml = await generateTemplate(this.currentTemplate, this.businessData);
      
      // Guardar en Firebase Database
      const siteData = {
        userId: this.currentUserId,
        template: this.currentTemplate,
        url: finalUrl,
        customUrl: this.customUrl || null,
        businessData: this.businessData,
        templateHtml: templateHtml,
        status: 'published',
        publishedAt: Date.now(),
        updatedAt: Date.now()
      };
      
      const sitesRef = ref(db, 'published-sites');
      const newSiteRef = push(sitesRef);
      await set(newSiteRef, siteData);
      
      // También guardar referencia en el usuario
      const userSitesRef = ref(db, `users/${this.currentUserId}/sites/${newSiteRef.key}`);
      await set(userSitesRef, {
        url: finalUrl,
        template: this.currentTemplate,
        publishedAt: Date.now()
      });
      
      this.hideLoadingOverlay();
      this.showNotification('¡Sitio web publicado exitosamente!', 'success');
      
      // Mostrar sección de dominios existentes
      this.loadExistingDomains();
      
      // Opcional: abrir el sitio en nueva pestaña
      setTimeout(() => {
        if (confirm('¿Quieres ver tu sitio web publicado?')) {
          window.open(finalUrl, '_blank');
        }
      }, 1000);
      
    } catch (error) {
      console.error('Error publicando sitio:', error);
      this.hideLoadingOverlay();
      this.showNotification('Error al publicar el sitio web', 'error');
    }
  }

  async saveDraft() {
    try {
      const templateHtml = await generateTemplate(this.currentTemplate, this.businessData);
      
      const draftData = {
        userId: this.currentUserId,
        template: this.currentTemplate,
        businessData: this.businessData,
        templateHtml: templateHtml,
        status: 'draft',
        savedAt: Date.now()
      };
      
      const draftsRef = ref(db, `users/${this.currentUserId}/drafts/${this.currentTemplate}`);
      await set(draftsRef, draftData);
      
      this.showNotification('Borrador guardado exitosamente', 'success');
      
    } catch (error) {
      console.error('Error guardando borrador:', error);
      this.showNotification('Error al guardar el borrador', 'error');
    }
  }

  async loadExistingDomains() {
    try {
      const userSitesRef = ref(db, `users/${this.currentUserId}/sites`);
      const snapshot = await get(userSitesRef);
      
      const domainsList = document.getElementById('domains-list');
      const noDomains = document.getElementById('no-domains');
      const existingDomainsSection = document.getElementById('existing-domains');
      
      if (snapshot.exists()) {
        const sites = snapshot.val();
        domainsList.innerHTML = '';
        
        Object.entries(sites).forEach(([siteId, siteData]) => {
          const domainCard = this.createDomainCard(siteId, siteData);
          domainsList.appendChild(domainCard);
        });
        
        noDomains.style.display = 'none';
        existingDomainsSection.style.display = 'block';
      } else {
        noDomains.style.display = 'block';
        existingDomainsSection.style.display = 'block';
      }
      
    } catch (error) {
      console.error('Error cargando dominios:', error);
    }
  }

  createDomainCard(siteId, siteData) {
    const card = document.createElement('div');
    card.className = 'domain-card';
    card.innerHTML = `
      <div class="domain-info">
        <h4>${siteData.url}</h4>
        <p>Plantilla: ${siteData.template}</p>
        <small>Publicado: ${new Date(siteData.publishedAt).toLocaleDateString()}</small>
      </div>
      <div class="domain-actions">
        <button class="btn-view" onclick="window.open('${siteData.url}', '_blank')">
          <i class="fas fa-external-link-alt"></i> Ver
        </button>
        <button class="btn-edit" data-site-id="${siteId}">
          <i class="fas fa-edit"></i> Editar
        </button>
        <button class="btn-delete" data-site-id="${siteId}">
          <i class="fas fa-trash"></i> Eliminar
        </button>
      </div>
    `;
        
    const editBtn = card.querySelector('.btn-edit');
    const deleteBtn = card.querySelector('.btn-delete');
    
    editBtn.addEventListener('click', () => {
      window.location.href = `template-editor.html?template=${siteData.template}&site=${siteId}`;
    });
    
    deleteBtn.addEventListener('click', () => {
      this.deleteSite(siteId, siteData.url);
    });
    
    return card;
  }

  async deleteSite(siteId, url) {
    if (confirm(`¿Estás seguro de que quieres eliminar el sitio ${url}?`)) {
      try {
        // Eliminar de la lista del usuario
        const userSiteRef = ref(db, `users/${this.currentUserId}/sites/${siteId}`);
        await set(userSiteRef, null);
        
        // Eliminar de published-sites
        const publishedSiteRef = ref(db, `published-sites/${siteId}`);
        await set(publishedSiteRef, null);
        
        this.showNotification('Sitio eliminado exitosamente', 'success');
        this.loadExistingDomains();
        
      } catch (error) {
        console.error('Error eliminando sitio:', error);
        this.showNotification('Error al eliminar el sitio', 'error');
      }
    }
  }

  showLoadingOverlay() {
    document.getElementById('loading-overlay').style.display = 'flex';
  }

  hideLoadingOverlay() {
    document.getElementById('loading-overlay').style.display = 'none';
  }

  showNotification(message, type = 'info') {
    // Crear notificación temporal
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 15px 20px;
      border-radius: 5px;
      color: white;
      font-weight: bold;
      z-index: 10000;
      animation: slideIn 0.3s ease;
    `;
    
    if (type === 'success') {
      notification.style.backgroundColor = '#27ae60';
    } else if (type === 'error') {
      notification.style.backgroundColor = '#e74c3c';
    } else {
      notification.style.backgroundColor = '#3498db';
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  new DomainManager();
});