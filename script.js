'use strict';

/* =====================================================
   1. DATOS
   Para añadir un personaje, copia una entrada de PERSONAJES.
   ===================================================== */
const PERSONAJES = {
  ignis:  { nombre: 'Ignis',  tipo: 'fuego',  color: '#ff6b4a', vida: 100, aura: 60, ataque: 14, defensa: 8,  ataques: ['explosion', 'palma', 'esfera'] },
  glacia: { nombre: 'Glacia', tipo: 'hielo',  color: '#22d3ee', vida: 115, aura: 60, ataque: 12, defensa: 11, ataques: ['baile', 'onda', 'doble'] },
  voltar: { nombre: 'Voltar', tipo: 'rayo',   color: '#fde68a', vida: 90,  aura: 70, ataque: 15, defensa: 7,  ataques: ['onda', 'palma', 'doble'] },
  umbra:  { nombre: 'Umbra',  tipo: 'sombra', color: '#d946ef', vida: 95,  aura: 65, ataque: 13, defensa: 9,  ataques: ['eclipse', 'baile', 'explosion'] }
};

// Catálogo de ataques. 'anim' elige la animación en ANIMS; 'apoyo' marca técnicas sin daño.
// Inspirados en técnicas clásicas de anime, Pokémon y Smash: esferas de aura, palmas de fuerza,
// rayos de energía, imágenes residuales y explosiones.
const ATAQUES = {
  esfera:    { nombre: 'Esfera de aura',         coste: 20, mult: 1.5, anim: 'proyectil', desc: 'Bola de energía veloz' },
  onda:      { nombre: 'Onda de energía',        coste: 35, mult: 2.2, anim: 'rayo',      desc: 'Rayo continuo de aura' },
  palma:     { nombre: 'Palma de fuerza',        coste: 15, mult: 1.3, anim: 'palma',     desc: 'Embestida con onda de choque' },
  explosion: { nombre: 'Explosión (estilo Megumin)', coste: 50, mult: 3.2, anim: 'explosion', agota: true, desc: 'Daño enorme, pero te deja agotado' },
  baile:     { nombre: 'Baile hipnótico',        coste: 25, apoyo: 'baile', anim: 'baile', desc: 'Sube 2 niveles de aura e hipnotiza al rival' },
  doble:     { nombre: 'Imagen residual',        coste: 20, apoyo: 'doble', anim: 'doble', desc: 'Esquiva el próximo golpe' },
  eclipse:   { nombre: 'Eclipse vampírico',      coste: 40, mult: 1.7, robaVida: 0.5, anim: 'eclipse', desc: 'Roba la mitad del daño como vida' }
};

// Ventajas de tipo: la clave vence al valor (sombra es neutral)
const VENTAJAS = { fuego: 'hielo', hielo: 'rayo', rayo: 'fuego' };
const NIVEL_MAX = 5;
const PROB_CRITICO = 0.12;

/* =====================================================
   2. UTILIDADES
   ===================================================== */
