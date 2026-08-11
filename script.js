/* ==========================================================================
   EZEKIEL BADA - PORTFOLIO INTERACTIVITY ENGINE (VANILLA JS)
   Implements: Scroll reveals, mobile nav, custom gallery modal with swipe
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  
  /* --------------------------------------------------------------------------
     1. MOBILE NAVIGATION MENU
     -------------------------------------------------------------------------- */
  const menuToggle = document.querySelector('.mobile-menu-toggle');
  const mobileNav = document.getElementById('mobile-nav');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link, .cta-btn-mobile');
  
  if (menuToggle && mobileNav) {
    menuToggle.addEventListener('click', () => {
      const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', !isExpanded);
      mobileNav.classList.toggle('open');
      mobileNav.setAttribute('aria-hidden', isExpanded);
      
      // Toggle overflow hidden on body to prevent page scroll behind menu
      document.body.style.overflow = isExpanded ? 'auto' : 'hidden';
    });
    
    // Close mobile nav when links are clicked
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        menuToggle.setAttribute('aria-expanded', 'false');
        mobileNav.classList.remove('open');
        mobileNav.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = 'auto';
      });
    });
  }

  /* --------------------------------------------------------------------------
     2. SMOOTH SECTION NAVIGATION & STICKY NAV ACTIONS
     -------------------------------------------------------------------------- */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  
  function highlightNavigation() {
    const scrollY = window.pageYOffset;
    
    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      // Offset slightly to account for the sticky header height
      const sectionTop = current.offsetTop - 100;
      const sectionId = current.getAttribute('id');
      
      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }
  
  window.addEventListener('scroll', highlightNavigation);

  /* --------------------------------------------------------------------------
     3. INTERSECTION OBSERVER FOR SCROLL REVEALS
     -------------------------------------------------------------------------- */
  const revealElements = document.querySelectorAll('.scroll-reveal');
  
  if ('IntersectionObserver' in window && revealElements.length > 0) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          // Once elements are loaded and fade in, stop observing them
          observer.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      threshold: 0.15, // Trigger reveal when 15% visible
      rootMargin: '0px 0px -50px 0px' // Margins around root to trigger slightly early
    });
    
    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    // Fallback for older browsers
    revealElements.forEach(el => el.classList.add('revealed'));
  }

  /* --------------------------------------------------------------------------
     4. PROJECT LIGHTBOX / VIEWER CAROUSEL SYSTEM
     -------------------------------------------------------------------------- */
  const projectCards = document.querySelectorAll('.project-card');
  const viewerModal = document.getElementById('project-viewer');
  const viewerCloseBtn = document.getElementById('viewer-close-btn');
  const viewerSlider = document.getElementById('viewer-slider');
  const viewerActiveImage = document.getElementById('viewer-active-image');
  const viewerPrevBtn = document.getElementById('viewer-prev-btn');
  const viewerNextBtn = document.getElementById('viewer-next-btn');
  const viewerCounter = document.getElementById('viewer-counter');
  const thumbnailsContainer = document.getElementById('viewer-thumbnails-container');
  
  // Modal Data State
  const modalState = {
    title: '',
    cd: '',
    year: '',
    images: [],
    currentIndex: 0
  };

  // Touch Swipe Gesture State
  let touchStartX = 0;
  let touchEndX = 0;

  function initViewer() {
    projectCards.forEach(card => {
      card.addEventListener('click', () => {
        // Read card attributes
        modalState.title = card.getAttribute('data-title') || '[Project Title]';
        modalState.cd = card.getAttribute('data-cd') || '[Creative Direction]';
        modalState.year = card.getAttribute('data-year') || '[Year]';
        
        // Parse CSV images list
        const imagesCsv = card.getAttribute('data-images') || '';
        modalState.images = imagesCsv.split(',').map(img => img.trim()).filter(Boolean);
        modalState.currentIndex = 0;
        
        // Populate and open lightbox
        openLightbox();
      });
    });
    
    // Close events
    if (viewerCloseBtn) {
      viewerCloseBtn.addEventListener('click', closeLightbox);
    }
    
    const overlayBg = document.querySelector('.viewer-overlay-bg');
    if (overlayBg) {
      overlayBg.addEventListener('click', closeLightbox);
    }
    
    // Navigate events
    if (viewerPrevBtn) {
      viewerPrevBtn.addEventListener('click', showPrevSlide);
    }
    if (viewerNextBtn) {
      viewerNextBtn.addEventListener('click', showNextSlide);
    }
    
    // Keyboard keydown binds
    document.addEventListener('keydown', handleKeyboardControls);

    // Touch swipe gesture binds on the modal viewport
    if (viewerSlider) {
      viewerSlider.addEventListener('touchstart', handleTouchStart, { passive: true });
      viewerSlider.addEventListener('touchend', handleTouchEnd, { passive: true });
    }
  }

  function openLightbox() {
    if (!viewerModal) return;
    
    // Lock scroll on background page
    document.body.style.overflow = 'hidden';
    
    // Sync textual information
    document.querySelectorAll('#modal-project-title').forEach(el => {
      el.textContent = modalState.title;
    });
    const cdEl = document.getElementById('modal-project-cd');
    if (cdEl) cdEl.textContent = modalState.cd;
    const yearEl = document.getElementById('modal-project-year');
    if (yearEl) yearEl.textContent = modalState.year;
    
    // Build thumbnails block
    buildThumbnails();
    
    // Render first slide
    updateSlideDisplay();
    
    // Toggle active classes to fade modal in
    viewerModal.classList.add('active');
    viewerModal.setAttribute('aria-hidden', 'false');
    
    // Focus close button for keyboard trapping accessibility
    if (viewerCloseBtn) viewerCloseBtn.focus();
  }

  function closeLightbox() {
    if (!viewerModal) return;
    
    viewerModal.classList.remove('active');
    viewerModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = 'auto';
  }

  function buildThumbnails() {
    if (!thumbnailsContainer) return;
    thumbnailsContainer.innerHTML = '';
    
    // If only one image, hide thumbnails and navigation arrows
    if (modalState.images.length <= 1) {
      thumbnailsContainer.style.display = 'none';
      if (viewerPrevBtn) viewerPrevBtn.style.display = 'none';
      if (viewerNextBtn) viewerNextBtn.style.display = 'none';
      if (viewerCounter) viewerCounter.style.display = 'none';
      return;
    }
    
    thumbnailsContainer.style.display = 'flex';
    if (viewerPrevBtn) viewerPrevBtn.style.display = 'flex';
    if (viewerNextBtn) viewerNextBtn.style.display = 'flex';
    if (viewerCounter) viewerCounter.style.display = 'block';

    modalState.images.forEach((imgSrc, index) => {
      const thumb = document.createElement('img');
      thumb.src = imgSrc;
      thumb.alt = `${modalState.title} - Thumbnail ${index + 1}`;
      thumb.className = 'viewer-thumb';
      if (index === modalState.currentIndex) {
        thumb.classList.add('active');
      }
      
      thumb.addEventListener('click', () => {
        changeSlide(index);
      });
      
      thumbnailsContainer.appendChild(thumb);
    });
  }

  function changeSlide(index) {
    if (index < 0 || index >= modalState.images.length || index === modalState.currentIndex) return;
    
    modalState.currentIndex = index;
    updateSlideDisplay();
  }

  function updateSlideDisplay() {
    if (!viewerActiveImage || modalState.images.length === 0) return;
    
    const activeImageSrc = modalState.images[modalState.currentIndex];
    
    // Trigger smooth fade-out class, swap src, then fade-in
    viewerActiveImage.classList.add('fade-out');
    
    setTimeout(() => {
      viewerActiveImage.src = activeImageSrc;
      viewerActiveImage.alt = `${modalState.title} - Large Artwork Slide ${modalState.currentIndex + 1}`;
      viewerActiveImage.classList.remove('fade-out');
      
      // Update page index counter (e.g. 01 / 04)
      if (viewerCounter) {
        const curNum = String(modalState.currentIndex + 1).padStart(2, '0');
        const totNum = String(modalState.images.length).padStart(2, '0');
        viewerCounter.textContent = `${curNum} / ${totNum}`;
      }
      
      // Sync thumbnail active highlights
      const thumbs = document.querySelectorAll('.viewer-thumb');
      thumbs.forEach((th, idx) => {
        th.classList.toggle('active', idx === modalState.currentIndex);
        
        // Auto scroll thumbnails into viewport view if overflowing
        if (idx === modalState.currentIndex) {
          th.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
      });
    }, 250); // Matches transition CSS timeout
  }

  function showNextSlide() {
    if (modalState.images.length <= 1) return;
    
    // Loop back to start if at last page
    let nextIndex = modalState.currentIndex + 1;
    if (nextIndex >= modalState.images.length) {
      nextIndex = 0;
    }
    changeSlide(nextIndex);
  }

  function showPrevSlide() {
    if (modalState.images.length <= 1) return;
    
    // Loop back to end if at first page
    let prevIndex = modalState.currentIndex - 1;
    if (prevIndex < 0) {
      prevIndex = modalState.images.length - 1;
    }
    changeSlide(prevIndex);
  }

  /* Keyboard binds (Left, Right, ESC) */
  function handleKeyboardControls(e) {
    if (!viewerModal || !viewerModal.classList.contains('active')) return;
    
    if (e.key === 'Escape' || e.key === 'Esc') {
      closeLightbox();
    } else if (e.key === 'ArrowRight') {
      showNextSlide();
    } else if (e.key === 'ArrowLeft') {
      showPrevSlide();
    }
  }

  /* Mobile Swipe Gestures */
  function handleTouchStart(e) {
    touchStartX = e.changedTouches[0].screenX;
  }

  function handleTouchEnd(e) {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipeGesture();
  }

  function handleSwipeGesture() {
    const swipeThreshold = 55; // pixels
    
    if (touchEndX < touchStartX - swipeThreshold) {
      // Swipe Left -> Next
      showNextSlide();
    } else if (touchEndX > touchStartX + swipeThreshold) {
      // Swipe Right -> Prev
      showPrevSlide();
    }
  }

  // Fire modal controls initiation
  initViewer();
});
