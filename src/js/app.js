const navToggle = document.querySelector("[data-nav-toggle]");
const nav = document.querySelector("[data-nav]");

if (navToggle && nav) {
  navToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");

    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const heroCarousel = document.querySelector("[data-hero-carousel]");

  if (heroCarousel && window.gsap) {
    const slides = Array.from(heroCarousel.querySelectorAll("[data-slide]"));
    const prevButton = heroCarousel.querySelector("[data-carousel-prev]");
    const nextButton = heroCarousel.querySelector("[data-carousel-next]");
    const currentCounter = heroCarousel.querySelector("[data-carousel-current]");
    const totalCounter = heroCarousel.querySelector("[data-carousel-total]");

    let currentIndex = 0;
    let autoplayId = null;
    let isAnimating = false;
    let touchStartX = 0;
    const autoplayDelay = 6500;

    const updateCounter = () => {
      if (currentCounter) {
        currentCounter.textContent = String(currentIndex + 1).padStart(2, "0");
      }

      if (totalCounter) {
        totalCounter.textContent = String(slides.length).padStart(2, "0");
      }
    };

    const setInitialState = () => {
      slides.forEach((slide, index) => {
        const slideItems = slide.querySelectorAll("[data-slide-item]");
        const slideImage = slide.querySelector(".hero-slide__image");

        slide.classList.toggle("is-active", index === 0);

        gsap.set(slide, {
          autoAlpha: index === 0 ? 1 : 0
        });

        gsap.set(slideItems, {
          autoAlpha: index === 0 ? 1 : 0,
          y: index === 0 ? 0 : 24
        });

        if (slideImage) {
          gsap.set(slideImage, {
            scale: index === 0 ? 1 : 1.08
          });
        }
      });

      updateCounter();
    };

    const syncHeroVideos = (activeIndex = currentIndex) => {
      slides.forEach((slide, index) => {
        const video = slide.querySelector(".hero-slide__video");

        if (!video) {
          return;
        }

        video.muted = true;
        video.loop = true;
        video.playsInline = true;

        if (index === activeIndex) {
          const playPromise = video.play();

          if (playPromise !== undefined) {
            playPromise.catch(() => {});
          }
        } else {
          video.pause();
          video.currentTime = 0;
        }
      });
    };

    const goToSlide = (nextIndex) => {
      if (isAnimating || nextIndex === currentIndex) {
        return;
      }

      isAnimating = true;

      const currentSlide = slides[currentIndex];
      const nextSlide = slides[nextIndex];

      const currentItems = currentSlide.querySelectorAll("[data-slide-item]");
      const nextItems = nextSlide.querySelectorAll("[data-slide-item]");

      const currentImage = currentSlide.querySelector(".hero-slide__image");
      const nextImage = nextSlide.querySelector(".hero-slide__image");

      nextSlide.classList.add("is-active");

      gsap.set(nextSlide, { autoAlpha: 1 });
      gsap.set(nextItems, { autoAlpha: 0, y: 24 });

      if (nextImage) {
        gsap.set(nextImage, { scale: 1.08 });
      }

      syncHeroVideos(nextIndex);

      const tl = gsap.timeline({
        defaults: {
          ease: "power3.out"
        },
        onComplete: () => {
          currentSlide.classList.remove("is-active");
          gsap.set(currentSlide, { autoAlpha: 0 });

          currentIndex = nextIndex;
          updateCounter();
          syncHeroVideos(currentIndex);
          isAnimating = false;
        }
      });

      tl.to(
        currentItems,
        {
          autoAlpha: 0,
          y: -16,
          duration: 0.35,
          stagger: 0.04
        },
        0
      )
        .fromTo(
          currentSlide,
          {
            autoAlpha: 1
          },
          {
            autoAlpha: 0,
            duration: 0.95
          },
          0
        )
        .fromTo(
          nextSlide,
          {
            autoAlpha: 0
          },
          {
            autoAlpha: 1,
            duration: 0.95
          },
          0
        )
        .to(
          currentImage,
          {
            scale: 1.02,
            duration: 1.2,
            ease: "power2.out"
          },
          0
        )
        .to(
          nextImage,
          {
            scale: 1,
            duration: 1.6,
            ease: "power2.out"
          },
          0
        )
        .to(
          nextItems,
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.75,
            stagger: 0.08
          },
          0.22
        );
    };

    const nextSlide = () => {
      goToSlide((currentIndex + 1) % slides.length);
    };

    const prevSlide = () => {
      goToSlide((currentIndex - 1 + slides.length) % slides.length);
    };

    const stopAutoplay = () => {
      if (autoplayId) {
        clearInterval(autoplayId);
        autoplayId = null;
      }
    };

    const startAutoplay = () => {
      stopAutoplay();
      autoplayId = setInterval(() => {
        nextSlide();
      }, autoplayDelay);
    };

    if (nextButton) {
      nextButton.addEventListener("click", () => {
        nextSlide();
        startAutoplay();
      });
    }

    if (prevButton) {
      prevButton.addEventListener("click", () => {
        prevSlide();
        startAutoplay();
      });
    }

    heroCarousel.addEventListener("mouseenter", stopAutoplay);
    heroCarousel.addEventListener("mouseleave", startAutoplay);
    heroCarousel.addEventListener("focusin", stopAutoplay);
    heroCarousel.addEventListener("focusout", startAutoplay);

    heroCarousel.addEventListener(
      "touchstart",
      (event) => {
        touchStartX = event.changedTouches[0].clientX;
      },
      { passive: true }
    );

    heroCarousel.addEventListener(
      "touchend",
      (event) => {
        const touchEndX = event.changedTouches[0].clientX;
        const diffX = touchStartX - touchEndX;

        if (Math.abs(diffX) < 40) {
          return;
        }

        if (diffX > 0) {
          nextSlide();
        } else {
          prevSlide();
        }

        startAutoplay();
      },
      { passive: true }
    );

    setInitialState();
    syncHeroVideos();
    startAutoplay();
  }
});