const $ = (sel) => document.querySelector(sel);
const pausa = (ms) => new Promise((r) => setTimeout(r, ms));
// Estilo visual de cada luchador (colores, peinado y detalles). Se usa en figuraSVG().
// En 'atras', PELO se sustituye por el color del pelo.
const ESTILOS = {
  ignis: { piel:'#f1b98a', pelo:'#ff8a1f', gi:'#d9381e', pant:'#7f1d1d', cinto:'#fde68a', botas:'#2b0a0a', ojos:'#ff3b1f',
    pelop:'M42 46 L34 16 L48 28 L50 0 L60 24 L72 2 L72 28 L86 14 L80 46 Q60 30 42 46Z', atras:'', frente:'' },
  glacia: { piel:'#f5cba7', pelo:'#bff3ff', gi:'#0e7490', pant:'#164e63', cinto:'#e0fbff', botas:'#0b2a35', ojos:'#22d3ee',
    pelop:'M42 46 Q40 22 62 22 Q84 24 80 46 Q70 34 58 36 Q50 36 42 46Z',
    atras:'<path class="o" d="M46 30 Q14 30 8 72 Q28 52 50 44Z" fill="PELO"/>',
    frente:'<path d="M43 35 Q60 29 77 35 L77 40 Q60 34 43 40Z" fill="#e0fbff"/>' },
  voltar: { piel:'#f1c27d', pelo:'#ffe45c', gi:'#1d4ed8', pant:'#1e3a8a', cinto:'#fde68a', botas:'#111827', ojos:'#facc15',
    pelop:'M42 46 L28 26 L46 30 L42 6 L56 24 L64 0 L70 26 L90 10 L80 34 L90 44 Q62 30 42 46Z', atras:'', frente:'' },
  umbra: { piel:'#e8b8a0', pelo:'#3b1d6e', gi:'#581c87', pant:'#1f0b3d', cinto:'#d946ef', botas:'#12061f', ojos:'#f0abfc',
    pelop:'M42 46 Q40 22 62 21 Q84 22 80 46 Q66 32 42 46Z',
    atras:'<path class="o" d="M46 76 Q8 100 6 152 Q30 132 52 122Z" fill="#7e22ce"/><path class="o" d="M46 28 L2 38 L42 46Z M48 22 L10 12 L46 36Z" fill="PELO"/>',
    frente:'' }
};

// Dibuja un guerrero de estilo anime en posición de combate (mirando a la derecha)
function figuraSVG(id) {
  const e = ESTILOS[id] || ESTILOS.ignis;
  return `<svg viewBox="0 0 140 200" aria-hidden="true">
    ${e.atras.replaceAll('PELO', e.pelo)}
    <path class="o" d="M40 120 L20 172 L36 178 L56 126Z" fill="${e.pant}"/>
    <path class="o" d="M14 170 L38 177 L36 188 L10 184Z" fill="${e.botas}"/>
    <path d="M42 78 L24 94" stroke="${e.gi}" stroke-width="14" stroke-linecap="round"/>
    <path d="M24 94 L28 112" stroke="${e.piel}" stroke-width="10" stroke-linecap="round"/>
    <circle cx="28" cy="115" r="7" fill="${e.piel}"/>
    <path class="o" d="M38 72 L82 72 L86 120 L34 120Z" fill="${e.gi}"/>
    <path class="o" d="M52 72 L68 72 L60 90Z" fill="${e.piel}"/>
    <circle cx="60" cy="102" r="5" fill="${e.cinto}" opacity=".9"/>
    <rect class="o" x="33" y="112" width="54" height="9" fill="${e.cinto}"/>
    <path class="o" d="M70 121 L76 140 L82 138 L78 121Z" fill="${e.cinto}"/>
    <path class="o" d="M62 122 L84 150 L84 178 L100 178 L102 146 L82 118Z" fill="${e.pant}"/>
    <path class="o" d="M82 176 L108 176 L110 188 L82 188Z" fill="${e.botas}"/>
    <rect x="53" y="60" width="14" height="16" fill="${e.piel}"/>
    <ellipse class="o" cx="60" cy="46" rx="16" ry="19" fill="${e.piel}"/>
    <path d="M49 41 L58 44 M62 44 L71 41" stroke="#07041a" stroke-width="2.6" stroke-linecap="round"/>
    <ellipse cx="54" cy="48" rx="4" ry="3" fill="#fff"/><ellipse cx="66" cy="48" rx="4" ry="3" fill="#fff"/>
    <circle cx="55" cy="48" r="2.2" fill="${e.ojos}"/><circle cx="67" cy="48" r="2.2" fill="${e.ojos}"/>
    <path d="M55 57 L65 57" stroke="#7a3b2a" stroke-width="1.8" stroke-linecap="round"/>
    <path class="o" d="${e.pelop}" fill="${e.pelo}"/>
    ${e.frente}
    <path d="M78 78 L100 88" stroke="${e.gi}" stroke-width="14" stroke-linecap="round"/>
    <path d="M100 88 L116 80" stroke="${e.piel}" stroke-width="10" stroke-linecap="round"/>
    <circle cx="122" cy="78" r="15" fill="currentColor" opacity=".45"/>
    <circle cx="120" cy="79" r="8" fill="${e.piel}"/>
    <circle cx="122" cy="78" r="4" fill="#fff"/>
  </svg>`;
}

