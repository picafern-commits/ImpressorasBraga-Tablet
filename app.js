/* =========================
   OCR + SCANNER ESTÁVEL
========================= */
const tonerMapStable = {
  "TK-3190": { equipamento: "P3155DN", cor: "Preto", codigo: "TK-3190" },
  "TK-8365Y": { equipamento: "TASKalfa_255ci", cor: "Amarelo", codigo: "TK-8365Y" },
  "TK-8365C": { equipamento: "TASKalfa_255ci", cor: "Azul", codigo: "TK-8365C" },
  "TK-8365M": { equipamento: "TASKalfa_255ci", cor: "Vermelho", codigo: "TK-8365M" },
  "TK-8365K": { equipamento: "TASKalfa_255ci", cor: "Preto", codigo: "TK-8365K" },
  "TK-3430": { equipamento: "PA5500x", cor: "Preto", codigo: "TK-3430" }
};

let scannerInstanceStable = null;
let scannerAtivoStable = false;

function mostrarOCRStatusStable(texto) {
  const box = el("ocrStatus");
  if (!box) return;
  box.style.display = "block";
  box.innerText = texto;
}

function normalizarTextoOCRStable(texto) {
  return String(texto || "")
    .replace(/[\r\n]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();
}

function preencherDataAtualSeVaziaStable() {
  const dataEl = el("data");
  if (!dataEl) return;

  if (!dataEl.value) {
    const hoje = new Date();
    const yyyy = hoje.getFullYear();
    const mm = String(hoje.getMonth() + 1).padStart(2, "0");
    const dd = String(hoje.getDate()).padStart(2, "0");
    dataEl.value = `${yyyy}-${mm}-${dd}`;
  }
}

function montarTextoLocalizacaoStable(item) {
  return `${item.serie} - ${item.armazem} - ${item.localizacao}`;
}

function procurarImpressoraPorUltimos3DigitosStable(final3) {
  const alvo = String(final3 || "").trim().toUpperCase();
  if (alvo.length !== 3) return null;

  return impressorasData.find(item => {
    const serie = String(item.serie || "").trim().toUpperCase();
    return serie.slice(-3) === alvo;
  }) || null;
}

function abrirSerie3DigitosStable() {
  const box = el("serial3Box");
  if (box) box.style.display = "block";

  const input = el("serial3Input");
  if (input) {
    input.value = "";
    setTimeout(() => input.focus(), 120);
  }
}

function fecharSerie3DigitosStable() {
  const box = el("serial3Box");
  if (box) box.style.display = "none";

  const input = el("serial3Input");
  if (input) input.value = "";
}

function aplicarDadosTonerStable(toner) {
  if (el("equipamento")) el("equipamento").value = toner.equipamento || "";
  if (el("cor")) el("cor").value = toner.cor || "";
  preencherDataAtualSeVaziaStable();
}

function extrairDadosEtiquetaOCRStable(texto) {
  const t = normalizarTextoOCRStable(texto);

  const tkMatch = t.match(/TK-\d{4}[A-Z]?/);
  const dataMatch = t.match(/\d{4}-\d{2}-\d{2}/);

  let serieEncontrada = "";
  for (const item of impressorasData) {
    const s = String(item.serie || "").toUpperCase();
    if (s && t.includes(s)) {
      serieEncontrada = item.serie;
      break;
    }
  }

  const tonerCode = tkMatch ? tkMatch[0] : "";
  const toner = tonerCode ? tonerMapStable[tonerCode] || null : null;

  return {
    tonerCode,
    equipamento: toner ? toner.equipamento : "",
    cor: toner ? toner.cor : "",
    data: dataMatch ? dataMatch[0] : "",
    serie: serieEncontrada
  };
}

function aplicarDadosOCRNoFormularioStable(dados) {
  if (!dados) return false;

  if (dados.equipamento && el("equipamento")) el("equipamento").value = dados.equipamento;
  if (dados.cor && el("cor")) el("cor").value = dados.cor;

  if (dados.data && el("data")) {
    el("data").value = dados.data;
  } else {
    preencherDataAtualSeVaziaStable();
  }

  if (dados.serie && el("localizacao")) {
    const printer = impressorasData.find(p => p.serie === dados.serie);
    if (printer) {
      el("localizacao").value = montarTextoLocalizacaoStable(printer);
    }
  } else if (dados.equipamento || dados.cor) {
    abrirSerie3DigitosStable();
  }

  return !!(dados.equipamento || dados.cor || dados.data || dados.serie);
}

function processarTextoLidoStable(textoLido) {
  const bruto = String(textoLido || "");
  const normal = normalizarTextoOCRStable(bruto);

  const tkMatch = normal.match(/TK-\d{4}[A-Z]?/);

  if (tkMatch) {
    const toner = tonerMapStable[tkMatch[0]] || null;

    if (toner) {
      aplicarDadosTonerStable(toner);
      mostrarMensagem(`Toner identificado: ${toner.codigo}`);
      abrirSerie3DigitosStable();
      return true;
    }
  }

  mostrarMensagem("Código não reconhecido para preenchimento automático.", "erro");
  return false;
}

async function startScannerStable() {
  const reader = el("reader");

  if (!reader) {
    mostrarMensagem("Zona do scanner não encontrada.", "erro");
    return;
  }

  if (typeof Html5Qrcode === "undefined") {
    mostrarMensagem("Biblioteca da câmara não carregada.", "erro");
    return;
  }

  if (scannerAtivoStable) {
    mostrarMensagem("A câmara já está aberta.", "erro");
    return;
  }

  reader.innerHTML = "";
  scannerInstanceStable = new Html5Qrcode("reader");

  try {
    await scannerInstanceStable.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: { width: 280, height: 180 } },
      (decodedText) => {
        processarTextoLidoStable(decodedText);
        stopScannerStable();
      },
      () => {}
    );

    scannerAtivoStable = true;
    mostrarMensagem("Câmara iniciada.");
  } catch (e) {
    console.error("Erro ao iniciar scanner:", e);
    mostrarMensagem("Não foi possível abrir a câmara.", "erro");
  }
}

