class ChatBot {
    constructor() {
        this.isOpen = false;
        this.messages = [];
        this.init();
    }

    init() {
        this.bindEvents();
        this.setupAutoResize();
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
        this.addMessage(message, 'user');
        this.showTyping();
        
        // Simular respuesta del bot
        setTimeout(() => {
            this.hideTyping();
            const response = this.generateResponse(message);
            this.addMessage(response, 'bot');
        }, 1000 + Math.random() * 1000);
    }

    addMessage(content, sender) {
        const messagesContainer = document.getElementById('chatbotMessages');
        if (!messagesContainer) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `chatbot-message ${sender}`;
        
        const contentDiv = document.createElement('div');
        contentDiv.className = 'chatbot-message-content';
        contentDiv.textContent = content;
        
        messageDiv.appendChild(contentDiv);
        
        // Insertar antes del indicador de escritura
        const typingIndicator = document.getElementById('chatbotTyping');
        messagesContainer.insertBefore(messageDiv, typingIndicator);
        
        // Scroll al final
        this.scrollToBottom();
        
        // Guardar mensaje
        this.messages.push({ content, sender, timestamp: new Date() });
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
        const responses = {
            // Saludos
            'hola': '¡Hola! 😊 ¿En qué puedo ayudarte hoy?',
            'buenos días': '¡Buenos días! ☀️ ¿Cómo puedo asistirte?',
            'buenas tardes': '¡Buenas tardes! 🌅 ¿En qué te puedo ayudar?',
            'buenas noches': '¡Buenas noches! 🌙 ¿Cómo puedo ayudarte?',
            
            // Servicios
            'servicios': 'Ofrecemos una amplia gama de servicios profesionales. ¿Te interesa algún área en particular?',
            'qué servicios': 'Nuestros principales servicios incluyen consultoría, desarrollo y soporte técnico. ¿Sobre cuál te gustaría saber más?',
            
            // Horarios
            'horarios': 'Nuestros horarios de atención son de lunes a viernes de 9:00 AM a 6:00 PM. ¿Necesitas agendar una cita?',
            'horario': 'Estamos disponibles de lunes a viernes de 9:00 AM a 6:00 PM. ¿En qué horario te conviene más?',
            
            // Contacto
            'contacto': 'Puedes contactarnos por teléfono, email o visitarnos en nuestras oficinas. ¿Cuál prefieres?',
            'teléfono': 'Nuestro número de teléfono es el que aparece en la página. ¿Prefieres que te llamemos nosotros?',
            'email': 'Puedes escribirnos a nuestro email principal. ¿Necesitas que te envíe la dirección?',
            
            // Ubicación
            'ubicación': 'Estamos ubicados en el centro de la ciudad. ¿Necesitas indicaciones para llegar?',
            'dirección': 'Nuestra dirección está disponible en la sección de contacto. ¿Te gustaría que te envíe un mapa?',
            
            // Precios
            'precio': 'Los precios varían según el servicio. ¿Podrías contarme más sobre lo que necesitas?',
            'costo': 'El costo depende de varios factores. ¿Te gustaría agendar una consulta gratuita?',
            
            // Despedidas
            'gracias': '¡De nada! 😊 ¿Hay algo más en lo que pueda ayudarte?',
            'adiós': '¡Hasta luego! 👋 No dudes en contactarnos si necesitas algo más.',
            'chao': '¡Chao! 😊 Que tengas un excelente día.',
        };

        const lowerMessage = message.toLowerCase();
        
        // Buscar respuesta exacta
        for (const [key, response] of Object.entries(responses)) {
            if (lowerMessage.includes(key)) {
                return response;
            }
        }

        // Respuestas por categorías
        if (lowerMessage.includes('precio') || lowerMessage.includes('costo') || lowerMessage.includes('cuánto')) {
            return 'Los precios varían según tus necesidades específicas. ¿Te gustaría agendar una consulta gratuita para darte un presupuesto personalizado?';
        }

        if (lowerMessage.includes('tiempo') || lowerMessage.includes('cuándo') || lowerMessage.includes('plazo')) {
            return 'Los tiempos de entrega dependen del proyecto. Generalmente trabajamos con plazos de 1-4 semanas. ¿Tienes alguna fecha límite en mente?';
        }

        if (lowerMessage.includes('experiencia') || lowerMessage.includes('años')) {
            return 'Contamos con varios años de experiencia en el sector. Nuestro equipo está altamente capacitado. ¿Te gustaría conocer algunos de nuestros proyectos?';
        }

        // Respuesta por defecto
        const defaultResponses = [
            'Interesante pregunta. ¿Podrías darme más detalles para ayudarte mejor?',
            'Entiendo tu consulta. ¿Te gustaría que te conecte con uno de nuestros especialistas?',
            'Esa es una buena pregunta. ¿Podrías ser más específico sobre lo que necesitas?',
            'Me gustaría ayudarte con eso. ¿Podrías contarme un poco más sobre tu situación?',
            'Perfecto, puedo ayudarte con eso. ¿Qué información específica necesitas?'
        ];

        return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
    }
}

// Inicializar el chatbot cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new ChatBot();
});