document.addEventListener("DOMContentLoaded", () => {
  const revealItems = document.querySelectorAll("[data-reveal]");

  if (window.gsap && window.ScrollTrigger && revealItems.length) {
    gsap.registerPlugin(ScrollTrigger);

    revealItems.forEach((item) => {
      gsap.fromTo(
        item,
        {
          autoAlpha: 0,
          y: 28
        },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.75,
          ease: "power3.out",
          scrollTrigger: {
            trigger: item,
            start: "top 86%",
            once: true
          }
        }
      );
    });
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const tiltCards = document.querySelectorAll("[data-tilt-card]");

  if (!prefersReducedMotion && tiltCards.length) {
    tiltCards.forEach((card) => {
      card.addEventListener("pointermove", (event) => {
        const rect = card.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const rotateY = ((x / rect.width) - 0.5) * 6;
        const rotateX = ((0.5 - y / rect.height)) * 6;

        card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
      });

      card.addEventListener("pointerleave", () => {
        card.style.transform = "";
      });
    });
  }

  const testimonialCarousel = document.querySelector("[data-testimonial-carousel]");

  if (testimonialCarousel) {
    const track = testimonialCarousel.querySelector("[data-testimonial-track]");
    const slides = Array.from(testimonialCarousel.querySelectorAll("[data-testimonial-slide]"));
    const prevButton = document.querySelector("[data-testimonial-prev]");
    const nextButton = document.querySelector("[data-testimonial-next]");
    const dotsContainer = testimonialCarousel.querySelector("[data-testimonial-dots]");

    let currentIndex = 0;
    let autoplayId = null;
    const autoplayDelay = 5200;

    if (!track || !slides.length) {
      return;
    }

    const getVisibleSlides = () => {
      if (window.matchMedia("(min-width: 960px)").matches) {
        return 3;
      }

      if (window.matchMedia("(min-width: 700px)").matches) {
        return 2;
      }

      return 1;
    };

    const getMaxIndex = () => {
      return Math.max(slides.length - getVisibleSlides(), 0);
    };

    const createDots = () => {
      if (!dotsContainer) {
        return;
      }

      dotsContainer.innerHTML = "";

      for (let index = 0; index <= getMaxIndex(); index += 1) {
        const dot = document.createElement("button");
        dot.className = "testimonials__dot";
        dot.type = "button";
        dot.setAttribute("aria-label", `Go to testimonial ${index + 1}`);

        dot.addEventListener("click", () => {
          goToSlide(index);
          restartAutoplay();
        });

        dotsContainer.appendChild(dot);
      }
    };

    const updateDots = () => {
      if (!dotsContainer) {
        return;
      }

      const dots = dotsContainer.querySelectorAll(".testimonials__dot");

      dots.forEach((dot, index) => {
        dot.classList.toggle("is-active", index === currentIndex);
      });
    };

    const updateCarousel = () => {
      currentIndex = Math.min(currentIndex, getMaxIndex());

      const firstSlide = slides[0];
      const slideWidth = firstSlide.getBoundingClientRect().width;
      const styles = window.getComputedStyle(track);
      const gap = parseFloat(styles.columnGap || styles.gap || 0);
      const offset = currentIndex * (slideWidth + gap);

      if (window.gsap && !prefersReducedMotion) {
        gsap.to(track, {
          x: -offset,
          duration: 0.7,
          ease: "power3.out"
        });
      } else {
        track.style.transform = `translateX(${-offset}px)`;
      }

      updateDots();
    };

    const goToSlide = (index) => {
      const maxIndex = getMaxIndex();
      currentIndex = Math.max(0, Math.min(index, maxIndex));
      updateCarousel();
    };

    const nextSlide = () => {
      const maxIndex = getMaxIndex();
      currentIndex = currentIndex >= maxIndex ? 0 : currentIndex + 1;
      updateCarousel();
    };

    const prevSlide = () => {
      const maxIndex = getMaxIndex();
      currentIndex = currentIndex <= 0 ? maxIndex : currentIndex - 1;
      updateCarousel();
    };

    const stopAutoplay = () => {
      if (autoplayId) {
        clearInterval(autoplayId);
        autoplayId = null;
      }
    };

    const startAutoplay = () => {
      stopAutoplay();

      if (!prefersReducedMotion) {
        autoplayId = setInterval(nextSlide, autoplayDelay);
      }
    };

    const restartAutoplay = () => {
      stopAutoplay();
      startAutoplay();
    };

    if (nextButton) {
      nextButton.addEventListener("click", () => {
        nextSlide();
        restartAutoplay();
      });
    }

    if (prevButton) {
      prevButton.addEventListener("click", () => {
        prevSlide();
        restartAutoplay();
      });
    }

    testimonialCarousel.addEventListener("mouseenter", stopAutoplay);
    testimonialCarousel.addEventListener("mouseleave", startAutoplay);
    testimonialCarousel.addEventListener("focusin", stopAutoplay);
    testimonialCarousel.addEventListener("focusout", startAutoplay);

    window.addEventListener("resize", () => {
      createDots();
      updateCarousel();
    });

    createDots();
    updateCarousel();
    startAutoplay();
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const projectShowcase = document.querySelector("[data-project-showcase]");

  if (!projectShowcase) {
    return;
  }

  const track = projectShowcase.querySelector("[data-project-track]");
  const slides = Array.from(projectShowcase.querySelectorAll("[data-project-slide]"));
  const thumbs = Array.from(projectShowcase.querySelectorAll("[data-project-thumb]"));
  const prevButton = projectShowcase.querySelector("[data-project-prev]");
  const nextButton = projectShowcase.querySelector("[data-project-next]");
  const currentCounter = projectShowcase.querySelector("[data-project-current]");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let currentIndex = 0;

  const formatNumber = (number) => String(number).padStart(2, "0");

  const updateThumbs = () => {
    thumbs.forEach((thumb, index) => {
      thumb.classList.toggle("is-active", index === currentIndex);
    });

    const activeThumb = thumbs[currentIndex];

    if (activeThumb) {
      activeThumb.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "nearest",
        inline: "nearest"
      });
    }
  };

  const updateSlides = () => {
    slides.forEach((slide, index) => {
      slide.classList.toggle("is-active", index === currentIndex);
    });

    const offset = currentIndex * 100;

    if (window.gsap && !prefersReducedMotion) {
      gsap.to(track, {
        xPercent: -offset,
        duration: 0.65,
        ease: "power3.out"
      });
    } else {
      track.style.transform = `translateX(-${offset}%)`;
    }

    if (currentCounter) {
      currentCounter.textContent = formatNumber(currentIndex + 1);
    }

    updateThumbs();
  };

  const goToSlide = (index) => {
    if (!slides.length) {
      return;
    }

    currentIndex = (index + slides.length) % slides.length;
    updateSlides();
  };

  if (prevButton) {
    prevButton.addEventListener("click", () => {
      goToSlide(currentIndex - 1);
    });
  }

  if (nextButton) {
    nextButton.addEventListener("click", () => {
      goToSlide(currentIndex + 1);
    });
  }

  thumbs.forEach((thumb) => {
    thumb.addEventListener("click", () => {
      const index = Number(thumb.dataset.projectThumb);
      goToSlide(index);
    });
  });

  projectShowcase.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      goToSlide(currentIndex - 1);
    }

    if (event.key === "ArrowRight") {
      goToSlide(currentIndex + 1);
    }
  });

  let touchStartX = 0;

  projectShowcase.addEventListener(
    "touchstart",
    (event) => {
      touchStartX = event.changedTouches[0].clientX;
    },
    { passive: true }
  );

  projectShowcase.addEventListener(
    "touchend",
    (event) => {
      const touchEndX = event.changedTouches[0].clientX;
      const difference = touchStartX - touchEndX;

      if (Math.abs(difference) > 50) {
        goToSlide(difference > 0 ? currentIndex + 1 : currentIndex - 1);
      }
    },
    { passive: true }
  );

  updateSlides();
});


