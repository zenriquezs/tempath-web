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
  const navBtnIcon = document.querySelector("#nav-btn-icon");

  // Hamburger menu functionality
  if (navBtn && nav) {
    navBtn.addEventListener('click', () => {
      nav.classList.toggle('open');
      document.body.classList.toggle('menu-open');
      
      // Update icon based on menu state
      if (navBtnIcon) {
        if (nav.classList.contains('open')) {
          navBtnIcon.className = 'fas fa-times';
        } else {
          navBtnIcon.className = 'fas fa-bars';
        }
      }
    });
  }

  // Scroll functionality
  window.addEventListener("scroll", function () {
    const header = document.querySelector("#header");
    const hero = document.querySelector("#home");
    const goToTop = document.querySelector("#go-to-top");

    if (!hero || !header) return;

    let triggerHeight = hero.offsetHeight - 170;

    if (window.scrollY > triggerHeight) {
      header.classList.add("header-sticky");
      if (goToTop) goToTop.classList.add("reveal");
    } else {
      header.classList.remove("header-sticky");
      if (goToTop) goToTop.classList.remove("reveal");
    }
  });

  // Active navigation links
  let sections = document.querySelectorAll("section");
  let navLinks = document.querySelectorAll("header nav a");

  window.addEventListener('scroll', () => {
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
  });

  // Close menu when clicking on nav links
  const navLinksArray = document.querySelectorAll('.nav-link');
  navLinksArray.forEach(link => {
    link.addEventListener('click', () => {
      if (nav && nav.classList.contains('open')) {
        nav.classList.remove('open');
        document.body.classList.remove('menu-open');
        if (navBtnIcon) {
          navBtnIcon.className = 'fas fa-bars';
        }
      }
    });
  });
});

