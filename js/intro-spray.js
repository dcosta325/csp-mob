/* Intro "spray na parede": o logótipo é pintado em graffiti (vídeo feito no Higgsfield).
   Guardada como alternativa: só aparece em index.html?intro=spray. A intro por defeito é a VHS. */
(function () {
  const spray = document.getElementById("spray");
  if (!spray) return;
  const escolhida = new URLSearchParams(location.search).get("intro") || "vhs";
  if (escolhida !== "spray") return;

  const video = spray.querySelector(".spray-video");
  const entrar = spray.querySelector(".spray-entrar");
  const saltar = spray.querySelector(".spray-saltar");

  spray.hidden = false;
  document.body.classList.add("com-intro");
  entrar.focus();

  const temporizadores = [];
  let terminou = false;

  function terminar() {
    if (terminou) return;
    terminou = true;
    temporizadores.forEach(clearTimeout);
    spray.classList.add("a-sair");
    document.body.classList.remove("com-intro");
    const v0 = video.volume;
    const passo = setInterval(() => {
      video.volume = Math.max(0, video.volume - v0 / 8);
      if (video.volume <= 0.01) { clearInterval(passo); video.pause(); }
    }, 80);
    setTimeout(() => {
      spray.hidden = true;
      const destino = document.getElementById("conteudo");
      if (destino) destino.focus({ preventScroll: true });
    }, 900);
  }

  entrar.addEventListener("click", () => {
    spray.classList.add("a-pintar");
    saltar.focus();
    video.currentTime = 0;
    video.volume = 1;
    const tentativa = video.play();
    if (tentativa && tentativa.catch) tentativa.catch(() => {});

    const duracao = (video.duration || 5) * 1000;
    /* Tremor no grave final */
    temporizadores.push(setTimeout(() => spray.classList.add("impacto"), duracao - 450));
    video.addEventListener("ended", () => temporizadores.push(setTimeout(terminar, 700)), { once: true });
    temporizadores.push(setTimeout(terminar, duracao + 1500));
  });

  saltar.addEventListener("click", terminar);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !spray.hidden) terminar();
  });
})();
