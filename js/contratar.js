/* Janela "Contratar a CSP MOB": junta o pedido numa mensagem, copia-a
   e abre a conversa com @csp.mob no Instagram. Nada é guardado nem enviado pelo site. */
(function () {
  const janela = document.getElementById("contratar");
  if (!janela) return;
  const form = document.getElementById("contratar-form");
  const erro = document.getElementById("contratar-erro");
  const feito = document.getElementById("contratar-feito");
  const mostra = document.getElementById("contratar-mostra");
  const copiar = document.getElementById("contratar-copiar");
  let texto = "";

  function abrir() {
    feito.hidden = true;
    erro.hidden = true;
    janela.showModal();
    const primeiro = form.querySelector('input[name="nome"]');
    if (primeiro) primeiro.focus();
  }

  document.querySelectorAll("[data-abrir-contratar]").forEach((b) => b.addEventListener("click", abrir));
  janela.querySelectorAll("[data-fechar-contratar]").forEach((b) => b.addEventListener("click", () => janela.close()));
  janela.addEventListener("click", (e) => {
    if (e.target === janela) janela.close();
  });
  /* concertos.html#contratar abre logo a janela (atalho da página de contactos) */
  if (location.hash === "#contratar") abrir();

  function dataBonita(valor) {
    if (!valor) return "";
    const [a, m, d] = valor.split("-");
    return `${d}/${m}/${a}`;
  }

  async function copiarTexto() {
    try {
      await navigator.clipboard.writeText(texto);
      return true;
    } catch (e) {
      return false;
    }
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const dados = new FormData(form);
    const falta = [];
    if (!String(dados.get("nome")).trim()) falta.push("o nome");
    if (!String(dados.get("local")).trim()) falta.push("a cidade ou local");
    if (!String(dados.get("contacto")).trim()) falta.push("um contacto");
    if (falta.length) {
      erro.textContent = `Falta preencher ${falta.join(", ").replace(/, ([^,]*)$/, " e $1")}.`;
      erro.hidden = false;
      form.querySelector(`[name="${!String(dados.get("nome")).trim() ? "nome" : !String(dados.get("local")).trim() ? "local" : "contacto"}"]`).focus();
      return;
    }
    erro.hidden = true;

    const linhas = [
      "Olá CSP MOB! Pedido de booking pelo site:",
      `• Tipo: ${dados.get("tipo")}`,
      dados.get("evento") ? `• Evento / organização: ${dados.get("evento")}` : "",
      dados.get("data") ? `• Data: ${dataBonita(dados.get("data"))}` : "",
      `• Local: ${dados.get("local")}`,
      `• Nome: ${dados.get("nome")}`,
      `• Contacto: ${dados.get("contacto")}`,
      dados.get("mensagem") ? `• Mensagem: ${dados.get("mensagem")}` : "",
    ].filter(Boolean);
    texto = linhas.join("\n");

    const copiou = await copiarTexto();
    mostra.textContent = texto;
    feito.hidden = false;
    feito.querySelector("strong").textContent = copiou
      ? "O pedido foi copiado."
      : "Copia o pedido abaixo.";
    feito.scrollIntoView({ block: "nearest" });
    window.open("https://ig.me/m/csp.mob", "_blank", "noopener");
  });

  copiar.addEventListener("click", async () => {
    const ok = await copiarTexto();
    copiar.textContent = ok ? "Copiado ✓" : "Seleciona e copia o texto";
    setTimeout(() => (copiar.textContent = "Copiar outra vez"), 2000);
  });
})();
