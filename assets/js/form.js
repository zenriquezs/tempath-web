const form = () => {
  const contactForm = document.querySelector(".contactForm");
  const responseMessage = document.querySelector(".response");

  if (!contactForm || !responseMessage) {
    console.warn("No se encontró formulario .contactForm o .response");
    return;
  }

  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    responseMessage.classList.add("open");
    responseMessage.textContent = "Please wait...";

    async function getData() {
      try {
        const response = await fetch("mail.php", {
          method: "POST",
          body: formData,
        });
        if (!response.ok) {
          responseMessage.textContent = "Error en la respuesta del servidor";
          return;
        }

        const result = await response.text();
        responseMessage.textContent = result;
      } catch (error) {
        console.error(error.message);
        responseMessage.textContent = "Error enviando el formulario.";
      }
    }

    await getData();

    setTimeout(() => {
      responseMessage.classList.remove("open");
    }, 3000);

    form.reset();
  });
};

export default form;