let estado = null;   // estado del combate actual
let elegido = null;  // id del personaje del jugador

/* ---------- Racha de victorias (localStorage) ---------- */
function leerRacha() {
  try {
    return { actual: +localStorage.getItem('auraclash_racha') || 0, mejor: +localStorage.getItem('auraclash_mejor') || 0 };
  } catch { return { actual: 0, mejor: 0 }; }
}
function guardarRacha(gano) {
  const r = leerRacha();
  r.actual = gano ? r.actual + 1 : 0;
  r.mejor = Math.max(r.mejor, r.actual);
  try {
    localStorage.setItem('auraclash_racha', r.actual);
    localStorage.setItem('auraclash_mejor', r.mejor);
  } catch { /* sin almacenamiento disponible */ }
  return r;
}
const textoRacha = () => {
  const r = leerRacha();
  return `Racha: ${r.actual} · Mejor: ${r.mejor}`;
};

/* =====================================================
   3. PANTALLAS
   ===================================================== */
function mostrarPantalla(id) {
  document.querySelectorAll('.pantalla').forEach((p) => p.classList.toggle('activa', p.id === id));
  if (id === 'inicio') $('#racha-texto').textContent = textoRacha();
}

function montarSeleccion() {
  $('#lista-personajes').innerHTML = Object.entries(PERSONAJES).map(([id, p]) => `
    <button class="tarjeta" data-id="${id}" style="--c:${p.color}">
      <div class="figura">${figuraSVG(id)}</div>
      <h3>${p.nombre}</h3>
      <small>Aura de ${p.tipo}</small>
      <dl><dt>Vida</dt><dd>${p.vida}</dd><dt>Aura</dt><dd>${p.aura}</dd>
          <dt>Ataque</dt><dd>${p.ataque}</dd><dt>Defensa</dt><dd>${p.defensa}</dd></dl>
      <small>${p.ataques.map((k) => ATAQUES[k].nombre).join(' · ')}</small>
    </button>`).join('');
}

/* =====================================================
   4. LÓGICA DE COMBATE
   ===================================================== */
function crearLuchador(id, clave) {
  const p = PERSONAJES[id];
  return {
    ...p, id, clave, el: $('#luchador-' + clave),
    vidaMax: p.vida, auraMax: p.aura, aura: Math.round(p.aura / 2),
    nivel: 1, turnos: 0, defendiendo: false, agotado: false, hipnotizado: false, esquiva: false
  };
}

function iniciarCombate(id) {
  elegido = id;
  const rivales = Object.keys(PERSONAJES).filter((k) => k !== id);
  const idCpu = rivales[Math.floor(Math.random() * rivales.length)];
  estado = {
    jugador: crearLuchador(id, 'jugador'), cpu: crearLuchador(idCpu, 'cpu'),
    bloqueado: false, fin: false, registro: [],
    stats: { turnos: 0, hecho: 0, recibido: 0, criticos: 0 }
  };
  const { jugador, cpu } = estado;
  $('#marcadores').innerHTML = [jugador, cpu].map(panelHTML).join('');
  for (const f of [jugador, cpu]) {
    f.el.style.setProperty('--c', f.color);
    f.el.querySelector('.figura').innerHTML = figuraSVG(f.id);
    f.el.className = 'luchador';
  }
  // El campo de batalla se tiñe con las auras de ambos luchadores
  $('#escena').style.setProperty('--c1', jugador.color);
  $('#escena').style.setProperty('--c2', cpu.color);
  $('#ataques').innerHTML = jugador.ataques.map((k) =>
    `<button class="btn especial" data-accion="${k}" title="${ATAQUES[k].desc}">${ATAQUES[k].nombre} (${ATAQUES[k].coste})</button>`).join('');
  $('#aviso').textContent = `${jugador.nombre} contra ${cpu.nombre}. ¡Elige tu acción!`;
  $('#registro').innerHTML = '';
  actualizarUI();
  mostrarPantalla('batalla');
}

