document.addEventListener('DOMContentLoaded', function() {
  // Mobile Navigation
  const navToggle = document.querySelector('.nav-toggle');
  const navList = document.querySelector('.nav-list');
  
  navToggle.addEventListener('click', function() {
    navList.classList.toggle('active');
    this.classList.toggle('active');
  });
  
  // Smooth scrolling for navigation links
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      
      if (targetElement) {
        // Close mobile menu if open
        navList.classList.remove('active');
        navToggle.classList.remove('active');
        
        // Scroll to target
        window.scrollTo({
          top: targetElement.offsetTop - 80,
          behavior: 'smooth'
        });
        
        // Update active link
        document.querySelectorAll('.nav-link').forEach(navLink => {
          navLink.classList.remove('active');
        });
        this.classList.add('active');
      }
    });
  });
  
  // Set current year in footer
  document.getElementById('current-year').textContent = new Date().getFullYear();
  
  // Initialize AOS (Animate On Scroll)
  AOS.init({
    duration: 800,
    once: true,
    easing: 'ease-in-out'
  });
  
  // Sticky header on scroll
  window.addEventListener('scroll', function() {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
      header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    } else {
      header.style.boxShadow = 'none';
    }
  });

  // Header con cambio de color al hacer scroll
  window.addEventListener('scroll', function() {
      const header = document.querySelector('.header-transparent');
      if (header) {
          if (window.scrollY > 100) {
              header.style.backgroundColor = 'var(--primary-color)';
              header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
          } else {
              header.style.backgroundColor = 'transparent';
              header.style.boxShadow = 'none';
          }
      }
  });

  // Inicializar AOS para animaciones
  document.addEventListener('DOMContentLoaded', function() {
      AOS.init({
          duration: 800,
          once: true,
          easing: 'ease-in-out'
      });
      
      // Año actual en el footer
      document.getElementById('current-year').textContent = new Date().getFullYear();
  });
  
  // Aqu]i se puede agregar la logica para cargar los datos del formulario
  // Esto es un ejemplo de cómo podrías hacerlo:
  
  /*
  // Cargar datos del negocio (simulando que vienen del formulario)
  const businessData = {
    name: "Mi Negocio",
    description: "Descripción profesional de mi negocio que explica lo que hacemos y nuestros valores.",
    phone: "+52 55 1234 5678",
    address: "Av. Principal #123, Col. Centro, Ciudad de México",
    hours: "Lunes a Viernes: 9:00 AM - 6:00 PM, Sábados: 10:00 AM - 2:00 PM",
    socialMedia: {
      facebook: "https://facebook.com/minegocio",
      instagram: "https://instagram.com/minegocio",
      linkedin: "https://linkedin.com/company/minegocio",
      tiktok: "https://tiktok.com/@minegocio"
    },
    images: [
      "assets/gallery1.jpg",
      "assets/gallery2.jpg",
      "assets/gallery3.jpg",
      "assets/gallery4.jpg",
      "assets/gallery5.jpg",
      "assets/gallery6.jpg"
    ],
    logo: "assets/logo.png"
  };
  
  // Actualizar la p]agina con los datos del negocio
  function updateBusinessData(data) {
    // Información básica
    document.getElementById('business-name').textContent = data.name;
    document.getElementById('business-slogan').textContent = `Bienvenido a ${data.name}`;
    document.getElementById('business-description').textContent = data.description;
    document.getElementById('business-phone').textContent = data.phone;
    document.getElementById('contact-phone').textContent = data.phone;
    document.getElementById('footer-phone').textContent = data.phone;
    
    // Ubicación
    document.getElementById('business-address').textContent = data.address;
    document.getElementById('contact-address').textContent = data.address;
    document.getElementById('footer-address').textContent = data.address;
    
    // Horario
    document.getElementById('business-hours').textContent = data.hours;
    document.getElementById('footer-hours').textContent = data.hours;
    
    // Redes sociales
    if (data.socialMedia.facebook) {
      document.getElementById('facebook-link').href = data.socialMedia.facebook;
      document.getElementById('footer-facebook').href = data.socialMedia.facebook;
    } else {
      document.getElementById('facebook-link').style.display = 'none';
      document.getElementById('footer-facebook').style.display = 'none';
    }
    
    if (data.socialMedia.instagram) {
      document.getElementById('instagram-link').href = data.socialMedia.instagram;
      document.getElementById('footer-instagram').href = data.socialMedia.instagram;
    } else {
      document.getElementById('instagram-link').style.display = 'none';
      document.getElementById('footer-instagram').style.display = 'none';
    }
    
    if (data.socialMedia.linkedin) {
      document.getElementById('linkedin-link').href = data.socialMedia.linkedin;
      document.getElementById('footer-linkedin').href = data.socialMedia.linkedin;
    } else {
      document.getElementById('linkedin-link').style.display = 'none';
      document.getElementById('footer-linkedin').style.display = 'none';
    }
    
    if (data.socialMedia.tiktok) {
      document.getElementById('tiktok-link').href = data.socialMedia.tiktok;
      document.getElementById('footer-tiktok').href = data.socialMedia.tiktok;
    } else {
      document.getElementById('tiktok-link').style.display = 'none';
      document.getElementById('footer-tiktok').style.display = 'none';
    }
    
    // Logo
    if (data.logo) {
      document.getElementById('business-logo').src = data.logo;
      document.querySelector('.footer-logo').src = data.logo;
    }
    
    // Imágenes de galería
    const galleryContainer = document.getElementById('business-gallery');
    if (data.images && data.images.length > 0) {
      galleryContainer.innerHTML = '';
      data.images.forEach(image => {
        galleryContainer.innerHTML += `
          <div class="gallery-item" data-aos="zoom-in">
            <img src="${image}" alt="Imagen del negocio">
          </div>
        `;
      });
    }
    
    // Footer
    document.getElementById('footer-business-name').textContent = data.name;
    document.getElementById('footer-business-description').textContent = data.description;
  }
  
  // Llamar a la función con los datos del negocio
  updateBusinessData(businessData);
  */
  
  // En tu implementación real, deberías cargar los datos desde donde los tengas almacenados
  // Puede ser desde localStorage, una API, o cualquier otra fuente de datos
});