document.addEventListener("DOMContentLoaded", () => {
  const videoShowcase = document.querySelector("[data-video-showcase]");

  if (!videoShowcase) {
    return;
  }

  const player = videoShowcase.querySelector("[data-video-feature]");
  const sourceWebm = videoShowcase.querySelector("[data-video-feature-webm]");
  const sourceMp4 = videoShowcase.querySelector("[data-video-feature-mp4]");
  const playButton = videoShowcase.querySelector("[data-video-feature-toggle]");
  const fallback = videoShowcase.querySelector("[data-video-feature-fallback]");

  const title = videoShowcase.querySelector("[data-video-feature-title]");
  const text = videoShowcase.querySelector("[data-video-feature-text]");
  const badge = videoShowcase.querySelector("[data-video-feature-badge]");
  const items = Array.from(videoShowcase.querySelectorAll("[data-video-item]"));

  if (!player || !playButton) {
    return;
  }

  const playText = playButton.querySelector(".video-feature__play-text");

  const showFallback = () => {
    if (fallback) {
      fallback.hidden = false;
    }
  };

  const hideFallback = () => {
    if (fallback) {
      fallback.hidden = true;
    }
  };

  const updatePlayButton = () => {
    const isPlaying = !player.paused && !player.ended;

    playButton.classList.toggle("is-playing", isPlaying);
    playButton.setAttribute(
      "aria-label",
      isPlaying ? "Pause featured asphalt work video" : "Play featured asphalt work video"
    );

    if (playText) {
      playText.textContent = isPlaying ? "Pause Video" : "Play Video";
    }
  };

  const playVideo = async () => {
    hideFallback();

    try {
      player.muted = false;
      await player.play();
    } catch (error) {
      try {
        player.muted = true;
        await player.play();
      } catch (secondError) {
        player.setAttribute("controls", "controls");
        showFallback();
      }
    }

    updatePlayButton();
  };

  const pauseVideo = () => {
    player.pause();
    updatePlayButton();
  };

  playButton.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (player.paused || player.ended) {
      playVideo();
    } else {
      pauseVideo();
    }
  });

  player.addEventListener("click", () => {
    if (player.paused || player.ended) {
      playVideo();
    } else {
      pauseVideo();
    }
  });

  player.addEventListener("play", updatePlayButton);
  player.addEventListener("pause", updatePlayButton);
  player.addEventListener("ended", updatePlayButton);

  player.addEventListener("loadeddata", () => {
    hideFallback();
  });

  player.addEventListener("error", () => {
    showFallback();
    updatePlayButton();
  });

  items.forEach((item) => {
    item.addEventListener("click", () => {
      const webm = item.dataset.videoWebm || "";
      const mp4 = item.dataset.videoMp4 || "";
      const poster = item.dataset.videoPoster || "";
      const nextTitle = item.dataset.videoTitle || "";
      const nextText = item.dataset.videoText || "";
      const nextBadge = item.dataset.videoBadge || "Project Video";

      player.pause();
      hideFallback();

      if (sourceWebm) {
        sourceWebm.src = webm;
      }

      if (sourceMp4) {
        sourceMp4.src = mp4;
      }

      if (poster) {
        player.poster = poster;
      }

      if (title) {
        title.textContent = nextTitle;
      }

      if (text) {
        text.textContent = nextText;
      }

      if (badge) {
        badge.textContent = nextBadge;
      }

      items.forEach((button) => {
        const isActive = button === item;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-pressed", isActive ? "true" : "false");
      });

      player.load();
      updatePlayButton();
    });
  });

  updatePlayButton();
});

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#estimateForm");

  if (!form) {
    return;
  }

  const endpoint = form.dataset.leadsEndpoint;
  const powDifficulty = 4;

  const fields = {
    website: form.querySelector("#website"),
    formTs: form.querySelector("#formTs"),
    name: form.querySelector("#name"),
    phone: form.querySelector("#phone"),
    email: form.querySelector("#email"),
    service: form.querySelector("#service"),
    propertyType: form.querySelector("#propertyType"),
    location: form.querySelector("#location"),
    message: form.querySelector("#message"),
    consent: form.querySelector("#consent")
  };

  const submitButton = form.querySelector(".contact-form__submit");

  if (fields.formTs) {
    fields.formTs.value = String(Date.now());
  }

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

  const showAlert = (options) => {
    if (window.Swal) {
      Swal.fire(options);
      return;
    }

    alert(options.text || options.title || "Form message");
  };

  const setSubmitting = (isSubmitting) => {
    if (!submitButton) {
      return;
    }

    submitButton.disabled = isSubmitting;
    submitButton.textContent = isSubmitting
      ? "Verifying & Sending..."
      : "Submit Free Estimate Request";
  };

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const isValidPhone = (phone) => {
    const digits = phone.replace(/\D/g, "");
    return digits.length >= 10;
  };

  const validateForm = () => {
    let isValid = true;

    [
      "name",
      "phone",
      "email",
      "service",
      "propertyType",
      "location",
      "message",
      "consent"
    ].forEach(clearError);

    if (fields.website && fields.website.value.trim()) {
      isValid = false;
    }

    if (!fields.name.value.trim()) {
      setError("name", "Please enter your full name.");
      isValid = false;
    }

    if (!fields.phone.value.trim()) {
      setError("phone", "Please enter your phone number.");
      isValid = false;
    } else if (!isValidPhone(fields.phone.value.trim())) {
      setError("phone", "Please enter a valid phone number.");
      isValid = false;
    }

    if (!fields.email.value.trim()) {
      setError("email", "Please enter your email address.");
      isValid = false;
    } else if (!isValidEmail(fields.email.value.trim())) {
      setError("email", "Please enter a valid email address.");
      isValid = false;
    }

    if (!fields.service.value) {
      setError("service", "Please select a service.");
      isValid = false;
    }

    if (!fields.propertyType.value) {
      setError("propertyType", "Please select a property type.");
      isValid = false;
    }

    if (!fields.location.value.trim()) {
      setError("location", "Please enter the project location.");
      isValid = false;
    }

    if (!fields.message.value.trim()) {
      setError("message", "Please tell us about your project.");
      isValid = false;
    } else if (fields.message.value.trim().length < 12) {
      setError("message", "Please add a few more details about your project.");
      isValid = false;
    }

    if (!fields.consent.checked) {
      setError("consent", "Please confirm that we may contact you about your estimate.");
      isValid = false;
    }

    return isValid;
  };

  const sha256Hex = async (text) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));

    return hashArray
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  };

  const generateProofOfWork = async (email) => {
    const powTs = Date.now();
    const prefix = "0".repeat(powDifficulty);
    let nonce = 0;
    let hash = "";

    while (true) {
      const nonceValue = String(nonce);
      const base = `${email}|${powTs}|${nonceValue}`;
      hash = await sha256Hex(base);

      if (hash.startsWith(prefix)) {
        return {
          pow_ts: powTs,
          pow_nonce: nonceValue,
          pow_hash: hash,
          pow_difficulty: powDifficulty
        };
      }

      nonce += 1;
    }
  };

  Object.entries(fields).forEach(([fieldName, field]) => {
    if (!field || fieldName === "website" || fieldName === "formTs") {
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
        title: "Please check the form",
        text: "Some required fields need your attention before submitting.",
        confirmButtonText: "Review Form",
        confirmButtonColor: "#f5c400"
      });

      return;
    }

    if (!endpoint) {
      showAlert({
        icon: "error",
        title: "Form endpoint missing",
        text: "The Google Sheets endpoint has not been configured.",
        confirmButtonText: "OK",
        confirmButtonColor: "#f5c400"
      });

      return;
    }

    try {
      setSubmitting(true);

      const email = fields.email.value.trim().toLowerCase();
      const pow = await generateProofOfWork(email);

      const payload = {
        website: fields.website ? fields.website.value.trim() : "",
        form_ts: fields.formTs ? Number(fields.formTs.value) : Date.now(),

        name: fields.name.value.trim(),
        phone: fields.phone.value.trim(),
        email,
        service: fields.service.value,
        propertyType: fields.propertyType.value,
        location: fields.location.value.trim(),
        message: fields.message.value.trim(),
        consent: fields.consent.checked ? "true" : "false",

        ua: navigator.userAgent,
        tz: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
        page_id: "contact",
        page_url: window.location.href,

        pow_ts: pow.pow_ts,
        pow_nonce: pow.pow_nonce,
        pow_hash: pow.pow_hash,
        pow_difficulty: pow.pow_difficulty
      };

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
        title: "Estimate Request Sent",
        html: `
          <p style="margin:0 0 10px;">Thank you, <strong>${payload.name}</strong>.</p>
          <p style="margin:0;">Your request has been submitted to Asphalt 365.</p>
        `,
        confirmButtonText: "Great",
        confirmButtonColor: "#f5c400"
      });

      form.reset();

      if (fields.formTs) {
        fields.formTs.value = String(Date.now());
      }

    } catch (error) {
      console.error("Lead submission error:", error);

      showAlert({
        icon: "error",
        title: "Submission Error",
        text: "Your request could not be submitted. Please call Asphalt 365 at 630-440-7586.",
        confirmButtonText: "OK",
        confirmButtonColor: "#f5c400"
      });

    } finally {
      setSubmitting(false);
    }
  });
});


