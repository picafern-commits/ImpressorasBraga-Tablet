const firebaseConfig = {
  apiKey: "AIzaSyCSgw4rhBLW5mq4QClulubf6e0hf5lDJbo",
  authDomain: "toner-manager-756c4.firebaseapp.com",
  projectId: "toner-manager-756c4"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const passos = [
  "TEAMVIEWER HOST",
  "TEAMS",
  "DNS (192.168.0.204 & 192.168.0.205)",
  "NOME DO SISTEMA",
  "Atribuir Dominio",
  "Desinstalar MCFee",
  "Instalar Sophos",
  "MICROSOFT 365",
  "Instalar Impressora",
  "Alterar Definições de Energia",
  "Apagar User",
  "Criar novo user"
];

let stockGlobal = [];

// NAVEGAÇÃO
window.mostrarPagina = function(id) {
  document.querySelectorAll(".page").forEach(p => p.classList.add("hidden"));
  const alvo = document.getElementById(id);
  if (alvo) alvo.classList.remove("hidden");

  document.querySelectorAll(".side-nav button").forEach(b => b.classList.remove("active"));
  const btn = Array.from(document.querySelectorAll(".side-nav button"))
    .find(b => (b.getAttribute("onclick") || "").includes(`'${id}'`));
  if (btn) btn.classList.add("active");

  if (id === "computadores") carregarChecklist();
};

// DARK MODE
function initDarkMode() {
  const sw = document.getElementById("darkSwitch");
  if (!sw) return;

  const ativo = localStorage.getItem("modo") === "dark";
  document.body.classList.toggle("dark", ativo);
  sw.checked = ativo;

  sw.addEventListener("change", function() {
    document.body.classList.toggle("dark", this.checked);
    localStorage.setItem("modo", this.checked ? "dark" : "light");
  });
}

// IMPRESSORAS
async function gerarID() {
  const ref = db.collection("config").doc("contador");

  return db.runTransaction(async (t) => {
    const doc = await t.get(ref);
    const numero = doc.exists ? (doc.data().valor || 0) + 1 : 1;
    t.set(ref, { valor: numero });
    return "TON-" + String(numero).padStart(4, "0");
  });
}

window.disponivel = async function() {
  const equipamento = document.getElementById("equipamento").value;
  const localizacao = document.getElementById("localizacao").value;
  const cor = document.getElementById("cor").value;
  const data = document.getElementById("data").value;

  if (!equipamento || !cor) {
    alert("Preenche equipamento e cor.");
    return;
  }

  const idInterno = await gerarID();

  await db.collection("stock").add({
    idInterno,
    equipamento,
    localizacao: localizacao || "Sem Localização",
    cor,
    data: data || "Não tem Data",
    created: new Date()
  });

  document.getElementById("equipamento").value = "";
  document.getElementById("localizacao").value = "";
  document.getElementById("cor").value = "";
  document.getElementById("data").value = "";
};

window.usar = async function(docId) {
  const confirmar = confirm("Marcar como usado?");
  if (!confirmar) return;

  const ref = db.collection("stock").doc(docId);
  const snap = await ref.get();
  if (!snap.exists) return;

  await db.collection("historico").add({
    ...snap.data(),
    created: new Date(),
    usadoEm: new Date().toISOString()
  });

  await ref.delete();
};

window.apagarHistorico = async function(docId) {
  const confirmar = confirm("Apagar este registo?");
  if (!confirmar) return;
  await db.collection("historico").doc(docId).delete();
};

function renderStock(lista) {
  const el = document.getElementById("listaStock");
  if (!el) return;

  el.innerHTML = "";

  lista.forEach(t => {
    el.innerHTML += `
      <div class="card">
        <div class="card-top">
          <div>
            <strong>${t.idInterno || ""}</strong><br>
            ${t.equipamento || ""} - ${t.cor || ""}<br>
            <small>${t.localizacao || ""}</small>
            <small>${t.data || ""}</small>
          </div>
          <input class="inline-check" type="checkbox" onchange="usar('${t.idDoc}')">
        </div>
      </div>
    `;
  });
}

function initStock() {
  db.collection("stock").orderBy("created", "desc").onSnapshot((snap) => {
    const count = document.getElementById("countStock");
    if (count) count.innerText = snap.size;

    stockGlobal = [];
    snap.forEach((doc) => {
      stockGlobal.push({
        ...doc.data(),
        idDoc: doc.id
      });
    });

    renderStock(stockGlobal);
  });
}

function initHistorico() {
  db.collection("historico").orderBy("created", "desc").onSnapshot((snap) => {
    const lista = document.getElementById("listaHistorico");
    const count = document.getElementById("countUsados");
    if (count) count.innerText = snap.size;
    if (!lista) return;

    lista.innerHTML = "";

    snap.forEach((doc) => {
      const t = doc.data();
      lista.innerHTML += `
        <div class="card">
          <strong>${t.idInterno || ""}</strong><br>
          ${t.equipamento || ""} - ${t.cor || ""}<br>
          <small>${t.localizacao || ""}</small>
          <small>${t.data || ""}</small>
          <button class="delete-btn" onclick="apagarHistorico('${doc.id}')">❌ Apagar</button>
        </div>
      `;
    });
  });
}

// COMPUTADORES
function carregarChecklist() {
  const el = document.getElementById("checklist");
  if (!el) return;

  let html = "";
  passos.forEach((passo, i) => {
    html += `
      <label class="check-item">
        <input type="checkbox" id="p${i}">
        <span>${passo}</span>
      </label>
    `;
  });

  el.innerHTML = html;
}

window.guardarPC = async function() {
  const nome = document.getElementById("nomePC").value.trim();
  const data = document.getElementById("dataPC").value || "Sem Data";

  if (!nome) {
    alert("Nome do computador é obrigatório.");
    return;
  }

  const dados = passos.map((passo, i) => ({
    passo,
    feito: !!document.getElementById(`p${i}`)?.checked
  }));

  await db.collection("pcs").add({
    nome,
    data,
    passos: dados,
    created: new Date()
  });

  document.getElementById("nomePC").value = "";
  document.getElementById("dataPC").value = "";
  carregarChecklist();
};

window.apagarPC = async function(docId) {
  const confirmar = confirm("Apagar este registo?");
  if (!confirmar) return;
  await db.collection("pcs").doc(docId).delete();
};

function initPCs() {
  db.collection("pcs").orderBy("created", "desc").onSnapshot((snap) => {
    const lista = document.getElementById("listaPC");
    const count = document.getElementById("countPCs");
    if (count) count.innerText = snap.size;
    if (!lista) return;

    lista.innerHTML = "";

    snap.forEach((doc) => {
      const d = doc.data();
      let passosHtml = "";

      (d.passos || []).forEach((p) => {
        passosHtml += `<div>${p.feito ? "✔" : "❌"} ${p.passo}</div>`;
      });

      lista.innerHTML += `
        <div class="card">
          <strong>${d.nome || ""}</strong><br>
          <small>📅 ${d.data || "Sem Data"}</small>
          <div style="margin-top:10px">${passosHtml}</div>
          <button class="delete-btn" onclick="apagarPC('${doc.id}')">❌ Apagar</button>
        </div>
      `;
    });
  });
}

// MANUTENÇÃO
window.guardarManutencao = async function() {
  const equipamento = document.getElementById("manutEquipamento").value.trim();
  const local = document.getElementById("manutLocal").value.trim();
  const descricao = document.getElementById("manutDescricao").value.trim();
  const data = document.getElementById("manutData").value || "Sem Data";

  if (!equipamento || !descricao) {
    alert("Preenche equipamento e descrição.");
    return;
  }

  await db.collection("manutencoes").add({
    equipamento,
    local,
    descricao,
    data,
    created: new Date()
  });

  document.getElementById("manutEquipamento").value = "";
  document.getElementById("manutLocal").value = "";
  document.getElementById("manutDescricao").value = "";
  document.getElementById("manutData").value = "";
};

window.apagarManutencao = async function(docId) {
  if (!confirm("Apagar manutenção?")) return;
  await db.collection("manutencoes").doc(docId).delete();
};

function initManutencao() {
  db.collection("manutencoes").orderBy("created", "desc").onSnapshot((snap) => {
    const lista = document.getElementById("listaManutencao");
    const count = document.getElementById("countManut");
    if (count) count.innerText = snap.size;
    if (!lista) return;

    lista.innerHTML = "";
    snap.forEach((doc) => {
      const d = doc.data();
      lista.innerHTML += `
        <div class="card">
          <strong>${d.equipamento}</strong><br>
          <small>${d.local || ""}</small>
          <small>📅 ${d.data || ""}</small>
          <div style="margin-top:10px">${d.descricao || ""}</div>
          <button class="delete-btn" onclick="apagarManutencao('${doc.id}')">❌ Apagar</button>
        </div>
      `;
    });
  });
}

// PISTOLAS
window.guardarPistola = async function() {
  const nome = document.getElementById("pistolaNome").value.trim();
  const estado = document.getElementById("pistolaEstado").value;
  const obs = document.getElementById("pistolaObs").value.trim();

  if (!nome || !estado) {
    alert("Preenche nome e estado.");
    return;
  }

  await db.collection("pistolas").add({
    nome,
    estado,
    obs,
    created: new Date()
  });

  document.getElementById("pistolaNome").value = "";
  document.getElementById("pistolaEstado").value = "";
  document.getElementById("pistolaObs").value = "";
};

window.apagarPistola = async function(docId) {
  if (!confirm("Apagar pistola?")) return;
  await db.collection("pistolas").doc(docId).delete();
};

function initPistolas() {
  db.collection("pistolas").orderBy("created", "desc").onSnapshot((snap) => {
    const lista = document.getElementById("listaPistolas");
    const count = document.getElementById("countPistolas");
    if (count) count.innerText = snap.size;
    if (!lista) return;

    lista.innerHTML = "";
    snap.forEach((doc) => {
      const d = doc.data();
      lista.innerHTML += `
        <div class="card">
          <strong>${d.nome}</strong><br>
          <small>${d.estado}</small>
          <small>${d.obs || ""}</small>
          <button class="delete-btn" onclick="apagarPistola('${doc.id}')">❌ Apagar</button>
        </div>
      `;
    });
  });
}

// PORTAS
window.guardarPorta = async function() {
  const local = document.getElementById("portaLocal").value.trim();
  const numero = document.getElementById("portaNumero").value.trim();
  const equipamento = document.getElementById("portaEquipamento").value.trim();
  const obs = document.getElementById("portaObs").value.trim();

  if (!local || !numero) {
    alert("Preenche local e porta.");
    return;
  }

  await db.collection("portasRede").add({
    local,
    numero,
    equipamento,
    obs,
    created: new Date()
  });

  document.getElementById("portaLocal").value = "";
  document.getElementById("portaNumero").value = "";
  document.getElementById("portaEquipamento").value = "";
  document.getElementById("portaObs").value = "";
};

window.apagarPorta = async function(docId) {
  if (!confirm("Apagar porta?")) return;
  await db.collection("portasRede").doc(docId).delete();
};

function initPortas() {
  db.collection("portasRede").orderBy("created", "desc").onSnapshot((snap) => {
    const lista = document.getElementById("listaPortas");
    if (!lista) return;

    lista.innerHTML = "";
    snap.forEach((doc) => {
      const d = doc.data();
      lista.innerHTML += `
        <div class="card">
          <strong>${d.local}</strong><br>
          <small>Porta: ${d.numero}</small>
          <small>${d.equipamento || ""}</small>
          <small>${d.obs || ""}</small>
          <button class="delete-btn" onclick="apagarPorta('${doc.id}')">❌ Apagar</button>
        </div>
      `;
    });
  });
}

// USERS
window.guardarUser = async function() {
  const nome = document.getElementById("userNome").value.trim();
  const login = document.getElementById("userLogin").value.trim();
  const departamento = document.getElementById("userDepartamento").value.trim();
  const estado = document.getElementById("userEstado").value;

  if (!nome || !login) {
    alert("Preenche nome e login.");
    return;
  }

  await db.collection("usersApp").add({
    nome,
    login,
    departamento,
    estado,
    created: new Date()
  });

  document.getElementById("userNome").value = "";
  document.getElementById("userLogin").value = "";
  document.getElementById("userDepartamento").value = "";
  document.getElementById("userEstado").value = "";
};

window.apagarUser = async function(docId) {
  if (!confirm("Apagar user?")) return;
  await db.collection("usersApp").doc(docId).delete();
};

function initUsers() {
  db.collection("usersApp").orderBy("created", "desc").onSnapshot((snap) => {
    const lista = document.getElementById("listaUsers");
    const count = document.getElementById("countUsers");
    if (count) count.innerText = snap.size;
    if (!lista) return;

    lista.innerHTML = "";
    snap.forEach((doc) => {
      const d = doc.data();
      lista.innerHTML += `
        <div class="card">
          <strong>${d.nome}</strong><br>
          <small>${d.login}</small>
          <small>${d.departamento || ""}</small>
          <small>${d.estado || ""}</small>
          <button class="delete-btn" onclick="apagarUser('${doc.id}')">❌ Apagar</button>
        </div>
      `;
    });
  });
}

// INIT
window.onload = function() {
  carregarChecklist();
  initDarkMode();
  initStock();
  initHistorico();
  initPCs();
  initManutencao();
  initPistolas();
  initPortas();
  initUsers();
  mostrarPagina("dashboard");
};