function panelHTML(f) {
  return `<div class="panel" style="--c:${f.color}">
    <div class="panel-cab"><strong>${f.nombre}</strong><span id="nivel-${f.clave}"></span></div>
    <div class="barra vida"><i id="vida-${f.clave}"></i><b id="tvida-${f.clave}"></b></div>
    <div class="barra aura"><i id="aura-${f.clave}"></i><b id="taura-${f.clave}"></b></div>
  </div>`;
}

/** Calcula el daño de un golpe teniendo en cuenta nivel, tipo, crítico y defensa. */
function calcularDano(atacante, rival, mult, ignoraDefensa) {
  let ef = 1;
  if (VENTAJAS[atacante.tipo] === rival.tipo) ef = 1.3;
  else if (VENTAJAS[rival.tipo] === atacante.tipo) ef = 0.75;
  const critico = Math.random() < PROB_CRITICO;
  let d = atacante.ataque * mult * (1 + 0.1 * (atacante.nivel - 1)) * (0.85 + Math.random() * 0.3) * ef;
  if (critico) d *= 1.5;
  if (!ignoraDefensa) d -= rival.defensa * 0.5;
  if (rival.defendiendo) { d *= 0.4; rival.defendiendo = false; }
  return { dano: Math.max(1, Math.round(d)), critico, ef };
}

/** Aplica una acción y devuelve el texto del registro y el golpe (si hubo). */
function ejecutar(actor, rival, accion) {
  const n = actor.nombre;
  let at = ATAQUES[accion];
  if (at && actor.aura < at.coste) { accion = 'atacar'; at = null; } // sin aura suficiente

  if (accion === 'cargar') {
    actor.aura = Math.min(actor.auraMax, actor.aura + 25);
    return { texto: `${n} concentra su aura (+25).` };
  }
  if (accion === 'defender') {
    actor.defendiendo = true;
    actor.aura = Math.min(actor.auraMax, actor.aura + 5);
    return { texto: `${n} se protege con su aura.` };
  }
  if (at) actor.aura -= at.coste;
  else actor.aura = Math.min(actor.auraMax, actor.aura + 6);
  const anim = at ? at.anim : 'melee';

  // Técnicas de apoyo (sin daño)
  if (at && at.apoyo === 'baile') {
    actor.nivel = Math.min(NIVEL_MAX, actor.nivel + 2);
    rival.hipnotizado = true;
    return { texto: `${n} baila: su aura sube 2 niveles y ${rival.nombre} queda hipnotizado.`, anim };
  }
  if (at && at.apoyo === 'doble') {
    actor.esquiva = true;
    return { texto: `${n} deja imágenes residuales y esquivará el próximo golpe.`, anim };
  }

  // Fallos: imagen residual del rival o hipnosis propia
  if (rival.esquiva) {
    rival.esquiva = false;
    return { texto: `${n} ataca, pero ${rival.nombre} esquiva con su imagen residual.`, anim };
  }
  if (actor.hipnotizado) {
    actor.hipnotizado = false;
    if (Math.random() < 0.5) return { texto: `${n} está hipnotizado y falla el golpe.`, anim };
  }

  const golpe = calcularDano(actor, rival, at ? at.mult : 1, at && at.ignoraDefensa);
  rival.vida = Math.max(0, rival.vida - golpe.dano);
  let texto = at ? `${n} usa ${at.nombre}: ${golpe.dano} de daño.` : `${n} ataca: ${golpe.dano} de daño.`;
  if (golpe.critico) texto += ' ¡Golpe crítico!';
  if (golpe.ef > 1) texto += ' Es muy efectivo.';
  if (golpe.ef < 1) texto += ' No es muy efectivo.';
  if (at && at.robaVida) {
    const cura = Math.round(golpe.dano * at.robaVida);
    actor.vida = Math.min(actor.vidaMax, actor.vida + cura);
    texto += ` Recupera ${cura} de vida.`;
  }
  if (at && at.agota) { actor.agotado = true; actor.aura = 0; texto += ` ${n} queda agotado.`; }
  return { texto, golpe, anim };
}

