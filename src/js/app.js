"use strict";

/*
  Art-Zac Welding
  Main JavaScript
  Architecture: single app.js file compiled by Gulp
*/

/* =========================================================
   Mobile Navigation
========================================================= */
const navToggle = document.querySelector("[data-nav-toggle]");
const nav = document.querySelector("[data-nav]");
const navLinks = document.querySelectorAll("[data-nav-link]");

if (navToggle && nav) {
  navToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");

    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute("aria-label", isOpen ? "Cerrar menú" : "Abrir menú");
    document.body.classList.toggle("nav-open", isOpen);
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.setAttribute("aria-label", "Abrir menú");
      document.body.classList.remove("nav-open");
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") {
      return;
    }

    nav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Abrir menú");
    document.body.classList.remove("nav-open");
  });
}

/* =========================================================
   Active Navigation Link
========================================================= */
(function setActiveNavigationLink() {
  const currentPath = window.location.pathname.split("/").pop() || "index.html";

  navLinks.forEach((link) => {
    const href = link.getAttribute("href");

    if (!href) {
      return;
    }

    const normalizedHref = href.split("/").pop();

    const isHome =
      currentPath === "" &&
      (normalizedHref === "index.html" || normalizedHref === "");

    const isActive = normalizedHref === currentPath || isHome;

    link.classList.toggle("is-active", isActive);

    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
})();

/* =========================================================
   Header Scroll State
========================================================= */
(function initHeaderScrollState() {
  const header = document.querySelector("[data-header]");

  if (!header) {
    return;
  }

  const updateHeader = () => {
    header.classList.toggle("is-scrolled", window.scrollY > 18);
  };

  updateHeader();

  window.addEventListener("scroll", updateHeader, { passive: true });
})();

/* =========================================================
   Hero Carousel
   Temporary fallback until Three.js hero is implemented
========================================================= */
(function initHeroCarousel() {
  const carousel = document.querySelector("[data-hero-carousel]");

  if (!carousel) {
    return;
  }

  const slides = Array.from(carousel.querySelectorAll("[data-slide]"));
  const prevButton = carousel.querySelector("[data-carousel-prev]");
  const nextButton = carousel.querySelector("[data-carousel-next]");
  const currentCounter = carousel.querySelector("[data-carousel-current]");
  const totalCounter = carousel.querySelector("[data-carousel-total]");

  if (!slides.length) {
    return;
  }

  let activeIndex = slides.findIndex((slide) => slide.classList.contains("is-active"));

  if (activeIndex < 0) {
    activeIndex = 0;
    slides[0].classList.add("is-active");
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const autoPlayDelay = 7500;
  let autoPlayTimer = null;

  const formatNumber = (number) => String(number).padStart(2, "0");

  const updateCounter = () => {
    if (currentCounter) {
      currentCounter.textContent = formatNumber(activeIndex + 1);
    }

    if (totalCounter) {
      totalCounter.textContent = formatNumber(slides.length);
    }
  };

  const animateSlideContent = (slide) => {
    const items = slide.querySelectorAll("[data-slide-item]");

    if (!items.length || !window.gsap || prefersReducedMotion) {
      return;
    }

    window.gsap.fromTo(
      items,
      {
        y: 24,
        autoAlpha: 0
      },
      {
        y: 0,
        autoAlpha: 1,
        duration: 0.75,
        stagger: 0.08,
        ease: "power3.out"
      }
    );
  };

  const showSlide = (newIndex) => {
    if (newIndex === activeIndex) {
      return;
    }

    slides[activeIndex].classList.remove("is-active");

    activeIndex = (newIndex + slides.length) % slides.length;

    slides[activeIndex].classList.add("is-active");
    updateCounter();
    animateSlideContent(slides[activeIndex]);
  };

  const nextSlide = () => {
    showSlide(activeIndex + 1);
  };

  const prevSlide = () => {
    showSlide(activeIndex - 1);
  };

  const stopAutoPlay = () => {
    if (autoPlayTimer) {
      window.clearInterval(autoPlayTimer);
      autoPlayTimer = null;
    }
  };

  const startAutoPlay = () => {
    if (prefersReducedMotion || slides.length <= 1) {
      return;
    }

    stopAutoPlay();

    autoPlayTimer = window.setInterval(nextSlide, autoPlayDelay);
  };

  if (nextButton) {
    nextButton.addEventListener("click", () => {
      nextSlide();
      startAutoPlay();
    });
  }

  if (prevButton) {
    prevButton.addEventListener("click", () => {
      prevSlide();
      startAutoPlay();
    });
  }

  carousel.addEventListener("mouseenter", stopAutoPlay);
  carousel.addEventListener("mouseleave", startAutoPlay);
  carousel.addEventListener("focusin", stopAutoPlay);
  carousel.addEventListener("focusout", startAutoPlay);

  let touchStartX = 0;

  carousel.addEventListener(
    "touchstart",
    (event) => {
      touchStartX = event.touches[0].clientX;
    },
    { passive: true }
  );

  carousel.addEventListener(
    "touchend",
    (event) => {
      const touchEndX = event.changedTouches[0].clientX;
      const diff = touchStartX - touchEndX;

      if (Math.abs(diff) < 48) {
        return;
      }

      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }

      startAutoPlay();
    },
    { passive: true }
  );

  updateCounter();
  animateSlideContent(slides[activeIndex]);
  startAutoPlay();
})();

/* =========================================================
   Reveal Animations
========================================================= */
(function initRevealAnimations() {
  const revealItems = document.querySelectorAll("[data-reveal]");

  if (!revealItems.length) {
    return;
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReducedMotion) {
    revealItems.forEach((item) => {
      item.classList.add("is-visible");
    });

    return;
  }

  if (window.gsap && window.ScrollTrigger) {
    window.gsap.registerPlugin(window.ScrollTrigger);

    revealItems.forEach((item) => {
      window.gsap.fromTo(
        item,
        {
          y: 34,
          autoAlpha: 0
        },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.85,
          ease: "power3.out",
          scrollTrigger: {
            trigger: item,
            start: "top 84%",
            once: true
          }
        }
      );
    });

    return;
  }

  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        currentObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -8% 0px"
    }
  );

  revealItems.forEach((item) => {
    observer.observe(item);
  });
})();

