import { auth, db } from "../../auth/js/firebaseConfig.js";
import { ref, get } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";

export async function getUserBusinessData(userId) {
  try {
    const userRef = ref(db, `Informacion-Usuarios/${userId}`);
    const snapshot = await get(userRef);
    
    if (snapshot.exists()) {
      const userData = snapshot.val();
      const lastKey = Object.keys(userData).pop();
      return userData[lastKey];
    }
  } catch (error) {
    console.error('Error obteniendo datos del usuario:', error);
  }
  return null;
}

// Cargar configuración de plantillas dinámicamente
let templatesConfig = null;

async function loadTemplatesConfig() {
  if (!templatesConfig) {
    try {
      const response = await fetch('./templates/templates-config.json');
      templatesConfig = await response.json();
    } catch (error) {
      console.error('Error cargando configuración de plantillas:', error);
      // Fallback a configuración hardcodeada
      templatesConfig = {
        templates: [
          { id: 'moderna', fileName: 'modern' },
          { id: 'clasica', fileName: 'classic' },
          { id: 'creativa', fileName: 'minimal' }
        ]
      };
    }
  }
  return templatesConfig;
}

export async function loadTemplate(templateType) {
  try {
    const config = await loadTemplatesConfig();
    const template = config.templates.find(t => t.id === templateType);
    
    if (!template) {
      throw new Error(`Plantilla '${templateType}' no encontrada`);
    }

    const response = await fetch(`./templates/${template.fileName}.html`);
    if (!response.ok) {
      throw new Error(`Error cargando plantilla: ${response.status}`);
    }
    return await response.text();
  } catch (error) {
    console.error('Error cargando plantilla:', error);
    return null;
  }
}

// Función para obtener todas las plantillas disponibles
export async function getAvailableTemplates() {
  const config = await loadTemplatesConfig();
  return config.templates;
}

// Función para obtener metadatos de una plantilla específica
export async function getTemplateMetadata(templateId) {
  const config = await loadTemplatesConfig();
  return config.templates.find(t => t.id === templateId);
}