/** Resuelve un turno completo de un luchador. */
async function turno(actor, rival, accion) {
  actor.defendiendo = false;
  const r = ejecutar(actor, rival, accion);
  const s = estado.stats;
  s.turnos++;
  anotar(r.texto);

  if (r.golpe) {
    if (actor.clave === 'jugador') { s.hecho += r.golpe.dano; if (r.golpe.critico) s.criticos++; }
    else s.recibido += r.golpe.dano;
    await animarGolpe(actor, rival, r.golpe, r.anim);
  } else {
    await efecto(r.anim, actor, rival);
    actor.el.classList.toggle('defendiendo', actor.defendiendo);
    actualizarUI();
  }

  // Cada dos turnos propios sube el nivel de aura
  actor.turnos++;
  if (actor.turnos % 2 === 0 && actor.nivel < NIVEL_MAX) {
    actor.nivel++;
    anotar(`El aura de ${actor.nombre} sube al nivel ${actor.nivel}.`);
  }
  rival.el.classList.remove('defendiendo');
  actualizarUI();
  if (rival.vida <= 0) await terminar(actor.clave === 'jugador');
}

/* =====================================================
   5. IA DE LA CPU
   ===================================================== */
function decidirCPU(cpu) {
  if (cpu.vida / cpu.vidaMax < 0.3 && Math.random() < 0.6) return 'defender';
  if (cpu.aura < 15) return 'cargar';
  const posibles = cpu.ataques.filter((k) => ATAQUES[k].coste <= cpu.aura);
  if (posibles.length && Math.random() < 0.6) return posibles[Math.floor(Math.random() * posibles.length)];
  return 'atacar';
}

async function turnoJugador(accion) {
  if (!estado || estado.bloqueado || estado.fin) return;
  const { jugador, cpu } = estado;
  estado.bloqueado = true;
  actualizarBotones();
  await turno(jugador, cpu, accion);
  if (!estado.fin) {
    await pausa(700);
    if (cpu.agotado) { cpu.agotado = false; anotar(`${cpu.nombre} está agotado y pierde el turno.`); }
    else await turno(cpu, jugador, decidirCPU(cpu));
  }
  // Tras una explosión, el jugador pierde su siguiente turno
  if (!estado.fin && jugador.agotado) {
    jugador.agotado = false;
    anotar(`${jugador.nombre} está agotado y pierde el turno.`);
    await pausa(700);
    await turno(cpu, jugador, decidirCPU(cpu));
  }
  estado.bloqueado = false;
  actualizarBotones();
}

async function terminar(gano) {
  estado.fin = true;
  const racha = guardarRacha(gano);
  actualizarBotones();
  await pausa(1100);
  const s = estado.stats;
  $('#res-titulo').textContent = gano ? '¡Victoria!' : 'Derrota';
  $('#res-stats').innerHTML = [
    ['Turnos jugados', s.turnos], ['Daño causado', s.hecho],
    ['Daño recibido', s.recibido], ['Golpes críticos', s.criticos]
  ].map(([k, v]) => `<li><span>${k}</span><b>${v}</b></li>`).join('');
  $('#res-racha').textContent = `Racha: ${racha.actual} · Mejor: ${racha.mejor}`;
  mostrarPantalla('resultado');
}