/* =========================================================
   Premium Tilt Cards
========================================================= */
(function initTiltCards() {
  const cards = document.querySelectorAll("[data-tilt-card]");

  if (!cards.length) {
    return;
  }

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const supportsFinePointer = window.matchMedia("(pointer: fine)").matches;

  if (prefersReducedMotion || !supportsFinePointer) {
    return;
  }

  cards.forEach((card) => {
    const maxTilt = 5;

    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      const rotateY = ((x / rect.width) - 0.5) * maxTilt * 2;
      const rotateX = (((y / rect.height) - 0.5) * maxTilt * -2);

      card.style.transform = `perspective(900px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-6px)`;
    });

    card.addEventListener("pointerleave", () => {
      card.style.transform = "";
    });

    card.addEventListener("blur", () => {
      card.style.transform = "";
    });
  });
})();

/* =========================================================
   Smooth Anchor Scroll
========================================================= */
(function initSmoothAnchors() {
  const anchorLinks = document.querySelectorAll('a[href^="#"]:not([href="#"])');

  if (!anchorLinks.length) {
    return;
  }

  anchorLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");

      if (!targetId) {
        return;
      }

      const target = document.querySelector(targetId);

      if (!target) {
        return;
      }

      event.preventDefault();

      const header = document.querySelector("[data-header]");
      const headerOffset = header ? header.offsetHeight + 20 : 20;
      const targetPosition = target.getBoundingClientRect().top + window.scrollY - headerOffset;

      window.scrollTo({
        top: targetPosition,
        behavior: "smooth"
      });
    });
  });
})();

/* =========================================================
   Google Translate
========================================================= */
window.googleTranslateElementInit = function googleTranslateElementInit() {
  const translateContainer = document.getElementById("google_translate_element");

  if (!translateContainer || !window.google || !window.google.translate) {
    return;
  }

  new window.google.translate.TranslateElement(
    {
      pageLanguage: "es",
      includedLanguages: "es,en",
      layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
      autoDisplay: false
    },
    "google_translate_element"
  );
};

