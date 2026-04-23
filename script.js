'use strict';

/*  1. CURSOR GLOW (light follow)*/
(function initCursor() {
  const glow = document.getElementById('cursor-glow');
  if (!glow) return;

  // Desliga em touch
  if ('ontouchstart' in window) {
    glow.style.display = 'none';
    return;
  }

  let mx = -500, my = -500;
  let cx = -500, cy = -500;

  document.addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;
  });

  function animateCursor() {
    // Lerp suave
    cx += (mx - cx) * 0.12;
    cy += (my - cy) * 0.12;
    glow.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
    requestAnimationFrame(animateCursor);
  }

  animateCursor();
})();


/* 2. CANVAS DE PARTÍCULAS  */
(function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, particles;

  // Redimensiona
  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  resize();
  window.addEventListener('resize', () => {
    resize();
    initParticleList();
  });

  // Cria partículas
  function initParticleList() {
    const count = Math.floor((W * H) / 14000);  // densidade
    particles = [];

    for (let i = 0; i < count; i++) {
      particles.push(createParticle());
    }
  }

  function createParticle(startAtTop = false) {
    return {
      x:    Math.random() * W,
      y:    startAtTop ? H + 10 : Math.random() * H,
      r:    Math.random() * 1.6 + 0.4,       // raio 0.4–2
      vx:   (Math.random() - 0.5) * 0.3,     // deriva horizontal
      vy:   -(Math.random() * 0.4 + 0.15),   // sobe lentamente
      alpha: Math.random() * 0.5 + 0.1,
      pulse: Math.random() * Math.PI * 2,    // fase do pulso
      type: Math.random() < 0.15 ? 'gold' : 'purple', // 15% dourada
    };
  }

  initParticleList();

  // Loop de animação
  function draw() {
    ctx.clearRect(0, 0, W, H);

    particles.forEach((p, i) => {
      // Pulso de brilho
      p.pulse += 0.015;
      const alphaMod = p.alpha * (0.7 + 0.3 * Math.sin(p.pulse));

      // Cor
      if (p.type === 'gold') {
        ctx.fillStyle = `rgba(212, 175, 55, ${alphaMod})`;
      } else {
        ctx.fillStyle = `rgba(155, 77, 255, ${alphaMod})`;
      }

      // Desenha ponto
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();

      // Move
      p.x += p.vx;
      p.y += p.vy;

      // Recicla ao sair do topo
      if (p.y < -10) {
        particles[i] = createParticle(true);
        particles[i].y = H + 10;
      }

      // Recicla lateralmente
      if (p.x < -10)  p.x = W + 10;
      if (p.x > W + 10) p.x = -10;
    });

    requestAnimationFrame(draw);
  }

  draw();
})();


/* 3. HEADER — scroll behavior  */
(function initHeader() {
  const header = document.getElementById('header');
  if (!header) return;

  let lastY = 0;

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y > 60) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    lastY = y;
  }, { passive: true });
})();


/* 4. HAMBURGER — menu mobile  */
(function initHamburger() {
  const btn = document.getElementById('hamburger');
  const nav = document.getElementById('nav');
  if (!btn || !nav) return;

  btn.addEventListener('click', () => {
    const isOpen = btn.classList.toggle('open');
    nav.classList.toggle('open', isOpen);
    document.body.style.overflow = isOpen ? 'hidden' : '';
    btn.setAttribute('aria-expanded', isOpen);
  });

  // Fecha ao clicar em link
  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      btn.classList.remove('open');
      nav.classList.remove('open');
      document.body.style.overflow = '';
    });
  });
})();


/* 5. SCROLL REVEAL */
(function initScrollReveal() {
  const elements = document.querySelectorAll('[data-reveal]');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;

      const el = entry.target;
      const delay = parseInt(el.dataset.delay || '0', 10);

      setTimeout(() => {
        el.classList.add('revealed');
      }, delay);

      observer.unobserve(el);
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -60px 0px',
  });

  elements.forEach(el => observer.observe(el));
})();


/* 6. COUNTDOWN */
(function initCountdown() {
  // Pega (ou cria) data de expiração no localStorage
  const STORAGE_KEY = 'kitenem_expiry';
  let expiry = localStorage.getItem(STORAGE_KEY);

  if (!expiry) {
    // 3 dias a partir de agora
    expiry = Date.now() + 3 * 24 * 60 * 60 * 1000;
    localStorage.setItem(STORAGE_KEY, expiry);
  } else {
    expiry = parseInt(expiry, 10);
  }

  // Elementos do countdown principal (seção urgência)
  const cdDays  = document.getElementById('cd-days');
  const cdHours = document.getElementById('cd-hours');
  const cdMins  = document.getElementById('cd-mins');
  const cdSecs  = document.getElementById('cd-secs');

  // Elementos do countdown do CTA final
  const ctaDays  = document.getElementById('cta-cd-days');
  const ctaHours = document.getElementById('cta-cd-hours');
  const ctaMins  = document.getElementById('cta-cd-mins');
  const ctaSecs  = document.getElementById('cta-cd-secs');

  function pad(n) {
    return String(Math.max(0, n)).padStart(2, '0');
  }

  function update() {
    const diff = Math.max(0, expiry - Date.now());

    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);

    const vals = [pad(d), pad(h), pad(m), pad(s)];

    // Urgência
    if (cdDays)  animateNum(cdDays,  vals[0]);
    if (cdHours) animateNum(cdHours, vals[1]);
    if (cdMins)  animateNum(cdMins,  vals[2]);
    if (cdSecs)  animateNum(cdSecs,  vals[3]);

    // CTA final
    if (ctaDays)  ctaDays.textContent  = vals[0];
    if (ctaHours) ctaHours.textContent = vals[1];
    if (ctaMins)  ctaMins.textContent  = vals[2];
    if (ctaSecs)  ctaSecs.textContent  = vals[3];

    if (diff <= 0) {
      // Reset para mais 3 dias quando expirar
      expiry = Date.now() + 3 * 24 * 60 * 60 * 1000;
      localStorage.setItem(STORAGE_KEY, expiry);
    }
  }

  // Animação de flip no número (micro-interação)
  function animateNum(el, newVal) {
    if (el.textContent === newVal) return;
    el.style.transform = 'scale(1.2)';
    el.style.color = 'var(--gold-light)';
    el.textContent = newVal;
    setTimeout(() => {
      el.style.transform = '';
      el.style.color = '';
    }, 200);
  }

  update();
  setInterval(update, 1000);
})();