/* =====================================================
   6. INTERFAZ Y ANIMACIONES
   ===================================================== */
function actualizarUI() {
  for (const f of [estado.jugador, estado.cpu]) {
    const k = f.clave;
    $('#vida-' + k).style.width = (f.vida / f.vidaMax) * 100 + '%';
    $('#aura-' + k).style.width = (f.aura / f.auraMax) * 100 + '%';
    $('#tvida-' + k).textContent = `Vida ${f.vida}/${f.vidaMax}`;
    $('#taura-' + k).textContent = `Aura ${f.aura}/${f.auraMax}`;
    $('#nivel-' + k).textContent = `Nivel ${f.nivel}`;
    f.el.style.setProperty('--n', f.nivel);
  }
  actualizarBotones();
}

function actualizarBotones() {
  const bloq = estado.bloqueado || estado.fin;
  document.querySelectorAll('#batalla button[data-accion]').forEach((b) => {
    const at = ATAQUES[b.dataset.accion];
    b.disabled = bloq || (at && estado.jugador.aura < at.coste);
  });
}

function anotar(texto) {
  estado.registro.unshift(texto);
  $('#registro').innerHTML = estado.registro.slice(0, 5).map((t) => `<li>${t}</li>`).join('');
  $('#aviso').textContent = texto;
}

function animar(el, clase, ms) {
  el.classList.remove(clase);
  void el.offsetWidth; // reinicia la animación
  el.classList.add(clase);
  setTimeout(() => el.classList.remove(clase), ms);
}

async function animarGolpe(atacante, rival, golpe, anim) {
  if (ANIMS[anim]) await ANIMS[anim](atacante, rival);
  else { animar(atacante.el, 'ataca', 550); await pausa(250); }
  animar($('#chispa'), 'activa', 500);
  animar(rival.el, 'dano', 500);
  const num = document.createElement('span');
  num.className = 'numero' + (golpe.critico ? ' critico' : '');
  num.textContent = '-' + golpe.dano;
  rival.el.appendChild(num);
  setTimeout(() => num.remove(), 900);
  actualizarUI();
  await pausa(450);
}

/* =====================================================
   6b. ANIMACIONES DE ATAQUES (una distinta por técnica)
   ===================================================== */
const PX = (v) => v + 'px';

// Crea un elemento de efecto dentro del campo y lo anima con la Web Animations API
function fx(clase, estilo, frames, ms, txt = '') {
  const d = document.createElement('div');
  d.className = 'fx ' + clase;
  d.textContent = txt;
  Object.assign(d.style, estilo);
  $('#escena').appendChild(d);
  const an = d.animate(frames, { duration: ms, easing: 'ease-out', fill: 'forwards' });
  an.onfinish = () => d.remove();
  return an.finished;
}
function centro(f) { // posición del luchador dentro del campo
  const e = $('#escena').getBoundingClientRect(), r = f.el.getBoundingClientRect();
  return { x: r.left - e.left + r.width / 2, y: r.top - e.top + r.height * 0.42 };
}
const centrar = 'translate(-50%,-50%)';