document.addEventListener("DOMContentLoaded", () => {
  const navLinks = document.querySelectorAll(".site-nav__link");

  if (!navLinks.length) {
    return;
  }

  const currentPath = window.location.pathname;
  const currentPage = currentPath.split("/").pop() || "index.html";

  navLinks.forEach((link) => {
    const linkHref = link.getAttribute("href");

    if (!linkHref) {
      return;
    }

    const linkPage = linkHref.split("/").pop();

    const isHome =
      currentPage === "" ||
      currentPage === "index.html" ||
      currentPath === "/";

    const isActive =
      linkPage === currentPage ||
      (isHome && linkPage === "index.html");

    link.classList.toggle("is-active", isActive);

    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });
});



// Google Translate initializer for bilingual ES/EN support.
// Uses the official Google Translate widget and keeps Spanish as the base language.
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

(function () {
  const form = document.getElementById("artZacContactForm");

  if (!form || form.dataset.enhanced === "true") {
    return;
  }

  form.dataset.enhanced = "true";

  const startedAtInput = document.getElementById("formStartedAt");
  const submitButton = form.querySelector("[data-submit-button]");
  const honeypot = form.querySelector('[name="company_website"]');

  if (startedAtInput) {
    startedAtInput.value = String(Date.now());
  }

  const fields = {
    name: form.querySelector("#contactName"),
    phone: form.querySelector("#contactPhone"),
    email: form.querySelector("#contactEmail"),
    service: form.querySelector("#contactService"),
    message: form.querySelector("#contactMessage")
  };

  function showAlert(type, title, text) {
    if (window.Swal) {
      window.Swal.fire({
        icon: type,
        title,
        text,
        confirmButtonText: "Entendido",
        confirmButtonColor: "#b7652a"
      });
      return;
    }

    alert(`${title}\n\n${text}`);
  }

  function setFieldState(field, message) {
    const wrapper = field.closest(".form-field");
    const error = form.querySelector(`[data-error-for="${field.id}"]`);

    if (!wrapper) {
      return;
    }

    wrapper.classList.remove("is-valid", "is-invalid");

    if (message) {
      wrapper.classList.add("is-invalid");

      if (error) {
        error.textContent = message;
      }

      return;
    }

    wrapper.classList.add("is-valid");

    if (error) {
      error.textContent = "";
    }
  }

  function normalizePhone(value) {
    return value.replace(/[^\d+]/g, "");
  }

  function validateEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(value);
  }

  function validatePhone(value) {
    const normalized = normalizePhone(value);
    return normalized.length >= 10 && normalized.length <= 15;
  }

  function validateForm() {
    let isValid = true;

    const name = fields.name.value.trim();
    const phone = fields.phone.value.trim();
    const email = fields.email.value.trim();
    const service = fields.service.value.trim();
    const message = fields.message.value.trim();

    if (name.length < 2) {
      setFieldState(fields.name, "Ingrese su nombre completo.");
      isValid = false;
    } else {
      setFieldState(fields.name, "");
    }

    if (!validatePhone(phone)) {
      setFieldState(fields.phone, "Ingrese un teléfono válido de al menos 10 dígitos.");
      isValid = false;
    } else {
      setFieldState(fields.phone, "");
    }

    if (!validateEmail(email)) {
      setFieldState(fields.email, "Ingrese un email válido.");
      isValid = false;
    } else {
      setFieldState(fields.email, "");
    }

    if (!service) {
      setFieldState(fields.service, "Seleccione el servicio requerido.");
      isValid = false;
    } else {
      setFieldState(fields.service, "");
    }

    if (message.length < 12) {
      setFieldState(fields.message, "Describa brevemente su proyecto.");
      isValid = false;
    } else {
      setFieldState(fields.message, "");
    }

    return isValid;
  }

  function isLikelySpam() {
    const startedAt = Number(startedAtInput ? startedAtInput.value : 0);
    const elapsed = Date.now() - startedAt;

    if (honeypot && honeypot.value.trim() !== "") {
      return true;
    }

    if (startedAt && elapsed < 4000) {
      return true;
    }

    return false;
  }

  function getPayload() {
    const formData = new FormData(form);
    const payload = {};

    formData.forEach((value, key) => {
      payload[key] = String(value).trim();
    });

    payload.submitted_at = new Date().toISOString();
    payload.user_agent = navigator.userAgent;
    payload.page_url = window.location.href;

    return payload;
  }

  async function submitToEndpoint(payload) {
    const endpoint = form.dataset.endpoint;

    if (!endpoint) {
      throw new Error("missing_endpoint");
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error("request_failed");
    }

    return response;
  }

  Object.values(fields).forEach((field) => {
    field.addEventListener("blur", validateForm);
    field.addEventListener("input", () => {
      const wrapper = field.closest(".form-field");
      const error = form.querySelector(`[data-error-for="${field.id}"]`);

      if (wrapper) {
        wrapper.classList.remove("is-invalid");
      }

      if (error) {
        error.textContent = "";
      }
    });
  });

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    if (isLikelySpam()) {
      showAlert(
        "error",
        "Solicitud no enviada",
        "No pudimos validar el envío. Intente nuevamente en unos segundos."
      );
      return;
    }

    if (!validateForm()) {
      showAlert(
        "warning",
        "Revise el formulario",
        "Hay campos requeridos que deben corregirse antes de enviar."
      );
      return;
    }

    const payload = getPayload();

    form.classList.add("is-submitting");

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Enviando...";
    }

    try {
      await submitToEndpoint(payload);

      showAlert(
        "success",
        "Solicitud enviada",
        "Gracias por contactar a Art-Zac Welding. Revisaremos su proyecto y nos pondremos en contacto."
      );

      form.reset();

      if (startedAtInput) {
        startedAtInput.value = String(Date.now());
      }

      form.querySelectorAll(".form-field").forEach((field) => {
        field.classList.remove("is-valid", "is-invalid");
      });
    } catch (error) {
      if (error.message === "missing_endpoint") {
        showAlert(
          "info",
          "Formulario listo",
          "Falta configurar el endpoint de envío en data-endpoint. El diseño y las validaciones ya están activos."
        );
      } else {
        showAlert(
          "error",
          "No se pudo enviar",
          "Hubo un problema al enviar su solicitud. Intente nuevamente o contacte por WhatsApp."
        );
      }
    } finally {
      form.classList.remove("is-submitting");

      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "Enviar solicitud";
      }
    }
  });
})();

