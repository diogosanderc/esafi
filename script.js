document.addEventListener('DOMContentLoaded', () => {
  const header = document.getElementById('site-header');
  const navToggle = document.getElementById('nav-toggle');

  if (navToggle && header) {
    navToggle.addEventListener('click', () => {
      header.classList.toggle('nav-open');
    });

    document.querySelectorAll('.main-nav a').forEach((link) => {
      link.addEventListener('click', () => {
        header.classList.remove('nav-open');
      });
    });
  }

  let lastScrollY = window.scrollY;
  if (header) {
    window.addEventListener('scroll', () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > header.offsetHeight) {
        header.classList.add('header-hidden');
        header.classList.remove('nav-open');
      } else {
        header.classList.remove('header-hidden');
      }
      lastScrollY = currentScrollY;
    }, { passive: true });
  }

  const scrollTopBtn = document.getElementById('scroll-top');
  if (scrollTopBtn) {
    scrollTopBtn.hidden = false;
    window.addEventListener('scroll', () => {
      scrollTopBtn.classList.toggle('is-visible', window.scrollY > 600);
    }, { passive: true });
    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  const countdownBar = document.getElementById('countdown-bar');
  if (countdownBar) {
    const eventDate = new Date('2026-11-04T07:30:00-03:00').getTime();
    const daysEl = document.getElementById('cd-days');
    const hoursEl = document.getElementById('cd-hours');
    const minutesEl = document.getElementById('cd-minutes');
    const secondsEl = document.getElementById('cd-seconds');
    const pad = (n) => String(n).padStart(2, '0');

    const tick = () => {
      const diff = eventDate - Date.now();
      if (diff <= 0) {
        daysEl.textContent = '00';
        hoursEl.textContent = '00';
        minutesEl.textContent = '00';
        secondsEl.textContent = '00';
        return;
      }
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      daysEl.textContent = pad(days);
      hoursEl.textContent = pad(hours);
      minutesEl.textContent = pad(minutes);
      secondsEl.textContent = pad(seconds);
    };

    tick();
    setInterval(tick, 1000);

    window.addEventListener('scroll', () => {
      countdownBar.classList.toggle('is-visible', window.scrollY > 200);
    }, { passive: true });
  }

  const bioModal = document.getElementById('bio-modal-overlay');
  if (bioModal) {
    const bioName = document.getElementById('bio-modal-name');
    const bioText = document.getElementById('bio-modal-text');
    const bioClose = document.getElementById('bio-modal-close');
    let hideTimer = null;

    const openBioModal = (card) => {
      clearTimeout(hideTimer);
      bioName.textContent = card.dataset.speakerName || '';
      bioText.textContent = card.dataset.speakerBio || '';
      bioModal.hidden = false;
      requestAnimationFrame(() => bioModal.classList.add('is-visible'));
    };

    document.querySelectorAll('.speaker-card[data-speaker-name]').forEach((card) => {
      card.addEventListener('click', () => openBioModal(card));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openBioModal(card);
        }
      });
    });

    bioClose.addEventListener('click', () => {
      clearTimeout(hideTimer);
      bioModal.classList.remove('is-visible');
      bioModal.hidden = true;
    });
    bioModal.addEventListener('click', (e) => {
      if (e.target === bioModal) {
        clearTimeout(hideTimer);
        bioModal.classList.remove('is-visible');
        bioModal.hidden = true;
      }
    });
  }

  document.querySelectorAll('[data-accordion]').forEach((item) => {
    const trigger = item.querySelector('.schedule-head, .faq-head');
    if (!trigger) return;
    trigger.addEventListener('click', () => {
      const isOpen = item.classList.toggle('is-open');
      trigger.setAttribute('aria-expanded', String(isOpen));
    });
  });

  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    revealEls.forEach((el) => observer.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  const infoModal = document.getElementById('info-modal-overlay');
  if (infoModal) {
    const modal = infoModal.querySelector('.modal');
    const form = document.getElementById('info-modal-form');
    const nameInput = document.getElementById('info-name');
    const phoneInput = document.getElementById('info-phone');
    const emailInput = document.getElementById('info-email');
    const successBox = document.getElementById('info-modal-success');
    const closeBtn = document.getElementById('info-modal-close');
    let lastFocused = null;

    const setError = (input, message) => {
      const errorEl = infoModal.querySelector(`[data-error-for="${input.id}"]`);
      input.classList.toggle('is-invalid', Boolean(message));
      if (errorEl) errorEl.textContent = message || '';
    };

    const openModal = () => {
      lastFocused = document.activeElement;
      infoModal.hidden = false;
      requestAnimationFrame(() => infoModal.classList.add('is-visible'));
      document.body.style.overflow = 'hidden';
      setTimeout(() => nameInput.focus(), 50);
    };

    const closeModal = () => {
      infoModal.classList.remove('is-visible');
      document.body.style.overflow = '';
      setTimeout(() => {
        infoModal.hidden = true;
        form.reset();
        form.hidden = false;
        successBox.hidden = true;
        [nameInput, phoneInput, emailInput].forEach((input) => setError(input, ''));
        if (lastFocused) lastFocused.focus();
      }, 250);
    };

    document.querySelectorAll('.js-open-info-modal').forEach((trigger) => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        openModal();
      });
    });

    closeBtn.addEventListener('click', closeModal);

    phoneInput.addEventListener('input', () => {
      const digits = phoneInput.value.replace(/\D/g, '').slice(0, 11);
      const ddd = digits.slice(0, 2);
      const local = digits.slice(2);
      const splitAt = local.length > 8 ? 5 : 4;
      let formatted = digits.length > 0 ? '(' + ddd : '';
      if (digits.length >= 3) formatted += ') ' + local.slice(0, splitAt);
      if (local.length > splitAt) formatted += '-' + local.slice(splitAt, splitAt + 4);
      phoneInput.value = formatted;
      setError(phoneInput, '');
    });

    const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    const isValidPhone = (value) => /^\(\d{2}\) \d{4,5}-\d{4}$/.test(value);

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let valid = true;

      if (!nameInput.value.trim()) {
        setError(nameInput, 'Informe seu nome.');
        valid = false;
      } else {
        setError(nameInput, '');
      }

      if (!isValidPhone(phoneInput.value)) {
        setError(phoneInput, 'WhatsApp inválido. Use (00) 0000-0000 ou (00) 00000-0000.');
        valid = false;
      } else {
        setError(phoneInput, '');
      }

      if (!isValidEmail(emailInput.value.trim())) {
        setError(emailInput, 'Informe um e-mail válido.');
        valid = false;
      } else {
        setError(emailInput, '');
      }

      if (!valid) return;

      const acData = new FormData();
      acData.append('u', '1');
      acData.append('f', '1');
      acData.append('s', '');
      acData.append('c', '0');
      acData.append('m', '0');
      acData.append('act', 'sub');
      acData.append('v', '2');
      acData.append('or', '702e5f6d-c13e-4b86-a4d0-b5f8e037017a');
      acData.append('fullname', nameInput.value.trim());
      acData.append('phone', '+55' + phoneInput.value.replace(/\D/g, ''));
      acData.append('email', emailInput.value.trim());

      fetch('https://esafi.activehosted.com/proc.php', {
        method: 'POST',
        mode: 'no-cors',
        keepalive: true,
        body: acData,
      }).catch(() => {});

      window.location.href = 'obrigado.html';
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId.length > 1) {
        const target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });
});
