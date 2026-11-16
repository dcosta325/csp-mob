/* Comum a todas as páginas */
(function () {
  /* Menu no telemóvel */
  const topo = document.querySelector(".topo");
  const botao = document.querySelector(".menu-botao");
  if (topo && botao) {
    botao.addEventListener("click", () => {
      const aberto = topo.classList.toggle("menu-aberto");
      botao.setAttribute("aria-expanded", String(aberto));
      botao.textContent = aberto ? "Fechar" : "Menu";
    });
  }

  /* Vídeos: só carregam o YouTube quando se clica */
  document.querySelectorAll("button.video[data-video]").forEach((b) => {
    b.addEventListener("click", () => {
      const iframe = document.createElement("iframe");
      iframe.src = `https://www.youtube-nocookie.com/embed/${b.dataset.video}?autoplay=1&rel=0`;
      iframe.title = b.getAttribute("aria-label") || "Vídeo da CSP MOB";
      iframe.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
      iframe.allowFullscreen = true;
      const caixa = document.createElement("div");
      caixa.className = "video";
      caixa.append(iframe);
      b.replaceWith(caixa);
    });
  });

  /* Quem pediu menos movimento no sistema vê o logótipo parado */
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.querySelectorAll(".heroi-logo video").forEach((v) => {
      v.removeAttribute("autoplay");
      v.pause();
    });
  }

  document.querySelectorAll("[data-ano]").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
})();
