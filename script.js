document.addEventListener("DOMContentLoaded", () => {
  
  // -------------------------------------------------------------
  // 1. Headline Option Switcher (A/B Test Switcher)
  // -------------------------------------------------------------
  const croButtons = document.querySelectorAll(".cro-btn");
  const headlines = document.querySelectorAll(".hero-title");

  croButtons.forEach(button => {
    button.addEventListener("click", () => {
      // Remove active class from buttons
      croButtons.forEach(btn => btn.classList.remove("active"));
      // Add active class to clicked button
      button.classList.add("active");

      const targetHeadlineId = `headline-${button.dataset.headline}`;

      // Transition headlines
      headlines.forEach(headline => {
        if (headline.id === targetHeadlineId) {
          headline.classList.add("active");
        } else {
          headline.classList.remove("active");
        }
      });
    });
  });

  // -------------------------------------------------------------
  // 2. Sticky Header & Mobile Nav
  // -------------------------------------------------------------
  const mobileMenuToggle = document.querySelector(".mobile-menu-toggle");
  const navLinks = document.querySelector(".nav-links");
  const header = document.querySelector(".sticky-nav");

  // Toggle mobile menu
  mobileMenuToggle.addEventListener("click", () => {
    mobileMenuToggle.classList.toggle("active");
    navLinks.classList.toggle("active");
  });

  // Close mobile menu when clicking navigation links
  const links = document.querySelectorAll(".nav-link");
  links.forEach(link => {
    link.addEventListener("click", () => {
      mobileMenuToggle.classList.remove("active");
      navLinks.classList.remove("active");
    });
  });

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
  // 3. Countdown Timer (Persistent 14-day loop via LocalStorage)
  // -------------------------------------------------------------
  const daysEl = document.getElementById("days");
  const hoursEl = document.getElementById("hours");
  const minutesEl = document.getElementById("minutes");
  const secondsEl = document.getElementById("seconds");

  // Check if countdown target exists in storage, if not, set to 14 days from now
  let targetDate = localStorage.getItem("vss_launch_offer_date");
  
  if (!targetDate) {
    // 14 days in milliseconds: 14 * 24 * 60 * 60 * 1000
    const fourteenDaysMs = 14 * 24 * 60 * 60 * 1000;
    const newTarget = new Date().getTime() + fourteenDaysMs;
    localStorage.setItem("vss_launch_offer_date", newTarget.toString());
    targetDate = newTarget;
  } else {
    targetDate = parseInt(targetDate, 10);
    // If target has already passed, reset to a new 14 days to keep offer active for new session
    if (targetDate < new Date().getTime()) {
      const fourteenDaysMs = 14 * 24 * 60 * 60 * 1000;
      const newTarget = new Date().getTime() + fourteenDaysMs;
      localStorage.setItem("vss_launch_offer_date", newTarget.toString());
      targetDate = newTarget;
    }
  }

  function updateTimer() {
    const now = new Date().getTime();
    const distance = targetDate - now;

    // Calculations for days, hours, minutes and seconds
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // Format single digits with a leading zero
    daysEl.textContent = String(days).padStart(2, '0');
    hoursEl.textContent = String(hours).padStart(2, '0');
    minutesEl.textContent = String(minutes).padStart(2, '0');
    secondsEl.textContent = String(seconds).padStart(2, '0');

    // If countdown finished
    if (distance < 0) {
      clearInterval(timerInterval);
      daysEl.textContent = "00";
      hoursEl.textContent = "00";
      minutesEl.textContent = "00";
      secondsEl.textContent = "00";
    }
  }

  // Update timer immediately, then run interval
  updateTimer();
  const timerInterval = setInterval(updateTimer, 1000);

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

});