(function initLanguageSwitcher() {
  const languageButtons = document.querySelectorAll("[data-language-option]");

  if (!languageButtons.length) {
    return;
  }

  function setCookie(name, value) {
    document.cookie = `${name}=${value}; path=/`;

    if (window.location.hostname && window.location.hostname.includes(".")) {
      document.cookie = `${name}=${value}; path=/; domain=${window.location.hostname}`;
    }
  }

  function setActiveLanguage(language) {
    languageButtons.forEach((button) => {
      const isActive = button.dataset.languageOption === language;

      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    });
  }

  function getCurrentLanguage() {
    const match = document.cookie.match(/googtrans=\/es\/([^;]+)/);

    if (match && match[1]) {
      return match[1];
    }

    return "es";
  }

  function changeLanguage(language) {
    if (!language) {
      return;
    }

    if (language === getCurrentLanguage()) {
      setActiveLanguage(language);
      return;
    }

    if (language === "es") {
      setCookie("googtrans", "");
      setCookie("googtrans", "/es/es");
      setActiveLanguage("es");
      window.location.reload();
      return;
    }

    setCookie("googtrans", `/es/${language}`);
    setActiveLanguage(language);
    window.location.reload();
  }

  languageButtons.forEach((button) => {
    button.addEventListener("click", () => {
      changeLanguage(button.dataset.languageOption);
    });
  });

  setActiveLanguage(getCurrentLanguage());
})();

