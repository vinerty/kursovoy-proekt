
(function () {
  'use strict';

  const STORAGE_PREFIX = 'artisanal_';

  function isFormFieldFocused() {
    const el = document.activeElement;
    if (!el) return false;
    if (el.isContentEditable) return true;
    return ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName);
  }

  function matchPhysicalKey(e, code) {
    return e.code === code;
  }

  function matchKeyChar(e, ...chars) {
    return chars.includes(e.key);
  }

  function saveFormData(key, data) {
    try {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
    } catch (e) {
      console.warn('localStorage недоступен', e);
    }
  }

  function loadFormData(key) {
    try {
      const raw = localStorage.getItem(STORAGE_PREFIX + key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  function initCustomCursor() {
    if (window.matchMedia('(max-width: 768px)').matches) {
      document.body.classList.add('no-custom-cursor');
      return;
    }

    const cursorDot = document.createElement('div');
    cursorDot.className = 'cursor-dot';
    const cursorRing = document.createElement('div');
    cursorRing.className = 'cursor-ring';
    document.body.appendChild(cursorDot);
    document.body.appendChild(cursorRing);

    let mouseX = 0, mouseY = 0;
    let ringX = 0, ringY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorDot.style.left = mouseX + 'px';
      cursorDot.style.top = mouseY + 'px';
    });

    function animateRing() {
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;
      cursorRing.style.left = ringX + 'px';
      cursorRing.style.top = ringY + 'px';
      requestAnimationFrame(animateRing);
    }
    animateRing();

    const interactive = 'a, button, .btn, input, textarea, select, .menu-item, .team-card, .menu-cat, .fab-cart, .mood-card__result--clickable';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(interactive)) {
        cursorRing.classList.add('is-hover');
      }
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(interactive)) {
        cursorRing.classList.remove('is-hover');
      }
    });
  }

  function initMouseGlow() {
    if (window.matchMedia('(max-width: 768px)').matches) return;

    const glow = document.createElement('div');
    glow.className = 'mouse-glow';
    document.body.appendChild(glow);

    document.addEventListener('mousemove', (e) => {
      glow.style.left = e.clientX + 'px';
      glow.style.top = e.clientY + 'px';
    });
  }

  function initHeader() {
    const header = document.querySelector('.header');
    if (!header) return;

    const burger = document.querySelector('.burger');
    const mobileNav = document.querySelector('.mobile-nav');

    window.addEventListener('scroll', () => {
      header.classList.toggle('is-scrolled', window.scrollY > 40);
    }, { passive: true });

    if (burger && mobileNav) {
      burger.addEventListener('click', () => {
        const isOpen = mobileNav.classList.toggle('is-open');
        burger.classList.toggle('is-open', isOpen);
        burger.setAttribute('aria-expanded', String(isOpen));
      });

      mobileNav.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
          mobileNav.classList.remove('is-open');
          burger.classList.remove('is-open');
          burger.setAttribute('aria-expanded', 'false');
        });
      });
    }
  }

  function initVideoVisibility() {
    const videos = document.querySelectorAll('video[data-autopause]');
    if (!videos.length) return;

    document.addEventListener('visibilitychange', () => {
      videos.forEach((v) => {
        if (document.hidden) {
          v.pause();
        } else {
          v.play().catch(() => {});
        }
      });
    });
  }

  function initModals() {
    const overlays = document.querySelectorAll('.modal-overlay');
    if (!overlays.length) return;

    function openModal(id) {
      const overlay = document.getElementById(id);
      if (!overlay) return;
      overlay.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }

    function closeModal(overlay) {
      overlay.classList.remove('is-open');
      document.body.style.overflow = '';
    }

    document.querySelectorAll('[data-modal-open]').forEach((btn) => {
      btn.addEventListener('click', () => openModal(btn.dataset.modalOpen));
    });

    overlays.forEach((overlay) => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModal(overlay);
      });
      overlay.querySelectorAll('[data-modal-close]').forEach((el) => {
        el.addEventListener('click', () => closeModal(overlay));
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.code === 'Escape' || e.key === 'Escape') {
        overlays.forEach((o) => {
          if (o.classList.contains('is-open')) closeModal(o);
        });
      }

      const isOrderKey =
        matchPhysicalKey(e, 'KeyO') || matchKeyChar(e, 'o', 'O', 'щ', 'Щ');
      if (isOrderKey && !isFormFieldFocused()) {
        openModal('modal-order');
      }
    });

    window.openModal = openModal;
    window.closeModalById = (id) => {
      const overlay = document.getElementById(id);
      if (overlay) closeModal(overlay);
    };
    window.openOrderModal = () => openModal('modal-order');
  }

  function initScrollReveal() {
    const items = document.querySelectorAll('.reveal');
    if (!items.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    items.forEach((el) => observer.observe(el));
  }

  function initParallax() {
    const parallaxEls = document.querySelectorAll('[data-parallax]');
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    if (!parallaxEls.length || isMobile || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      parallaxEls.forEach((el) => {
        const speed = parseFloat(el.dataset.parallax) || 0.3;
        el.style.transform = `translateY(${scrollY * speed}px)`;
      });
    }, { passive: true });
  }

  function initSkeletons() {
    document.querySelectorAll('[data-skeleton]').forEach((wrap) => {
      const delay = parseInt(wrap.dataset.skeleton, 10) || 1500;
      setTimeout(() => {
        wrap.classList.add('is-loaded');
      }, delay);
    });
  }

  function initLazyLoad() {
    const images = document.querySelectorAll('img[data-src]');
    if (!images.length) return;

    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const img = entry.target;
        img.src = img.dataset.src;
        if (img.dataset.srcset) img.srcset = img.dataset.srcset;
        img.removeAttribute('data-src');
        img.classList.add('is-loaded');
        imageObserver.unobserve(img);
      });
    }, { rootMargin: '100px' });

    images.forEach((img) => imageObserver.observe(img));
  }

  function calcFormProgress(form) {
    const fields = form.querySelectorAll('input, textarea, select');
    let filled = 0;
    let total = 0;
    fields.forEach((f) => {
      if (f.type === 'hidden' || f.disabled) return;
      total++;
      if (f.value.trim()) filled++;
    });
    return total ? Math.round((filled / total) * 100) : 0;
  }

  function bindFormPersistence(form, storageKey, options = {}) {
    const progressBar = options.progressBar;
    const progressText = options.progressText;
    const stepper = options.stepper;

    const saved = loadFormData(storageKey);
    if (saved) {
      Object.entries(saved).forEach(([name, value]) => {
        const field = form.querySelector(`[name="${name}"]`);
        if (field) field.value = value;
      });
    }

    function updateUI() {
      const data = {};
      form.querySelectorAll('input, textarea, select').forEach((f) => {
        if (f.name) data[f.name] = f.value;
      });
      saveFormData(storageKey, data);

      const pct = calcFormProgress(form);
      if (progressBar) {
        const fill = progressBar.querySelector('.form-progress-bar__fill');
        if (fill) fill.style.width = pct + '%';
      }
      if (progressText) progressText.textContent = `Заполнено: ${pct}%`;

      if (stepper) {
        const name = form.querySelector('[name="name"]')?.value.trim();
        const email = form.querySelector('[name="email"]')?.value.trim();
        const message = form.querySelector('[name="message"]')?.value.trim();
        const steps = stepper.querySelectorAll('.form-step');
        steps.forEach((s) => s.classList.remove('is-active', 'is-done'));

        if (name && email) {
          steps[0]?.classList.add('is-done');
          steps[1]?.classList.add('is-active');
        } else {
          steps[0]?.classList.add('is-active');
        }
        if (message && message.length > 10) {
          steps[1]?.classList.add('is-done');
          steps[2]?.classList.add('is-active');
        }

        const progressLine = stepper.querySelector('.form-stepper__progress');
        if (progressLine) progressLine.style.width = Math.min(pct, 100) + '%';
      }
    }

    form.addEventListener('input', updateUI);
    form.addEventListener('change', updateUI);
    updateUI();

    return updateUI;
  }

  function initOrderForm() {
    const form = document.getElementById('order-form');
    if (!form) return;

    const progressBar = document.getElementById('order-progress-bar');
    const progressText = document.getElementById('order-progress-text');

    bindFormPersistence(form, 'order', { progressBar, progressText });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn = form.querySelector('[type="submit"]');
      const prevLabel = submitBtn?.textContent;
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Отправка…';
      }

      const sent = await sendOrderToTelegram(form);

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = prevLabel || 'Отправить заказ';
      }

      if (!sent) {
        alert('Не удалось отправить заказ в Telegram. Проверьте интернет и настройки бота.');
        return;
      }

      saveFormData('order_submitted', { date: new Date().toISOString() });
      saveCart({ items: [] });
      document.dispatchEvent(new CustomEvent('cart-updated'));

      alert('Заказ отправлен! Мы свяжемся с вами в ближайшее время.');
      document.getElementById('modal-order')?.classList.remove('is-open');
      document.body.style.overflow = '';
    });
  }

  function initContactForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    const progressBar = document.getElementById('contact-progress-bar');
    const progressText = document.getElementById('contact-progress-text');
    const stepper = document.getElementById('contact-stepper');
    const statusSuccess = document.getElementById('status-success');
    const statusError = document.getElementById('status-error');

    bindFormPersistence(form, 'contact', { progressBar, progressText, stepper });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = form.querySelector('[name="name"]')?.value.trim();
      const email = form.querySelector('[name="email"]')?.value.trim();

      if (!name || !email) {
        statusError?.classList.add('is-visible');
        statusSuccess?.classList.remove('is-visible');
        return;
      }

      saveFormData('contact_submitted', { date: new Date().toISOString() });
      statusSuccess?.classList.add('is-visible');
      statusError?.classList.remove('is-visible');
    });

    form.addEventListener('keydown', (e) => {
      if ((e.code === 'Enter' || e.key === 'Enter') && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        form.requestSubmit();
      }
    });

    document.addEventListener('keydown', (e) => {
      if ((e.code === 'Escape' || e.key === 'Escape') && document.activeElement?.closest('#contact-form')) {
        form.reset();
        localStorage.removeItem(STORAGE_PREFIX + 'contact');
        bindFormPersistence(form, 'contact', { progressBar, progressText, stepper });
        statusSuccess?.classList.remove('is-visible');
        statusError?.classList.remove('is-visible');
      }
    });
  }

  function initNewsletterForms() {
    document.querySelectorAll('.newsletter-form').forEach((form, i) => {
      const input = form.querySelector('input[type="email"]');
      const key = 'newsletter_' + (form.dataset.page || i);
      const saved = loadFormData(key);
      if (saved?.email && input) input.value = saved.email;

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (input) saveFormData(key, { email: input.value });
        alert('Спасибо за подписку!');
      });

      input?.addEventListener('input', () => {
        saveFormData(key, { email: input.value });
      });
    });
  }

  function initCtaSubscribe() {
    const form = document.getElementById('cta-subscribe-form');
    if (!form) return;
    bindFormPersistence(form, 'cta_subscribe', {
      progressBar: document.getElementById('cta-progress-bar'),
      progressText: document.getElementById('cta-progress-text'),
    });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Вы подписаны на свежеобжаренные сорта!');
    });
  }

  const MENU_DRINKS = [
    'Колд брю медленного заваривания',
    'Кортадо на овсяном молоке',
    'Латте с карамелью',
    'Фирменный эспрессо',
    'Круассан на закваске',
  ];

  function initMoodGenerator() {
    const container = document.getElementById('mood-generator');
    if (!container) return;

    const resultEl = document.getElementById('mood-result');
    const generateBtn = document.getElementById('mood-generate-btn');
    const resultBtn = document.getElementById('mood-result-btn');

    const saved = loadFormData('mood');
    if (saved?.drink && resultEl) {
      resultEl.textContent = saved.drink;
    }

    function pickRandom(animate) {
      if (!resultEl || !MENU_DRINKS.length) return;

      let pick = MENU_DRINKS[Math.floor(Math.random() * MENU_DRINKS.length)];
      if (MENU_DRINKS.length > 1) {
        while (pick === resultEl.textContent.trim()) {
          pick = MENU_DRINKS[Math.floor(Math.random() * MENU_DRINKS.length)];
        }
      }

      const apply = () => {
        resultEl.textContent = pick;
        saveFormData('mood', { drink: pick });
      };

      if (animate) {
        resultEl.style.transition = 'opacity 0.2s ease';
        resultEl.style.opacity = '0';
        setTimeout(() => {
          apply();
          resultEl.style.opacity = '1';
        }, 200);
      } else {
        apply();
      }
    }

    generateBtn?.addEventListener('click', () => pickRandom(true));
    resultBtn?.addEventListener('click', () => pickRandom(true));
  }

  function initMenuCategories() {
    const cats = document.querySelectorAll('.menu-cat');

    const sections = document.querySelectorAll('.menu-content > section[data-category]');
    if (!cats.length) return;

    function showCategory(id) {
      cats.forEach((c) => c.classList.toggle('is-active', c.dataset.category === id));
      sections.forEach((s) => {
        s.hidden = s.dataset.category !== id;
      });
      saveFormData('menu_category', { category: id });
    }

    const saved = loadFormData('menu_category');
    showCategory(saved?.category || 'coffee');

    cats.forEach((cat) => {
      cat.addEventListener('click', () => showCategory(cat.dataset.category));
    });
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function parsePriceValue(priceText) {
    const match = priceText?.replace(/\s/g, '').match(/[\d.]+/);
    return match ? parseFloat(match[0]) : 0;
  }

  function formatRubles(amount) {
    return `${Math.round(amount).toLocaleString('ru-RU')} ₽`;
  }

  function escapeTelegramHtml(text) {
    return String(text ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function buildOrderTelegramMessage(form, cart) {
    const name = form.querySelector('[name="name"]')?.value.trim() || '—';
    const phone = form.querySelector('[name="phone"]')?.value.trim() || '—';
    const drink = form.querySelector('[name="drink"]')?.value.trim() || '—';
    const comment = form.querySelector('[name="comment"]')?.value.trim() || '—';

    let lines = [
      '<b>Новый заказ — Artisanal Roasts</b>',
      '',
      `<b>Имя:</b> ${escapeTelegramHtml(name)}`,
      `<b>Телефон:</b> ${escapeTelegramHtml(phone)}`,
      `<b>Напиток:</b> ${escapeTelegramHtml(drink)}`,
    ];

    if (cart?.items?.length) {
      lines.push('', '<b>Корзина:</b>');
      let total = 0;
      cart.items.forEach((item, i) => {
        total += item.priceNum || 0;
        lines.push(`${i + 1}. ${escapeTelegramHtml(item.title)} — ${escapeTelegramHtml(item.price)}`);
      });
      lines.push('', `<b>Итого:</b> ${escapeTelegramHtml(formatRubles(total))}`);
    }

    if (comment !== '—') {
      lines.push('', `<b>Комментарий:</b> ${escapeTelegramHtml(comment)}`);
    }

    lines.push('', `<i>${new Date().toLocaleString('ru-RU')}</i>`);
    return lines.join('\n');
  }

  function sendTelegramViaGet(text) {
    const cfg = window.TELEGRAM_CONFIG;
    if (!cfg?.botToken || !cfg?.chatId) return Promise.resolve(false);

    const url =
      `https://api.telegram.org/bot${cfg.botToken}/sendMessage` +
      `?chat_id=${encodeURIComponent(cfg.chatId)}` +
      `&parse_mode=HTML` +
      `&text=${encodeURIComponent(text)}`;

    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(true);
      img.src = url;
      setTimeout(() => resolve(true), 1200);
    });
  }

  async function sendOrderToTelegram(form) {
    const cfg = window.TELEGRAM_CONFIG;
    if (!cfg?.botToken || !cfg?.chatId) {
      console.warn('TELEGRAM_CONFIG не задан');
      return false;
    }

    const cart = getCart();
    const text = buildOrderTelegramMessage(form, cart);
    const apiUrl = `https://api.telegram.org/bot${cfg.botToken}/sendMessage`;

    try {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: cfg.chatId,
          text,
          parse_mode: 'HTML',
        }),
      });
      const data = await res.json();
      if (data.ok) return true;
    } catch {

    }

    return sendTelegramViaGet(text);
  }

  const MENU_PRICE_BY_TITLE = {
    'Колд брю медленного заваривания': 410,
    'Кортадо на овсяном молоке': 290,
    'Латте с карамелью': 370,
    'Фирменный эспрессо': 210,
    'Круассан на закваске': 230,
  };

  function normalizeCartItem(item) {
    let priceNum = MENU_PRICE_BY_TITLE[item.title];

    if (priceNum == null) {
      priceNum = typeof item.priceNum === 'number' ? item.priceNum : parsePriceValue(item.price);

      if (String(item.price || '').includes('$') || (priceNum > 0 && priceNum < 100)) {
        priceNum = MENU_PRICE_BY_TITLE[item.title] ?? Math.round(priceNum * 75);
      }
    }

    return {
      ...item,
      priceNum,
      price: formatRubles(priceNum),
    };
  }

  function getCart() {
    const saved = loadFormData('cart');
    if (!saved?.items || !Array.isArray(saved.items)) return { items: [] };

    const cart = { items: saved.items.map(normalizeCartItem) };
    const needsSave = saved.items.some((item, i) => item.price !== cart.items[i].price);
    if (needsSave) saveFormData('cart', cart);

    return cart;
  }

  function saveCart(cart) {
    saveFormData('cart', cart);
  }

  function initCart() {
    const fab = document.querySelector('.fab-cart');
    const cartModal = document.getElementById('modal-cart');
    if (!fab || !cartModal) return;

    const badge = fab.querySelector('.fab-cart__badge');
    const listEl = document.getElementById('cart-list');
    const emptyEl = document.getElementById('cart-empty');
    const totalEl = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('cart-checkout');
    const clearBtn = document.getElementById('cart-clear');

    function updateBadge() {
      const count = getCart().items.length;
      if (!badge) return;
      badge.textContent = String(count);
      badge.hidden = count === 0;
    }

    function renderCart() {
      const cart = getCart();
      if (!listEl || !totalEl || !emptyEl) return;

      if (cart.items.length === 0) {
        listEl.innerHTML = '';
        emptyEl.classList.remove('is-hidden');
        totalEl.textContent = '0 ₽';
        if (checkoutBtn) checkoutBtn.disabled = true;
        return;
      }

      emptyEl.classList.add('is-hidden');
      if (checkoutBtn) checkoutBtn.disabled = false;

      let total = 0;
      listEl.innerHTML = cart.items
        .map((item, index) => {
          total += item.priceNum;
          return `
            <li class="cart-item" data-index="${index}">
              <div class="cart-item__info">
                <span class="cart-item__title">${escapeHtml(item.title)}</span>
                <span class="cart-item__price">${escapeHtml(formatRubles(item.priceNum))}</span>
              </div>
              <button type="button" class="cart-item__remove" aria-label="Удалить">×</button>
            </li>`;
        })
        .join('');

      totalEl.textContent = formatRubles(total);

      listEl.querySelectorAll('.cart-item__remove').forEach((btn) => {
        btn.addEventListener('click', () => {
          const index = parseInt(btn.closest('.cart-item')?.dataset.index, 10);
          const current = getCart();
          if (Number.isNaN(index)) return;
          current.items.splice(index, 1);
          saveCart(current);
          updateBadge();
          renderCart();
        });
      });
    }

    function addToCart(card) {
      const title = card.querySelector('.menu-item__title')?.textContent?.trim();
      const priceEl = card.querySelector('.menu-item__price')?.textContent?.trim();
      if (!title || !priceEl) return;

      const priceNum = MENU_PRICE_BY_TITLE[title] ?? parsePriceValue(priceEl);
      const price = formatRubles(priceNum);

      const cart = getCart();
      cart.items.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        title,
        price,
        priceNum,
      });
      saveCart(cart);
      updateBadge();
      renderCart();

      card.classList.add('is-added');
      setTimeout(() => card.classList.remove('is-added'), 600);
    }

    document.querySelectorAll('.menu-grid [data-add]').forEach((card) => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.cart-item__remove')) return;
        addToCart(card);
      });
    });

    fab.addEventListener('click', () => renderCart());

    clearBtn?.addEventListener('click', () => {
      saveCart({ items: [] });
      updateBadge();
      renderCart();
    });

    checkoutBtn?.addEventListener('click', () => {
      const cart = getCart();
      if (!cart.items.length) return;

      const drinkSelect = document.getElementById('order-drink');
      const commentField = document.getElementById('order-comment');
      const summary = cart.items.map((i) => `${i.title} (${i.price})`).join(', ');

      if (drinkSelect && cart.items[0]) {
        const first = cart.items[0].title;
        const options = Array.from(drinkSelect.options);
        const match = options.find((o) => o.text === first);
        drinkSelect.value = match ? match.value : options[0]?.value;
      }
      if (commentField && !commentField.value.trim()) {
        commentField.value = `Заказ из корзины: ${summary}`;
      }

      window.closeModalById?.('modal-cart');
      window.openOrderModal?.();
    });

    document.addEventListener('cart-updated', () => {
      updateBadge();
      renderCart();
    });

    updateBadge();
    renderCart();
  }

  function initThreeJS() {
    const containers = document.querySelectorAll('[data-three]');
    if (!containers.length || typeof THREE === 'undefined') return;

    containers.forEach((container) => {
      const w = container.clientWidth || 180;
      const h = container.clientHeight || 180;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
      camera.position.z = 4;

      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(w, h);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      container.style.overflow = 'hidden';
      container.appendChild(renderer.domElement);

      const cupMat = new THREE.MeshStandardMaterial({
        color: 0xF5F0EB,
        roughness: 0.4,
        metalness: 0.1,
      });
      const coffeeMat = new THREE.MeshStandardMaterial({ color: 0x3D2314, roughness: 0.6 });

      const cupBody = new THREE.Mesh(
        new THREE.CylinderGeometry(0.55, 0.45, 0.9, 32, 1, true),
        cupMat
      );
      const coffee = new THREE.Mesh(
        new THREE.CylinderGeometry(0.5, 0.5, 0.15, 32),
        coffeeMat
      );
      coffee.position.y = 0.35;

      const handle = new THREE.Mesh(
        new THREE.TorusGeometry(0.22, 0.05, 8, 24, Math.PI),
        cupMat
      );
      handle.position.set(0.6, 0, 0);
      handle.rotation.z = -Math.PI / 2;

      const group = new THREE.Group();
      group.add(cupBody, coffee, handle);
      scene.add(group);

      const light1 = new THREE.DirectionalLight(0xffffff, 1);
      light1.position.set(2, 3, 4);
      scene.add(light1);
      scene.add(new THREE.AmbientLight(0xffffff, 0.5));

      let animating = true;
      document.addEventListener('visibilitychange', () => {
        animating = !document.hidden;
      });

      function animate() {
        requestAnimationFrame(animate);
        if (animating) group.rotation.y += 0.012;
        renderer.render(scene, camera);
      }
      animate();

      window.addEventListener('resize', () => {
        const nw = container.clientWidth || 180;
        const nh = container.clientHeight || 180;
        camera.aspect = nw / nh;
        camera.updateProjectionMatrix();
        renderer.setSize(nw, nh);
      });
    });
  }

  function initHotkeys() {
    document.addEventListener('keydown', (e) => {
      if (isFormFieldFocused()) return;

      const isMenuKey =
        matchPhysicalKey(e, 'KeyM') || matchKeyChar(e, 'm', 'M', 'ь', 'Ь');
      if (isMenuKey) {
        const menuLink = document.querySelector('a[href="menu.html"]');
        if (menuLink && !window.location.pathname.endsWith('menu.html')) {
          window.location.href = menuLink.href;
        }
      }
    });
  }

  function init() {
    initCustomCursor();
    initMouseGlow();
    initHeader();
    initVideoVisibility();
    initModals();
    initScrollReveal();
    initParallax();
    initSkeletons();
    initLazyLoad();
    initOrderForm();
    initContactForm();
    initNewsletterForms();
    initCtaSubscribe();
    initMoodGenerator();
    initMenuCategories();
    initCart();
    initHotkeys();

    if (typeof THREE !== 'undefined') {
      initThreeJS();
    } else {
      window.addEventListener('load', initThreeJS);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
