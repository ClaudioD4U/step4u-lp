/* Step4u — interações da landing (sem dependências).
   Tudo é melhoria progressiva: sem JS a página continua completa e navegável. */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(pointer: fine)').matches;

  /* ---------- Header: pílula escura ao sair do topo ---------- */
  var header = document.querySelector('.site-header');
  var ticking = false;
  function updateHeader() {
    header.classList.toggle('is-scrolled', window.scrollY > 10);
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(updateHeader); }
  }, { passive: true });
  updateHeader();

  /* ---------- Menu mobile ---------- */
  var toggle = document.querySelector('.menu-toggle');
  var menu = document.getElementById('menu');
  function setMenu(open) {
    header.classList.toggle('menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    toggle.querySelector('use').setAttribute('href', open ? '#i-close' : '#i-menu');
  }
  toggle.addEventListener('click', function () {
    setMenu(toggle.getAttribute('aria-expanded') !== 'true');
  });
  menu.addEventListener('click', function (e) {
    if (e.target.closest('a')) setMenu(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && header.classList.contains('menu-open')) { setMenu(false); toggle.focus(); }
  });

  /* ---------- Hero: brilho azul que acompanha o mouse ---------- */
  var hero = document.querySelector('.hero');
  var glow = document.querySelector('.hero-glow');
  if (hero && glow) {
    var size = 520;
    var rest = function () {
      // Repouso: centro na base do hero, com metade escondida.
      glow.style.transform = 'translate3d(' + (hero.clientWidth / 2 - size / 2) + 'px,' + (hero.clientHeight - size / 2) + 'px,0)';
    };
    rest();
    window.addEventListener('resize', rest, { passive: true });
    if (finePointer && !reduceMotion) {
      var frame = 0;
      hero.addEventListener('pointermove', function (e) {
        var r = hero.getBoundingClientRect();
        var x = e.clientX - r.left - size / 2;
        var y = e.clientY - r.top - size / 2;
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(function () {
          glow.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
        });
      }, { passive: true });
      hero.addEventListener('pointerleave', rest, { passive: true });
    }
  }

  /* ---------- Formulário de análise prévia ---------- */
  var form = document.querySelector('.lead-form');
  if (form) {
    var linkedin = form.querySelector('#lead-linkedin');
    var fileInput = form.querySelector('#lead-file');
    var drop = form.querySelector('.dropzone');
    var title = drop.querySelector('.dropzone-title');
    var hint = drop.querySelector('.dropzone-hint');
    var error = form.querySelector('#lead-error');
    var MAX = 5 * 1024 * 1024;
    var TYPES = /\.(pdf|docx?)$/i;
    var file = null;

    var accept = function (f) {
      if (!f) return;
      if (!TYPES.test(f.name)) { error.textContent = 'Envie o currículo em PDF, DOC ou DOCX.'; return; }
      if (f.size > MAX) { error.textContent = 'Arquivo acima do limite de 5 MB.'; return; }
      file = f;
      error.textContent = '';
      drop.classList.add('has-file');
      title.textContent = f.name;
      hint.textContent = 'Clique para trocar o arquivo';
    };

    fileInput.addEventListener('change', function () { accept(fileInput.files[0]); });
    ['dragenter', 'dragover'].forEach(function (t) {
      drop.addEventListener(t, function (e) { e.preventDefault(); drop.classList.add('is-over'); });
    });
    ['dragleave', 'drop'].forEach(function (t) {
      drop.addEventListener(t, function (e) { e.preventDefault(); drop.classList.remove('is-over'); });
    });
    drop.addEventListener('drop', function (e) { accept(e.dataTransfer && e.dataTransfer.files[0]); });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!/linkedin\.com\/in\/[^\/\s]+/i.test(linkedin.value.trim())) {
        error.textContent = 'Informe a URL do seu perfil, ex.: linkedin.com/in/seu-nome';
        linkedin.focus();
        return;
      }
      if (!file) { error.textContent = 'Anexe seu currículo para a análise.'; return; }
      error.textContent = '';
      // TODO: enviar LinkedIn + currículo para uma rota pública de leads quando
      // ela existir. Por enquanto leva ao cadastro (sem dados pessoais na URL).
      window.location.href = form.action + '?mode=signup';
    });
  }

  root.classList.add('js');
})();
