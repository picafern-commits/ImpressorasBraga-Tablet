
const firebaseConfig = {
  apiKey: "AIzaSyCSgw4rhBLW5mq4QClulubf6e0hf5lDJbo",
  authDomain: "toner-manager-756c4.firebaseapp.com",
  projectId: "toner-manager-756c4"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();


// ================= PORTAS =================

let portasData = [];
let pistolasData = [];
let usersData = [];

function renderPortas(){
  const lista = document.getElementById("listaPortas");
  if(!lista) return;

  lista.innerHTML = "";

  portasData.forEach((p)=>{
    lista.innerHTML += `
      <div class="card">
        <b>${p.porta || ""}</b> - ${p.local || ""}
        <br>
        ${p.user || ""}
        <br>
        ${p.ip || ""}
        <br><br>
        <button onclick="editarPorta('${p.id}')">Editar</button>
        <button onclick="apagarPorta('${p.id}')">Apagar</button>
      </div>
    `;
  });
}

async function adicionarPorta(){
  const porta = prompt("Porta:");
  if(!porta) return;

  await db.collection("portas").add({
    porta,
    local:"",
    user:"",
    equipamento:"",
    ip:""
  });
}

async function editarPorta(id){
  const novo = prompt("Novo valor da porta:");
  if(!novo) return;

  await db.collection("portas")
    .doc(id)
    .update({
      porta:novo
    });
}

async function apagarPorta(id){
  await db.collection("portas")
    .doc(id)
    .delete();
}

function iniciarPortasRealtime(){
  db.collection("portas")
    .onSnapshot((snapshot)=>{

      portasData = snapshot.docs.map(doc=>({
        id:doc.id,
        ...doc.data()
      }));

      renderPortas();
    });
}

// ================= PISTOLAS =================

function renderPistolas(){

  const lista = document.getElementById("listaPistolas");
  if(!lista) return;

  lista.innerHTML = "";

  pistolasData.forEach((p)=>{

    lista.innerHTML += `
      <div class="card">
        <b>${p.nome || ""}</b>
        <br>
        ${p.operador || ""}
        <br>
        ${p.armazem || ""}
        <br><br>
        <button onclick="editarPistola('${p.id}')">Editar</button>
        <button onclick="apagarPistola('${p.id}')">Apagar</button>
      </div>
    `;
  });
}

async function adicionarPistola(){

  const nome = prompt("Nome da pistola:");
  if(!nome) return;

  await db.collection("pistolas").add({
    nome,
    operador:"",
    armazem:"",
    estado:""
  });
}

async function editarPistola(id){

  const nome = prompt("Novo nome:");
  if(!nome) return;

  await db.collection("pistolas")
    .doc(id)
    .update({
      nome
    });
}

async function apagarPistola(id){

  await db.collection("pistolas")
    .doc(id)
    .delete();
}

function iniciarPistolasRealtime(){

  db.collection("pistolas")
    .onSnapshot((snapshot)=>{

      pistolasData = snapshot.docs.map(doc=>({
        id:doc.id,
        ...doc.data()
      }));

      renderPistolas();
    });
}

// ================= USERS =================

function renderUsers(){

  const lista = document.getElementById("listaUsers");
  if(!lista) return;

  lista.innerHTML = "";

  usersData.forEach((u)=>{

    lista.innerHTML += `
      <div class="card">
        <b>${u.nome || ""}</b>
        <br>
        ${u.zona || ""}
        <br><br>
        <button onclick="editarUser('${u.id}')">Editar</button>
        <button onclick="apagarUser('${u.id}')">Apagar</button>
      </div>
    `;
  });
}

async function adicionarUser(){

  const nome = prompt("Nome:");
  if(!nome) return;

  await db.collection("users").add({
    nome,
    zona:"",
    user_pc_eye:""
  });
}

async function editarUser(id){

  const nome = prompt("Novo nome:");
  if(!nome) return;

  await db.collection("users")
    .doc(id)
    .update({
      nome
    });
}

async function apagarUser(id){

  await db.collection("users")
    .doc(id)
    .delete();
}

function iniciarUsersRealtime(){

  db.collection("users")
    .onSnapshot((snapshot)=>{

      usersData = snapshot.docs.map(doc=>({
        id:doc.id,
        ...doc.data()
      }));

      renderUsers();
    });
}

// ================= START =================

window.addEventListener("DOMContentLoaded", ()=>{

  iniciarPortasRealtime();
  iniciarPistolasRealtime();
  iniciarUsersRealtime();
});
