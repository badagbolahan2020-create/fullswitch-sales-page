document.addEventListener("DOMContentLoaded", () => {
  

  // -------------------------------------------------------------
  // 2. Sticky Header & Mobile Nav
  // -------------------------------------------------------------
  const mobileMenuToggle = document.querySelector(".mobile-menu-toggle");
  const navLinks = document.querySelector(".nav-links");
  const header = document.querySelector(".sticky-nav");

  // Toggle mobile menu
  if (mobileMenuToggle && navLinks) {
    mobileMenuToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      mobileMenuToggle.classList.toggle("active");
      navLinks.classList.toggle("active");
    });

    // Close mobile menu when clicking outside
    document.addEventListener("click", (e) => {
      if (navLinks.classList.contains("active") && !navLinks.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
        mobileMenuToggle.classList.remove("active");
        navLinks.classList.remove("active");
      }
    });

    // Close mobile menu when clicking navigation links or mobile purchase button
    const links = document.querySelectorAll(".nav-link, .mobile-nav-cta");
    links.forEach(link => {
      link.addEventListener("click", () => {
        mobileMenuToggle.classList.remove("active");
        navLinks.classList.remove("active");
      });
    });
  }

  // Change header styling on scroll
  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      header.style.padding = "10px 0";
      header.style.background = "rgba(27, 42, 73, 0.9)";
      header.style.boxShadow = "0 4px 30px rgba(0, 0, 0, 0.2)";
    } else {
      header.style.padding = "16px 0";
      header.style.background = "rgba(27, 42, 73, 0.7)";
      header.style.boxShadow = "none";
    }
  });


  // -------------------------------------------------------------
  // 4. FAQ Accordion
  // -------------------------------------------------------------
  const accordionTriggers = document.querySelectorAll(".accordion-trigger");

  accordionTriggers.forEach(trigger => {
    trigger.addEventListener("click", () => {
      const accordionItem = trigger.parentElement;
      const panel = trigger.nextElementSibling;
      const isActive = accordionItem.classList.contains("active");

      // Close all other panels
      document.querySelectorAll(".accordion-item").forEach(item => {
        item.classList.remove("active");
        item.querySelector(".accordion-panel").style.maxHeight = null;
        item.querySelector(".accordion-panel").style.opacity = "0";
      });

      // Toggle current panel
      if (!isActive) {
        accordionItem.classList.add("active");
        panel.style.maxHeight = panel.scrollHeight + "px";
        panel.style.opacity = "1";
      }
    });
  });

  // -------------------------------------------------------------
  // 5. Reveal Elements on Scroll
  // -------------------------------------------------------------
  const revealElements = document.querySelectorAll(".scroll-reveal");

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        // Stop observing once animated in
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px" // Triggers slightly before element is fully in view
  });

  revealElements.forEach(element => {
    revealObserver.observe(element);
  });

  // -------------------------------------------------------------
  // 6. Background Blobs Parallax Scroll Effect
  // -------------------------------------------------------------
  const blobs = document.querySelectorAll(".bg-blob");
  
  // Assign individual scroll speed coefficients (alternating directions for depth)
  blobs.forEach((blob, index) => {
    const speeds = [0.15, -0.1, 0.2, -0.15, 0.1, -0.08, 0.18];
    blob.dataset.speed = speeds[index % speeds.length];
  });

  window.addEventListener("scroll", () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    blobs.forEach(blob => {
      const speed = parseFloat(blob.dataset.speed) || 0.1;
      const yOffset = scrollTop * speed;
      blob.style.setProperty("--scroll-offset", `${yOffset}px`);
    });
  });
});
