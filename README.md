# Tempath

Tempath es una herramienta digital enfocada en facilitar a pequeños negocios (consultorios médicos, estéticas, constructoras, papelerías, entre otros) la creación de su propio sitio web sin necesidad de conocimientos en programación o diseño. A través de un formulario guiado y opciones prediseñadas, el usuario puede generar y publicar su página web de forma rápida, sencilla y funcional.


![Project Preview](tempath-web\assets\img\Tempath.jpeg)
---

## Objetivo del Proyecto

El objetivo de esta primera fase (MVP) es validar la funcionalidad básica de la plataforma, enfocándonos en que el cliente pueda:

- Registrarse e iniciar sesión.
- Llenar un formulario paso a paso con datos de su negocio.
- Visualizar 3 plantillas prediseñadas con su información cargada.
- Seleccionar y publicar su sitio en un subdominio tipo `miempresa.tempath.app`.
- Tener integrado un botón de contacto vía WhatsApp.

---

## Tecnologías y Herramientas

### Frontend
- React.js (o Next.js en fases futuras)
- Tailwind CSS – Framework de utilidad para estilos rápidos y consistentes.
- Figma – Para el prototipado y validación visual antes del desarrollo.

### Backend
- Node.js – Para la lógica de negocio del backend.
- MongoDB – Base de datos no relacional para almacenar información de usuarios y formularios.
- Firebase Authentication – Para el sistema de login seguro y simple.

### Hosting y Despliegue
- Firebase Hosting (o alternativamente Netlify o Render)
- GitHub – Para el control de versiones y colaboración del equipo.

---

## Funcionalidades del MVP

| Función | Descripción |
|--------|-------------|
| Login/Sign up | Registro e inicio de sesión con correo electrónico. |
| Formulario guiado | Captura paso a paso de información clave del negocio. |
| Plantillas prediseñadas | Visualización de 3 sitios autogenerados con los datos del cliente. |
| Publicación web | Generación automática del sitio en un subdominio tipo `negocio.tempath.app`. |
| WhatsApp directo | Botón flotante en la página para contacto instantáneo. |

---

## Estructura del Proyecto

```
tempath-web/
├── public/                # Archivos estáticos
├── src/
│   ├── assets/            # Imágenes, íconos, etc.
│   ├── components/        # Componentes reutilizables
│   ├── pages/             # Vistas principales (Login, Formulario, Plantillas)
│   ├── templates/         # Plantillas prediseñadas
│   ├── services/          # Conexión con APIs o Firebase
│   └── App.jsx            # Punto de entrada del frontend
├── firebase.json          # Configuración para Firebase Hosting
├── tailwind.config.js     # Configuración de Tailwind CSS
├── package.json           # Dependencias y scripts
└── README.md              # Este archivo
```

---

## Instalación y Uso

### 1. Clonar el repositorio

```
git clone https://github.com/zenriquezs/tempath-web.git
cd tempath-web
```

### 2. Instalar dependencias

```
npm install
```

### 3. Ejecutar en modo desarrollo

```
npm run dev
```

La app se abrirá en `http://localhost:5173` (si usas Vite).

---

## Configuración de Firebase (opcional si no está listo)

1. Crea un proyecto en Firebase Console.
2. Habilita Authentication con el método de Email/Password.
3. Agrega Firebase SDK a tu proyecto:

```
npm install firebase
```

4. Crea el archivo `firebase.js` en `/src/services/` con tu configuración.

---

## Despliegue

### En Firebase Hosting

```
npm run build
firebase deploy
```

### O con Netlify/Render

Conecta tu repositorio en Netlify o Render y sigue el asistente para despliegue automático.

---

## Ideas Futuras / Escalabilidad

- Botón de agendado de citas para giros como salud o nutrición.
- Cotizadores automáticos para constructoras.
- Catálogo de productos para tiendas.
- Chatbot con voz (integrando ElevenLabs).
- Subdominios personalizados con dominio propio.
- Editor visual asistido.

---

## APIs y herramientas útiles

| Herramienta/API | Uso |
|----------------|-----|
| Firebase | Login, base de datos, hosting |
| Formspree / Tally.so | Alternativa rápida para formularios |
| WhatsApp Business API | Enlace directo con clientes |
| ElevenLabs | Voz automática (futuro) |
| Figma | Diseño visual colaborativo |
| Netlify / Render | Alternativas de despliegue |

---

## Equipo y Créditos

Proyecto desarrollado por el equipo Tempath como parte de un MVP colaborativo.

- Frontend: Enrique Zuñiga y equipo
- Backend: Por definir
- Diseño: Prototipos en Figma disponibles en grupo de WhatsApp
- Repositorio: https://github.com/zenriquezs/tempath-web

---

## Licencia

Este proyecto está bajo licencia MIT. Puedes usarlo, modificarlo y distribuirlo libremente, siempre que se incluya esta nota.

---

## Contacto

¿Tienes ideas, mejoras o quieres colaborar?

Correo: zenrizu@gmail.com  
LinkedIn: https://www.linkedin.com/in/enrique-zu%C3%B1iga-zu%C3%B1iga-6118b82b0/  
Portafolio: https://zenriquezs.github.io/portfolioenriquezs.github.io/