(function () {
  const links = document.querySelectorAll("[data-nav-link]");

  if (!links.length) {
    return;
  }

  const currentPath = window.location.pathname.split("/").pop() || "index.html";

  links.forEach((link) => {
    const linkPath = link.getAttribute("href");

    if (linkPath === currentPath) {
      link.setAttribute("aria-current", "page");
      link.classList.add("is-active");
    } else {
      link.removeAttribute("aria-current");
      link.classList.remove("is-active");
    }
  });
})();

(function () {
  const button = document.querySelector("[data-scroll-progress]");
  const value = document.querySelector("[data-scroll-progress-value]");
  const circle = document.querySelector("[data-scroll-progress-circle]");

  if (!button || !value || !circle) {
    return;
  }

  const radius = 28;
  const circumference = 2 * Math.PI * radius;

  circle.style.strokeDasharray = String(circumference);
  circle.style.strokeDashoffset = String(circumference);

  function updateScrollProgress() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;

    const progress = scrollableHeight > 0
      ? Math.min(100, Math.max(0, (scrollTop / scrollableHeight) * 100))
      : 0;

    const offset = circumference - (progress / 100) * circumference;

    circle.style.strokeDashoffset = String(offset);
    value.textContent = `${Math.round(progress)}%`;
  }

  button.addEventListener("click", function () {
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"
    });
  });

  window.addEventListener("scroll", updateScrollProgress, { passive: true });
  window.addEventListener("resize", updateScrollProgress);

  updateScrollProgress();
})();