/* =========================================================
   Contact Form
========================================================= */
(function initArtZacContactForm() {
  const form = document.querySelector("#artZacContactForm");

  if (!form) {
    return;
  }

  const endpoint = form.dataset.endpoint || "";

  const fields = {
    website: form.querySelector("#website"),
    name: form.querySelector("#name"),
    phone: form.querySelector("#phone"),
    email: form.querySelector("#email"),
    service: form.querySelector("#service"),
    projectType: form.querySelector("#projectType"),
    location: form.querySelector("#location"),
    message: form.querySelector("#message"),
    consent: form.querySelector("#consent")
  };

  const submitButton = form.querySelector(".contact-form__submit");

  const showAlert = (options) => {
    if (window.Swal) {
      window.Swal.fire(options);
      return;
    }

    alert(options.text || options.title || "Mensaje del formulario");
  };

  const setSubmitting = (isSubmitting) => {
    if (!submitButton) {
      return;
    }

    submitButton.disabled = isSubmitting;
    submitButton.textContent = isSubmitting
      ? "Enviando solicitud..."
      : "Enviar solicitud";
  };

  const setError = (fieldName, message) => {
    const field = fields[fieldName];
    const error = form.querySelector(`[data-error-for="${fieldName}"]`);

    if (!field || !error) {
      return;
    }

    field.classList.add("is-invalid");
    error.textContent = message;
  };

  const clearError = (fieldName) => {
    const field = fields[fieldName];
    const error = form.querySelector(`[data-error-for="${fieldName}"]`);

    if (!field || !error) {
      return;
    }

    field.classList.remove("is-invalid");
    error.textContent = "";
  };

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isValidPhone = (phone) => {
    const digits = phone.replace(/\D/g, "");
    return digits.length >= 7;
  };

  const validateForm = () => {
    let isValid = true;

    [
      "name",
      "phone",
      "email",
      "service",
      "projectType",
      "location",
      "message",
      "consent"
    ].forEach(clearError);

    if (fields.website && fields.website.value.trim()) {
      return false;
    }

    if (fields.name && !fields.name.value.trim()) {
      setError("name", "Ingrese su nombre completo.");
      isValid = false;
    }

    if (fields.phone && !fields.phone.value.trim()) {
      setError("phone", "Ingrese su número de teléfono.");
      isValid = false;
    } else if (fields.phone && !isValidPhone(fields.phone.value.trim())) {
      setError("phone", "Ingrese un número de teléfono válido.");
      isValid = false;
    }

    if (fields.email && !fields.email.value.trim()) {
      setError("email", "Ingrese su correo electrónico.");
      isValid = false;
    } else if (fields.email && !isValidEmail(fields.email.value.trim())) {
      setError("email", "Ingrese un correo electrónico válido.");
      isValid = false;
    }

    if (fields.service && !fields.service.value) {
      setError("service", "Seleccione el servicio requerido.");
      isValid = false;
    }

    if (fields.projectType && !fields.projectType.value) {
      setError("projectType", "Seleccione el tipo de proyecto.");
      isValid = false;
    }

    if (fields.location && !fields.location.value.trim()) {
      setError("location", "Ingrese la ubicación del proyecto.");
      isValid = false;
    }

    if (fields.message && !fields.message.value.trim()) {
      setError("message", "Cuéntenos brevemente qué necesita resolver.");
      isValid = false;
    } else if (fields.message && fields.message.value.trim().length < 12) {
      setError("message", "Agregue algunos detalles más sobre el proyecto.");
      isValid = false;
    }

    if (fields.consent && !fields.consent.checked) {
      setError("consent", "Confirme que podemos contactarlo sobre esta solicitud.");
      isValid = false;
    }

    return isValid;
  };

  Object.entries(fields).forEach(([fieldName, field]) => {
    if (!field || fieldName === "website") {
      return;
    }

    const eventName = field.type === "checkbox" || field.tagName === "SELECT"
      ? "change"
      : "input";

    field.addEventListener(eventName, () => {
      clearError(fieldName);
    });
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      showAlert({
        icon: "error",
        title: "Revise el formulario",
        text: "Algunos campos obligatorios necesitan su atención antes de enviar.",
        confirmButtonText: "Revisar",
        confirmButtonColor: "#b7652a"
      });

      return;
    }

    const payload = {
      name: fields.name ? fields.name.value.trim() : "",
      phone: fields.phone ? fields.phone.value.trim() : "",
      email: fields.email ? fields.email.value.trim().toLowerCase() : "",
      service: fields.service ? fields.service.value : "",
      projectType: fields.projectType ? fields.projectType.value : "",
      location: fields.location ? fields.location.value.trim() : "",
      message: fields.message ? fields.message.value.trim() : "",
      consent: fields.consent && fields.consent.checked ? "true" : "false",
      pageUrl: window.location.href,
      userAgent: navigator.userAgent,
      submittedAt: new Date().toISOString()
    };

    if (!endpoint) {
      const subject = encodeURIComponent(`Solicitud de cotización - ${payload.service}`);
      const body = encodeURIComponent(
        `Nombre: ${payload.name}\n` +
        `Teléfono: ${payload.phone}\n` +
        `Email: ${payload.email}\n` +
        `Servicio: ${payload.service}\n` +
        `Tipo de proyecto: ${payload.projectType}\n` +
        `Ubicación: ${payload.location}\n\n` +
        `Detalles:\n${payload.message}`
      );

      showAlert({
        icon: "info",
        title: "Formulario sin endpoint",
        text: "El formulario todavía no tiene un endpoint configurado. Se abrirá su correo para enviar la solicitud.",
        confirmButtonText: "Continuar",
        confirmButtonColor: "#b7652a"
      });

      window.location.href = `mailto:info@art-zacwelding.com?subject=${subject}&body=${body}`;
      return;
    }

    try {
      setSubmitting(true);

      await fetch(endpoint, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify(payload)
      });

      showAlert({
        icon: "success",
        title: "Solicitud enviada",
        html: `
          <p style="margin:0 0 10px;">Gracias, <strong>${payload.name}</strong>.</p>
          <p style="margin:0;">Su solicitud fue enviada correctamente a Art-Zac Welding.</p>
        `,
        confirmButtonText: "Perfecto",
        confirmButtonColor: "#b7652a"
      });

      form.reset();
    } catch (error) {
      console.error("Art-Zac contact form error:", error);

      showAlert({
        icon: "error",
        title: "Error al enviar",
        text: "No se pudo enviar la solicitud. Por favor llame directamente a Art-Zac Welding.",
        confirmButtonText: "Entendido",
        confirmButtonColor: "#b7652a"
      });
    } finally {
      setSubmitting(false);
    }
  });
})();

