const firebaseConfig = {
  apiKey: "AIzaSyCSgw4rhBLW5mq4QClulubf6e0hf5lDJbo",
  authDomain: "toner-manager-756c4.firebaseapp.com",
  projectId: "toner-manager-756c4"
};

if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const pages = ["dashboard", "registo", "stock", "historico", "computadores", "config"];
const subtitles = {
  dashboard: "Resumo geral",
  registo: "Adicionar toner",
  stock: "Toners disponíveis",
  historico: "Toners usados",
  computadores: "Checklist de instalação",
  config: "Preferências"
};
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

function el(id){ return document.getElementById(id); }
function abrirMenu(){ el('sidebar')?.classList.add('open'); el('overlay')?.classList.add('show'); }
function fecharMenu(){ el('sidebar')?.classList.remove('open'); el('overlay')?.classList.remove('show'); }
window.abrirMenu = abrirMenu;
window.fecharMenu = fecharMenu;

window.irParaPagina = function(page, btn){
  pages.forEach(id => el(id)?.classList.add('hidden'));
  el(page)?.classList.remove('hidden');
  document.querySelectorAll('.side-nav button').forEach(b => b.classList.remove('active'));
  const target = btn || document.querySelector(`.side-nav button[data-page="${page}"]`);
  if (target) target.classList.add('active');
  if (el('pageTitle')) el('pageTitle').innerText = target?.innerText.replace(/^\S+\s/, '') || 'App Braga';
  if (el('pageSub')) el('pageSub').innerText = subtitles[page] || '';
  if (page === 'computadores') carregarChecklist();
  fecharMenu();
};

window.preencherHoje = function(){
  const hoje = new Date().toISOString().split('T')[0];
  if (el('data')) el('data').value = hoje;
  if (el('dataPC')) el('dataPC').value = hoje;
};

async function gerarID(){
  const ref = db.collection('config').doc('contadorToner');
  return db.runTransaction(async tx => {
    const snap = await tx.get(ref);
    const valor = snap.exists ? (snap.data().valor || 0) + 1 : 1;
    tx.set(ref, { valor });
    return `TON-${String(valor).padStart(4,'0')}`;
  });
}

window.disponivel = async function(){
  const equipamento = el('equipamento')?.value || '';
  const localizacao = el('localizacao')?.value || 'Sem Localização';
  const cor = el('cor')?.value || '';
  const data = el('data')?.value || 'Não tem Data';
  if (!equipamento || !cor) {
    alert('Preenche equipamento e cor.');
    return;
  }
  const idInterno = await gerarID();
  await db.collection('stock').add({
    idInterno,
    equipamento,
    localizacao: localizacao || 'Sem Localização',
    cor,
    data,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });
  el('equipamento').value = '';
  el('localizacao').value = '';
  el('cor').value = '';
  el('data').value = '';
};

function renderStock(lista){
  const target = el('listaStock');
  const dash = el('dashboardStock');
  if (target) target.innerHTML = '';
  if (dash) dash.innerHTML = '';
  lista.forEach(item => {
    const html = `
      <div class="card">
        <div class="card-top">
          <div>
            <strong>${item.idInterno || ''}</strong>
            <div>${item.equipamento || ''} - ${item.cor || ''}</div>
            <small>📍 ${item.localizacao || 'Sem Localização'}</small>
            <small>📅 ${item.data || 'Não tem Data'}</small>
          </div>
          <input class="inline-check" type="checkbox" onchange="usar('${item.idDoc}')">
        </div>
      </div>`;
    if (target) target.insertAdjacentHTML('beforeend', html);
    if (dash) dash.insertAdjacentHTML('beforeend', html.replace(`onchange="usar('${item.idDoc}')"`, 'disabled'));
  });
}

window.filtrarStock = function(){
  const txt = (el('searchStock')?.value || '').toLowerCase();
  const filtrado = stockGlobal.filter(t => (t.localizacao || '').toLowerCase().includes(txt));
  renderStock(filtrado);
};
window.filtrarDashboard = function(){
  const txt = (el('dashboardSearch')?.value || '').toLowerCase();
  const filtrado = stockGlobal.filter(t => (t.localizacao || '').toLowerCase().includes(txt));
  renderStock(filtrado);
};

