import { getAvailableTemplates } from './template-generator.js';

export async function generateTemplatesGrid() {
  const templates = await getAvailableTemplates();
  const gridContainer = document.querySelector('.templates-grid');
  
  if (!gridContainer) return;
  
  gridContainer.innerHTML = '';
  
  templates.forEach((template, index) => {
    const templateCard = createTemplateCard(template, index);
    gridContainer.appendChild(templateCard);
  });
}

function createTemplateCard(template, index) {
  const delay = (index + 1) * 200;
  
  const cardHTML = `
    <div class="template-card" data-template="${template.id}" data-aos="fade-up" data-aos-delay="${delay}">
      <div class="template-preview" data-template="${template.id}">
        <div class="template-header ${template.preview.headerClass}">
          <div class="template-logo">${template.icon}</div>
          <h3 class="template-business-name">Cargando...</h3>
          <p class="template-business-desc">Cargando descripción...</p>
          ${template.preview.headerClass === 'modern' ? '<div class="template-contact-quick"><span class="template-phone-quick">📞 Cargando...</span></div>' : ''}
        </div>
        <div class="template-content ${template.preview.contentClass}">
          ${generateTemplateContent(template)}
          <div class="template-cta">
            <button class="${template.preview.buttonClass}">${template.preview.buttonText}</button>
          </div>
        </div>
      </div>
      <div class="template-info">
        <h3>${template.name}</h3>
        <p>${template.description}</p>
        <button class="btn template-preview-btn" data-template="${template.id}">Ver vista completa</button>
      </div>
    </div>
  `;
  
  const div = document.createElement('div');
  div.innerHTML = cardHTML;
  return div.firstElementChild;
}

function generateTemplateContent(template) {
  switch (template.preview.contentClass) {
    case 'modern':
      return `
        <div class="template-section">
          <h4>🏢 Información</h4>
          <p class="template-address">📍 Cargando dirección...</p>
          <p class="template-hours">🕒 Cargando horarios...</p>
        </div>
        <div class="template-section">
          <h4>🌐 Redes Sociales</h4>
          <div class="template-social modern">
            <div class="social-icons-preview"></div>
          </div>
        </div>
      `;
    case 'classic':
      return `
        <div class="template-info-grid">
          <div class="info-item">
            <span class="info-icon">📞</span>
            <span class="template-phone">Cargando...</span>
          </div>
          <div class="info-item">
            <span class="info-icon">📍</span>
            <span class="template-address">Cargando...</span>
          </div>
          <div class="info-item">
            <span class="info-icon">🕒</span>
            <span class="template-hours">Cargando...</span>
          </div>
        </div>
        <div class="template-social classic">
          <h5>Síguenos:</h5>
          <div class="social-icons-preview"></div>
        </div>
      `;
    case 'creative':
      return `
        <div class="creative-layout">
          <div class="contact-bubble">
            <div class="bubble-content">
              <span class="template-phone">📱 Cargando...</span>
            </div>
          </div>
          <div class="location-bubble">
            <div class="bubble-content">
              <span class="template-address">🌍 Cargando...</span>
            </div>
          </div>
          <div class="hours-bubble">
            <div class="bubble-content">
              <span class="template-hours">⏰ Cargando...</span>
            </div>
          </div>
        </div>
        <div class="template-social creative">
          <div class="social-icons-preview"></div>
        </div>
      `;
    default:
      return '<div class="template-section">Contenido de plantilla</div>';
  }
}