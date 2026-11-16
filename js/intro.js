/* Intro VHS da página inicial: ruído, PLAY, contagem de filme antigo 3, 2, 1,
   e no fim a televisão antiga desliga-se e volta a ligar já no site. */
(function () {
  const vhs = document.getElementById("vhs");
  if (!vhs) return;
  /* É a intro por defeito; index.html?intro=spray mostra a do spray */
  if ((new URLSearchParams(location.search).get("intro") || "vhs") !== "vhs") return;

  const canvas = vhs.querySelector(".vhs > canvas");
  const ctx = canvas.getContext("2d");
  const po = vhs.querySelector(".filme-po");
  const pctx = po.getContext("2d");
  const filme = vhs.querySelector(".filme");
  const fotograma = vhs.querySelector(".filme-fotograma");
  const play = vhs.querySelector(".vhs-play");
  const saltar = vhs.querySelector(".vhs-saltar");
  const estado = vhs.querySelector(".vhs-estado");
  const tempo = vhs.querySelector(".vhs-tempo");
  const numero = vhs.querySelector(".contagem-num");

  /* Aparece sempre que se abre a página inicial */
  vhs.hidden = false;
  document.body.classList.add("com-intro");
  play.focus();

  /* Ruído de televisão, desenhado em baixa resolução e esticado */
  canvas.width = 200;
  canvas.height = 120;
  const imagem = ctx.createImageData(canvas.width, canvas.height);
  let intensidade = 0.55;
  let animacao;
  function ruido() {
    const d = imagem.data;
    for (let i = 0; i < d.length; i += 4) {
      const v = Math.random() * 255 * intensidade;
      d[i] = d[i + 1] = d[i + 2] = v;
      d[i + 3] = 255;
    }
    ctx.putImageData(imagem, 0, 0);
    animacao = requestAnimationFrame(ruido);
  }
  ruido();

  /* Película: pó, cabelos, riscos, tremor da imagem e luz a cintilar, a 18 imagens por segundo */
  let pelicula = null;
  let instabilidade = 1;
  const aleat = (a, b) => a + Math.random() * (b - a);
  function desenharPelicula() {
    const w = (po.width = Math.round(innerWidth / 3));
    const h = (po.height = Math.round(innerHeight / 3));
    pctx.clearRect(0, 0, w, h);
    pctx.fillStyle = "#1b1006";
    pctx.strokeStyle = "#1b1006";
    const manchas = Math.floor(aleat(2, 9) * instabilidade);
    for (let i = 0; i < manchas; i++) {
      pctx.globalAlpha = aleat(0.35, 0.9);
      pctx.beginPath();
      pctx.ellipse(aleat(0, w), aleat(0, h), aleat(0.4, 2.2), aleat(0.4, 1.8), aleat(0, 3), 0, Math.PI * 2);
      pctx.fill();
    }
    if (Math.random() < 0.22) {
      pctx.globalAlpha = 0.7;
      pctx.lineWidth = aleat(0.4, 0.9);
      const x = aleat(0, w), y = aleat(0, h);
      pctx.beginPath();
      pctx.moveTo(x, y);
      pctx.bezierCurveTo(x + aleat(-25, 25), y + aleat(-25, 25), x + aleat(-25, 25), y + aleat(-25, 25), x + aleat(-30, 30), y + aleat(-30, 30));
      pctx.stroke();
    }
    const riscos = Math.random() < 0.55 ? 1 : 2;
    for (let i = 0; i < riscos; i++) {
      const x = aleat(w * 0.08, w * 0.92);
      pctx.globalAlpha = aleat(0.25, 0.6);
      pctx.fillStyle = Math.random() < 0.5 ? "#fff6dc" : "#1b1006";
      pctx.fillRect(x, 0, aleat(0.4, 1.1), h);
    }
    pctx.globalAlpha = 1;
    filme.style.transform = `translate(${aleat(-1.6, 1.6) * instabilidade}px, ${aleat(-2.4, 2.4) * instabilidade}px)`;
    filme.style.filter = `brightness(${aleat(0.86, 1.06)}) contrast(1.12) sepia(.25)`;
  }

  /* Som, criado no browser: chiado de fita, projetor a rodar, um bip por número,
     e um grave quando a televisão volta a ligar */
  let audio = null;
  let ritmo = 18;
  function iniciarSom() {
    try {
      audio = new (window.AudioContext || window.webkitAudioContext)();
      const t = audio.currentTime;
      const ruidoBuf = audio.createBuffer(1, audio.sampleRate * 2, audio.sampleRate);
      const c = ruidoBuf.getChannelData(0);
      for (let i = 0; i < c.length; i++) c[i] = Math.random() * 2 - 1;
      audio.ruidoBuf = ruidoBuf;

      const chiado = audio.createBufferSource();
      chiado.buffer = ruidoBuf;
      chiado.loop = true;
      const fChiado = audio.createBiquadFilter();
      fChiado.type = "bandpass";
      fChiado.frequency.value = 2400;
      const vChiado = audio.createGain();
      vChiado.gain.setValueAtTime(0.0001, t);
      vChiado.gain.exponentialRampToValueAtTime(0.25, t + 0.05);
      vChiado.gain.exponentialRampToValueAtTime(0.025, t + 0.6);
      chiado.connect(fChiado).connect(vChiado).connect(audio.destination);
      chiado.start(t);

      /* Zumbido grave e quente do projetor */
      const motor = audio.createOscillator();
      motor.type = "triangle";
      motor.frequency.value = 72;
      const vMotor = audio.createGain();
      vMotor.gain.setValueAtTime(0.0001, t);
      vMotor.gain.exponentialRampToValueAtTime(0.05, t + 0.6);
      motor.connect(vMotor).connect(audio.destination);
      motor.start(t);

      const clique = audio.createBuffer(1, audio.sampleRate * 0.06, audio.sampleRate);
      const cc = clique.getChannelData(0);
      for (let i = 0; i < cc.length; i++) cc[i] = (Math.random() * 2 - 1) * Math.exp(-i / (audio.sampleRate * 0.006));
      const vProj = audio.createGain();
      vProj.gain.value = 0.17;
      const fProj = audio.createBiquadFilter();
      fProj.type = "bandpass";
      fProj.frequency.value = 1500;
      fProj.Q.value = 0.8;
      fProj.connect(vProj).connect(audio.destination);
      let proximo = t + 0.4;
      const projetor = setInterval(() => {
        while (proximo < audio.currentTime + 0.2) {
          const s = audio.createBufferSource();
          s.buffer = clique;
          s.playbackRate.value = 0.9 + Math.random() * 0.2;
          s.connect(fProj);
          s.start(proximo);
          proximo += 1 / ritmo;
        }
      }, 60);

      audio.abrandar = () => {
        const tt = audio.currentTime;
        motor.frequency.setTargetAtTime(38, tt, 0.35);
        vMotor.gain.setTargetAtTime(0.0001, tt + 0.4, 0.25);
      };
      audio.pararTudo = (rapido) => {
        clearInterval(projetor);
        const tt = audio.currentTime;
        const k = rapido ? 0.06 : 0.25;
        vChiado.gain.setTargetAtTime(0.0001, tt, k);
        vProj.gain.setTargetAtTime(0, tt, k);
        vMotor.gain.setTargetAtTime(0.0001, tt, k);
        setTimeout(() => audio.close(), 4000);
      };
    } catch (e) {
      audio = null;
    }
  }

  function bip() {
    if (!audio) return;
    try {
      const t = audio.currentTime;
      const o = audio.createOscillator();
      o.type = "sine";
      o.frequency.value = 1000;
      const v = audio.createGain();
      v.gain.setValueAtTime(0.0001, t);
      v.gain.exponentialRampToValueAtTime(0.24, t + 0.01);
      v.gain.setValueAtTime(0.24, t + 0.13);
      v.gain.exponentialRampToValueAtTime(0.0001, t + 0.17);
      o.connect(v).connect(audio.destination);
      o.start(t);
      o.stop(t + 0.2);
    } catch (e) {}
  }

  function grave() {
    if (!audio) return;
    try {
      const t = audio.currentTime;
      const o = audio.createOscillator();
      o.type = "sine";
      o.frequency.setValueAtTime(110, t);
      o.frequency.exponentialRampToValueAtTime(38, t + 0.8);
      const v = audio.createGain();
      v.gain.setValueAtTime(0.0001, t);
      v.gain.exponentialRampToValueAtTime(0.8, t + 0.02);
      v.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);
      o.connect(v).connect(audio.destination);
      o.start(t);
      o.stop(t + 1.7);
    } catch (e) {}
  }

  /* Televisão antiga a desligar: o assobio do ecrã cai e ouve-se o estalido do botão */
  function somDesligar() {
    if (!audio) return;
    try {
      const t = audio.currentTime;
      const o = audio.createOscillator();
      o.type = "sine";
      o.frequency.setValueAtTime(7800, t);
      o.frequency.exponentialRampToValueAtTime(180, t + 0.4);
      const v = audio.createGain();
      v.gain.setValueAtTime(0.06, t);
      v.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
      o.connect(v).connect(audio.destination);
      o.start(t);
      o.stop(t + 0.5);
      estalo(t, 0.5);
    } catch (e) {}
  }

  /* E a ligar: estalido, chiado de estática que se apaga, zumbido do tubo e um grave */
  function somLigar() {
    if (!audio) return;
    try {
      const t = audio.currentTime;
      estalo(t, 0.6);
      const s = audio.createBufferSource();
      s.buffer = audio.ruidoBuf;
      const f = audio.createBiquadFilter();
      f.type = "highpass";
      f.frequency.value = 1500;
      const v = audio.createGain();
      v.gain.setValueAtTime(0.3, t);
      v.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
      s.connect(f).connect(v).connect(audio.destination);
      s.start(t);
      s.stop(t + 0.6);
      const zumbido = audio.createOscillator();
      zumbido.frequency.value = 7800;
      const vz = audio.createGain();
      vz.gain.setValueAtTime(0.025, t);
      vz.gain.exponentialRampToValueAtTime(0.0001, t + 1.2);
      zumbido.connect(vz).connect(audio.destination);
      zumbido.start(t);
      zumbido.stop(t + 1.3);
    } catch (e) {}
    grave();
  }

  function estalo(t, forca) {
    const b = audio.createBuffer(1, audio.sampleRate * 0.03, audio.sampleRate);
    const d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (audio.sampleRate * 0.003));
    const s = audio.createBufferSource();
    s.buffer = b;
    const v = audio.createGain();
    v.gain.value = forca;
    s.connect(v).connect(audio.destination);
    s.start(t);
  }

  /* Contador SP 0:00:00 */
  let inicio;
  let relogio;
  function contar() {
    const s = Math.floor((performance.now() - inicio) / 1000);
    tempo.textContent = `SP 0:00:${String(s).padStart(2, "0")}`;
  }

  const temporizadores = [];
  const depois = (ms, fn) => temporizadores.push(setTimeout(fn, ms));

  function mudarNumero(n) {
    fotograma.classList.remove("desliza");
    void fotograma.offsetWidth;
    fotograma.classList.add("desliza");
    numero.textContent = n;
    bip();
  }

  let terminou = false;
  function limpar() {
    cancelAnimationFrame(animacao);
    clearInterval(relogio);
    clearInterval(pelicula);
    vhs.hidden = true;
    document.body.classList.remove("revelar");
    const destino = document.getElementById("conteudo");
    if (destino) destino.focus({ preventScroll: true });
  }

  /* Saltar: fecha depressa */
  function terminar() {
    if (terminou) return;
    terminou = true;
    temporizadores.forEach(clearTimeout);
    if (audio && audio.pararTudo) audio.pararTudo(true);
    vhs.classList.add("a-sair");
    document.body.classList.remove("com-intro");
    setTimeout(limpar, 750);
  }

  /* Fim normal: a televisão desliga-se num ponto de luz e volta a ligar já no site */
  function desligarELigar() {
    if (terminou) return;
    terminou = true;
    clearInterval(pelicula);
    vhs.classList.add("tv-desliga");
    somDesligar();
    if (audio && audio.pararTudo) audio.pararTudo(true);
    setTimeout(() => {
      cancelAnimationFrame(animacao);
      clearInterval(relogio);
      vhs.hidden = true;
      document.body.classList.remove("com-intro");
      document.documentElement.classList.add("tv-liga");
      document.body.classList.add("tv-liga");
      somLigar();
      setTimeout(() => {
        document.body.classList.remove("tv-liga");
        document.documentElement.classList.remove("tv-liga");
        const destino = document.getElementById("conteudo");
        if (destino) destino.focus({ preventScroll: true });
      }, 850);
    }, 1050);
  }

  play.addEventListener("click", () => {
    iniciarSom();
    vhs.classList.add("a-tocar");
    estado.textContent = "▶ PLAY";
    inicio = performance.now();
    relogio = setInterval(contar, 250);
    intensidade = 1;
    saltar.focus();
    desenharPelicula();
    pelicula = setInterval(desenharPelicula, 1000 / 18);

    const a = 550;
    depois(a, () => {
      intensidade = 0.6;
      numero.textContent = "3";
      vhs.classList.add("contagem-visivel");
      bip();
    });
    depois(a + 1000, () => mudarNumero("2"));
    depois(a + 2000, () => mudarNumero("1"));
    /* Ao fim de exatamente um segundo de 1, a televisão desliga-se */
    depois(a + 3000, desligarELigar);
  });

  saltar.addEventListener("click", terminar);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !vhs.hidden) terminar();
  });
})();