window.usar = async function(id){
  const ok = window.confirm('Marcar este toner como usado?');
  if (!ok) return;
  const ref = db.collection('stock').doc(id);
  const snap = await ref.get();
  if (!snap.exists) return;
  const dados = snap.data();
  await db.collection('historico').add({
    ...dados,
    usadoEm: firebase.firestore.FieldValue.serverTimestamp()
  });
  await ref.delete();
};

window.apagarHistorico = async function(id){
  if (!window.confirm('Apagar este registo do histórico?')) return;
  await db.collection('historico').doc(id).delete();
};

function carregarChecklist(){
  const target = el('checklist');
  if (!target) return;
  target.innerHTML = passos.map((p, i) => `
    <label class="check-item">
      <input type="checkbox" id="p${i}">
      <span>${p}</span>
    </label>`).join('');
}

window.guardarPC = async function(){
  const nome = el('nomePC')?.value?.trim() || '';
  const data = el('dataPC')?.value || 'Sem Data';
  if (!nome) {
    alert('Nome do computador obrigatório.');
    return;
  }
  const dados = passos.map((passo, i) => ({
    passo,
    feito: !!el(`p${i}`)?.checked
  }));
  await db.collection('pcs').add({
    nome,
    data,
    passos: dados,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });
  el('nomePC').value = '';
  el('dataPC').value = '';
  carregarChecklist();
};

window.apagarPC = async function(id){
  if (!window.confirm('Apagar este registo do computador?')) return;
  await db.collection('pcs').doc(id).delete();
};

function aplicarDark(ativo){
  document.body.classList.toggle('dark', !!ativo);
  if (el('darkSwitch')) el('darkSwitch').checked = !!ativo;
  localStorage.setItem('modo', ativo ? 'dark' : 'light');
}

function bindRealtime(){
  db.collection('stock').orderBy('createdAt', 'desc').onSnapshot(snap => {
    stockGlobal = [];
    snap.forEach(doc => {
      stockGlobal.push({ idDoc: doc.id, ...doc.data() });
    });
    if (el('countStock')) el('countStock').innerText = String(snap.size);
    renderStock(stockGlobal);
  }, () => {
    if (el('countStock')) el('countStock').innerText = '0';
  });

  db.collection('historico').orderBy('usadoEm', 'desc').onSnapshot(snap => {
    if (el('countUsados')) el('countUsados').innerText = String(snap.size);
    const target = el('listaHistorico');
    if (!target) return;
    target.innerHTML = '';
    snap.forEach(doc => {
      const item = doc.data();
      target.insertAdjacentHTML('beforeend', `
        <div class="card">
          <strong>${item.idInterno || ''}</strong>
          <div>${item.equipamento || ''} - ${item.cor || ''}</div>
          <small>📍 ${item.localizacao || 'Sem Localização'}</small>
          <small>📅 ${item.data || 'Não tem Data'}</small>
          <button class="delete-btn" onclick="apagarHistorico('${doc.id}')">❌ Apagar</button>
        </div>`);
    });
  });

  db.collection('pcs').orderBy('createdAt', 'desc').onSnapshot(snap => {
    if (el('countPCs')) el('countPCs').innerText = String(snap.size);
    const target = el('listaPC');
    if (!target) return;
    target.innerHTML = '';
    snap.forEach(doc => {
      const item = doc.data();
      const passosHtml = (item.passos || []).map(p => `<div>${p.feito ? '✔' : '❌'} ${p.passo}</div>`).join('');
      target.insertAdjacentHTML('beforeend', `
        <div class="card">
          <strong>${item.nome || ''}</strong>
          <small>📅 ${item.data || 'Sem Data'}</small>
          ${passosHtml}
          <button class="delete-btn" onclick="apagarPC('${doc.id}')">❌ Apagar</button>
        </div>`);
    });
  });
}

window.onload = function(){
  const dark = localStorage.getItem('modo') === 'dark';
  aplicarDark(dark);
  if (el('darkSwitch')) {
    el('darkSwitch').addEventListener('change', e => aplicarDark(e.target.checked));
  }
  carregarChecklist();
  bindRealtime();
  window.irParaPagina('dashboard');
};
