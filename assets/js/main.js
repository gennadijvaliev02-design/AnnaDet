/**
 * Anna Detailing — Interactive Controllers
 * Zero-Build Vanilla JavaScript
 * Modules: BookingModalController, BeforeAfterSliderController, MobileNavigationController
 * Strict Zero-Emoji Rule enforced
 */

(function () {
  'use strict';

  // =========================================================================
  // Booking Modal Controller (Zero Screen Auto-Scroll Guaranteed)
  // =========================================================================
  const BookingModal = {
    modal: null,
    dialog: null,
    backdrop: null,
    isOpen: false,
    closeTimer: null,
    previousScrollY: 0,

    init() {
      this.modal = document.getElementById('booking-modal');
      if (!this.modal) return;

      this.dialog = this.modal.querySelector('[data-modal-dialog]');
      this.backdrop = this.modal.querySelector('[data-modal-backdrop]');

      // Attach click listeners to all booking CTA triggers
      const triggers = document.querySelectorAll('[data-modal-target="booking"]');
      triggers.forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const preselect = btn.getAttribute('data-preselect');
          this.open(preselect);
        });
      });

      // Attach close listeners
      const closeButtons = this.modal.querySelectorAll('[data-modal-close]');
      closeButtons.forEach((btn) => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          this.close();
        });
      });

      // Backdrop dismissal
      if (this.backdrop) {
        this.backdrop.addEventListener('click', (e) => {
          e.preventDefault();
          this.close();
        });
      }

      // Escape key dismissal
      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen) {
          this.close();
        }
      });

      // Interactive inquiry form submission handling
      const form = document.getElementById('booking-inquiry-form');
      const successBox = document.getElementById('modal-success-message');

      if (form) {
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          if (!form.reportValidity()) return;
          const services = { polishing: 'Полировка кузова', wrap: 'Оклейка PPF', ceramic: 'Керамика 9H', dryclean: 'Химчистка салона' };
          const service = form.querySelector('input[name="service"]:checked');
          const message = [
            'Анна, здравствуйте! Хочу записаться на детейлинг.',
            `Услуга: ${services[service?.value] || 'Консультация'}`,
            `Имя: ${document.getElementById('client-name').value.trim()}`,
            `Контакт: ${document.getElementById('client-phone').value.trim()}`,
            `Автомобиль: ${document.getElementById('client-car').value.trim() || 'Уточню в переписке'}`
          ].join('\n');
          const url = `https://t.me/annaplv?text=${encodeURIComponent(message)}`;
          if (successBox) {
            successBox.replaceChildren(document.createTextNode('Отправьте подготовленное сообщение Анне в Telegram. Запись подтверждается в переписке. '));
            const link = document.createElement('a');
            link.href = url;
            link.textContent = 'Открыть Telegram';
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            successBox.append(link);
            successBox.classList.remove('hidden');
          }
          window.open(url, '_blank', 'noopener,noreferrer');
        });
      }
    },

    open(serviceKey) {
      if (this.closeTimer) {
        clearTimeout(this.closeTimer);
        this.closeTimer = null;
      }

      if (this.isOpen) return;

      // Capture exact scroll position to ensure zero jumping
      this.previousScrollY = window.scrollY;
      this.previousFocus = document.activeElement;

      // Compensate scrollbar width to prevent desktop layout shift
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
      document.body.style.overflow = 'hidden';

      // Pre-select service radio chip if attribute passed
      if (serviceKey) {
        const targetRadio = this.modal.querySelector(`input[name="service"][value="${serviceKey}"]`);
        if (targetRadio) {
          targetRadio.checked = true;
        }
      }

      // Show modal container
      this.modal.classList.remove('hidden');
      // Force layout reflow for CSS transition
      void this.modal.offsetHeight;

      // Trigger scale & opacity transition
      this.modal.classList.remove('opacity-0', 'pointer-events-none');
      this.modal.classList.add('opacity-100', 'pointer-events-auto');

      if (this.dialog) {
        this.dialog.classList.remove('scale-95');
        this.dialog.classList.add('scale-100');
      }

      this.modal.setAttribute('aria-hidden', 'false');
      this.isOpen = true;
      this.modal.querySelector('[data-modal-close]')?.focus({ preventScroll: true });
      this.modal.onkeydown = (event) => {
        if (event.key !== 'Tab') return;
        const items = Array.from(this.modal.querySelectorAll('a[href], button, input')).filter(el => !el.disabled && el.getClientRects().length);
        const first = items[0], last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      };

      // Re-assert scroll position in case of browser anchor quirk
      if (window.scrollY !== this.previousScrollY) {
        window.scrollTo(0, this.previousScrollY);
      }
    },

    close() {
      if (!this.isOpen) return;

      if (this.closeTimer) {
        clearTimeout(this.closeTimer);
      }
      this.isOpen = false;

      // Transition out
      this.modal.classList.remove('opacity-100', 'pointer-events-auto');
      this.modal.classList.add('opacity-0', 'pointer-events-none');

      if (this.dialog) {
        this.dialog.classList.remove('scale-100');
        this.dialog.classList.add('scale-95');
      }

      this.closeTimer = setTimeout(() => {
        this.modal.classList.add('hidden');
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        this.modal.setAttribute('aria-hidden', 'true');
        this.previousFocus?.focus({ preventScroll: true });
        this.closeTimer = null;
      }, 250);
    }
  };

  // =========================================================================
  // Interactive Before / After Paint Correction Slider
  // =========================================================================
  const BeforeAfterSlider = {
    rangeInput: null,
    beforeImg: null,
    divider: null,

    init() {
      this.rangeInput = document.getElementById('slider-range-input');
      this.beforeImg = document.getElementById('slider-before-img');
      this.divider = document.getElementById('slider-divider');

      if (!this.rangeInput || !this.beforeImg || !this.divider) return;

      const updateSlider = (value) => {
        const val = Math.min(100, Math.max(0, parseFloat(value)));
        this.beforeImg.style.clipPath = `polygon(0 0, ${val}% 0, ${val}% 100%, 0 100%)`;
        this.divider.style.left = `${val}%`;
      };

      // Native range event listeners (mouse, touch drag, keyboard arrow keys)
      this.rangeInput.addEventListener('input', (e) => updateSlider(e.target.value));
      this.rangeInput.addEventListener('change', (e) => updateSlider(e.target.value));

      // Initial alignment at 50%
      updateSlider(this.rangeInput.value || 50);
    }
  };

  // =========================================================================
  // Mobile Navigation Menu Controller
  // =========================================================================
  const MobileNavigation = {
    menuBtn: null,
    menuDropdown: null,
    isOpen: false,

    init() {
      this.menuBtn = document.getElementById('mobile-menu-btn');
      this.menuDropdown = document.getElementById('mobile-nav-menu');

      if (!this.menuBtn || !this.menuDropdown) return;

      this.menuBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggle();
      });

      // Close menu when a navigation anchor is clicked
      const navLinks = this.menuDropdown.querySelectorAll('a[href^="#"]');
      navLinks.forEach((link) => {
        link.addEventListener('click', () => {
          this.close();
        });
      });
    },

    toggle() {
      if (this.isOpen) {
        this.close();
      } else {
        this.open();
      }
    },

    open() {
      this.menuDropdown.classList.remove('hidden');
      this.isOpen = true;
      this.menuBtn.setAttribute('aria-expanded', 'true');
    },

    close() {
      this.menuDropdown.classList.add('hidden');
      this.isOpen = false;
      this.menuBtn.setAttribute('aria-expanded', 'false');
    }
  };

  // =========================================================================
  // Document Initialization
  // =========================================================================
  function initPhotoViewer() {
    const viewer = document.createElement('dialog');
    viewer.className = 'photo-viewer';
    viewer.setAttribute('aria-label', 'Просмотр фотографии целиком');
    viewer.innerHTML = '<button type="button" class="photo-close" aria-label="Закрыть фотографию">×</button><figure><img alt=""><figcaption></figcaption></figure><a class="photo-original" target="_blank" rel="noopener noreferrer">Открыть файл фотографии</a>';
    document.body.append(viewer);
    viewer.querySelector('button').addEventListener('click', () => viewer.close());
    viewer.addEventListener('click', event => { if (event.target === viewer) viewer.close(); });
    let previousOverflow = '';
    viewer.addEventListener('close', () => { document.body.style.overflow = previousOverflow; });
    document.querySelectorAll('img').forEach(img => {
      if (img.closest('#slider-wrapper, .photo-viewer')) return;
      const link = document.createElement('a');
      link.href = img.src;
      link.className = 'photo-link';
      link.setAttribute('aria-label', `Посмотреть целиком: ${img.alt}`);
      img.replaceWith(link);
      link.append(img);
      link.addEventListener('click', event => {
        event.preventDefault();
        viewer.querySelector('img').src = img.src;
        viewer.querySelector('img').alt = img.alt;
        viewer.querySelector('figcaption').textContent = img.alt;
        viewer.querySelector('a').href = img.src;
        previousOverflow = document.body.style.overflow;
        viewer.showModal();
        document.body.style.overflow = 'hidden';
      });
    });
  }

  function initApp() {
    BookingModal.init();
    BeforeAfterSlider.init();
    MobileNavigation.init();
    initPhotoViewer();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
})();
