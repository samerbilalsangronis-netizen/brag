// Resortes fisicos para GSAP: cada ease es la respuesta de un resorte amortiguado,
// y su duracion es el tiempo real en que se asienta. Deterministas (solo dependen de t).
function resorte({ rigidez = 170, amortiguacion = 22, masa = 1 } = {}) {
  const w0 = Math.sqrt(rigidez / masa);
  const z = amortiguacion / (2 * Math.sqrt(rigidez * masa));
  const T = z < 1 ? Math.log(1000) / (z * w0) : Math.log(1000) / (w0 * (z - Math.sqrt(z * z - 1)));
  const f = (s) => {
    if (z < 1) {
      const wd = w0 * Math.sqrt(1 - z * z);
      return 1 - Math.exp(-z * w0 * s) * (Math.cos(wd * s) + ((z * w0) / wd) * Math.sin(wd * s));
    }
    return 1 - Math.exp(-w0 * s) * (1 + w0 * s);
  };
  const ease = (t) => (t >= 1 ? 1 : f(t * T));
  return { ease, duration: T };
}
const SECO = resorte({ rigidez: 520, amortiguacion: 34 });
const ESTANDAR = resorte({ rigidez: 190, amortiguacion: 18 });
const PESADO = resorte({ rigidez: 110, amortiguacion: 16, masa: 1.6 });

// Tween con resorte: tl.fromTo con la duracion fisica del resorte.
function spring(tl, target, from, to, at, r = ESTANDAR) {
  return tl.fromTo(target, from, Object.assign({ ease: r.ease, duration: r.duration }, to), at);
}

// Vapor: cada voluta sube y se desvanece en ciclos finitos entre [desde, hasta].
function vapor(tl, prefix, desde, hasta, ciclo = 1.6) {
  const paths = document.querySelectorAll(".vapor-" + prefix + " path");
  paths.forEach((p, i) => {
    const n = Math.max(1, Math.floor((hasta - desde) / ciclo));
    for (let k = 0; k < n; k++) {
      const t0 = desde + k * ciclo + (i * ciclo) / paths.length;
      if (t0 + ciclo > hasta) break;
      tl.fromTo(p, { y: 20, opacity: 0 }, { y: -10, opacity: 0.32, duration: ciclo * 0.4, ease: "sine.out", immediateRender: false }, t0);
      tl.fromTo(p, { y: -10, opacity: 0.32 }, { y: -60, opacity: 0, duration: ciclo * 0.6, ease: "sine.in", immediateRender: false }, t0 + ciclo * 0.4);
    }
  });
  tl.set(paths, { opacity: 0 }, 0);
}

// Brillos de salsa: titilan de forma ciclica entre [desde, hasta].
function brillos(tl, prefix, desde, hasta, ciclo = 1.2) {
  const els = document.querySelectorAll(".brillo-" + prefix);
  els.forEach((e, i) => {
    const n = Math.max(1, Math.floor((hasta - desde) / ciclo));
    for (let k = 0; k < n; k++) {
      const t0 = desde + k * ciclo + i * 0.37;
      if (t0 + ciclo > hasta) break;
      tl.fromTo(e, { opacity: 0.3, scale: 0.8, transformOrigin: "50% 50%" }, { opacity: 1, scale: 1.15, duration: ciclo / 2, ease: "sine.inOut", yoyo: true, repeat: 1, immediateRender: false }, t0);
    }
  });
}

// Formatos de precio identicos a habibis-chi.vercel.app
const TASA = { cop: 3188, bs: 1014 }; // 1 USDT = 3.188 COP = Bs. 1.014
function fmtCOP(v) {
  return String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " COP";
}
function fmtUSDT(cop) {
  return (cop / TASA.cop).toFixed(2).replace(".", ",") + " USDT";
}
function fmtBs(cop) {
  const n = (cop * TASA.bs) / TASA.cop;
  const [e, d] = n.toFixed(2).split(".");
  return "Bs. " + e.replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "," + d;
}
