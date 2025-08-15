class ChatBot {
    constructor() {
        this.isOpen = false;
        this.messages = [];
        this.userInactivityTimeout = null;
        this.userInactivityFinalTimeout = null;
    this.status = 'dormido'; // 'dormido' or 'disponible'
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupAutoResize();
    this.setStatus('dormido');
    }
    setStatus(status) {
        // status: 'dormido' | 'disponible'
        const statusEl = document.getElementById('chatbotStatus');
        if (!statusEl) return;
        const dot = statusEl.querySelector('.chatbot-status-dot');
        const text = statusEl.querySelector('.chatbot-status-text');
        if (status === 'disponible') {
            dot.style.background = '#00C853';
            text.textContent = 'Disponible';
        } else {
            dot.style.background = '#FFD600';
            text.textContent = 'Dormido';
        }
        this.status = status;
    }

    bindEvents() {
        const toggleBtn = document.getElementById('chatbotToggle');
        const closeBtn = document.getElementById('chatbotClose');
        const sendBtn = document.getElementById('chatbotSend');
        const input = document.getElementById('chatbotInput');
        const quickOptions = document.querySelectorAll('.chatbot-quick-option');

        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggleChat());
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeChat());
        }

        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.sendMessage());
        }

        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });
        }

        // Opciones rápidas
        quickOptions.forEach(option => {
            option.addEventListener('click', () => {
                const message = option.getAttribute('data-message');
                this.sendUserMessage(message);
                option.style.display = 'none';
            });
        });

        // Cerrar al hacer clic fuera
        document.addEventListener('click', (e) => {
            const widget = document.querySelector('.chatbot-widget');
            if (widget && !widget.contains(e.target) && this.isOpen) {
                this.closeChat();
            }
        });
    }

    setupAutoResize() {
        const input = document.getElementById('chatbotInput');
        if (input) {
            input.addEventListener('input', () => {
                input.style.height = 'auto';
                input.style.height = Math.min(input.scrollHeight, 100) + 'px';
            });
        }
    }

    toggleChat() {
        if (this.isOpen) {
            this.closeChat();
        } else {
            this.openChat();
        }
    }

    openChat() {
        const window = document.getElementById('chatbotWindow');
        if (window) {
            window.classList.add('active');
            this.isOpen = true;
            
            // Focus en el input
            setTimeout(() => {
                const input = document.getElementById('chatbotInput');
                if (input) input.focus();
            }, 300);
        }
    }

    closeChat() {
        const window = document.getElementById('chatbotWindow');
        if (window) {
            window.classList.remove('active');
            this.isOpen = false;
        }
    }

    sendMessage() {
        const input = document.getElementById('chatbotInput');
        if (!input) return;

        const message = input.value.trim();
        if (!message) return;

        this.sendUserMessage(message);
        input.value = '';
        input.style.height = 'auto';
    }

    sendUserMessage(message) {

        // Cambiar a disponible si es el primer mensaje del usuario
        if (this.status !== 'disponible') {
            this.setStatus('disponible');
        }
        this.addMessage(message, 'user');
        this.showTyping();

        // Limpiar timeouts de inactividad
        if (this.userInactivityTimeout) clearTimeout(this.userInactivityTimeout);
        if (this.userInactivityFinalTimeout) clearTimeout(this.userInactivityFinalTimeout);

        // Soporte: detectar si el último mensaje del bot fue la pregunta de opciones o atención personalizada
        const lastBotMsg = this.messages.slice().reverse().find(m => m.sender === 'bot');
        const trimmed = message.trim();
        if (lastBotMsg && lastBotMsg.content) {
            // Opciones de soporte general
            if (lastBotMsg.content.includes('¿Qué quieres hacer?')) {
                if (trimmed === '1') {
                    setTimeout(() => {
                        this.hideTyping();
                        window.open('https://accounts.google.com/servicelogin?service=mail', '_blank');
                        this.addMessage('Abriendo Gmail para que puedas escribirnos a <b>soporte@tempath.com</b>...', 'bot');
                    }, 800);
                    return;
                } else if (trimmed === '2') {
                    setTimeout(() => {
                        this.hideTyping();
                        document.getElementById('chatbotClose')?.click();
                        const contactSection = document.getElementById('contact') || document.querySelector('[id*="contact"]');
                        if (contactSection && typeof contactSection.scrollIntoView === 'function') {
                            contactSection.scrollIntoView({ behavior: 'smooth' });
                        } else {
                            window.location.hash = '#contact';
                        }
                        this.addMessage('Te llevamos al formulario de contacto. ¡Déjanos tu mensaje!', 'bot');
                    }, 800);
                    return;
                } else if (trimmed === '3') {
                    setTimeout(() => {
                        this.hideTyping();
                        window.open('https://web.whatsapp.com/', '_blank');
                        this.addMessage('Abriendo WhatsApp Web. Pronto tendrás soporte directo por WhatsApp.', 'bot');
                    }, 800);
                    return;
                }
            }
            // Opciones de atención personalizada
            if (lastBotMsg.content.includes('Si necesitas atención personalizada, aquí tienes opciones:')) {
                if (trimmed === '1') {
                    setTimeout(() => {
                        this.hideTyping();
                        window.open('https://accounts.google.com/servicelogin?service=mail', '_blank');
                        this.addMessage('Abriendo Gmail para que puedas escribirnos a <b>soporte@tempath.com</b>...', 'bot');
                    }, 800);
                    return;
                } else if (trimmed === '2') {
                    setTimeout(() => {
                        this.hideTyping();
                        document.getElementById('chatbotClose')?.click();
                        const contactSection = document.getElementById('contact') || document.querySelector('[id*="contact"]');
                        if (contactSection && typeof contactSection.scrollIntoView === 'function') {
                            contactSection.scrollIntoView({ behavior: 'smooth' });
                        } else {
                            window.location.hash = '#contact';
                        }
                        this.addMessage('Te llevamos al formulario de contacto. ¡Déjanos tu mensaje!', 'bot');
                    }, 800);
                    return;
                } else if (trimmed === '3') {
                    setTimeout(() => {
                        this.hideTyping();
                        window.open('https://web.whatsapp.com/', '_blank');
                        this.addMessage('Abriendo WhatsApp Web. Pronto tendrás soporte directo por WhatsApp.', 'bot');
                    }, 800);
                    return;
                }
            }
        }

        // Simular respuesta del bot normal
        setTimeout(() => {
            this.hideTyping();
            const response = this.generateResponse(message);
            this.addMessage(response, 'bot');
            this.startUserInactivityTimers();
        }, 1000 + Math.random() * 1000);
    }

    startUserInactivityTimers() {
        // Primer recordatorio a los X segundos
        this.userInactivityTimeout = setTimeout(() => {
            this.addMessage('⏳ <i>¿Sigues ahí? Si necesitas más ayuda, ¡aquí estoy!</i>', 'bot');
        }, 30000);
        // Despedida a los X segundos
        this.userInactivityFinalTimeout = setTimeout(() => {
            this.addMessage('👋 <b>Gracias por tu visita. Si necesitas más ayuda, vuelve cuando quieras. ¡Éxito con tu página Tempath!</b>', 'bot');
            this.setStatus('dormido');
        }, 50000);
    }

    addMessage(content, sender) {
        const messagesContainer = document.getElementById('chatbotMessages');
        if (!messagesContainer) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `chatbot-message ${sender}`;
        
    const contentDiv = document.createElement('div');
    contentDiv.className = 'chatbot-message-content';
    contentDiv.innerHTML = content;
        
        messageDiv.appendChild(contentDiv);
        
        // Insertar antes del indicador de escritura
        const typingIndicator = document.getElementById('chatbotTyping');
        messagesContainer.insertBefore(messageDiv, typingIndicator);
        
        // Scroll al final
        this.scrollToBottom();
        
        // Guardar mensaje
        this.messages.push({ content, sender, timestamp: new Date() });

        // Si es un mensaje de despedida del bot, volver a dormido
        if (sender === 'bot' && typeof content === 'string') {
            if (content.includes('Gracias por tu visita') || content.includes('¡Éxito con tu página Tempath!')) {
                this.setStatus('dormido');
            }
        }
    }

    showTyping() {
        const typing = document.getElementById('chatbotTyping');
        if (typing) {
            typing.style.display = 'flex';
            this.scrollToBottom();
        }
    }

    hideTyping() {
        const typing = document.getElementById('chatbotTyping');
        if (typing) {
            typing.style.display = 'none';
        }
    }

    scrollToBottom() {
        const messagesContainer = document.getElementById('chatbotMessages');
        if (messagesContainer) {
            setTimeout(() => {
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }, 100);
        }
    }

    generateResponse(message) {
        const lowerMessage = message.toLowerCase();

        // Horarios
        if (lowerMessage.includes('horario') || lowerMessage.includes('horarios') || lowerMessage.includes('a qué hora') || lowerMessage.includes('a que hora') || lowerMessage.includes('cuándo abren') || lowerMessage.includes('cuando abren')) {
            return '⏰ <b>Nuestro horario de atención:</b><br>' +
                '<ul style="margin: 8px 0 8px 18px; padding: 0;">' +
                '<li>Lunes a viernes: <b>9:00 AM a 6:00 PM</b></li>' +
                '</ul>' +
                '¡Puedes contactarnos en cualquier momento y te responderemos lo antes posible!';
        }

        // Ubicación
        if (lowerMessage.includes('ubicación') || lowerMessage.includes('ubicacion') || lowerMessage.includes('dónde están') || lowerMessage.includes('donde estan') || lowerMessage.includes('dónde se encuentran') || lowerMessage.includes('donde se encuentran')) {
            return '📍 <b>Nuestra oficina principal está en México</b>,<br>pero <b>Tempath es una plataforma 100% online</b>.<br><br>' +
                'Puedes crear tu página web desde cualquier lugar.<br>¿Necesitas atención presencial? <b>Contáctanos para agendar una cita</b>.';
        }

        // Saludos y presentación
        if (/\b(hola|buenas|hey|saludos)\b/.test(lowerMessage)) {
            return '👋 <b>¡Hola!</b> Soy el asistente virtual de <b>Tempath</b>.<br><br>' +
                '¿Qué te gustaría hacer?<br>' +
                '<ul style="margin: 8px 0 8px 18px; padding: 0; list-style: none;">' +
                '<li>• Descubrir cómo crear tu página web</li>' +
                '<li>• Conocer nuestros <b>servicios</b> o <b>planes</b></li>' +
                '<li>• Solicitar <b>soporte</b></li>' +
                '</ul>' +
                '¡Pregúntame lo que quieras!';
        }

        // Quién eres
        if (lowerMessage.includes('quién eres') || lowerMessage.includes('quien eres') || lowerMessage.includes('eres un bot') || lowerMessage.includes('eres real')) {
            return '🤖 <b>Soy el asistente virtual de Tempath</b>.<br>' +
                'Estoy aquí para ayudarte a:<br>' +
                '<ul style="margin: 8px 0 8px 18px; padding: 0; list-style: none;">' +
                '<li>• Crear, personalizar y publicar tu página web</li>' +
                '<li>• Resolver tus dudas</li>' +
                '<li>• Guiarte en todo el proceso</li>' +
                '</ul>' +
                '<b>¡Pregúntame lo que necesites!</b>';
        }

        // Qué es Tempath
        if (lowerMessage.includes('qué es tempath') || lowerMessage.includes('que es tempath')) {
            return '<b>Tempath</b> es una plataforma que te ayuda a:<br>' +
                '<ul style="margin: 8px 0 8px 18px; padding: 0; list-style: none;">' +
                '<li>• <b>Crear</b> tu propia página web</li>' +
                '<li>• <b>Personalizar</b> textos, imágenes y colores</li>' +
                '<li>• <b>Publicar</b> tu web de manera sencilla y rápida</li>' +
                '</ul>' +
                'Todo <b>sin necesidad de conocimientos técnicos</b>.';
        }

        // Servicios
        if (lowerMessage.includes('servicio') || lowerMessage.includes('servicios') || lowerMessage.includes('qué ofrecen') || lowerMessage.includes('que ofrecen')) {
            return '🛠️ <b>En Tempath ofrecemos:</b><br>' +
                '<ul style="margin: 8px 0 8px 18px; padding: 0;">' +
                '<li>• Creación de páginas web tipo <b>landing</b></li>' +
                '<li>• Páginas especializadas para sectores como belleza, restaurantes, hotelería, salud, educación, consultorías y más</li>' +
                '</ul>' +
                'Todo funciona por <b>planes</b> que se adaptan a tus necesidades.<br><br>' +
                '¿Te gustaría saber más sobre los planes disponibles?';
        }

        // Si el usuario responde afirmativamente sobre planes tras preguntar por servicios
        if (/\b(sí|si|claro|quiero saber|dime|cuáles|cuales|cuál|cual|muéstrame|muestrame|ver planes|más info|mas info|detalles)\b/.test(lowerMessage) && this.messages.length > 0) {
            // Buscar si la última respuesta fue sobre servicios o pregunta de planes
            const lastBotMsg = this.messages.slice().reverse().find(m => m.sender === 'bot');
            if (lastBotMsg && (lastBotMsg.content.includes('¿Te gustaría saber más sobre los planes disponibles?') || lastBotMsg.content.includes('¿Te gustaría ver una comparación detallada'))) {
                return '<b>Tempath ofrece tres planes:</b><br>' +
                    '<ul style="margin: 8px 0 8px 18px; padding: 0;">' +
                    '<li>🆓 <b>Gratis</b>: Publica tu web con anuncios y subdominio Tempath.</li>' +
                    '<li>💎 <b>Pro</b>: Sin anuncios, subdominio Tempath, ideal para proyectos personales.</li>' +
                    '<li>🌟 <b>Personalizado</b>: Sin anuncios, dominio propio, soporte premium y personalización avanzada.</li>' +
                    '</ul>' +
                    '<i>¿Te gustaría ver una comparación detallada o saber cuál te conviene según tus necesidades?</i>';
            }
        }

        // Guía paso a paso para crear una página (patrones ampliados)
        if (
            /como (hago|puedo hacer|puedo crear|hago mi|hago una|hago una web|hago mi pagina|hago mi página|hago una página|hago una pagina|lo hago|crear mi página|crear mi pagina|crear página|crear pagina|crear una página|crear una pagina|hacer mi página|hacer mi pagina|hacer una página|hacer una pagina|empezar|iniciar)/.test(lowerMessage) ||
            lowerMessage.includes('cómo lo hago') || lowerMessage.includes('como lo hago') || lowerMessage.includes('cómo hago mi página') || lowerMessage.includes('quiero el paso a paso') || lowerMessage.includes('dame el paso a paso') ||
            lowerMessage.includes('como hago mi pagina') || lowerMessage.includes('quiero hacer mi página') || lowerMessage.includes('quiero hacer mi pagina') ||
            lowerMessage.includes('quiero crear mi página') || lowerMessage.includes('sí, explícame paso a paso') || lowerMessage.includes('explicame el proceso') || lowerMessage.includes('explicame como hacerlo')
        ) {
            return '<b>¡Te explico cómo crear tu página web en Tempath!</b><br>' +
                '<ol style="margin: 8px 0 8px 18px; padding: 0;">' +
                '<li>Haz clic en <b>"Crear mi página"</b> o regístrate/inicia sesión.</li>' +
                '<li>Elige una <b>plantilla profesional</b> que te guste.</li>' +
                '<li>Personaliza <b>textos, imágenes y colores</b> a tu gusto.</li>' +
                '<li>Haz clic en <b>"Publicar"</b> para poner tu web en línea.</li>' +
                '</ol>' +
                '<i>¿Quieres que te ayude con alguno de estos pasos o tienes una duda específica?</i>';
        }

        // Información sobre planes
        if (lowerMessage.includes('planes') || lowerMessage.includes('precio') || lowerMessage.includes('costo') || lowerMessage.includes('gratuito') || lowerMessage.includes('gratis')) {
            return '<b>Tempath ofrece tres planes:</b><br>' +
                '<ul style="margin: 8px 0 8px 18px; padding: 0;">' +
                '<li>🆓 <b>Gratis</b>: Publica tu web con anuncios y subdominio Tempath.</li>' +
                '<li>💎 <b>Pro</b>: Sin anuncios, subdominio Tempath, ideal para proyectos personales.</li>' +
                '<li>🌟 <b>Personalizado</b>: Sin anuncios, dominio propio, soporte premium y personalización avanzada.</li>' +
                '</ul>' +
                '<i>¿Te gustaría ver una comparación detallada o saber cuál te conviene según tus necesidades?</i>';
        }
        // Migración de web
        if (lowerMessage.includes('migrar') || lowerMessage.includes('importar')) {
            return '🔄 <b>¡Sí! Puedes migrar tu sitio web a Tempath.</b><br>Contáctanos y te ayudaremos a importar tu contenido y configurarlo en nuestra plataforma.';
        }

        // Cambiar plantilla
        if (lowerMessage.includes('cambiar plantilla') || lowerMessage.includes('otra plantilla')) {
            return '🎨 <b>Puedes cambiar de plantilla en cualquier momento</b> desde tu panel de usuario.<br>' +
                'Solo ve a la sección de <b>diseño</b> y elige la nueva plantilla que prefieras.';
        }

        // Tienda en línea
        if (lowerMessage.includes('tienda en línea') || lowerMessage.includes('tienda online') || lowerMessage.includes('ecommerce')) {
            return '🛒 <b>¡Por supuesto! Tempath permite agregar una tienda en línea a tu página.</b><br>' +
                'Puedes gestionar productos, pagos y pedidos fácilmente desde tu panel.';
        }

        // Métodos de pago
        if (lowerMessage.includes('metodos de pago') ||lowerMessage.includes('métodos de pago') || lowerMessage.includes('formas de pago') || lowerMessage.includes('aceptan tarjeta')) {
            return '💳 <b>Aceptamos pagos con:</b><br>' +
                '<ul style="margin: 8px 0 8px 18px; padding: 0;">' +
                '<li>• Tarjeta de crédito</li>' +
                '<li>• Tarjeta de débito</li>' +
                '<li>• PayPal</li>' +
                '</ul>' +
                'para los planes de pago.<br>¿Te gustaría saber cómo actualizar tu plan?';
        }

        // Ejemplos de páginas
        if (lowerMessage.includes('ejemplo de página') || lowerMessage.includes('ejemplo de web') || lowerMessage.includes('ver ejemplos')) {
            return '🌐 <b>Puedes ver ejemplos de páginas creadas con Tempath</b> en nuestra galería de inspiración.<br>' +
                '¿Quieres que te envíe el enlace?';
        }

        // Recuperar contraseña
        if (lowerMessage.includes('olvidé mi contraseña') || lowerMessage.includes('olvide mi contraseña') || lowerMessage.includes('recuperar contraseña')) {
            return '🔑 <b>¿Olvidaste tu contraseña?</b><br>Haz clic en <b>"¿Olvidaste tu contraseña?"</b> en la pantalla de inicio de sesión y sigue los pasos para restablecerla.';
        }

        // Eliminar cuenta
        if (lowerMessage.includes('eliminar mi cuenta') || lowerMessage.includes('borrar mi cuenta') || lowerMessage.includes('cancelar mi cuenta')) {
            return '⚠️ <b>Lamentamos que quieras irte.</b><br>Puedes eliminar tu cuenta desde la configuración de tu perfil.<br>Si necesitas ayuda, contáctanos y te asistiremos.';
        }

        // Colaborar con otros
        if (lowerMessage.includes('colaborar') || lowerMessage.includes('trabajar en equipo') || lowerMessage.includes('agregar usuario')) {
            return '🤝 <b>Puedes invitar a otros usuarios a colaborar en tu página</b> desde la sección de <b>equipo</b> en tu panel de usuario.';
        }

        // Renovación y actualización de plan
        if (lowerMessage.includes('no renuevo') || lowerMessage.includes('no pago') || lowerMessage.includes('actualizar plan') || lowerMessage.includes('cambiar plan')) {
            return '🔄 <b>Si no renuevas tu plan</b>, tu página pasará al <b>plan gratuito con anuncios</b>.<br>Puedes actualizar o cambiar de plan en cualquier momento desde tu panel.';
        }

        // App móvil
        if (lowerMessage.includes('app móvil') || lowerMessage.includes('app android') || lowerMessage.includes('app ios')) {
            return '📱 <b>Actualmente Tempath funciona desde cualquier navegador móvil.</b><br>' +
                'Pronto lanzaremos nuestra app para Android y iOS.';
        }

        // Blog
        if (lowerMessage.includes('agregar blog') || lowerMessage.includes('tengo blog') || lowerMessage.includes('blog en mi web')) {
            return '📝 <b>Puedes agregar un blog a tu página</b> desde la sección de módulos.<br>' +
                'Es fácil de usar y personalizar.';
        }

        // Google Analytics
        if (lowerMessage.includes('google analytics') || lowerMessage.includes('estadísticas') || lowerMessage.includes('visitas web')) {
            return '📊 <b>Puedes integrar Google Analytics</b> y ver estadísticas de tu web desde tu panel de usuario.';
        }

        // Código propio
        if (lowerMessage.includes('código propio') || lowerMessage.includes('agregar código') || lowerMessage.includes('html personalizado')) {
            return '💻 <b>En el plan Personalizado puedes agregar tu propio código HTML, CSS o JS</b> para personalizar aún más tu web.';
        }

        // Seguridad
        if (lowerMessage.includes('seguridad') || lowerMessage.includes('es seguro') || lowerMessage.includes('protección')) {
            return '🔒 <b>Tempath utiliza cifrado SSL</b> y buenas prácticas de seguridad para proteger tu información y la de tus visitantes.';
        }

        // Contacto humano y soporte directo (también para "contacto" y similares)
        if (
            lowerMessage.includes('humano') ||
            lowerMessage.includes('soporte humano') ||
            lowerMessage.includes('hablar con alguien') ||
            lowerMessage.includes('atención humana') ||
            lowerMessage.includes('quiero hablar con soporte') ||
            lowerMessage.includes('quiero hablar con un humano') ||
            lowerMessage.includes('quiero soporte real') ||
            lowerMessage.includes('quiero soporte directo') ||
            lowerMessage.includes('quiero contactar a soporte') ||
            lowerMessage.includes('quiero contactar soporte') ||
            lowerMessage.includes('quiero contactar a un humano') ||
            lowerMessage.includes('quiero contactar a alguien') ||
            lowerMessage.includes('quiero atención personalizada') ||
            lowerMessage.includes('quiero atención humana') ||
            lowerMessage.includes('quiero ayuda de un humano') ||
            lowerMessage.includes('quiero ayuda real') ||
            lowerMessage.includes('quiero ayuda directa') ||
            lowerMessage.includes('quiero ayuda personalizada') ||
            lowerMessage.includes('quiero ayuda de soporte') ||
            lowerMessage.includes('quiero ayuda de alguien') ||
            lowerMessage.includes('quiero ayuda con un agente') ||
            lowerMessage.includes('quiero hablar con un agente') ||
            lowerMessage.includes('quiero contactar a un agente') ||
            lowerMessage.includes('quiero contactar agente') ||
            lowerMessage.includes('quiero contactar a soporte humano') ||
            lowerMessage.includes('quiero contactar a soporte real') ||
            lowerMessage.includes('quiero contactar a soporte directo') ||
            lowerMessage.includes('contacto') ||
            lowerMessage.includes('contactar') ||
            lowerMessage.includes('correo') ||
            lowerMessage.includes('email')
        ) {
            return '👨‍💻 <b>Si necesitas atención personalizada, aquí tienes opciones:</b><br>' +
                '<ul style="margin: 8px 0 8px 18px; padding: 0;">' +
                '<li>1️⃣ <a href="mailto:soporte@tempath.com" target="_blank"><b>Escribir correo</b></a> <span style="color:#888;">(abrirá Gmail u otro gestor de correo)</span></li>' +
                '<li>2️⃣ <a href="#contact" onclick="document.getElementById(\'chatbotClose\').click();" style="color:#007bff;"><b>Usar formulario</b></a> <span style="color:#888;">(te lleva al apartado Contáctanos)</span></li>' +
                '<li>3️⃣ <a href="https://web.whatsapp.com/" target="_blank"><b>WhatsApp</b></a> <span style="color:#888;">(próximamente soporte directo por WhatsApp)</span></li>' +
                '</ul>';
        }

        // Soporte técnico (no humano)
        if (lowerMessage.includes('soporte') || lowerMessage.includes('ayuda') || lowerMessage.includes('problema') || lowerMessage.includes('error')) {
            return '🛠️ <b>Estoy aquí para ayudarte.</b><br>' +
                'Por favor, describe tu problema o duda y te oriento paso a paso.<br>' +
                'Si es algo técnico, dime en qué parte del proceso tienes el inconveniente y te ayudo a resolverlo.<br><br>' +
                '<b>¿Quieres que te pase con un técnico especializado de Tempath para atención personalizada?</b>';
        }

        // Si el usuario responde afirmativamente tras pregunta de soporte técnico
        if (/\b(sí|si|claro|quiero|deseo|por favor|ayuda|hablar|contactar|tecnico|técnico|especialista|humano)\b/.test(lowerMessage) && this.messages.length > 0) {
            const lastBotMsg = this.messages.slice().reverse().find(m => m.sender === 'bot');
            if (lastBotMsg && lastBotMsg.content.includes('¿Quieres que te pase con un técnico especializado')) {
                return '👨‍💻 <b>Si necesitas atención personalizada, aquí tienes opciones:</b><br>' +
                    '<ul style="margin: 8px 0 8px 18px; padding: 0;">' +
                    '<li>1️⃣ <a href="mailto:soporte@tempath.com" target="_blank"><b>Escribir correo</b></a> <span style="color:#888;">(abrirá Gmail u otro gestor de correo)</span></li>' +
                    '<li>2️⃣ <a href="#contact" onclick="document.getElementById(\'chatbotClose\').click();" style="color:#007bff;"><b>Usar formulario</b></a> <span style="color:#888;">(te lleva al apartado Contáctanos)</span></li>' +
                    '<li>3️⃣ <a href="https://web.whatsapp.com/" target="_blank"><b>WhatsApp</b></a> <span style="color:#888;">(próximamente soporte directo por WhatsApp)</span></li>' +
                    '</ul>';
            }
        }

        // Preguntas frecuentes
        if (lowerMessage.includes('dominio')) {
            return '🌐 <b>En el plan Personalizado puedes usar tu propio dominio.</b><br>' +
                'En los otros planes, tu web estará bajo un subdominio de Tempath.';
        }
        if (lowerMessage.includes('anuncios')) {
            return '📢 <b>El plan gratuito incluye anuncios.</b><br>' +
                'Si prefieres una web sin anuncios, elige el plan Pro o Personalizado.';
        }
        if (lowerMessage.includes('plantilla') || lowerMessage.includes('diseño')) {
            return '🎨 <b>Puedes elegir entre varias plantillas profesionales</b> y personalizarlas a tu gusto desde el editor.<br>' +
                '¿Quieres ver ejemplos de plantillas?';
        }
        if (lowerMessage.includes('publicar')) {
            return '🚀 <b>Cuando termines de personalizar tu página</b>, haz clic en <b>"Publicar"</b> y tu web estará en línea al instante.';
        }
        if (lowerMessage.includes('editar')) {
            return '✏️ <b>Puedes editar tu página en cualquier momento</b> desde tu panel de usuario.<br>' +
                'Los cambios se reflejan al instante.';
        }

        // Despedidas
        if (/\b(gracias|adiós|adios|chao|bye)\b/.test(lowerMessage)) {
            setTimeout(() => { this.setStatus('dormido'); }, 500);
            return '🙌 <b>¡Gracias por usar Tempath!</b><br>' +
                'Si tienes más preguntas, aquí estaré para ayudarte.<br>' +
                '¡Éxito con tu página web!';
        }

        // Sugerencias de acción
        if (lowerMessage.includes('empezar') || lowerMessage.includes('iniciar')) {
            return '✨ <b>¡Perfecto!</b><br>' +
                'Haz clic en <b>"Crear mi página"</b> en la parte superior<br>o dime si quieres que te guíe paso a paso.';
        }

        // Respuesta por defecto
        const defaultResponses = [
            '🤔 <b>¿Quieres que te explique paso a paso cómo crear tu página web en Tempath?</b>',
            '💡 <b>¿Tienes dudas sobre plantillas, personalización, publicación o soporte?</b><br>¡Pregúntame!',
            '📋 <b>¿Te gustaría saber más sobre los planes, pagos o cómo publicar tu web?</b>',
            '🧑‍💻 <b>Estoy aquí para ayudarte en todo el proceso de creación de tu página.</b><br>¿En qué paso necesitas ayuda?',
            '🌟 <b>¿Quieres ver ejemplos de páginas creadas con Tempath, agregar tienda, blog o necesitas soporte técnico?</b>'
        ];
        return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
    }
}

// Inicializar el chatbot cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new ChatBot();
});