async function stopScannerStable() {
  const reader = el("reader");

  if (!scannerInstanceStable || !scannerAtivoStable) {
    if (reader) reader.innerHTML = "";
    scannerAtivoStable = false;
    return;
  }

  try {
    await scannerInstanceStable.stop();
    await scannerInstanceStable.clear();
  } catch (e) {
    console.error("Erro ao fechar scanner:", e);
  } finally {
    scannerInstanceStable = null;
    scannerAtivoStable = false;
    if (reader) reader.innerHTML = "";
  }
}

function abrirOCRStable() {
  const input = el("ocrInput");
  if (!input) {
    mostrarMensagem("Input OCR não encontrado.", "erro");
    return;
  }

  input.value = "";
  input.click();
}

async function processarOCRInputStable(event) {
  const file = event && event.target && event.target.files ? event.target.files[0] : null;
  if (!file) return;

  if (typeof Tesseract === "undefined") {
    mostrarMensagem("Biblioteca OCR não carregada.", "erro");
    return;
  }

  try {
    mostrarOCRStatusStable("A ler a folha... pode demorar alguns segundos.");
    mostrarMensagem("A ler a folha...");

    const result = await Tesseract.recognize(file, "eng");
    const texto = result && result.data ? result.data.text : "";
    const dados = extrairDadosEtiquetaOCRStable(texto);
    const ok = aplicarDadosOCRNoFormularioStable(dados);

    const resumo = [
      dados.tonerCode ? `Toner: ${dados.tonerCode}` : "",
      dados.equipamento ? `Equipamento: ${dados.equipamento}` : "",
      dados.cor ? `Cor: ${dados.cor}` : "",
      dados.data ? `Data: ${dados.data}` : "",
      dados.serie ? `Série: ${dados.serie}` : ""
    ].filter(Boolean).join(" | ");

    mostrarOCRStatusStable(resumo || "A folha foi lida, mas não encontrei dados suficientes.");
    mostrarMensagem(ok ? "Folha lida com sucesso." : "Não encontrei dados suficientes na folha.", ok ? "sucesso" : "erro");
  } catch (e) {
    console.error("Erro OCR:", e);
    mostrarOCRStatusStable("Erro ao ler a folha.");
    mostrarMensagem("Erro ao ler a folha.", "erro");
  }
}

function confirmarSerie3DigitosStable() {
  const valor = ((el("serial3Input") && el("serial3Input").value) || "").trim().toUpperCase();

  if (valor.length !== 3) {
    mostrarMensagem("Introduza exatamente 3 dígitos.", "erro");
    return;
  }

  const printer = procurarImpressoraPorUltimos3DigitosStable(valor);
  if (!printer) {
    mostrarMensagem("Nenhuma impressora encontrada com esses 3 dígitos.", "erro");
    return;
  }

  if (el("localizacao")) {
    el("localizacao").value = montarTextoLocalizacaoStable(printer);
  }

  fecharSerie3DigitosStable();
  mostrarMensagem("Localização selecionada com sucesso.");
}

window.startScanner = startScannerStable;
window.stopScanner = stopScannerStable;
window.abrirOCR = abrirOCRStable;
window.processarOCRInput = processarOCRInputStable;
window.confirmarSerie3Digitos = confirmarSerie3DigitosStable;
window.fecharSerie3Digitos = fecharSerie3DigitosStable;