export function processTemplate(templateHtml, businessData) {
  let processedHtml = templateHtml;
  
  processedHtml = processedHtml.replace(
    /href="css\/(.*?\.css)"/g, 
    'href="./templates/css/$1"'
  );
  
  console.log('🎨 Colores en processTemplate:', {
    primaryColor: businessData.primaryColor,
    secondaryColor: businessData.secondaryColor,
    businessData: businessData
  });
  
  // Reemplazar variables simples
  const simpleReplacements = {
    '{{businessName}}': businessData.businessName || 'Mi Negocio',
    '{{businessDescription}}': businessData.businessDescription || 'Descripción del negocio',
    '{{contactPhone}}': businessData.contactPhone || 'Teléfono',
    '{{businessAddress}}': businessData.businessAddress || '',
    '{{businessHours}}': businessData.businessHours || '',
    '{{googleMaps}}': businessData.googleMaps || '',
    '{{primaryColor}}': businessData.primaryColor || '#2563eb',
    '{{secondaryColor}}': businessData.secondaryColor || '#1e40af'
  };
  
  // ✅ DEBUG: Verificar qué valores se están usando
  console.log('🔄 Reemplazos que se aplicarán:', {
    primaryColor: simpleReplacements['{{primaryColor}}'],
    secondaryColor: simpleReplacements['{{secondaryColor}}']
  });
  
  Object.entries(simpleReplacements).forEach(([placeholder, value]) => {
    processedHtml = processedHtml.replace(new RegExp(placeholder.replace(/[{}]/g, '\\$&'), 'g'), value);
  });
  
  // Procesar logo
  if (businessData.logoUrl) {  
    processedHtml = processedHtml.replace(/\{\{#if logoUrl\}\}[\s\S]*?\{\{\/if\}\}/g, (match) => {
      return match.replace('{{#if logoUrl}}', '').replace('{{/if}}', '')
                  .replace('{{logoUrl}}', businessData.logoUrl)
                  .replace('{{businessName}}', businessData.businessName || 'Mi Negocio');
    });
  } else {
    processedHtml = processedHtml.replace(/\{\{#if logoUrl\}\}[\s\S]*?\{\{\/if\}\}/g, '');
  }
  
  if (businessData.galleryUrls && businessData.galleryUrls.length > 0) {
    processedHtml = processedHtml.replace(/\{\{#if galleryUrls\}\}[\s\S]*?\{\{\/if\}\}/g, (match) => {
      let gallerySection = match.replace('{{#if galleryUrls}}', '').replace('{{/if}}', '');
      const galleryMatch = gallerySection.match(/\{\{#each galleryUrls\}\}[\s\S]*?\{\{\/each\}\}/);
      if (!galleryMatch) return gallerySection;
      
      const galleryItemTemplate = galleryMatch[0];
      const itemTemplate = galleryItemTemplate.replace('{{#each galleryUrls}}', '').replace('{{/each}}', '');
      
      let galleryItems = '';
      businessData.galleryUrls.forEach((url, index) => {
        let item = itemTemplate.replace('{{this}}', url)
                              .replace('{{@index}}', index + 1);
        galleryItems += item;
      });
      
      return gallerySection.replace(/\{\{#each galleryUrls\}\}[\s\S]*?\{\{\/each\}\}/, galleryItems);
    });
  } else {
    processedHtml = processedHtml.replace(/\{\{#if galleryUrls\}\}[\s\S]*?\{\{\/if\}\}/g, '');
  }
  
  // Procesar redes sociales
  if (businessData.socialMedia && Object.keys(businessData.socialMedia).length > 0) {
    processedHtml = processedHtml.replace(/\{\{#if socialMedia\}\}[\s\S]*?\{\{\/if\}\}/g, (match) => {
      let socialSection = match.replace('{{#if socialMedia}}', '').replace('{{/if}}', '');
      
      // ✅ VALIDACIÓN AGREGADA: verificar si existe el template
      const socialMatch = socialSection.match(/\{\{#each socialMedia\}\}[\s\S]*?\{\{\/each\}\}/);
      if (!socialMatch) return socialSection;
      
      const socialItemTemplate = socialMatch[0];
      const itemTemplate = socialItemTemplate.replace('{{#each socialMedia}}', '').replace('{{/each}}', '');
      
      let socialItems = '';
      Object.entries(businessData.socialMedia).forEach(([platform, url]) => {
        let item = itemTemplate.replace('{{this}}', url)
                              .replace('{{@key}}', platform);
        socialItems += item;
      });
      
      return socialSection.replace(/\{\{#each socialMedia\}\}[\s\S]*?\{\{\/each\}\}/, socialItems);
    });
  } else {
    processedHtml = processedHtml.replace(/\{\{#if socialMedia\}\}[\s\S]*?\{\{\/if\}\}/g, '');
  }
  
  // Limpiar condicionales restantes
  processedHtml = processedHtml.replace(/\{\{#if [^}]+\}\}[\s\S]*?\{\{\/if\}\}/g, (match) => {
    const conditionMatch = match.match(/\{\{#if ([^}]+)\}\}/);
    if (!conditionMatch) return '';
    
    const condition = conditionMatch[1];
    if (businessData[condition]) {
      return match.replace(/\{\{#if [^}]+\}\}/, '').replace('{{/if}}', '');
    }
    return '';
  });
  
  return processedHtml;
}

// Función principal para generar plantilla completa
export async function generateTemplate(templateType, businessData) {
  try {
    const templateHtml = await loadTemplate(templateType);
    if (!templateHtml) {
      throw new Error('No se pudo cargar la plantilla');
    }
    
    return processTemplate(templateHtml, businessData);
  } catch (error) {
    console.error('Error generando plantilla:', error);
    return null;
  }
}

// Función para previsualizar plantilla
export async function previewTemplate(templateType, userId) {
  try {
    const businessData = await getUserBusinessData(userId);
    if (!businessData) {
      throw new Error('No se encontraron datos del usuario');
    }
    
    const generatedHtml = await generateTemplate(templateType, businessData);
    if (!generatedHtml) {
      throw new Error('Error generando la plantilla');
    }
    
    // Crear ventana de previsualización
    const previewWindow = window.open('', '_blank', 'width=1200,height=800');
    previewWindow.document.write(generatedHtml);
    previewWindow.document.close();
    
    return true;
  } catch (error) {
    console.error('Error en previsualización:', error);
    alert(`Error mostrando previsualización: ${error.message}`);
    return false;
  }
}
