// Kit Hikman Capital para Hyperframes. Lee window.EDICION (datos/hikman/edicion.json).
// La cinta corre a 110 px/s segun el tiempo GLOBAL del video, asi empalma con Remotion.
window.HK = {
  VEL: 110,
  cabecera(el, pagina) {
    const E = window.EDICION;
    el.innerHTML = '<div class="hk-cab"><span class="hk-marca">Hikman</span><span class="hk-pub">' + E.publicacion +
      '</span><span class="hk-fecha">' + E.fechaCorta + ' · <b>PÁGINA ' + pagina + '</b></span></div><div class="hk-linea"></div>';
  },
  cinta(el) {
    const E = window.EDICION;
    let items = "";
    for (let k = 0; k < 6; k++) E.ticker.forEach((it) => { items += '<span data-layout-allow-occlusion class="' + it.tono + '">' + it.texto + "</span>"; });
    el.innerHTML = '<div class="hk-cinta"><div class="hk-envivo">EN VIVO</div><div class="hk-banda"><div class="hk-items" data-layout-allow-occlusion>' + items + "</div></div></div>";
  },
  moverCinta(tl, sel, inicioGlobal, dur) {
    tl.fromTo(sel, { x: -inicioGlobal * this.VEL }, { x: -(inicioGlobal + dur) * this.VEL, duration: dur, ease: "none" }, 0);
  },
};
