// Hikman Capital · "Toro vs. Oso" para Hyperframes. Lee window.SEMANA (datos/hikman/semana.json).
// Todo depende del tiempo GLOBAL del video, asi empalma con Remotion (hikman-datos/src/kit2.tsx).
window.K = {
  // posicion de la Balanza (-1 toro, +1 oso) en el segundo t; mismo calculo que en Remotion
  balanzaP(t) {
    const k = window.SEMANA.balanza;
    let v = k[0][1];
    for (let i = 1; i < k.length; i++) {
      if (t <= k[i][0]) break;
      const a = Math.min(1, (t - k[i][0]) / 0.7);
      const e = a < 0.5 ? 4 * a * a * a : 1 - Math.pow(-2 * a + 2, 3) / 2;
      v = v + (k[i][1] - v) * e;
    }
    return v;
  },
  temaEn(t) {
    const ts = window.SEMANA.temas;
    let x = null;
    ts.forEach((m) => { if (t >= m.inicio) x = m; });
    return x;
  },
  barra(el) {
    const S = window.SEMANA;
    el.innerHTML = '<div class="k-barra"><img src="assets/hikman/logo-blanco.png" alt="" /><div class="k-pub"><b>' + S.publicacion + "</b><br />Semana al " + S.fecha + '</div></div><div class="k-linea"></div>';
  },
  tema(el, t) {
    const m = this.temaEn(t);
    el.innerHTML = m ? '<div class="k-tema">Tema <b>' + m.n + "/3</b> · " + m.nombre + "</div>" : "";
  },
  balanza(el) {
    el.innerHTML = '<div class="k-balanza"><div class="k-tit">BALANZA HIKMAN</div>' +
      '<img class="k-ico" src="assets/hikman/toro.png" style="left:70px" alt="" /><img class="k-ico" src="assets/hikman/oso.png" style="right:70px" alt="" />' +
      '<div class="k-pista"></div><div class="k-marca"></div>' +
      '<div class="k-lado" style="left:200px;color:var(--toro)">TORO</div><div class="k-lado" style="right:200px;color:var(--oso)">OSO</div></div>';
  },
  // mueve el marcador en este tramo (inicio global t0, duracion dur)
  moverBalanza(tl, sel, t0, dur) {
    const prox = { t: 0 };
    const nodo = () => document.querySelector(sel);
    tl.fromTo(prox, { t: 0 }, { t: dur, duration: dur, ease: "none", onUpdate: () => { const n = nodo(); if (n) n.style.left = 534 + K.balanzaP(t0 + prox.t) * 340 + "px"; } }, 0);
  },
  // vela que cubre la pantalla hasta tFin (local) y otra que la descubre desde tIni (local)
  velaHTML(id, color) {
    const c = color === "toro" ? "var(--toro)" : "var(--oso)";
    return '<div class="k-vela" id="' + id + '"><div class="k-mecha" style="background:' + c + '"></div><div class="k-cuerpo" style="background:' + c + '"></div></div>';
  },
  // vela: cubre la pantalla hasta tFin (local) y/o la descubre desde tIni (local). Un elemento por cambio de tema.
  vela(tl, id, tFin, tIni) {
    const cu = "#" + id + " .k-cuerpo", me = "#" + id + " .k-mecha";
    if (tFin != null) {
      tl.fromTo(cu, { scaleY: 0, transformOrigin: "50% 100%" }, { scaleY: 1, duration: 0.32, ease: "power3.in" }, tFin - 0.32);
      tl.fromTo(me, { scaleY: 0, transformOrigin: "50% 100%" }, { scaleY: 1, duration: 0.2, ease: "power2.in" }, tFin - 0.4);
    }
    if (tIni != null) {
      const prim = tFin == null;
      tl.fromTo(cu, { scaleY: 1, transformOrigin: "50% 0%" }, { scaleY: 0, duration: 0.34, ease: "power3.out", immediateRender: prim }, tIni);
      tl.fromTo(me, { scaleY: 1, transformOrigin: "50% 0%" }, { scaleY: 0, duration: 0.42, ease: "power2.out", immediateRender: prim }, tIni);
    }
  },
};