/*  7. CARD SHINE — mouse tracking*/
(function initCardShine() {
  const cards = document.querySelectorAll('.card--diamond');

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width)  * 100;
      const y = ((e.clientY - rect.top)  / rect.height) * 100;
      card.style.setProperty('--mouse-x', `${x}%`);
      card.style.setProperty('--mouse-y', `${y}%`);
    });
  });
})();


/*  8. VAGAS BAR — animate on scroll  */
(function initVagasBar() {
  const bar = document.querySelector('.vagas-bar__fill');
  if (!bar) return;

  const targetWidth = bar.style.width;
  bar.style.width = '0%';

  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      setTimeout(() => {
        bar.style.width = targetWidth;
      }, 300);
      observer.disconnect();
    }
  }, { threshold: 0.5 });

  observer.observe(bar.parentElement);
})();


/* 9. PALETA DE CORES (tooltip)  */
(function initPalette() {
  const toggle = document.getElementById('palette-toggle');
  const palette = document.getElementById('color-palette');
  if (!toggle || !palette) return;

  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    palette.classList.toggle('open');
  });

  document.addEventListener('click', () => {
    palette.classList.remove('open');
  });

  // Clique no swatch copia hex
  document.querySelectorAll('.swatch').forEach(swatch => {
    swatch.addEventListener('click', (e) => {
      e.stopPropagation();
      const hex = swatch.querySelector('span').textContent.trim();
      navigator.clipboard.writeText(hex).then(() => {
        const original = swatch.querySelector('span').textContent;
        swatch.querySelector('span').textContent = 'Copiado!';
        setTimeout(() => {
          swatch.querySelector('span').textContent = original;
        }, 1200);
      }).catch(() => {});
    });
  });
})();


/* 10. MOCKUP — tilt 3D suave  */
(function initMockupTilt() {
  const frame = document.querySelector('.mockup-frame');
  if (!frame) return;

  // Desliga em mobile
  if (window.innerWidth < 768) return;

  frame.addEventListener('mousemove', (e) => {
    const rect = frame.getBoundingClientRect();
    const cx = rect.left + rect.width  / 2;
    const cy = rect.top  + rect.height / 2;

    const dx = (e.clientX - cx) / (rect.width  / 2);  // -1 a 1
    const dy = (e.clientY - cy) / (rect.height / 2);  // -1 a 1

    const rotY = dx * 8;
    const rotX = -dy * 5;

    frame.style.transform = `perspective(1000px) rotateY(${rotY}deg) rotateX(${rotX}deg) translateY(-6px)`;
  });

  frame.addEventListener('mouseleave', () => {
    frame.style.transform = 'perspective(1000px) rotateY(-8deg) rotateX(3deg)';
  });
})();


/*  11. CHECKOUT SIMULADO  */
function goCheckout(event) {
  if (event) event.preventDefault();

  // Cria overlay de loading
  const overlay = document.createElement('div');
  overlay.style.cssText = `
    position: fixed; inset: 0; z-index: 9999;
    background: rgba(10,10,10,0.94);
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    gap: 20px;
    backdrop-filter: blur(20px);
    animation: fadeIn 0.3s ease;
  `;

  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
    @keyframes spin { to { transform: rotate(360deg) } }
    .checkout-spinner {
      width: 48px; height: 48px;
      border: 3px solid rgba(108,43,217,0.2);
      border-top-color: #9B4DFF;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
  `;
  document.head.appendChild(style);

  overlay.innerHTML = `
    <div class="checkout-spinner"></div>
    <p style="font-family: 'Syne',sans-serif; font-size: 1.1rem; color: #F5F5F5; font-weight: 700;">
      Redirecionando para o checkout…
    </p>
    <p style="font-size: 0.82rem; color: #A0A0A0;">
      Você será redirecionado em instantes
    </p>
  `;

  document.body.appendChild(overlay);

  setTimeout(() => {
    // Aqui você colocaria o link real do checkout
    window.location.href = 'https://pay.kiwify.com.br/Y3Xbo0Q';
    overlay.style.animation = 'fadeIn 0.3s ease reverse';
    setTimeout(() => overlay.remove(), 300);
  }, 1800);
}

// Expõe globalmente para uso no HTML onclick
window.goCheckout = goCheckout;


/*  12. SCROLL SUAVE nos links âncora  */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href === '#') return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      const offset = 80; // altura do header fixo
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();


/* 13. LAZY LOAD das imagens  */
(function initLazyImages() {
  if ('loading' in HTMLImageElement.prototype) {
    document.querySelectorAll('img').forEach(img => {
      img.setAttribute('loading', 'lazy');
    });
  }
})();
