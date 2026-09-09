document.addEventListener("DOMContentLoaded", () => {
  

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
  // 3. Countdown Timer (Universally Synchronized 5-day deadline across all devices & mobile)
  // -------------------------------------------------------------
  
  // Wipe all potential legacy storage keys from previous relative/auto-restart versions
  try {
    const legacyKeys = [
      "vss_launch_offer_date",
      "vss_launch_offer_date_v13_12_59",
      "vss_launch_offer_date_v5",
      "vss_timer_target",
      "countdown_timer_target",
      "launch_target_date"
    ];
    legacyKeys.forEach(k => localStorage.removeItem(k));
  } catch (e) {
    // Ignore if localStorage is disabled in private mode
  }

  // Fixed synchronized target deadline: Sept 14, 2026, 23:59:59 WAT (UTC+1) = 1789426799000 ms UTC
  // Using an exact millisecond timestamp avoids any mobile WebKit / Safari ISO date string parsing quirks.
  const COUNTDOWN_TARGET_TIMESTAMP = 1789426799000;

  // Track network time skew if client device clock is inaccurate
  let clientServerTimeOffset = 0;
  let timerInterval = null;

  // Query all timer elements across the page (supports multiple timer instances if present)
  function getTimerElements() {
    return {
      days: document.querySelectorAll("#days, [data-timer='days'], .time-days"),
      hours: document.querySelectorAll("#hours, [data-timer='hours'], .time-hours"),
      minutes: document.querySelectorAll("#minutes, [data-timer='minutes'], .time-minutes"),
      seconds: document.querySelectorAll("#seconds, [data-timer='seconds'], .time-seconds")
    };
  }

  function setElementValues(elements, val) {
    if (!elements || elements.length === 0) return;
    const strVal = String(val);
    elements.forEach(el => {
      if (el && el.textContent !== strVal) {
        el.textContent = strVal;
      }
    });
  }

  function updateTimer() {
    const els = getTimerElements();
    // Synchronized current time = local time + server offset (if computed)
    const now = Date.now() + clientServerTimeOffset;
    const distance = COUNTDOWN_TARGET_TIMESTAMP - now;

    // When countdown completes: stop at 00:00:00:00 permanently and do NOT restart
    if (distance <= 0) {
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
      setElementValues(els.days, "00");
      setElementValues(els.hours, "00");
      setElementValues(els.minutes, "00");
      setElementValues(els.seconds, "00");
      return;
    }

    // Exact calculations for days, hours, minutes, and seconds
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    setElementValues(els.days, String(days).padStart(2, "0"));
    setElementValues(els.hours, String(hours).padStart(2, "0"));
    setElementValues(els.minutes, String(minutes).padStart(2, "0"));
    setElementValues(els.seconds, String(seconds).padStart(2, "0"));
  }

  // Ensure timer loop is active and runs reliably
  function startOrResumeTimer() {
    updateTimer();
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    const now = Date.now() + clientServerTimeOffset;
    if (COUNTDOWN_TARGET_TIMESTAMP > now) {
      timerInterval = setInterval(updateTimer, 1000);
    }
  }

  // Synchronize with server time to eliminate any mobile device clock drift
  async function syncServerTimeOffset() {
    try {
      const startTime = Date.now();
      const response = await fetch(window.location.href, {
        method: "HEAD",
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" }
      });
      const serverDateHeader = response.headers.get("Date");
      if (serverDateHeader) {
        const endTime = Date.now();
        const roundTrip = endTime - startTime;
        const serverTime = new Date(serverDateHeader).getTime() + Math.round(roundTrip / 2);
        if (!isNaN(serverTime)) {
          clientServerTimeOffset = serverTime - endTime;
          updateTimer(); // Immediately re-apply synchronized skew
        }
      }
    } catch (e) {
      // Fall back gracefully to device time if offline or fetch restricted
    }
  }

  // Immediate execution on load
  startOrResumeTimer();
  syncServerTimeOffset();

  // Mobile Lifecycle & Sleep Resync Handlers:
  // Mobile Safari / Chrome pause JavaScript when phone locks or tab is backgrounded.
  // When user unlocks or returns to tab, these events immediately re-synchronize the timer!
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      startOrResumeTimer();
      syncServerTimeOffset();
    }
  });

  window.addEventListener("pageshow", (event) => {
    // Handles iOS Safari Back-Forward Cache (bfcache) restorations
    startOrResumeTimer();
    syncServerTimeOffset();
  });

  window.addEventListener("focus", () => {
    startOrResumeTimer();
  });

  window.addEventListener("online", () => {
    syncServerTimeOffset();
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
