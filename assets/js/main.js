"use strict";

import form from "./form.js";
import skillbar from "./skillbar.js";

document.addEventListener("DOMContentLoaded", () => {
  // Llama a form solo si existe el formulario en la página
  if (document.querySelector(".contactForm")) {
    form();
  }

  AOS.init({
    once: true,
  });

  skillbar();

  const nav = document.querySelector("#nav");
  const navBtn = document.querySelector("#nav-btn");
  const navBtnImg = document.querySelector("#nav-btn-img");

  // Hamburger menu
  navBtn.onclick = () => {
    if (nav.classList.toggle("open")) {
      navBtnImg.src = "assets/img/icons/close.svg";
    } else {
      navBtnImg.src = "assets/img/icons/open.svg";
    }
  };

  window.addEventListener("scroll", function () {
    const header = document.querySelector("#header");
    const hero = document.querySelector("#home");
    const goToTop = document.querySelector("#go-to-top"); // Asegúrate que existe este elemento

    if (!hero || !header || !goToTop) return; // Validación para evitar errores

    let triggerHeight = hero.offsetHeight - 170;

    if (window.scrollY > triggerHeight) {
      header.classList.add("header-sticky");
      goToTop.classList.add("reveal");
    } else {
      header.classList.remove("header-sticky");
      goToTop.classList.remove("reveal");
    }
  });

  let sections = document.querySelectorAll("section");
  let navLinks = document.querySelectorAll("header nav a");

  window.onscroll = () => {
    sections.forEach((sec) => {
      let top = window.scrollY;
      let offset = sec.offsetTop - 170;
      let height = sec.offsetHeight;
      let id = sec.getAttribute("id");

      if (top >= offset && top < offset + height) {
        navLinks.forEach((links) => {
          links.classList.remove("active");
          const linkToActivate = document.querySelector(`header nav a[href*=${id}]`);
          if (linkToActivate) linkToActivate.classList.add("active");
        });
      }
    });
  };
});