(function () {
  const widget = document.querySelector("[data-whatsapp-widget]");
  const toggle = document.querySelector("[data-whatsapp-toggle]");
  const panel = document.querySelector("[data-whatsapp-panel]");

  if (!widget || !toggle || !panel) {
    return;
  }

  function closeWidget() {
    widget.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  }

  function openWidget() {
    widget.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
  }

  toggle.addEventListener("click", function () {
    const isOpen = widget.classList.contains("is-open");

    if (isOpen) {
      closeWidget();
    } else {
      openWidget();
    }
  });

  document.addEventListener("click", function (event) {
    if (!widget.contains(event.target)) {
      closeWidget();
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closeWidget();
      toggle.focus();
    }
  });
})();


(function () {
  const languageButtons = document.querySelectorAll("[data-language-option]");

  if (!languageButtons.length) {
    return;
  }

  function setCookie(name, value) {
    document.cookie = `${name}=${value}; path=/`;
    document.cookie = `${name}=${value}; path=/; domain=${window.location.hostname}`;
  }

  function clearTranslateCookie() {
    setCookie("googtrans", "");
    setCookie("googtrans", "/es/es");
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
    if (language === "es") {
      clearTranslateCookie();
      setActiveLanguage("es");
      window.location.reload();
      return;
    }

    setCookie("googtrans", `/es/${language}`);
    setActiveLanguage(language);
    window.location.reload();
  }

  languageButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const language = button.dataset.languageOption;

      if (!language) {
        return;
      }

      changeLanguage(language);
    });
  });

  setActiveLanguage(getCurrentLanguage());
})();