const ANIMS = {
  // Bola de energía que viaja hasta el rival
  async proyectil(a, r) {
    const p = centro(a), q = centro(r);
    await fx('orbe', { left: PX(p.x), top: PX(p.y), background: `radial-gradient(circle,#fff 0,${a.color} 45%,transparent 72%)` },
      [{ transform: `${centrar} scale(.4)` }, { transform: `translate(calc(-50% + ${q.x - p.x}px),calc(-50% + ${q.y - p.y}px)) scale(1.2)` }], 550);
  },
  // Rayo continuo que cruza el campo
  async rayo(a, r) {
    const p = centro(a), q = centro(r);
    fx('rayo', { left: PX(Math.min(p.x, q.x)), top: PX(p.y), width: PX(Math.abs(q.x - p.x)), transformOrigin: q.x > p.x ? 'left' : 'right',
      background: `linear-gradient(90deg,${a.color},#fff,${a.color})` },
      [{ transform: 'translateY(-50%) scaleX(0)', opacity: 1 }, { transform: 'translateY(-50%) scaleX(1)', opacity: 1, offset: .55 }, { transform: 'translateY(-50%) scaleX(1)', opacity: 0 }], 750);
    await pausa(420);
  },
  // Embestida con onda de choque
  async palma(a, r) {
    animar(a.el, 'ataca', 550);
    await pausa(250);
    const q = centro(r);
    fx('onda', { left: PX(q.x), top: PX(q.y), borderColor: a.color },
      [{ transform: `${centrar} scale(.2)`, opacity: 1 }, { transform: `${centrar} scale(3.5)`, opacity: 0 }], 600);
  },
  // Carga, destello total, bola de fuego gigante y temblor del campo
  async explosion(a, r) {
    const q = centro(r), e = $('#escena');
    animar(a.el, 'destello', 700);
    await pausa(500);
    e.classList.add('temblor');
    setTimeout(() => e.classList.remove('temblor'), 900);
    fx('flash', { inset: 0 }, [{ opacity: 0 }, { opacity: .95 }, { opacity: 0 }], 800);
    fx('boom', { left: PX(q.x), top: PX(q.y) }, [{ transform: `${centrar} scale(0)`, opacity: 1 }, { transform: `${centrar} scale(7)`, opacity: 0 }], 1000);
    await pausa(350);
  },
  // Baile: giros, saltos y notas de colores
  async baile(a) {
    const p = centro(a);
    animar(a.el, 'baila', 1600);
    ['♪', '♫', '✦', '♪', '✦', '♫'].forEach((n, i) => setTimeout(() => fx('nota', { left: PX(p.x + (i - 2.5) * 22), top: PX(p.y - 30), color: i % 2 ? a.color : '#fde68a' },
      [{ transform: 'translateY(0) scale(.6)', opacity: 0 }, { opacity: 1, offset: .3 }, { transform: 'translateY(-90px) scale(1.4)', opacity: 0 }], 1200, n), i * 140));
    await pausa(1600);
  },
  // Imágenes residuales a los lados
  async doble(a) { animar(a.el, 'imagenes', 900); await pausa(900); },
  // Círculo de sombra que envuelve al rival
  async eclipse(a, r) {
    const q = centro(r);
    await fx('sombra', { left: PX(q.x), top: PX(q.y) },
      [{ transform: `${centrar} scale(0)`, opacity: 1 }, { transform: `${centrar} scale(1.6)`, opacity: 1, offset: .6 }, { transform: `${centrar} scale(1.6)`, opacity: 0 }], 800);
  }
};

// Reproduce la animación de una técnica (o un destello si no tiene)
async function efecto(anim, actor, rival) {
  if (ANIMS[anim]) await ANIMS[anim](actor, rival);
  else { animar(actor.el, 'destello', 600); await pausa(600); }
}

/* =====================================================
   7. EVENTOS
   ===================================================== */
$('#btn-jugar').addEventListener('click', () => mostrarPantalla('seleccion'));
$('#btn-ayuda').addEventListener('click', () => $('#ayuda').showModal());
$('#btn-revancha').addEventListener('click', () => iniciarCombate(elegido));
$('#btn-menu').addEventListener('click', () => mostrarPantalla('inicio'));
document.querySelectorAll('[data-ir]').forEach((b) => b.addEventListener('click', () => mostrarPantalla(b.dataset.ir)));
$('#lista-personajes').addEventListener('click', (e) => {
  const t = e.target.closest('.tarjeta');
  if (t) iniciarCombate(t.dataset.id);
});
$('#batalla').addEventListener('click', (e) => {
  const b = e.target.closest('button[data-accion]');
  if (b) turnoJugador(b.dataset.accion);
});

montarSeleccion();
mostrarPantalla('inicio');
