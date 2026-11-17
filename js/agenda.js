/*
  PRÓXIMOS EVENTOS E LANÇAMENTOS — é aqui que se edita a contagem do topo.

  - data: dia e hora em Portugal, no formato "AAAA-MM-DDTHH:MM". Sem hora certa, põe "T00:00".
  - horaCerta: false quando ainda não se sabe a hora (mostra só os dias que faltam).
  - link: para onde leva a faixa. Quando a música sair, troca pelo link do Spotify.
  A faixa mostra o próximo da lista. Depois de uma música sair, mostra "Já saiu" durante 3 dias.
*/
const AGENDA = [
  {
    tipo: "musica",
    titulo: "GTA 6 CSP MOB",
    data: "2026-11-19T00:00",
    horaCerta: true,
    link: "discografia.html",
  },
  {
    tipo: "concerto",
    titulo: "Ao vivo",
    data: "2026-12-05T00:00",
    horaCerta: false,
    link: "concertos.html",
  },
];

(function () {
  const faixa = document.getElementById("proximo-evento");
  if (!faixa) return;
  const etiqueta = faixa.querySelector(".pe-etiqueta");
  const titulo = faixa.querySelector(".pe-titulo");
  const relogio = faixa.querySelector(".pe-relogio");

  /* Hora de Portugal: diferença para UTC nesse dia (0 no inverno, +1 no verão) */
  function emPortugal(texto) {
    const [dia, hora] = texto.split("T");
    const [a, m, d] = dia.split("-").map(Number);
    const [h, min] = (hora || "00:00").split(":").map(Number);
    const utc = Date.UTC(a, m - 1, d, h, min);
    const nome = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Lisbon", timeZoneName: "short" })
      .formatToParts(new Date(utc)).find((p) => p.type === "timeZoneName").value;
    const desvio = nome.includes("+1") || nome === "BST" || nome === "WEST" ? 1 : 0;
    return utc - desvio * 3600000;
  }

  const meses = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  const eventos = AGENDA.map((e) => ({ ...e, quando: emPortugal(e.data) })).sort((a, b) => a.quando - b.quando);
  const dois = (n) => String(n).padStart(2, "0");

  function escolher(agora) {
    const acabadoDeSair = eventos.find((e) => e.tipo === "musica" && e.quando <= agora && agora - e.quando < 3 * 86400000);
    if (acabadoDeSair) return { evento: acabadoDeSair, saiu: true };
    const proximo = eventos.find((e) => e.quando > agora);
    return proximo ? { evento: proximo, saiu: false } : null;
  }

  function atualizar() {
    const agora = Date.now();
    const escolha = escolher(agora);
    if (!escolha) {
      faixa.hidden = true;
      return;
    }
    const { evento, saiu } = escolha;
    faixa.hidden = false;
    faixa.href = evento.link;
    const diaTexto = `${dois(Number(evento.data.slice(8, 10)))} ${meses[Number(evento.data.slice(5, 7)) - 1]}`;

    if (saiu) {
      etiqueta.textContent = "● Já saiu";
      titulo.textContent = `“${evento.titulo}”`;
      relogio.textContent = "Ouve agora ▶";
      faixa.setAttribute("aria-label", `Já saiu: ${evento.titulo}. Ouve agora.`);
      return;
    }

    etiqueta.textContent = evento.tipo === "musica" ? "● Nova música" : "● Próximo concerto";
    titulo.textContent = evento.tipo === "musica" ? `“${evento.titulo}” · ${diaTexto}` : `${evento.titulo} · ${diaTexto}`;

    const falta = evento.quando - agora;
    const dias = Math.floor(falta / 86400000);
    if (!evento.horaCerta) {
      relogio.textContent = dias <= 0 ? "É hoje" : dias === 1 ? "Falta 1 dia" : `Faltam ${dias} dias`;
    } else {
      const h = Math.floor((falta % 86400000) / 3600000);
      const m = Math.floor((falta % 3600000) / 60000);
      const s = Math.floor((falta % 60000) / 1000);
      relogio.textContent = `${dois(dias)}d ${dois(h)}h ${dois(m)}m ${dois(s)}s`;
    }
    const quanto = dias <= 0 ? "É hoje" : dias === 1 ? "Falta 1 dia" : `Faltam ${dias} dias`;
    faixa.setAttribute("aria-label", `${etiqueta.textContent.replace("● ", "")}: ${titulo.textContent}. ${quanto}.`);
  }

  atualizar();
  setInterval(atualizar, 1000);
})();