/* =========================================================
   Legacy Estimate Form Safety
   Kept only to avoid errors if an old page still includes #estimateForm
========================================================= */
(function initLegacyEstimateFormSafety() {
  const legacyForm = document.querySelector("#estimateForm");

  if (!legacyForm) {
    return;
  }

  legacyForm.addEventListener("submit", (event) => {
    event.preventDefault();

    alert("Este formulario fue reemplazado. Use el formulario principal de contacto.");
  });
})();

/* =========================================================
   Footer Current Year
========================================================= */
(function initCurrentYear() {
  const yearElements = document.querySelectorAll("[data-current-year]");

  if (!yearElements.length) {
    return;
  }

  const currentYear = new Date().getFullYear();

  yearElements.forEach((element) => {
    element.textContent = String(currentYear);
  });
})();

/* =========================================================
   Scroll Progress / Back To Top
========================================================= */
(function initScrollProgress() {
  const progressButton = document.querySelector("[data-scroll-top]");
  const progressCircle = document.querySelector("[data-scroll-progress]");

  if (!progressButton) {
    return;
  }

  const setupCircle = () => {
    if (!progressCircle) {
      return null;
    }

    const radius = Number(progressCircle.getAttribute("r")) || 24;
    const circumference = 2 * Math.PI * radius;

    progressCircle.style.strokeDasharray = `${circumference}`;
    progressCircle.style.strokeDashoffset = `${circumference}`;

    return circumference;
  };

  const circumference = setupCircle();

  const updateProgress = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollHeight > 0 ? scrollTop / scrollHeight : 0;

    progressButton.classList.toggle("is-visible", scrollTop > 360);

    if (progressCircle && circumference) {
      const offset = circumference - progress * circumference;
      progressCircle.style.strokeDashoffset = `${offset}`;
    }
  };

  progressButton.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });

  updateProgress();

  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);
})();

/* =========================================================
   Video Cards Safety
========================================================= */
(function initVideoCards() {
  const videoCards = document.querySelectorAll("[data-video-card]");

  if (!videoCards.length) {
    return;
  }

  videoCards.forEach((card) => {
    const video = card.querySelector("video");
    const playButton = card.querySelector("[data-video-play]");

    if (!video || !playButton) {
      return;
    }

    playButton.addEventListener("click", () => {
      if (video.paused) {
        video.play();
        card.classList.add("is-playing");
        playButton.setAttribute("aria-label", "Pausar video de Art-Zac Welding");
      } else {
        video.pause();
        card.classList.remove("is-playing");
        playButton.setAttribute("aria-label", "Reproducir video de Art-Zac Welding");
      }
    });
  });
})();

document.addEventListener("DOMContentLoaded", () => {
  const whatsappWidget = document.querySelector("[data-whatsapp-widget]");

  if (!whatsappWidget) {
    return;
  }

  const toggleButton = whatsappWidget.querySelector("[data-whatsapp-toggle]");
  const panel = whatsappWidget.querySelector("[data-whatsapp-panel]");

  if (!toggleButton || !panel) {
    return;
  }

  const closeWidget = () => {
    whatsappWidget.classList.remove("is-open");
    toggleButton.setAttribute("aria-expanded", "false");
    panel.setAttribute("aria-hidden", "true");
  };

  const openWidget = () => {
    whatsappWidget.classList.add("is-open");
    toggleButton.setAttribute("aria-expanded", "true");
    panel.setAttribute("aria-hidden", "false");
  };

  toggleButton.addEventListener("click", (event) => {
    event.stopPropagation();

    if (whatsappWidget.classList.contains("is-open")) {
      closeWidget();
    } else {
      openWidget();
    }
  });

  document.addEventListener("click", (event) => {
    if (!whatsappWidget.contains(event.target)) {
      closeWidget();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeWidget();
    }
  });
});