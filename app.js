const firebaseConfig = {
  apiKey: "AIzaSyCSgw4rhBLW5mq4QClulubf6e0hf5lDJbo",
  authDomain: "toner-manager-756c4.firebaseapp.com",
  projectId: "toner-manager-756c4"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const db = firebase.firestore();

let stockGlobal = [];
let historicoGlobal = [];
let pcsGlobal = [];
let manutencoesGlobal = [];

function el(id) {
  return document.getElementById(id);
}

function setText(id, value) {
  const node = el(id);
  if (node) node.innerText = value;
}

function normalizarTexto(valor) {
  return String(valor || "").toLowerCase().trim();
}

function mostrarMensagem(texto, tipo = "sucesso") {
  let toast = el("toast");

  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.className = "toast-app";
    document.body.appendChild(toast);
  }

  toast.className = `toast-app ${tipo}`;
  toast.innerText = texto;
  toast.style.display = "block";

  clearTimeout(toast._t);
  toast._t = setTimeout(() => {
    toast.style.display = "none";
  }, 2200);
}




/* =========================
   SCANNER FINAL LIMPO
========================= */
let scannerInstance = null;
let scannerAtivo = false;

function startScanner() {
  const reader = document.getElementById("reader");

  if (!reader) {
    alert("Zona do scanner não encontrada");
    return;
  }

  if (typeof Html5Qrcode === "undefined") {
    alert("Erro: biblioteca da câmara não carregou");
    return;
  }

  if (scannerAtivo) return;

  reader.innerHTML = "";
  scannerInstance = new Html5Qrcode("reader");

  scannerInstance.start(
    { facingMode: "environment" },
    { fps: 10, qrbox: { width: 280, height: 180 } },
    (decodedText) => {
      console.log("Lido:", decodedText);

      if (typeof preencherFormularioPorCodigo === "function") {
        preencherFormularioPorCodigo(decodedText);
      }

      stopScanner();
    }
  ).then(() => {
    scannerAtivo = true;
  }).catch(err => {
    console.error(err);
    alert("Erro a abrir câmara");
  });
}

function stopScanner() {
  if (!scannerInstance) return;

  scannerInstance.stop().then(() => {
    scannerInstance.clear();
    scannerInstance = null;
    scannerAtivo = false;
    document.getElementById("reader").innerHTML = "";
  }).catch(() => {});
}

window.startScanner = startScanner;
window.stopScanner = stopScanner;
