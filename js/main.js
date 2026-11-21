/* La Esquina · Triana — interacciones */
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

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
  // curva con "tirones", como una carga de juego de verdad
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
      revelarPortada();
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

  /* ---------- Portada: entrada escalonada tras la carga ---------- */
  function revelarPortada() {
    const ayuda = $('#ayuda');
    setTimeout(() => ayuda.classList.add('is-visible'), reduce ? 0 : 1500);
    setTimeout(() => ayuda.classList.remove('is-visible'), 7500);
    if (reduce || !Element.prototype.animate) return;
    const ease = 'cubic-bezier(.16,1,.3,1)';
    // viñetas del collage: entran de golpe, una a una
    $$('.collage .panel').forEach((el, i) => {
      el.animate(
        [{ opacity: 0, transform: 'scale(1.35)' }, { opacity: 1, transform: 'scale(1)' }],
        { duration: 520, delay: i * 110, easing: ease, fill: 'backwards' }
      );
    });
    $$('.hero .hud, .hero__texto > *, .hero__empezar').forEach((el, i) => {
      el.animate(
        [{ opacity: 0, translate: '0 26px' }, { opacity: 1, translate: '0 0' }],
        { duration: 750, delay: 520 + i * 95, easing: ease, fill: 'backwards' }
      );
    });
  }

  /* ---------- Subtítulo de objetivo (cambia por sección) ---------- */
  const objetivo = $('#objetivo');
  const objetivos = {
    pausa: 'Elige una opción del <b>menú</b>.',
    carta: 'Elige tu <b>tapa</b> del inventario.',
    misiones: 'Completa una <b>misión</b> y gana la recompensa.',
    fama: 'Comprueba tu <b>nivel de fama</b> en el barrio.',
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

  /* ---------- Entradas al hacer scroll ---------- */
  const revealIO = new IntersectionObserver((entradas) => {
    entradas.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); revealIO.unobserve(e.target); }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
  $$('.reveal').forEach((el) => revealIO.observe(el));

  /* ---------- Navegación: barra fija + opción activa ---------- */
  const pausebar = $('#pausebar');
  new IntersectionObserver(([e]) => {
    pausebar.classList.toggle('is-visible', !e.isIntersecting);
    objetivo.classList.toggle('is-visible', !e.isIntersecting);
  }, { threshold: 0 }).observe($('#inicio'));

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
  const seccionIO = new IntersectionObserver((entradas) => {
    entradas.forEach((e) => {
      if (!e.isIntersecting) return;
      if (e.target.id !== 'pausa') activar(alias[e.target.id] || e.target.id);
      ponerObjetivo(e.target.id);
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  $$('[data-seccion], #pausa').forEach((s) => seccionIO.observe(s));

  /* ---------- 6. Nivel de fama: estrellas + nota ---------- */
  const estrellas = $$('#famaEstrellas svg');
  const nota = $('#famaNota');
  const famaIO = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    famaIO.disconnect();
    estrellas.forEach((s, i) => setTimeout(() => s.classList.add('on'), reduce ? 0 : 200 + i * 260));
    if (reduce) return;
    const t0 = performance.now();
    const dur = 1500;
    const paso = (now) => {
      const t = Math.min((now - t0) / dur, 1);
      const v = 4.8 * (1 - Math.pow(1 - t, 3));
      nota.textContent = v.toFixed(1).replace('.', ',');
      if (t < 1) requestAnimationFrame(paso);
    };
    requestAnimationFrame(paso);
  }, { threshold: 0.5 });
  famaIO.observe($('#famaEstrellas'));

  /* ---------- Carrusel de reseñas ---------- */
  const pista = $('#carruselPista');
  const tarjetas = $$('.resena', pista);
  const puntos = $$('#carruselPuntos i');
  let actual = 0;
  let autoplay = !reduce;
  const marcar = (i) => puntos.forEach((p, j) => p.classList.toggle('on', j === i));
  marcar(0);
  // posición de scroll que deja la tarjeta i centrada
  const destino = (i) => tarjetas[i].offsetLeft - (pista.clientWidth - tarjetas[i].offsetWidth) / 2;
  pista.addEventListener('scroll', () => {
    let i = 0;
    tarjetas.forEach((_, j) => {
      if (Math.abs(destino(j) - pista.scrollLeft) < Math.abs(destino(i) - pista.scrollLeft)) i = j;
    });
    if (i !== actual) { actual = i; marcar(actual); }
  }, { passive: true });
  ['pointerdown', 'touchstart', 'wheel'].forEach((ev) =>
    pista.addEventListener(ev, () => { autoplay = false; }, { passive: true }));
  let visible = false;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0.6 }).observe(pista);
  setInterval(() => {
    if (!autoplay || !visible) return;
    const sig = (actual + 1) % tarjetas.length;
    pista.scrollTo({ left: destino(sig), behavior: 'smooth' });
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
  // si vuelven atrás desde WhatsApp, quitar la pantalla
  window.addEventListener('pageshow', () => { superada.hidden = true; });
})();
