/* La Esquina · Triana — interacciones */
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);

  /* ---------- 1. Pantalla de carga ---------- */
  const consejos = [
    'pide la tapa del día',
    'la segunda caña siempre sabe mejor',
    'las croquetas vuelan antes de las 14:00',
    'la terraza tiene las mejores vistas al río',
    'ven con 4 amigos y desbloquea una ronda',
  ];
  const loader = $('#loader');
  const fill = $('#loaderFill');
  const pct = $('#loaderPct');
  $('#loaderTip').textContent = consejos[Math.floor(Math.random() * consejos.length)];

  const DURACION = reduce ? 600 : 2600;
  const inicio = performance.now();
  const curva = (t) => {
    if (t < 0.35) return (t / 0.35) * 0.42;
    if (t < 0.55) return 0.42 + ((t - 0.35) / 0.2) * 0.08;
    if (t < 0.85) return 0.5 + ((t - 0.55) / 0.3) * 0.42;
    return 0.92 + ((t - 0.85) / 0.15) * 0.08;
  };
  let terminado = false;
  const acabar = () => {
    if (terminado) return;
    terminado = true;
    fill.style.width = '100%';
    pct.textContent = '100';
    setTimeout(() => {
      loader.classList.add('is-done');
      document.body.classList.remove('is-loading');
      entradaPortada();
      setTimeout(() => loader.remove(), 700);
    }, reduce ? 0 : 250);
  };
  const tick = (now) => {
    if (terminado) return;
    const t = Math.min((now - inicio) / DURACION, 1);
    const v = curva(t);
    fill.style.width = (v * 100).toFixed(1) + '%';
    pct.textContent = Math.round(v * 100);
    if (t < 1) requestAnimationFrame(tick); else acabar();
  };
  requestAnimationFrame(tick);
  loader.addEventListener('click', acabar); // tocar para saltar

  /* ---------- 2. Portada ---------- */
  const zoom = document.documentElement.classList.contains('zoom');
  const intro = $('#inicio');
  const ventana = $('#ventana');
  const mundo = $('#mundo');
  const pista = $('#introPista');
  const heroTexto = $('#heroTexto');
  const empezar = $('.hero__empezar');
  const ayuda = $('#ayuda');
  const barra = $('#barra');
  const objetivo = $('#objetivo');

  function entradaPortada() {
    if (reduce || !Element.prototype.animate) {
      ayuda.classList.add('is-visible');
      return;
    }
    const ease = 'cubic-bezier(.16,1,.3,1)';
    // el título-ventana aparece desde lejos
    if (zoom) {
      $('.ventana__texto').animate(
        [{ opacity: 0, transform: 'translateY(-4vh) scale(.7)' }, { opacity: 1, transform: 'translateY(-4vh) scale(1)' }],
        { duration: 900, easing: ease, fill: 'backwards' }
      );
    }
    $$('.hud, .hero__empezar').forEach((el, i) => {
      el.animate([{ opacity: 0, translate: '0 -14px' }, { opacity: 1, translate: '0 0' }],
        { duration: 700, delay: 400 + i * 120, easing: ease, fill: 'backwards' });
    });
    if (!zoom) setTimeout(() => ayuda.classList.add('is-visible'), 1200);
  }

  // punto de origen del zoom: el centro de la "I" de ESQUINA
  const origenVentana = () => {
    if (!zoom) return;
    ventana.style.transform = 'none';
    const r = $('#ventanaI').getBoundingClientRect();
    const v = ventana.getBoundingClientRect();
    ventana.style.transformOrigin = `${r.left - v.left + r.width / 2}px ${r.top - v.top + r.height * 0.55}px`;
  };

  let ayudaMostrada = false;
  const pintarIntro = () => {
    const recorrido = intro.offsetHeight - innerHeight;
    const p = recorrido > 0 ? clamp(-intro.getBoundingClientRect().top / recorrido) : 1;
    if (zoom) {
      const z = Math.pow(clamp(p / 0.6), 2.4);
      ventana.style.transform = `scale(${1 + z * 48})`;
      ventana.style.opacity = 1 - clamp((p - 0.42) / 0.16);
      ventana.style.visibility = p > 0.6 ? 'hidden' : 'visible';
      mundo.style.transform = `scale(${1.25 - 0.25 * easeOut(clamp(p / 0.7))})`;
      pista.style.opacity = 1 - clamp(p / 0.08);
      const t = easeOut(clamp((p - 0.58) / 0.22));
      heroTexto.style.opacity = t;
      heroTexto.style.transform = `translateY(${(1 - t) * 36}px)`;
      empezar.style.opacity = Math.max(1 - clamp(p / 0.06), t);
      if (p > 0.82 && !ayudaMostrada) {
        ayudaMostrada = true;
        ayuda.classList.add('is-visible');
        setTimeout(() => ayuda.classList.remove('is-visible'), 6000);
      }
    }
    // cabecera y objetivo: aparecen al terminar la portada
    const fuera = intro.getBoundingClientRect().bottom < innerHeight * 0.6;
    barra.classList.toggle('is-visible', fuera);
    objetivo.classList.toggle('is-visible', fuera);
  };

  /* ---------- Panorámica: acercamiento ligado al scroll ---------- */
  const panorama = $('#panorama');
  const panoArte = $('#panoramaArte');
  const pintarPanorama = () => {
    if (reduce) return;
    const r = panorama.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return;
    const q = clamp((innerHeight - r.top) / (innerHeight + r.height));
    panoArte.style.transform = `scale(${1.35 - 0.35 * easeOut(q)}) translateY(${(q - 0.5) * -30}px)`;
  };

  let pendiente = false;
  const alScroll = () => {
    if (pendiente) return;
    pendiente = true;
    requestAnimationFrame(() => { pendiente = false; pintarIntro(); pintarPanorama(); });
  };
  addEventListener('scroll', alScroll, { passive: true });
  addEventListener('resize', () => { origenVentana(); alScroll(); });
  document.fonts?.ready.then(() => { origenVentana(); pintarIntro(); });
  origenVentana();
  pintarIntro();
  pintarPanorama();

  /* ---------- Vídeos: solo se cargan y reproducen cuando están en pantalla ---------- */
  if (!reduce) {
    const videoIO = new IntersectionObserver((entradas) => {
      entradas.forEach((e) => {
        const v = e.target;
        if (e.isIntersecting) { v.preload = 'auto'; v.play().catch(() => {}); } else v.pause();
      });
    }, { rootMargin: '200px 0px' });
    $$('video[data-auto]').forEach((v) => videoIO.observe(v));
  }

  /* ---------- Entradas al hacer scroll ---------- */
  const revealIO = new IntersectionObserver((entradas) => {
    entradas.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); revealIO.unobserve(e.target); }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
  $$('.reveal').forEach((el) => revealIO.observe(el));

  /* ---------- Navegación: opción activa + subtítulo de objetivo ---------- */
  const enlaces = $$('[data-nav]');
  const alias = { fama: 'misiones' }; // las reseñas no tienen opción propia
  const activar = (id) => {
    enlaces.forEach((a) => {
      const on = a.dataset.nav === id;
      a.classList.toggle('is-active', on);
      if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
  };
  activar('carta'); // cursor por defecto del menú de pausa

  const objetivos = {
    pausa: 'Elige una opción del <b>menú</b>.',
    carta: 'Elige tu <b>tapa</b> del inventario.',
    misiones: 'Completa una <b>misión</b> y gana la recompensa.',
    fama: 'Comprueba tu <b>nivel de fama</b> en el barrio.',
    panorama: 'Explora <b>Triana</b>.',
    mapa: 'Sigue la ruta hasta la <i>calle Betis</i>.',
    reservar: 'Reserva tu <b>mesa</b> en La Esquina.',
  };
  let objetivoActual = '';
  const ponerObjetivo = (id) => {
    const txt = objetivos[id];
    if (!txt || id === objetivoActual) return;
    objetivoActual = id;
    objetivo.classList.add('is-cambio');
    setTimeout(() => { objetivo.innerHTML = txt; objetivo.classList.remove('is-cambio'); }, 150);
  };
  const seccionIO = new IntersectionObserver((entradas) => {
    entradas.forEach((e) => {
      if (!e.isIntersecting) return;
      const id = e.target.id;
      if (id !== 'pausa' && id !== 'panorama') activar(alias[id] || id);
      ponerObjetivo(id);
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  $$('[data-seccion], #pausa, #panorama').forEach((s) => seccionIO.observe(s));

  /* ---------- Menú de pausa a pantalla completa ---------- */
  const overlay = $('#pausaOverlay');
  const abrirBtn = $('#abrirPausa');
  const abrirPausa = () => { overlay.hidden = false; $('#cerrarPausa').focus(); };
  const cerrarPausa = () => { overlay.hidden = true; abrirBtn.focus(); };
  abrirBtn.addEventListener('click', abrirPausa);
  $('#cerrarPausa').addEventListener('click', cerrarPausa);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) cerrarPausa();
    if (e.target.closest('a')) overlay.hidden = true;
  });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && !overlay.hidden) cerrarPausa(); });

  /* ---------- 6. Nivel de fama: estrellas + nota ---------- */
  const estrellas = $$('#famaEstrellas svg');
  const nota = $('#famaNota');
  const famaIO = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    famaIO.disconnect();
    estrellas.forEach((s, i) => setTimeout(() => s.classList.add('on'), reduce ? 0 : 200 + i * 260));
    if (reduce) return;
    const t0 = performance.now();
    const paso = (now) => {
      const t = Math.min((now - t0) / 1500, 1);
      nota.textContent = (4.8 * easeOut(t)).toFixed(1).replace('.', ',');
      if (t < 1) requestAnimationFrame(paso);
    };
    requestAnimationFrame(paso);
  }, { threshold: 0.5 });
  famaIO.observe($('#famaEstrellas'));

  /* ---------- Carrusel de reseñas ---------- */
  const pistaC = $('#carruselPista');
  const tarjetas = $$('.resena', pistaC);
  const puntos = $$('#carruselPuntos i');
  let actual = 0;
  let autoplay = !reduce;
  const marcar = (i) => puntos.forEach((p, j) => p.classList.toggle('on', j === i));
  marcar(0);
  const destino = (i) => tarjetas[i].offsetLeft - (pistaC.clientWidth - tarjetas[i].offsetWidth) / 2;
  pistaC.addEventListener('scroll', () => {
    let i = 0;
    tarjetas.forEach((_, j) => {
      if (Math.abs(destino(j) - pistaC.scrollLeft) < Math.abs(destino(i) - pistaC.scrollLeft)) i = j;
    });
    if (i !== actual) { actual = i; marcar(actual); }
  }, { passive: true });
  ['pointerdown', 'touchstart', 'wheel'].forEach((ev) =>
    pistaC.addEventListener(ev, () => { autoplay = false; }, { passive: true }));
  let visible = false;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0.6 }).observe(pistaC);
  setInterval(() => {
    if (!autoplay || !visible) return;
    pistaC.scrollTo({ left: destino((actual + 1) % tarjetas.length), behavior: 'smooth' });
  }, 3200);

  /* ---------- 8. Reservar: ¡MISIÓN SUPERADA! y WhatsApp ---------- */
  const btn = $('#btnReservar');
  const superada = $('#superada');
  btn.addEventListener('click', (ev) => {
    ev.preventDefault();
    superada.hidden = false;
    if (navigator.vibrate) navigator.vibrate([40, 60, 80]);
    setTimeout(() => { window.location.href = btn.href; }, 1500);
  });
  window.addEventListener('pageshow', () => { superada.hidden = true; });
})();
