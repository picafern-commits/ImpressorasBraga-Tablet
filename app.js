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

function normalizarTexto(v) {
  return String(v || "").toLowerCase().trim();
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

function abrirMenu() {
  el("mobileSidebar")?.classList.add("open");
  el("mobileOverlay")?.classList.add("show");
}

function fecharMenu() {
  el("mobileSidebar")?.classList.remove("open");
  el("mobileOverlay")?.classList.remove("show");
}

function mudarPagina(p) {
  const paginas = [
    "dashboard",
    "registoPage",
    "stockPage",
    "historicoPage",
    "computadores",
    "impressorasLista",
    "manutencaoImpressoras",
    "pistolasPage",
    "portasPage",
    "usersPage",
    "config"
  ];

  paginas.forEach(id => {
    const sec = el(id);
    if (sec) sec.style.display = "none";
  });

  const atual = el(p);
  if (atual) atual.style.display = "block";

  const subtitulos = {
    dashboard: "Dashboard Toners",
    registoPage: "Registo Toners",
    stockPage: "Toners disponíveis",
    historicoPage: "Toners usados",
    computadores: "Checklist de instalação",
    impressorasLista: "Lista de impressoras",
    manutencaoImpressoras: "Pedidos de manutenção",
    pistolasPage: "Pistolas CK65",
    portasPage: "Portas de rede",
    usersPage: "Utilizadores",
    config: "Preferências"
  };

  if (el("headerSubtitle")) {
    el("headerSubtitle").innerText = subtitulos[p] || "Gestão móvel";
  }

  if (p === "computadores") carregarChecklist();
  fecharMenu();
}

function irParaPagina(p) {
  mudarPagina(p);
}

/* =========================
   DADOS IMPRESSORAS
========================= */
const impressorasData = [
  { modelo: "Kyocera P3155dn", serie: "R4B2229805", armazem: "Braga", localizacao: "Ilha 01", ip: "192.168.10.178" },
  { modelo: "Ecosys PA5500x", serie: "WD44336210", armazem: "Braga", localizacao: "Ilha 02", ip: "192.168.10.179" },
  { modelo: "Kyocera P3155dn", serie: "R4B1395508", armazem: "Braga", localizacao: "Ilha 03", ip: "192.168.10.180" },
  { modelo: "Kyocera P3155dn", serie: "R4B1293179", armazem: "Braga", localizacao: "Ilha 04", ip: "192.168.10.181" },
  { modelo: "Kyocera P3155dn", serie: "R4B1293180", armazem: "Braga", localizacao: "Ilha 05", ip: "192.168.10.182" },
  { modelo: "Kyocera P3155dn", serie: "R4B1293183", armazem: "Braga", localizacao: "Balcão 01", ip: "192.168.10.183" },
  { modelo: "Kyocera P3155dn", serie: "R4B1293184", armazem: "Braga", localizacao: "Balcão 02", ip: "192.168.10.184" },
  { modelo: "Kyocera P3155dn", serie: "R4B2230012", armazem: "Braga", localizacao: "Dep. Logistica", ip: "192.168.10.185" },
  { modelo: "Kyocera P3155dn", serie: "R4B1293173", armazem: "Braga", localizacao: "G/Encomendas", ip: "192.168.10.186" },
  { modelo: "Kyocera P3155dn", serie: "R4B1395261", armazem: "Braga", localizacao: "Devoluções", ip: "192.168.10.187" },
  { modelo: "TASKalfa 2554ci", serie: "RVP0Z03770", armazem: "Braga", localizacao: "Escritorio", ip: "192.168.10.197" },
  { modelo: "Kyocera P3155dn", serie: "R4B1293169", armazem: "Vila Real", localizacao: "Ilha 01", ip: "192.168.11.110" },
  { modelo: "Kyocera P3155dn", serie: "R4B1293174", armazem: "Vila Real", localizacao: "Ilha 02", ip: "192.168.11.108" },
  { modelo: "TASKalfa 2554ci", serie: "RVP0Z03715", armazem: "Vila Real", localizacao: "Ilha 03", ip: "192.168.11.201" }
];

/* =========================
   DADOS PISTOLAS
========================= */
const pistolasData = [
  { num: 01, nome: "BRA01", password: "123456", cn: "CK65-L0N-BSC210E", sn: "25105D81B7", mac: "0C:23:69:ED:7D:05", operador: "Márcio Vilela", armazem: "Vila Real", prontas: "2026-01-12", estado: "" },
  { num: 02, nome: "BRA02", password: "123456", cn: "CK65-L0N-BSC210E", sn: "25105D8148", mac: "0C:23:69:ED:92:68", operador: "Mário Roberto Gomes Monteiro", armazem: "Braga", prontas: "2026-01-12", estado: "" },
  { num: 03, nome: "BRA03", password: "123456", cn: "CK65-L0N-BSC210E", sn: "25105D81A8", mac: "0C:23:69:ED:88:CF", operador: "Joao Abel Pacheco", armazem: "Braga", prontas: "2026-01-12", estado: "" },
  { num: 04, nome: "BRA04", password: "123456", cn: "CK65-L0N-BSC210E", sn: "25105D8143", mac: "0C:23:69:ED:94:51", operador: "Carlos Avelino Lopes Silva", armazem: "Braga", prontas: "2026-01-12", estado: "" },
  { num: 05, nome: "BRA05", password: "123456", cn: "CK65-L0N-BSC210E", sn: "25105D813E", mac: "0C:23:69:ED:7C:F6", operador: "Papa Bei", armazem: "Braga", prontas: "2026-01-12", estado: "" },
  { num: 06, nome: "BRA06", password: "123456", cn: "CK65-L0N-BSC210E", sn: "25105D8105", mac: "0C:23:69:ED:88:A2", operador: "Aguinaldo Enoque de Oliveira Epalanga", armazem: "Braga", prontas: "2026-01-12", estado: "" },
  { num: 07, nome: "BRA07", password: "123456", cn: "CK65-L0N-BSC210E", sn: "25105D813D", mac: "0C:23:69:ED:89:B0", operador: "Luís Faria", armazem: "Vila Real", prontas: "2026-01-12", estado: "" },
  { num: 08, nome: "BRA08", password: "123456", cn: "CK65-L0N-BSC210E", sn: "25105D8152", mac: "0C:23:69:ED:87:9A", operador: "Paulo Sérgio Marques Pimenta", armazem: "Braga", prontas: "2026-01-12", estado: "" },
  { num: 09, nome: "BRA09", password: "123456", cn: "CK65-L0N-BSC210E", sn: "25105D810C", mac: "0C:23:69:ED:89:68", operador: "André Correia", armazem: "Vila Real", prontas: "2026-01-12", estado: "" },
  { num: 10, nome: "BRA10", password: "123456", cn: "CK65-L0N-BSC210E", sn: "25105D8103", mac: "0C:23:69:ED:88:60", operador: "Luis Filipe Bragas Silva", armazem: "Braga", prontas: "2026-01-12", estado: "" },
  { num: 11, nome: "BRA11", password: "123456", cn: "CK65-L0N-BSC210E", sn: "25154D80E9", mac: "0C:23:69:ED:CC:EE", operador: "Cristiana Da Silva Oliveira/fernandes", armazem: "Braga", prontas: "2026-01-12", estado: "" },
  { num: 12, nome: "BRA12", password: "123456", cn: "CK65-L0N-BSC210E", sn: "25105D813C", mac: "0C:23:69:ED:93:73", operador: "Diogo Gomes Da Mota", armazem: "Braga", prontas: "2026-01-12", estado: "" },
  { num: 13, nome: "BRA13", password: "123456", cn: "CK65-L0N-BSC210E", sn: "25105D819F", mac: "0C:23:69:ED:83:EF", operador: "André Filipe Brandão Batista", armazem: "Braga", prontas: "2026-01-12", estado: "" },
  { num: 14, nome: "BRA14", password: "123456", cn: "CK65-L0N-BSC210E", sn: "25105D8141", mac: "0C:23:69:ED:93:22", operador: "Rafael David Martins Cunha", armazem: "Braga", prontas: "2026-01-12", estado: "" },
  { num: 15, nome: "BRA15", password: "123456", cn: "CK65-L0N-BSC210E", sn: "25105D813F", mac: "0C:23:69:ED:89:A7", operador: "Leonel Alexandre Gomes Pereira", armazem: "Braga", prontas: "2026-01-12", estado: "" },
  { num: 16, nome: "BRA16", password: "123456", cn: "CK65-L0N-BSC210E", sn: "25105D8142", mac: "0C:23:69:ED:89:E6", operador: "Joao Pedro Fernandes Da Silva", armazem: "Braga", prontas: "2026-01-12", estado: "" },
  { num: 17, nome: "BRA17", password: "123456", cn: "CK65-L0N-BSC210E", sn: "25105D811F", mac: "0C:23:69:ED:7C:5A", operador: "Miguel Esteves", armazem: "Vila Real", prontas: "2026-01-12", estado: "" },
  { num: 18, nome: "BRA18", password: "123456", cn: "CK65-L0N-BSC210E", sn: "25105D80BF", mac: "0C:23:69:ED:8A:7C", operador: "Daniel Chukhleb", armazem: "Braga", prontas: "2026-01-12", estado: "" },
  { num: 19, nome: "BRA19", password: "123456", cn: "CK65-L0N-BSC210E", sn: "25105D81AE", mac: "0C:23:69:ED:7C:78", operador: "Fábio Alexandre Vaz Pereira", armazem: "Braga", prontas: "2026-01-12", estado: "" },
  { num: 20, nome: "BRA20", password: "123456", cn: "CK65-L0N-BSC210E", sn: "25105D814F", mac: "0C:23:69:ED:90:DF", operador: "Hugo Carvalho", armazem: "Vila Real", prontas: "2026-01-12", estado: "" },
  { num: 21, nome: "BRA21", password: "123456", cn: "CK65-L0N-BSC210E", sn: "25105D8151", mac: "0C:23:69:ED:92:8F", operador: "Rafael SIlva Araujo", armazem: "Braga", prontas: "2026-01-12", estado: "" },
  { num: 22, nome: "BRA22", password: "123456", cn: "CK65-L0N-BSC210E", sn: "25105D8199", mac: "0C:23:69:ED:83:1A", operador: "José Miguel Pereira Araujo", armazem: "Braga", prontas: "2026-01-12", estado: "" },
  { num: 23, nome: "BRA23", password: "123456", cn: "CK65-L0N-BSC210E", sn: "25105D8136", mac: "0C:23:69:ED:93:5B", operador: "Micael Da Costa Marques", armazem: "Braga", prontas: "2026-01-12", estado: "" },
  { num: 24, nome: "BRA24", password: "123456", cn: "CK65-L0N-BSC210E", sn: "25105D817A", mac: "0C:23:69:ED:84:2B", operador: "Rui Jorge Sousa Fernandes", armazem: "Braga", prontas: "2026-01-12", estado: "" },
  { num: 25, nome: "BRA25", password: "123456", cn: "CK65-L0N-BSC210E", sn: "25105D81A6", mac: "0C:23:69:ED:88:B4", operador: "Rui Filipe Gonçalves Bernardo", armazem: "Braga", prontas: "2026-01-12", estado: "" },
  { num: 26, nome: "BRA26", password: "123456", cn: "CK65-L0N-BSC210E", sn: "25105D8114", mac: "0C:23:69:ED:83:98", operador: "Leonardo Alexandre Silva Ferreira", armazem: "Braga", prontas: "2026-01-12", estado: "" },
  { num: 27, nome: "BRA27", password: "123456", cn: "CK65-L0N-BSC210E", sn: "25105D8161", mac: "0C:23:69:ED:93:EB", operador: "Pedro Esteves", armazem: "Vila Real", prontas: "2026-01-12", estado: "" },
  { num: 28, nome: "BRA28", password: "123456", cn: "CK65-L0N-BSC210E", sn: "25105D81AB", mac: "0C:23:69:ED:7C:D8", operador: "Rafael Gonçalves Silva", armazem: "Braga", prontas: "2026-01-12", estado: "" },
  { num: 29, nome: "BRA29", password: "123456", cn: "CK65-L0N-BSC210E", sn: "25105D80BD", mac: "0C:23:69:ED:88:9F", operador: "José Miguel Silva Lopes", armazem: "Braga", prontas: "2026-01-12", estado: "" },
  { num: 30, nome: "BRA30", password: "123456", cn: "CK65-L0N-BSC210E", sn: "25105D80C9", mac: "0C:23:69:ED:8A:79", operador: "Diogo Vieira Costa", armazem: "Braga", prontas: "2026-01-12", estado: "" },
  { num: 31, nome: "BRA31", password: "123456", cn: "CK65-L0N-BSC210E", sn: "23138D820C", mac: "0C:23:69:A2:FB:F2", operador: "Dmitrii Diuldin", armazem: "Braga", prontas: "2026-01-12", estado: "" },
  { num: 32, nome: "BRA32", password: "123456", cn: "CK65-L0N-BSC210E", sn: "23139D8288", mac: "0C:23:69:A3:05:40", operador: "Francisco Pereira Silva", armazem: "Braga", prontas: "2026-01-12", estado: "" },
  { num: 33, nome: "BRA33", password: "123456", cn: "CK65-L0N-BSC210E", sn: "23059D8073", mac: "0C:23:69:A2:4B:B2", operador: "Tiago Filipe Ferreira De Melo", armazem: "Braga", prontas: "2026-01-12", estado: "" },
  { num: 34, nome: "BRA34", password: "123456", cn: "CK65-L0N-BSC210E", sn: "24075D802B", mac: "C4:EF:DA:06:1A:34", operador: "Fábio Filipe Macedo Ferreira Da Silva", armazem: "Braga", prontas: "2026-01-12", estado: "" },
  { num: 35, nome: "BRA35", password: "123456", cn: "CK65-L0N-BSC210E", sn: "24074D8336", mac: "C4:EF:DA:05:EC:F2", operador: "José Ferreira Da Silva", armazem: "Braga", prontas: "2026-01-12", estado: "" },
  { num: 36, nome: "BRA36", password: "123456", cn: "CK65-L0N-BSC210E", sn: "23130D8005", mac: "0C:23:69:A3:1F:3E", operador: "Carlos Miguel Abreu Gomes", armazem: "Braga", prontas: "2026-01-12", estado: "" },
  { num: 37, nome: "BRA37", password: "123456", cn: "CK65-L0N-BSC210E", sn: "24074D8320", mac: "C4:EF:DA:05:E6:AD", operador: "Jorge Miguel Ribeiro Rodrigues", armazem: "Braga", prontas: "2026-01-12", estado: "" },
  { num: 38, nome: "BRA38", password: "123456", cn: "CK65-L0N-BSC210E", sn: "24074D8305", mac: "C4:EF:DA:05:B9:32", operador: "José Miguel Castro Gomes", armazem: "Braga", prontas: "2026-01-12", estado: "" },
  { num: 39, nome: "BRA39", password: "123456", cn: "CK65-L0N-BSC210E", sn: "24074D8311", mac: "C4:EF:DA:05:9F:97", operador: "Andre Nuno Gomes Da Costa", armazem: "Braga", prontas: "2026-01-12", estado: "" },
  { num: 40, nome: "BRA40", password: "123456", cn: "CK65-L0N-BSC210E", sn: "24075D8027", mac: "C4:EF:DA:06:16:80", operador: "Henrique Filipe Gomes Ferreira", armazem: "Braga", prontas: "2026-01-12", estado: "" },
  { num: 41, nome: "BRA41", password: "123456", cn: "CK65-L0N-BSC210E", sn: "23057D80E0", mac: "0C:23:69:A2:3A:BD", operador: "Pedro José Peixoto Machado", armazem: "Braga", prontas: "2026-01-12", estado: "" },
  { num: 42, nome: "BRA42", password: "123456", cn: "CK65-L0N-BSC210E", sn: "24074D831E", mac: "C4:EF:DA:06:18:C3", operador: "Marcelino Rafael Domingues Fernandes", armazem: "Braga", prontas: "2026-01-12", estado: "" },
  { num: 43, nome: "BRA49", password: "123456", cn: "CK65-L0N-BSC210E", sn: "24075D8068", mac: "C4:EF:DA:06:15:F9", operador: "Reserva", armazem: "Braga", prontas: "2026-02-24", estado: "" },
  { num: 44, nome: "BRA44", password: "123456", cn: "CK65-L0N-BSC210E", sn: "24075D8092", mac: "C4:EF:DA:06:18:FF", operador: "Gonçalo Santos", armazem: "Braga", prontas: "2026-01-12", estado: "" },
  { num: 45, nome: "BRA45", password: "123456", cn: "CK65-L0N-BSC210E", sn: "24074D834D", mac: "C4:EF:DA:05:EF:BC", operador: "Joao Ferreira", armazem: "Braga", prontas: "2026-02-24", estado: "" },
  { num: 46, nome: "BRA46", password: "123456", cn: "CK65-L0N-BSC210E", sn: "24075D8082", mac: "C4:EF:DA:06:1A:5A", operador: "Pedro Fernandes", armazem: "Braga", prontas: "2026-02-24", estado: "" },
  { num: 47, nome: "BRA47", password: "123456", cn: "CK65-L0N-BSC210E", sn: "24074D83A2", mac: "C4:EF:DA:06:18:A7", operador: "Carlos Pinto", armazem: "Braga", prontas: "2026-02-24", estado: "" },
  { num: 48, nome: "BRA48", password: "123456", cn: "CK65-L0N-BSC210E", sn: "23130D80C6", mac: "0C:23:69:A3:04:1A", operador: "Reserva", armazem: "Braga", prontas: "2026-02-24", estado: "" }
];

/* =========================
   DADOS PORTAS
========================= */
const portasData = [
  { porta: "127", local: "Ilha 01", user: "Mesa 01", equipamento: "", ip: "" },
  { porta: "126", local: "Ilha 01", user: "Mesa 01", equipamento: "Computador", ip: "192.168.10.101" },

  { porta: "125", local: "Ilha 01", user: "Mesa 02", equipamento: "Impressora", ip: "192.168.10.178" },
  { porta: "124", local: "Ilha 01", user: "Mesa 02", equipamento: "Computador", ip: "192.168.10.102" },

  { porta: "123", local: "Ilha 02", user: "Mesa 03", equipamento: "", ip: "" },
  { porta: "122", local: "Ilha 02", user: "Mesa 03", equipamento: "Computador", ip: "192.168.10.103" },

  { porta: "121", local: "Ilha 02", user: "Mesa 04", equipamento: "Impressora", ip: "192.168.10.179" },
  { porta: "120", local: "Ilha 02", user: "Mesa 04", equipamento: "Computador", ip: "192.168.10.104" },

  { porta: "119", local: "Ilha 03", user: "Mesa 05", equipamento: "Impressora", ip: "192.168.10.180" },
  { porta: "118", local: "Ilha 03", user: "Mesa 05", equipamento: "Computador", ip: "192.168.10.105" },

  { porta: "117", local: "Ilha 03", user: "Mesa 06", equipamento: "", ip: "" },
  { porta: "116", local: "Ilha 03", user: "Mesa 06", equipamento: "Computador", ip: "192.168.10.106" },

  { porta: "115", local: "Ilha 04", user: "Mesa 07", equipamento: "Impressora", ip: "192.168.10.181" },
  { porta: "114", local: "Ilha 04", user: "Mesa 07", equipamento: "Computador", ip: "192.168.10.107" },

  { porta: "113", local: "Ilha 04", user: "Mesa 08", equipamento: "", ip: "" },
  { porta: "112", local: "Ilha 04", user: "Mesa 08", equipamento: "Computador", ip: "192.168.10.108" },

  { porta: "111", local: "Ilha 05", user: "Mesa 09", equipamento: "Impressora", ip: "192.168.10.182" },
  { porta: "110", local: "Ilha 05", user: "Mesa 09", equipamento: "Computador", ip: "192.168.10.109" },

  { porta: "109", local: "Ilha 05", user: "Mesa 10", equipamento: "", ip: "" },
  { porta: "108", local: "Ilha 05", user: "Mesa 10", equipamento: "Computador", ip: "192.168.10.110" },

  { porta: "106", local: "Mesa 16", user: "Mesa 16", equipamento: "", ip: "" },
  { porta: "105", local: "Mesa 16", user: "Pedro Machado", equipamento: "Computador", ip: "192.168.10.164" },

  { porta: "104", local: "Dep.Logistica", user: "Impressora", equipamento: "Impressora", ip: "192.168.10.185" },
  { porta: "103", local: "Dep.Logistica", user: "", equipamento: "", ip: "" },

  { porta: "102", local: "Mesa 17", user: "Mesa 17", equipamento: "", ip: "" },
  { porta: "101", local: "Mesa 17", user: "Rafael Silva", equipamento: "Computador", ip: "192.168.10.117" },

  { porta: "139", local: "Mesa 14", user: "Mesa 14", equipamento: "Impressora", ip: "192.168.10.187" },
  { porta: "138", local: "Mesa 14", user: "José Silva", equipamento: "Computador", ip: "192.168.10.114" },

  { porta: "137", local: "Mesa 13", user: "Mesa 13", equipamento: "", ip: "" },
  { porta: "136", local: "Mesa 13", user: "Carlos Pinto / Andre Costa", equipamento: "Computador", ip: "192.168.10.113" },

  { porta: "143", local: "Mesa 11", user: "Mesa 11", equipamento: "Impressora", ip: "192.168.10.186" },
  { porta: "142", local: "Mesa 11", user: "Carlos Avelino", equipamento: "Computador", ip: "192.168.10.111" },

  { porta: "141", local: "Mesa 12", user: "Mesa 12", equipamento: "", ip: "" },
  { porta: "140", local: "Mesa 12", user: "Jorge Rodrigues", equipamento: "Computador", ip: "192.168.10.112" },

  { porta: "224", local: "BRA-BAL01", user: "BRA-BAL01", equipamento: "", ip: "" },
  { porta: "223", local: "BRA-BAL01", user: "Jose Miguel / Gonçalo Santos", equipamento: "Computador", ip: "192.168.10.125" },

  { porta: "222", local: "BRA-BAL02", user: "BRA-BAL02", equipamento: "Impressora", ip: "192.168.10.183" },
  { porta: "221", local: "BRA-BAL02", user: "Rafael Araujo / Fabio Silva", equipamento: "Computador", ip: "192.168.10.126" },

  { porta: "220", local: "BRA-BAL03", user: "BRA-BAL03", equipamento: "Impressora", ip: "192.168.10.184" },
  { porta: "219", local: "BRA-BAL03", user: "Henrique Ferreira / Andre Costa", equipamento: "Computador", ip: "192.168.10.127" },

  { porta: "232", local: "BRA-CAL01", user: "BRA-CAL01", equipamento: "", ip: "" },
  { porta: "231", local: "BRA-CAL01", user: "João Carlos", equipamento: "Computador", ip: "192.168.10.120" },

  { porta: "234", local: "BRA-CAL02", user: "BRA-CAL02", equipamento: "", ip: "" },
  { porta: "233", local: "BRA-CAL02", user: "Pedro Fernandes", equipamento: "Computador", ip: "192.168.10.121" },

  { porta: "230", local: "BRA-CAL03", user: "BRA-CAL03", equipamento: "", ip: "" },
  { porta: "229", local: "BRA-CAL03", user: "Tiago Melo", equipamento: "Computador", ip: "192.168.10.122" },

  { porta: "228", local: "BRA-CAL04", user: "BRA-CAL04", equipamento: "", ip: "" },
  { porta: "227", local: "BRA-CAL04", user: "Carlos Pinto / Andre Costa", equipamento: "Computador", ip: "192.168.10.123" },

  { porta: "225", local: "BRA-CAL05", user: "BRA-CAL05", equipamento: "", ip: "" },
  { porta: "226", local: "BRA-CAL05", user: "Ricardo Fernandes", equipamento: "Computador", ip: "192.168.10.152" },

  { porta: "304", local: "Escritorio", user: "André Veloso", equipamento: "Computador", ip: "192.168.10.163" },
  { porta: "303", local: "Escritorio", user: "André Veloso", equipamento: "", ip: "" },

  { porta: "306", local: "Escritorio", user: "João Silva", equipamento: "", ip: "" },
  { porta: "305", local: "Escritorio", user: "João Silva", equipamento: "Computador", ip: "192.168.10.162" },

  { porta: "302", local: "Escritorio", user: "César Soares", equipamento: "Computador", ip: "192.168.10.158" },
  { porta: "301", local: "Escritorio", user: "João Ferreira", equipamento: "Computador", ip: "" },

  { porta: "316", local: "Escritorio", user: "Secre. Vazia", equipamento: "", ip: "" },
  { porta: "315", local: "Escritorio", user: "Secre. Vazia", equipamento: "", ip: "" },

  { porta: "314", local: "Escritorio", user: "Elisabete Silva", equipamento: "", ip: "" },
  { porta: "313", local: "Escritorio", user: "Elisabete Silva", equipamento: "Computador", ip: "" },

  { porta: "318", local: "Escritorio", user: "Claudia Silva", equipamento: "", ip: "" },
  { porta: "317", local: "Escritorio", user: "Claudia Silva", equipamento: "Computador", ip: "" },

  { porta: "322", local: "Escritorio", user: "Lucinda Santos", equipamento: "", ip: "" },
  { porta: "321", local: "Escritorio", user: "Lucinda Santos", equipamento: "Computador", ip: "" },

  { porta: "310", local: "Escritorio", user: "", equipamento: "", ip: "" },
  { porta: "309", local: "Escritorio", user: "TASKalfa 2554ci", equipamento: "Impressora", ip: "192.168.10.197" },

  { porta: "308", local: "", user: "", equipamento: "", ip: "" },
  { porta: "307", local: "", user: "", equipamento: "", ip: "" },

  { porta: "312", local: "", user: "", equipamento: "", ip: "" },
  { porta: "311", local: "", user: "", equipamento: "", ip: "" },

  { porta: "320", local: "", user: "", equipamento: "", ip: "" },
  { porta: "319", local: "", user: "", equipamento: "", ip: "" },

  { porta: "326", local: "", user: "", equipamento: "", ip: "" },
  { porta: "325", local: "", user: "", equipamento: "", ip: "" },

  { porta: "3", local: "Escritorio Chefe", user: "", equipamento: "", ip: "" },
  { porta: "2", local: "Escritorio Chefe", user: "Ricardo Venâncio", equipamento: "Computador", ip: "" }
];

/* =========================
   DADOS USERS
========================= */
const usersData = [
  {
    nome: "Pedro José Peixoto Machado",
    zona: "Resp Armazém",
    user_pc_eye: "PJPMachado",
    pass_remote: "pmachado",
    pass_eye_peak: "",
    op_pistola: "PJPMachadoP",
    pass_pistola: "123456",
    nome_pc: "PJPMachado-PT",
    teamviewer: "1719798838",
    user_mo365: "pedro-machado@autozitania.onmicrosoft.com",
    pw_mo365: "Mug97628",
    email_bragalis: "pmachado@bragalis.com",
    pass_bragalis: "Brg25lis_1!!"
  },
  {
    nome: "Rafael Gonçalves Silva",
    zona: "Armazém/Logistica",
    user_pc_eye: "RGSSilva",
    pass_remote: "RGS07",
    pass_eye_peak: "RGSSilva",
    op_pistola: "RGSilvaP",
    pass_pistola: "rgs07",
    nome_pc: "",
    teamviewer: "",
    user_mo365: "",
    pw_mo365: "",
    email_bragalis: "",
    pass_bragalis: ""
  },
  {
    nome: "Aguinaldo Enoque de Oliveira Epalanga",
    zona: "Armazém",
    user_pc_eye: "AEOEpalanga",
    pass_remote: "AEOE05",
    pass_eye_peak: "aeoepalanga05",
    op_pistola: "AEOEpalangaP",
    pass_pistola: "ae0e05",
    nome_pc: "",
    teamviewer: "",
    user_mo365: "",
    pw_mo365: "",
    email_bragalis: "",
    pass_bragalis: ""
  },
  {
    nome: "Ana Cristina de Azevedo Gomes Da Cunha",
    zona: "Limpeza",
    user_pc_eye: "",
    pass_remote: "",
    pass_eye_peak: "",
    op_pistola: "",
    pass_pistola: "",
    nome_pc: "",
    teamviewer: "",
    user_mo365: "",
    pw_mo365: "",
    email_bragalis: "",
    pass_bragalis: ""
  },
  {
    nome: "André Filipe Brandão Batista",
    zona: "Armazém",
    user_pc_eye: "AFBBatista",
    pass_remote: "AFBB12",
    pass_eye_peak: "afbbatista12",
    op_pistola: "AFBBatistaP",
    pass_pistola: "afbb12",
    nome_pc: "",
    teamviewer: "",
    user_mo365: "",
    pw_mo365: "",
    email_bragalis: "",
    pass_bragalis: ""
  },
  {
    nome: "Andre Nuno Gomes Da Costa",
    zona: "Balcao/Armazém",
    user_pc_eye: "ANGCosta",
    pass_remote: "ANGC17",
    pass_eye_peak: "",
    op_pistola: "ANGCostaP",
    pass_pistola: "angc17",
    nome_pc: "",
    teamviewer: "",
    user_mo365: "",
    pw_mo365: "",
    email_bragalis: "",
    pass_bragalis: ""
  },
  {
    nome: "Carlos Avelino Lopes Silva",
    zona: "Armazém",
    user_pc_eye: "CALSilva",
    pass_remote: "CALS10",
    pass_eye_peak: "",
    op_pistola: "CALSilvaP",
    pass_pistola: "cals10",
    nome_pc: "",
    teamviewer: "",
    user_mo365: "",
    pw_mo365: "",
    email_bragalis: "",
    pass_bragalis: ""
  },
  {
    nome: "Carlos Miguel Abreu Gomes",
    zona: "Armazém",
    user_pc_eye: "CMAGomes",
    pass_remote: "123456",
    pass_eye_peak: "CMAGomes123456",
    op_pistola: "CMAGomesP",
    pass_pistola: "123456",
    nome_pc: "",
    teamviewer: "",
    user_mo365: "",
    pw_mo365: "",
    email_bragalis: "",
    pass_bragalis: ""
  },
  {
    nome: "Cristiana Da Silva Oliveira/fernandes",
    zona: "Armazém",
    user_pc_eye: "CSOliveira",
    pass_remote: "CSO05",
    pass_eye_peak: "",
    op_pistola: "CSOliveiraP",
    pass_pistola: "cso05",
    nome_pc: "",
    teamviewer: "",
    user_mo365: "",
    pw_mo365: "",
    email_bragalis: "",
    pass_bragalis: ""
  },
  {
    nome: "Daniel Chukhleb",
    zona: "Armazém",
    user_pc_eye: "DChukhleb",
    pass_remote: "DC0501",
    pass_eye_peak: "",
    op_pistola: "DChukhlebP",
    pass_pistola: "dc0501",
    nome_pc: "",
    teamviewer: "",
    user_mo365: "",
    pw_mo365: "",
    email_bragalis: "",
    pass_bragalis: ""
  },
  {
    nome: "Diogo Gomes Da Mota",
    zona: "Armazém",
    user_pc_eye: "DGMota",
    pass_remote: "DGM09",
    pass_eye_peak: "dgmota09",
    op_pistola: "DGMotaP",
    pass_pistola: "dgm09",
    nome_pc: "",
    teamviewer: "",
    user_mo365: "",
    pw_mo365: "",
    email_bragalis: "",
    pass_bragalis: ""
  },
  {
    nome: "Diogo Vieira Costa",
    zona: "Armazém",
    user_pc_eye: "DVCosta",
    pass_remote: "DVC22",
    pass_eye_peak: "dvcosta22",
    op_pistola: "DVCostaP",
    pass_pistola: "dvc22",
    nome_pc: "",
    teamviewer: "",
    user_mo365: "",
    pw_mo365: "",
    email_bragalis: "",
    pass_bragalis: ""
  },
  {
    nome: "Dmitrii Diuldin",
    zona: "Armazém",
    user_pc_eye: "DDiuldin",
    pass_remote: "DD9903",
    pass_eye_peak: "ddiuldin9903",
    op_pistola: "DDiuldinP",
    pass_pistola: "dd9903",
    nome_pc: "",
    teamviewer: "",
    user_mo365: "",
    pw_mo365: "",
    email_bragalis: "",
    pass_bragalis: ""
  },
  {
    nome: "Fábio Alexandre Vaz Pereira",
    zona: "Armazém",
    user_pc_eye: "FAVPereira",
    pass_remote: "FAVP04",
    pass_eye_peak: "",
    op_pistola: "FAVPereiraP",
    pass_pistola: "favp04",
    nome_pc: "",
    teamviewer: "",
    user_mo365: "",
    pw_mo365: "",
    email_bragalis: "",
    pass_bragalis: ""
  },
  {
    nome: "Fábio Filipe Macedo Ferreira Da Silva",
    zona: "Balcao/Armazém",
    user_pc_eye: "FFMFSilva",
    pass_remote: "FFMFS41",
    pass_eye_peak: "",
    op_pistola: "FFMFSilvaP",
    pass_pistola: "ffmfs41",
    nome_pc: "",
    teamviewer: "",
    user_mo365: "",
    pw_mo365: "",
    email_bragalis: "",
    pass_bragalis: ""
  },
  {
    nome: "Francisco Pereira Da Silva",
    zona: "Armazém/Logistica",
    user_pc_eye: "FPSilva",
    pass_remote: "123456",
    pass_eye_peak: "",
    op_pistola: "FPSilvaP",
    pass_pistola: "123456",
    nome_pc: "",
    teamviewer: "",
    user_mo365: "",
    pw_mo365: "",
    email_bragalis: "",
    pass_bragalis: ""
  },
  {
    nome: "Gonçalo Alexandre Ferreira Rodrigues Martins dos Santos",
    zona: "Balcao/Armazém",
    user_pc_eye: "GAFSantos",
    pass_remote: "GAFS02",
    pass_eye_peak: "",
    op_pistola: "GAFSantosP",
    pass_pistola: "gafs02",
    nome_pc: "",
    teamviewer: "",
    user_mo365: "",
    pw_mo365: "",
    email_bragalis: "",
    pass_bragalis: ""
  },
  {
    nome: "Henrique Filipe Gomes Ferreira",
    zona: "Balcao/Armazém",
    user_pc_eye: "HFGFerreira",
    pass_remote: "HFGF35",
    pass_eye_peak: "",
    op_pistola: "HFGFerreiraP",
    pass_pistola: "hfgf35",
    nome_pc: "",
    teamviewer: "",
    user_mo365: "",
    pw_mo365: "",
    email_bragalis: "",
    pass_bragalis: ""
  },
  {
    nome: "João Matias Abel Pacheco",
    zona: "Armazém",
    user_pc_eye: "JMAPacheco",
    pass_remote: "jmap",
    pass_eye_peak: "jmapacheco24",
    op_pistola: "JMAPachecoP",
    pass_pistola: "jmap",
    nome_pc: "",
    teamviewer: "",
    user_mo365: "",
    pw_mo365: "",
    email_bragalis: "",
    pass_bragalis: ""
  },
  {
    nome: "João Pedro Fernandes Da Silva",
    zona: "Armazém",
    user_pc_eye: "JPFSilva",
    pass_remote: "jpfs06",
    pass_eye_peak: "",
    op_pistola: "JPFSilvaP",
    pass_pistola: "jpfs06",
    nome_pc: "",
    teamviewer: "",
    user_mo365: "",
    pw_mo365: "",
    email_bragalis: "",
    pass_bragalis: ""
  },
  {
    nome: "Jorge Miguel Ribeiro Rodrigues",
    zona: "Armazém",
    user_pc_eye: "JMRRodrigues",
    pass_remote: "JMRR01",
    pass_eye_peak: "",
    op_pistola: "JMRRodriguesP",
    pass_pistola: "jmrr01",
    nome_pc: "",
    teamviewer: "",
    user_mo365: "",
    pw_mo365: "",
    email_bragalis: "",
    pass_bragalis: ""
  },
  {
    nome: "José Miguel Castro Gomes",
    zona: "Balcao/Armazém",
    user_pc_eye: "JMCGomes",
    pass_remote: "JMCG38",
    pass_eye_peak: "",
    op_pistola: "JMCGomesP",
    pass_pistola: "jmcg38",
    nome_pc: "",
    teamviewer: "",
    user_mo365: "jose-gomes@autozitania.onmicrosoft.com",
    pw_mo365: "Fax30677",
    email_bragalis: "",
    pass_bragalis: ""
  },
  {
    nome: "José Miguel Pereira Araujo",
    zona: "Armazém",
    user_pc_eye: "JMPAraujo",
    pass_remote: "JMPA25",
    pass_eye_peak: "",
    op_pistola: "JMPAraujoP",
    pass_pistola: "jmpa25",
    nome_pc: "",
    teamviewer: "",
    user_mo365: "",
    pw_mo365: "",
    email_bragalis: "",
    pass_bragalis: ""
  },
  {
    nome: "José Miguel Silva Lopes",
    zona: "Armazém",
    user_pc_eye: "JMSLopes",
    pass_remote: "jmsl",
    pass_eye_peak: "jmslopes08",
    op_pistola: "JMSLopesP",
    pass_pistola: "jmsl08",
    nome_pc: "",
    teamviewer: "",
    user_mo365: "",
    pw_mo365: "",
    email_bragalis: "",
    pass_bragalis: ""
  },
  {
    nome: "Leonardo Alexandre Silva Ferreira",
    zona: "Armazém",
    user_pc_eye: "LASFerreira",
    pass_remote: "LASF04",
    pass_eye_peak: "",
    op_pistola: "LASFerreiraP",
    pass_pistola: "lasf04",
    nome_pc: "",
    teamviewer: "",
    user_mo365: "",
    pw_mo365: "",
    email_bragalis: "",
    pass_bragalis: ""
  },
  {
    nome: "Leonel Alexandre Gomes Pereira",
    zona: "Armazém",
    user_pc_eye: "LAGPereira",
    pass_remote: "123456",
    pass_eye_peak: "",
    op_pistola: "LAGPereiraP",
    pass_pistola: "123456",
    nome_pc: "",
    teamviewer: "",
    user_mo365: "",
    pw_mo365: "",
    email_bragalis: "",
    pass_bragalis: ""
  },
  {
    nome: "Luis Filipe Bragas Silva",
    zona: "Armazém",
    user_pc_eye: "LFDSilva",
    pass_remote: "LFDS02",
    pass_eye_peak: "lfdsilva02",
    op_pistola: "LFDSilvaP",
    pass_pistola: "lfds02",
    nome_pc: "",
    teamviewer: "",
    user_mo365: "",
    pw_mo365: "",
    email_bragalis: "",
    pass_bragalis: ""
  },
  {
    nome: "Marcelino Rafael Domingues Fernandes",
    zona: "Armazém",
    user_pc_eye: "MRDFernandes",
    pass_remote: "123456",
    pass_eye_peak: "",
    op_pistola: "MRDFernandesP",
    pass_pistola: "123456",
    nome_pc: "",
    teamviewer: "",
    user_mo365: "",
    pw_mo365: "",
    email_bragalis: "",
    pass_bragalis: ""
  },
  {
    nome: "Mário Roberto Gomes Monteiro",
    zona: "Armazém",
    user_pc_eye: "MRGMonteiro",
    pass_remote: "MRGM05",
    pass_eye_peak: "",
    op_pistola: "MRGMonteiroP",
    pass_pistola: "mrgm05",
    nome_pc: "",
    teamviewer: "",
    user_mo365: "",
    pw_mo365: "",
    email_bragalis: "",
    pass_bragalis: ""
  },
  {
    nome: "Micael Da Costa Marques",
    zona: "Armazém",
    user_pc_eye: "MCMarques",
    pass_remote: "MCM06",
    pass_eye_peak: "",
    op_pistola: "MCMarquesP",
    pass_pistola: "mcm06",
    nome_pc: "",
    teamviewer: "",
    user_mo365: "",
    pw_mo365: "",
    email_bragalis: "",
    pass_bragalis: ""
  },
  {
    nome: "Papa Bei",
    zona: "Armazém",
    user_pc_eye: "PBei",
    pass_remote: "PBEI0529",
    pass_eye_peak: "pbei0529",
    op_pistola: "PBeiP",
    pass_pistola: "pbei0529",
    nome_pc: "",
    teamviewer: "",
    user_mo365: "",
    pw_mo365: "",
    email_bragalis: "",
    pass_bragalis: ""
  },
  {
    nome: "Paulo Sérgio Marques Pimenta",
    zona: "Armazém",
    user_pc_eye: "PSMPimenta",
    pass_remote: "PSMP10",
    pass_eye_peak: "psmpimenta10",
    op_pistola: "PSMPimentaP",
    pass_pistola: "psmp10",
    nome_pc: "",
    teamviewer: "",
    user_mo365: "",
    pw_mo365: "",
    email_bragalis: "",
    pass_bragalis: ""
  },
  {
    nome: "Rafael David Martins Cunha",
    zona: "Armazém",
    user_pc_eye: "RDMCunha",
    pass_remote: "RDMC05",
    pass_eye_peak: "",
    op_pistola: "RDMCunhaP",
    pass_pistola: "rdmc05",
    nome_pc: "",
    teamviewer: "",
    user_mo365: "",
    pw_mo365: "",
    email_bragalis: "",
    pass_bragalis: ""
  },
  {
    nome: "Rafael Silva Araujo",
    zona: "Balcao/Armazém",
    user_pc_eye: "RSAraujo",
    pass_remote: "RSA04",
    pass_eye_peak: "",
    op_pistola: "RSAraujoP",
    pass_pistola: "rsa04",
    nome_pc: "",
    teamviewer: "",
    user_mo365: "",
    pw_mo365: "",
    email_bragalis: "",
    pass_bragalis: ""
  },
  {
    nome: "Rui Filipe Gonçalves Bernardo",
    zona: "Armazém",
    user_pc_eye: "RFGBernardo",
    pass_remote: "123456",
    pass_eye_peak: "",
    op_pistola: "RFGBernardoP",
    pass_pistola: "123456",
    nome_pc: "",
    teamviewer: "",
    user_mo365: "",
    pw_mo365: "",
    email_bragalis: "",
    pass_bragalis: ""
  },
  {
    nome: "Rui Jorge Sousa Fernandes",
    zona: "Armazém",
    user_pc_eye: "RJSFernandes",
    pass_remote: "RJSF04",
    pass_eye_peak: "rjsfernandes04",
    op_pistola: "RJSFernandesP",
    pass_pistola: "rjsf04",
    nome_pc: "",
    teamviewer: "",
    user_mo365: "",
    pw_mo365: "",
    email_bragalis: "",
    pass_bragalis: ""
  },
  {
    nome: "Carlos Jorge Azevedo Pinto",
    zona: "CallCenter/Devoluções",
    user_pc_eye: "CJAPinto",
    pass_remote: "CJAP11",
    pass_eye_peak: "",
    op_pistola: "CJAPintoP",
    pass_pistola: "cjap11",
    nome_pc: "",
    teamviewer: "",
    user_mo365: "",
    pw_mo365: "",
    email_bragalis: "",
    pass_bragalis: ""
  },
  {
    nome: "José Ferreira Da Silva",
    zona: "Após-Venda",
    user_pc_eye: "JFSilva",
    pass_remote: "JFS1225",
    pass_eye_peak: "",
    op_pistola: "JFSilvaP",
    pass_pistola: "123456",
    nome_pc: "",
    teamviewer: "",
    user_mo365: "",
    pw_mo365: "",
    email_bragalis: "",
    pass_bragalis: ""
  },
  {
    nome: "Ricardo Jorge Barbosa Fernandes",
    zona: "Informatica",
    user_pc_eye: "RJBFernandes",
    pass_remote: "",
    pass_eye_peak: "RJBFernandes03",
    op_pistola: "RJBFernandesP",
    pass_pistola: "rjbf03",
    nome_pc: "RJBFernandes-PT",
    teamviewer: "398909305",
    user_mo365: "ricardo-fernandes@autozitania.onmicrosoft.com",
    pw_mo365: "Dog83888",
    email_bragalis: "",
    pass_bragalis: ""
  },
  {
    nome: "João Carlos Castro Teixeira Araujo",
    zona: "CallCenter",
    user_pc_eye: "JCCTAraujo",
    pass_remote: "JOCA69",
    pass_eye_peak: "",
    op_pistola: "JCCTAraujoP",
    pass_pistola: "Joca69",
    nome_pc: "",
    teamviewer: "",
    user_mo365: "joao-araujo@autozitania.onmicrosoft.com",
    pw_mo365: "Yoz88475",
    email_bragalis: "jcarlos@bragalis.com",
    pass_bragalis: ""
  },
  {
    nome: "Pedro Miguel Antunes Matos Fernandes",
    zona: "CallCenter",
    user_pc_eye: "PMAMFernandes",
    pass_remote: "PMAMF15",
    pass_eye_peak: "23081977",
    op_pistola: "PMAMFernandesP",
    pass_pistola: "pmam15",
    nome_pc: "",
    teamviewer: "",
    user_mo365: "pedro-fernandes@autozitania.onmicrosoft.com",
    pw_mo365: "Ham94656",
    email_bragalis: "pfernandes@bragalis.com",
    pass_bragalis: ""
  },
  {
    nome: "Tiago Filipe Ferreira De Melo",
    zona: "CallCenter/Armazém",
    user_pc_eye: "TFFMelo",
    pass_remote: "TFFM08",
    pass_eye_peak: "tffm08!",
    op_pistola: "TFFMeloP",
    pass_pistola: "tffm08",
    nome_pc: "",
    teamviewer: "",
    user_mo365: "tiago-melo@autozitania.onmicrosoft.com",
    pw_mo365: "Log45079",
    email_bragalis: "tmelo@bragaliscom",
    pass_bragalis: ""
  },
  {
    nome: "Andre Nuno Gomes Da Costa",
    zona: "CallCenter/Devoluções",
    user_pc_eye: "ANGCosta",
    pass_remote: "ANGC17",
    pass_eye_peak: "",
    op_pistola: "ANGCostaP",
    pass_pistola: "angc17",
    nome_pc: "",
    teamviewer: "",
    user_mo365: "",
    pw_mo365: "",
    email_bragalis: "",
    pass_bragalis: ""
  },
  {
    nome: "André Alexandre Da Silva Correia",
    zona: "Armazém",
    user_pc_eye: "AASCorreia",
    pass_remote: "505024",
    pass_eye_peak: "",
    op_pistola: "AASCorreiaP",
    pass_pistola: "505024",
    nome_pc: "",
    teamviewer: "",
    user_mo365: "",
    pw_mo365: "",
    email_bragalis: "",
    pass_bragalis: ""
  },
  {
    nome: "Carlos Miguel Costa Esteves",
    zona: "Armazém",
    user_pc_eye: "CMCEsteves",
    pass_remote: "198585",
    pass_eye_peak: "",
    op_pistola: "CMCEstevesP",
    pass_pistola: "198585",
    nome_pc: "",
    teamviewer: "",
    user_mo365: "",
    pw_mo365: "",
    email_bragalis: "",
    pass_bragalis: ""
  },
  {
    nome: "Hugo Filipe Teixeira Carvalho",
    zona: "Armazém/Balcao",
    user_pc_eye: "HFTCarvalho",
    pass_remote: "201291",
    pass_eye_peak: "",
    op_pistola: "HFTCarvalhoP",
    pass_pistola: "201291",
    nome_pc: "",
    teamviewer: "",
    user_mo365: "",
    pw_mo365: "Log53498",
    email_bragalis: "",
    pass_bragalis: ""
  },
  {
    nome: "Luis Carlos Ferreira Faria",
    zona: "Armazém",
    user_pc_eye: "LCFFaria",
    pass_remote: "515900",
    pass_eye_peak: "",
    op_pistola: "LCFFariaP",
    pass_pistola: "515900",
    nome_pc: "",
    teamviewer: "",
    user_mo365: "",
    pw_mo365: "",
    email_bragalis: "",
    pass_bragalis: ""
  },
  {
    nome: "Pedro Alexandre Costa Esteves",
    zona: "Armazém/Balcao",
    user_pc_eye: "PACEsteves",
    pass_remote: "199400",
    pass_eye_peak: "",
    op_pistola: "PACEstevesP",
    pass_pistola: "199400",
    nome_pc: "",
    teamviewer: "",
    user_mo365: "",
    pw_mo365: "",
    email_bragalis: "",
    pass_bragalis: ""
  },
  {
    nome: "Márcio Cide Carvalho Vilela",
    zona: "Resp Armazém/Balcao",
    user_pc_eye: "MCCVilela",
    pass_remote: "198101",
    pass_eye_peak: "",
    op_pistola: "MCCVilelaP",
    pass_pistola: "198101",
    nome_pc: "",
    teamviewer: "",
    user_mo365: "marcio-vilela@autozitania.onmicrosoft.com",
    pw_mo365: "",
    email_bragalis: "",
    pass_bragalis: ""
  },
  {
    nome: "Maria Lucinda Coutinho Ramos De Azevedo Santos",
    zona: "Escritório",
    user_pc_eye: "MLASantos",
    pass_remote: "LUCINDA13",
    pass_eye_peak: "",
    op_pistola: "MLASantosP",
    pass_pistola: "Lucinda13",
    nome_pc: "MLASantos-PC",
    teamviewer: "1791141128",
    user_mo365: "lucinda-santos@autozitania.onmicrosoft.com",
    pw_mo365: "Buv13078",
    email_bragalis: "lsantos@bragalis.com",
    pass_bragalis: ""
  },
  {
    nome: "César António Abreu Soares",
    zona: "Escritório",
    user_pc_eye: "CAASoares",
    pass_remote: "193579",
    pass_eye_peak: "",
    op_pistola: "CAASoaresP",
    pass_pistola: "193579",
    nome_pc: "CAASoares-PC / CAASoares-PT",
    teamviewer: "1796613422 / 530913184",
    user_mo365: "cesar-soares@autozitania.onmicrosoft.com",
    pw_mo365: "Hot94069",
    email_bragalis: "csoares@bragalis.com",
    pass_bragalis: "Brg501560254_1985!!"
  },
  {
    nome: "CláuBraga Raquel Martins Silva",
    zona: "Escritório",
    user_pc_eye: "CRMSIlva",
    pass_remote: "CR6991MS",
    pass_eye_peak: "",
    op_pistola: "CRMSilvaP",
    pass_pistola: "Cr6991Ms",
    nome_pc: "CRMSilva-PC",
    teamviewer: "1800022165",
    user_mo365: "clauBraga-silva@autozitania.onmicrosoft.com",
    pw_mo365: "Fup66182",
    email_bragalis: "csilva@bragalis.com",
    pass_bragalis: ""
  },
  {
    nome: "Elisabete Maria Veiga Da Silva",
    zona: "Escritório",
    user_pc_eye: "EMVSilva",
    pass_remote: "Elisabete1977",
    pass_eye_peak: "",
    op_pistola: "EMVSilvaP",
    pass_pistola: "Bragalis1977",
    nome_pc: "EMVSilva-PC / EMVSilva-PT",
    teamviewer: "1821808539 / 1719798838",
    user_mo365: "elisabete-silva@autozitania.onmicrosoft.com",
    pw_mo365: "Xox55029",
    email_bragalis: "esilva@bragalis.com",
    pass_bragalis: "Brg25lis_1!!"
  },
  {
    nome: "Flávio André Oliveira Veloso",
    zona: "Escritório",
    user_pc_eye: "FAOVeloso",
    pass_remote: "bragalis22",
    pass_eye_peak: "",
    op_pistola: "FAOVelosoP",
    pass_pistola: "bragalis22",
    nome_pc: "",
    teamviewer: "",
    user_mo365: "andre-veloso@autozitania.onmicrosoft.com",
    pw_mo365: "Juy26813",
    email_bragalis: "fveloso@bragalis.com",
    pass_bragalis: ""
  },
  {
    nome: "João Pedro Gomes Silva",
    zona: "Escritório",
    user_pc_eye: "JPGSilva",
    pass_remote: "BRG25LIS",
    pass_eye_peak: "",
    op_pistola: "JPGSilvaP",
    pass_pistola: "brg25lis",
    nome_pc: "JPGSilva-PT",
    teamviewer: "701314749",
    user_mo365: "joao-silva@autozitania.onmicrosoft.com",
    pw_mo365: "Zod22924",
    email_bragalis: "jsilva@bragalis.com",
    pass_bragalis: ""
  },
  {
    nome: "João Pedro Viana Ferreira",
    zona: "Escritório",
    user_pc_eye: "JPVFerreira",
    pass_remote: "Bragalis22!/1305",
    pass_eye_peak: "",
    op_pistola: "JPVFerreiraP",
    pass_pistola: "Bragalis22!/1305",
    nome_pc: "JPVFerreira-PC",
    teamviewer: "1791731056",
    user_mo365: "joao-ferreira@autozitania.onmicrosoft.com",
    pw_mo365: "Guw17492",
    email_bragalis: "jferreira@bragalis.com",
    pass_bragalis: ""
  },
  {
    nome: "António Cristiano Carvalho Vilela",
    zona: "Comercial",
    user_pc_eye: "ACVilela",
    pass_remote: "Bragalis22",
    pass_eye_peak: "",
    op_pistola: "ACVilelaP",
    pass_pistola: "Bragalis22",
    nome_pc: "ACVilela-PT",
    teamviewer: "265145335",
    user_mo365: "cristiano-vilela@autozitania.onmicrosoft.com",
    pw_mo365: "Qov55091",
    email_bragalis: "",
    pass_bragalis: ""
  },
  {
    nome: "Sérgio Eurico Jesus Pitrez",
    zona: "Comercial",
    user_pc_eye: "SEJPitrez",
    pass_remote: "Bragalis23",
    pass_eye_peak: "",
    op_pistola: "SEJPitrezP",
    pass_pistola: "Bragalis23",
    nome_pc: "",
    teamviewer: "",
    user_mo365: "sergio-pitrez@autozitania.onmicrosoft.com",
    pw_mo365: "Lap23828",
    email_bragalis: "",
    pass_bragalis: ""
  },
  {
    nome: "Jose Luis Martins Azevedo",
    zona: "Comercial",
    user_pc_eye: "JLMAzevedo",
    pass_remote: "",
    pass_eye_peak: "",
    op_pistola: "",
    pass_pistola: "",
    nome_pc: "",
    teamviewer: "",
    user_mo365: "",
    pw_mo365: "",
    email_bragalis: "",
    pass_bragalis: ""
  }
];

/* =========================
   FIREBASE
========================= */
async function gerarID() {
  const ref = db.collection("config").doc("contador");
  return db.runTransaction(async t => {
    const doc = await t.get(ref);
    const n = doc.exists ? doc.data().valor + 1 : 1;
    t.set(ref, { valor: n });
    return "TON-" + String(n).padStart(4, "0");
  });
}

async function disponivel() {
  const eq = el("equipamento")?.value;
  const loc = el("localizacao")?.value;
  const cor = el("cor")?.value;
  const data = el("data")?.value;

  if (!eq || !cor) {
    mostrarMensagem("Preenche o equipamento e a cor.", "erro");
    return;
  }

  try {
    const id = await gerarID();

    await db.collection("stock").add({
      idInterno: id,
      equipamento: eq,
      localizacao: loc || "Sem Localização",
      cor,
      data: data || "Sem Data",
      created: new Date()
    });

    if (el("equipamento")) el("equipamento").value = "";
    if (el("localizacao")) el("localizacao").value = "";
    if (el("cor")) el("cor").value = "";
    if (el("data")) el("data").value = "";

    mostrarMensagem("Toner adicionado");
  } catch (e) {
    console.error(e);
    mostrarMensagem("Erro ao adicionar toner", "erro");
  }
}

db.collection("stock").orderBy("created", "desc").onSnapshot(snap => {
  stockGlobal = [];
  setText("countStock", snap.size);

  snap.forEach(doc => {
    const t = doc.data();
    t.idDoc = doc.id;
    stockGlobal.push(t);
  });

  renderStock();
  renderDashboard();
});

db.collection("historico").orderBy("created", "desc").onSnapshot(snap => {
  historicoGlobal = [];
  setText("countUsados", snap.size);

  snap.forEach(doc => {
    const t = doc.data();
    t.idDoc = doc.id;
    historicoGlobal.push(t);
  });

  renderHistorico();
});

db.collection("pcs").orderBy("created", "desc").onSnapshot(snap => {
  pcsGlobal = [];
  setText("countPCs", snap.size);

  snap.forEach(doc => {
    const d = doc.data();
    d.idDoc = doc.id;
    pcsGlobal.push(d);
  });

  renderPC();
});

db.collection("manutencoes").orderBy("created", "desc").onSnapshot(snap => {
  manutencoesGlobal = [];

  snap.forEach(doc => {
    const d = doc.data();
    d.idDoc = doc.id;
    manutencoesGlobal.push(d);
  });

  renderManutencoes(manutencoesGlobal);
});

/* =========================
   DASHBOARD / STOCK / HISTÓRICO
========================= */
function renderDashboard() {
  const dash = el("listaDashboardStock");
  if (!dash) return;

  setText("countPistolasDashboard", pistolasData.length);
  setText("countPortasDashboard", portasData.length);
  setText("countUsersDashboard", usersData.length);

  if (!stockGlobal.length) {
    dash.innerHTML = `<div class="panel empty-state"><h3>Sem toners recentes</h3><p>Adiciona toners para os veres aqui.</p></div>`;
    return;
  }

  dash.innerHTML = stockGlobal.slice(0, 5).map(t => `
    <div class="dashboard-card">
      <div class="stock-id">${t.idInterno}</div>
      <div class="meta-line">Equipamento: <span class="meta-value">${t.equipamento}</span></div>
      <div class="meta-line">Cor: <span class="meta-value">${t.cor}</span></div>
      <div class="meta-line">Local: <span class="meta-value">${t.localizacao}</span></div>
    </div>
  `).join("");
}

function renderStock(lista = stockGlobal) {
  const box = el("listaStock");
  if (!box) return;

  if (!lista.length) {
    box.innerHTML = `<div class="panel empty-state"><h3>Sem toners em stock</h3><p>Quando adicionares toners, aparecem aqui.</p></div>`;
    return;
  }

  box.innerHTML = lista.map(t => `
    <div class="stock-card">
      <div class="stock-id">${t.idInterno}</div>
      <div class="meta-line">Equipamento: <span class="meta-value">${t.equipamento}</span></div>
      <div class="meta-line">Cor: <span class="meta-value">${t.cor}</span></div>
      <div class="meta-line">Localização: <span class="meta-value">${t.localizacao}</span></div>
      <div class="meta-line">Data: <span class="meta-value">${t.data || "Sem Data"}</span></div>
      <div class="card-actions">
        <button class="small-btn btn-use" onclick="usar('${t.idDoc}')">Usado</button>
      </div>
    </div>
  `).join("");
}

function renderHistorico(lista = historicoGlobal) {
  const box = el("listaHistorico");
  if (!box) return;

  if (!lista.length) {
    box.innerHTML = `<div class="panel empty-state"><h3>Sem histórico</h3><p>Os toners usados aparecem aqui.</p></div>`;
    return;
  }

  box.innerHTML = lista.map(t => `
    <div class="history-card">
      <div class="history-id">${t.idInterno}</div>
      <div class="meta-line">Equipamento: <span class="meta-value">${t.equipamento}</span></div>
      <div class="meta-line">Cor: <span class="meta-value">${t.cor || "-"}</span></div>
      <div class="meta-line">Localização: <span class="meta-value">${t.localizacao || "Sem Localização"}</span></div>
      <div class="meta-line">Data: <span class="meta-value">${t.data || "Sem Data"}</span></div>
      <div class="card-actions">
        <button class="small-btn btn-delete" onclick="apagar('${t.idDoc}')">Apagar</button>
      </div>
    </div>
  `).join("");
}

async function usar(id) {
  try {
    const ref = db.collection("stock").doc(id);
    const snap = await ref.get();

    await db.collection("historico").add({
      ...snap.data(),
      created: new Date()
    });

    await ref.delete();
    mostrarMensagem("Movido para histórico");
  } catch (e) {
    console.error(e);
    mostrarMensagem("Erro ao mover", "erro");
  }
}

async function apagar(id) {
  try {
    await db.collection("historico").doc(id).delete();
    mostrarMensagem("Apagado");
  } catch (e) {
    console.error(e);
    mostrarMensagem("Erro ao apagar", "erro");
  }
}

function filtrar() {
  const txt = normalizarTexto(el("search")?.value || "");
  const filtrados = stockGlobal.filter(t =>
    normalizarTexto(t.localizacao).includes(txt) ||
    normalizarTexto(t.equipamento).includes(txt) ||
    normalizarTexto(t.cor).includes(txt) ||
    normalizarTexto(t.idInterno).includes(txt)
  );
  renderStock(filtrados);
}

function filtrarDashboard() {
  const txt = normalizarTexto(el("searchDashboard")?.value || "");
  const filtrados = stockGlobal.filter(t =>
    normalizarTexto(t.localizacao).includes(txt) ||
    normalizarTexto(t.equipamento).includes(txt) ||
    normalizarTexto(t.cor).includes(txt) ||
    normalizarTexto(t.idInterno).includes(txt)
  );

  const dash = el("listaDashboardStock");
  if (!dash) return;

  dash.innerHTML = filtrados.map(t => `
    <div class="dashboard-card">
      <div class="stock-id">${t.idInterno}</div>
      <div class="meta-line">Equipamento: <span class="meta-value">${t.equipamento}</span></div>
      <div class="meta-line">Cor: <span class="meta-value">${t.cor}</span></div>
      <div class="meta-line">Local: <span class="meta-value">${t.localizacao}</span></div>
    </div>
  `).join("");
}

/* =========================
   COMPUTADORES
========================= */
const passos = [
  "TEAMVIEWER HOST",
  "TEAMS",
  "DNS",
  "NOME DO SISTEMA",
  "Atribuir Dominio",
  "Desinstalar MCFee",
  "Instalar Sophos",
  "MICROSOFT 365",
  "Instalar Impressora",
  "Alterar Energia",
  "Apagar User",
  "Criar novo user"
];

function carregarChecklist() {
  const check = el("checklist");
  if (!check) return;

  check.innerHTML = passos.map((p, i) => `
    <label class="checkItem">
      <input type="checkbox" id="p${i}">
      <span>${p}</span>
    </label>
  `).join("");
}

function renderPC() {
  const box = el("listaPC");
  if (!box) return;

  if (!pcsGlobal.length) {
    box.innerHTML = `<div class="panel empty-state"><h3>Sem registos de computadores</h3><p>Os computadores guardados aparecem aqui.</p></div>`;
    return;
  }

  box.innerHTML = pcsGlobal.map(d => {
    const htmlPassos = (d.passos || []).map(p => `
      <div class="meta-line">${p.feito ? "✔" : "❌"} <span class="meta-value">${p.passo}</span></div>
    `).join("");

    return `
      <div class="pc-card">
        <div class="pc-name">${d.nome}</div>
        <div class="meta-line">Data: <span class="meta-value">${d.data || "Sem Data"}</span></div>
        <div class="pc-meta" style="margin-top:12px;">${htmlPassos}</div>
        <div class="card-actions">
          <button class="small-btn btn-delete" onclick="apagarPC('${d.idDoc}')">Apagar</button>
        </div>
      </div>
    `;
  }).join("");
}

async function guardarPC() {
  const nome = el("nomePC")?.value;
  let data = el("dataPC")?.value;

  if (!nome) {
    mostrarMensagem("Nome obrigatório", "erro");
    return;
  }

  if (!data) data = "Sem Data";

  const dados = passos.map((p, i) => ({
    passo: p,
    feito: el("p" + i)?.checked || false
  }));

  try {
    await db.collection("pcs").add({
      nome,
      data,
      passos: dados,
      created: new Date()
    });

    if (el("nomePC")) el("nomePC").value = "";
    if (el("dataPC")) el("dataPC").value = "";
    carregarChecklist();
    mostrarMensagem("PC guardado");
  } catch (e) {
    console.error(e);
    mostrarMensagem("Erro ao guardar PC", "erro");
  }
}

async function apagarPC(id) {
  try {
    await db.collection("pcs").doc(id).delete();
    mostrarMensagem("PC apagado");
  } catch (e) {
    console.error(e);
    mostrarMensagem("Erro ao apagar PC", "erro");
  }
}

/* =========================
   IMPRESSORAS / MANUTENÇÃO
========================= */
function renderImpressoras() {
  const tbody = el("impressorasTableBody");
  if (!tbody) return;

  tbody.innerHTML = impressorasData.map(item => `
    <tr>
      <td>${item.modelo}</td>
      <td>${item.serie}</td>
      <td>${item.armazem}</td>
      <td>${item.localizacao}</td>
      <td><a href="http://${item.ip}" target="_blank" rel="noopener noreferrer">${item.ip}</a></td>
    </tr>
  `).join("");
}

function modelosPorArmazem(armazem) {
  const lista = !armazem
    ? impressorasData
    : impressorasData.filter(i => i.armazem === armazem);

  return [...new Set(lista.map(i => i.modelo))];
}

function preencherDropdownManutencao() {
  const armazem = el("manutencaoArmazem")?.value || "";
  const modeloSelect = el("manutencaoModelo");
  const serieSelect = el("manutencaoSerie");
  const locSelect = el("manutencaoLocalizacao");
  const ipSelect = el("manutencaoIP");

  if (!modeloSelect || !serieSelect || !locSelect || !ipSelect) return;

  const modelos = modelosPorArmazem(armazem);

  modeloSelect.innerHTML = `
    <option value="">Selecionar modelo</option>
    ${modelos.map(m => `<option value="${m}">${m}</option>`).join("")}
  `;

  serieSelect.innerHTML = `<option value="">Selecionar nº série</option>`;
  locSelect.innerHTML = `<option value="">Selecionar localização</option>`;
  ipSelect.innerHTML = `<option value="">Selecionar IP</option>`;
}

function sincronizarManutencaoPorArmazem() {
  preencherDropdownManutencao();
}

function sincronizarManutencaoPorModelo() {
  const armazem = el("manutencaoArmazem")?.value || "";
  const modelo = el("manutencaoModelo")?.value || "";
  const serieSelect = el("manutencaoSerie");
  const locSelect = el("manutencaoLocalizacao");
  const ipSelect = el("manutencaoIP");

  if (!serieSelect || !locSelect || !ipSelect) return;

  let lista = impressorasData.filter(i => i.modelo === modelo);
  if (armazem) lista = lista.filter(i => i.armazem === armazem);

  serieSelect.innerHTML = `
    <option value="">Selecionar nº série</option>
    ${lista.map(i => `<option value="${i.serie}">${i.serie}</option>`).join("")}
  `;

  locSelect.innerHTML = `
    <option value="">Selecionar localização</option>
    ${lista.map(i => `<option value="${i.localizacao}">${i.localizacao}</option>`).join("")}
  `;

  ipSelect.innerHTML = `
    <option value="">Selecionar IP</option>
    ${lista.map(i => `<option value="${i.ip}">${i.ip}</option>`).join("")}
  `;
}

function sincronizarManutencaoPorSerie() {
  const serie = el("manutencaoSerie")?.value || "";
  const item = impressorasData.find(i => i.serie === serie);
  if (!item) return;

  if (el("manutencaoArmazem")) el("manutencaoArmazem").value = item.armazem;
  if (el("manutencaoModelo")) el("manutencaoModelo").value = item.modelo;
  if (el("manutencaoLocalizacao")) el("manutencaoLocalizacao").value = item.localizacao;
  if (el("manutencaoIP")) el("manutencaoIP").value = item.ip;
}

function sincronizarManutencaoPorIP() {
  const ip = el("manutencaoIP")?.value || "";
  const item = impressorasData.find(i => i.ip === ip);
  if (!item) return;

  if (el("manutencaoArmazem")) el("manutencaoArmazem").value = item.armazem;
  if (el("manutencaoModelo")) el("manutencaoModelo").value = item.modelo;
  if (el("manutencaoSerie")) el("manutencaoSerie").value = item.serie;
  if (el("manutencaoLocalizacao")) el("manutencaoLocalizacao").value = item.localizacao;
}

async function guardarManutencao() {
  const tecnico = el("manutencaoTecnico")?.value || "";
  const armazem = el("manutencaoArmazem")?.value || "";
  const modelo = el("manutencaoModelo")?.value || "";
  const serie = el("manutencaoSerie")?.value || "";
  const localizacao = el("manutencaoLocalizacao")?.value || "";
  const ip = el("manutencaoIP")?.value || "";
  const motivo = el("manutencaoMotivo")?.value || "";
  const dataPedido = el("manutencaoPedido")?.value || "";
  const dataResolucao = el("manutencaoResolucao")?.value || "";

  if (!tecnico || !armazem || !modelo || !serie || !localizacao || !ip || !motivo || !dataPedido) {
    mostrarMensagem("Preenche os campos obrigatórios da manutenção.", "erro");
    return;
  }

  try {
    await db.collection("manutencoes").add({
      tecnico,
      armazem,
      modelo,
      serie,
      localizacao,
      ip,
      motivo,
      dataPedido,
      dataResolucao: dataResolucao || "Sem resolução",
      created: new Date()
    });

    if (el("manutencaoTecnico")) el("manutencaoTecnico").value = "";
    if (el("manutencaoArmazem")) el("manutencaoArmazem").value = "";
    if (el("manutencaoModelo")) el("manutencaoModelo").innerHTML = `<option value="">Selecionar modelo</option>`;
    if (el("manutencaoSerie")) el("manutencaoSerie").innerHTML = `<option value="">Selecionar nº série</option>`;
    if (el("manutencaoLocalizacao")) el("manutencaoLocalizacao").innerHTML = `<option value="">Selecionar localização</option>`;
    if (el("manutencaoIP")) el("manutencaoIP").innerHTML = `<option value="">Selecionar IP</option>`;
    if (el("manutencaoMotivo")) el("manutencaoMotivo").value = "";
    if (el("manutencaoPedido")) el("manutencaoPedido").value = "";
    if (el("manutencaoResolucao")) el("manutencaoResolucao").value = "";

    mostrarMensagem("Manutenção guardada");
  } catch (e) {
    console.error(e);
    mostrarMensagem("Erro ao guardar manutenção", "erro");
  }
}

function renderManutencoes(items) {
  const lista = el("listaManutencoes");
  if (!lista) return;

  if (!items.length) {
    lista.innerHTML = `<div class="panel empty-state"><h3>Sem pedidos de manutenção</h3><p>Os pedidos vão aparecer aqui.</p></div>`;
    return;
  }

  lista.innerHTML = items.map(item => `
    <div class="pc-card">
      <div class="pc-name">${item.modelo || "-"}</div>
      <div class="meta-line">Série: <span class="meta-value">${item.serie || "-"}</span></div>
      <div class="meta-line">Técnico: <span class="meta-value">${item.tecnico}</span></div>
      <div class="meta-line">Armazém: <span class="meta-value">${item.armazem}</span></div>
      <div class="meta-line">Localização: <span class="meta-value">${item.localizacao}</span></div>
      <div class="meta-line">IP: <span class="meta-value"><a href="http://${item.ip}" target="_blank" rel="noopener noreferrer">${item.ip}</a></span></div>
      <div class="meta-line">Motivo: <span class="meta-value">${item.motivo}</span></div>
      <div class="meta-line">Pedido: <span class="meta-value">${item.dataPedido}</span></div>
      <div class="meta-line">Reparação/Resolução: <span class="meta-value">${item.dataResolucao || "Sem resolução"}</span></div>
      <div class="card-actions">
        <button class="small-btn btn-delete" onclick="apagarManutencao('${item.idDoc}')">Apagar</button>
      </div>
    </div>
  `).join("");
}

async function apagarManutencao(id) {
  try {
    await db.collection("manutencoes").doc(id).delete();
    mostrarMensagem("Manutenção apagada");
  } catch (e) {
    console.error(e);
    mostrarMensagem("Erro ao apagar manutenção", "erro");
  }
}

/* =========================
   PISTOLAS
========================= */
function badgePistola(p) {
  return normalizarTexto(p.operador) === "reserva"
    ? `<span class="badge reserva">Reserva</span>`
    : `<span class="badge ok">Ativa</span>`;
}

function renderPistolas(lista = pistolasData) {
  const box = el("listaPistolas");
  if (!box) return;

  setText("countPistolas", lista.length);
  setText("countPistolasDia", lista.filter(p => normalizarTexto(p.turno) === "dia").length);
  setText("countPistolasReserva", lista.filter(p => normalizarTexto(p.operador) === "reserva").length);

  box.innerHTML = lista.map(p => `
    <div class="mobile-data-card">
      <div class="mobile-data-card-top">
        <h3>Pistola ${p.num}</h3>
        ${badgePistola(p)}
      </div>
      <div class="meta-line">Login: <span class="meta-value">${p.login}</span></div>
      <div class="meta-line">Operador: <span class="meta-value">${p.operador}</span></div>
      <div class="meta-line">Turno: <span class="meta-value">${p.turno}</span></div>
      <div class="meta-line">SN: <span class="meta-value">${p.sn}</span></div>
      <div class="meta-line">MAC: <span class="meta-value">${p.mac}</span></div>
      <div class="meta-line">CN: <span class="meta-value">${p.cn}</span></div>
      <div class="meta-line">Data: <span class="meta-value">${p.prontas}</span></div>
    </div>
  `).join("");
}

function filtrarPistolas() {
  const txt = normalizarTexto(el("searchPistolas")?.value || "");
  const turno = normalizarTexto(el("filterTurnoPistolas")?.value || "");
  const tipo = normalizarTexto(el("filterTipoPistolas")?.value || "");

  const filtradas = pistolasData.filter(p => {
    const textoOk =
      normalizarTexto(p.num).includes(txt) ||
      normalizarTexto(p.login).includes(txt) ||
      normalizarTexto(p.operador).includes(txt) ||
      normalizarTexto(p.sn).includes(txt) ||
      normalizarTexto(p.mac).includes(txt);

    const turnoOk = !turno || normalizarTexto(p.turno) === turno;
    const tipoAtual = normalizarTexto(p.operador) === "reserva" ? "reserva" : "ativas";
    const tipoOk = !tipo || tipoAtual === tipo;

    return textoOk && turnoOk && tipoOk;
  });

  renderPistolas(filtradas);
}

/* =========================
   PORTAS
========================= */
function estadoPorta(p) {
  const temIP = normalizarTexto(p.ip) !== "";
  const temUser = normalizarTexto(p.user) !== "";

  if (!temIP && !temUser) return "livre";
  if (temIP && temUser) return "ocupado";
  if (temIP && !temUser) return "semuser";
  return "livre";
}

function badgePorta(estado) {
  if (estado === "ocupado") return `<span class="badge ocupado">Ocupado</span>`;
  if (estado === "livre") return `<span class="badge livre">Livre</span>`;
  if (estado === "semuser") return `<span class="badge aviso">Sem user</span>`;
  return "";
}
function renderPortas(lista = portasData) {
  const box = el("listaPortas");
  if (!box) return;

  setText("countPortas", lista.length);
  setText("countPortasUsadas", lista.filter(p => estadoPorta(p) === "ocupado").length);
  setText("countPortasLivres", lista.filter(p => estadoPorta(p) === "livre").length);

  box.innerHTML = lista.map(p => `
    <div class="mobile-data-card">
      <div class="mobile-data-card-top">
        <h3>Porta ${p.porta || "-"}</h3>
        ${badgePorta(estadoPorta(p))}
      </div>
      <div class="meta-line">Localização: <span class="meta-value">${p.local || "-"}</span></div>
      <div class="meta-line">Utilizador: <span class="meta-value">${p.user || "-"}</span></div>
      <div class="meta-line">Equipamento: <span class="meta-value">${p.equipamento || "-"}</span></div>
      <div class="meta-line">IP: <span class="meta-value">${p.ip ? `<a href="http://${p.ip}" target="_blank">${p.ip}</a>` : "-"}</span></div>
    </div>
  `).join("");
}


function filtrarPortas() {
  const txt = normalizarTexto(el("searchPortas")?.value || "");
  const estado = normalizarTexto(el("filterEstadoPortas")?.value || "");

  const filtradas = portasData.filter(p => {
    const textoOk =
      normalizarTexto(p.porta).includes(txt) ||
      normalizarTexto(p.local).includes(txt) ||
      normalizarTexto(p.user).includes(txt) ||
      normalizarTexto(p.ip).includes(txt);

    const estadoOk = !estado || estadoPorta(p) === estado;
    return textoOk && estadoOk;
  });

  renderPortas(filtradas);
}

/* =========================
   USERS
========================= */
function temMO365(u) {
  return normalizarTexto(u.user_mo365) !== "";
}

function temPistola(u) {
  return normalizarTexto(u.op_pistola) !== "";
}

function temTeamviewer(u) {
  return normalizarTexto(u.teamviewer) !== "";
}

function renderUsers(lista = usersData) {
  const box = el("listaUsers");
  if (!box) return;

  // 🔥 ORDENAR ALFABETICAMENTE PELO NOME
  const listaOrdenada = [...lista].sort((a, b) =>
    (a.nome || "").localeCompare(b.nome || "", "pt", { sensitivity: "base" })
  );

  setText("countUsers", listaOrdenada.length);
  setText("countUsersMO365", listaOrdenada.filter(temMO365).length);
  setText("countUsersPistola", listaOrdenada.filter(temPistola).length);

  box.innerHTML = listaOrdenada.map((u, i) => `
    <div class="mobile-data-card">
      <div class="mobile-data-card-top">
        <h3>${u.nome || "-"}</h3>
        ${temMO365(u) ? `<span class="badge ok">MO365</span>` : `<span class="badge livre">Sem MO365</span>`}
      </div>

      <div class="meta-line">Zona: <span class="meta-value">${u.zona || "-"}</span></div>
      <div class="meta-line">User PC: <span class="meta-value">${u.user_pc_eye || "-"}</span></div>
      <div class="meta-line">Pass Remote: <span class="meta-value">${u.pass_remote || "-"}</span></div>
      <div class="meta-line">Op. Pistola: <span class="meta-value">${u.op_pistola || "-"}</span></div>
      <div class="meta-line">Pass Pistola: <span class="meta-value">${u.pass_pistola || "-"}</span></div>
      <div class="meta-line">Nome PC: <span class="meta-value">${u.nome_pc || "-"}</span></div>
      <div class="meta-line">TeamViewer: <span class="meta-value">${u.teamviewer || "-"}</span></div>
      <div class="meta-line">User MO365: <span class="meta-value">${u.user_mo365 || "-"}</span></div>
      <div class="meta-line">Email Bragalis: <span class="meta-value">${u.email_bragalis || "-"}</span></div>

      <div class="card-actions">
        ${temPistola(u) ? `<span class="badge ok">Com Pistola</span>` : `<span class="badge livre">Sem Pistola</span>`}
      </div>

      <div class="card-actions">
        <button class="small-btn btn-edit" onclick="toggleUserExtra('userExtra${i}')">Ver mais</button>
      </div>

      <div id="userExtra${i}" class="user-extra-box" style="display:none;">
        <div class="meta-line">Pass Eye Peak: <span class="meta-value">${u.pass_eye_peak || "-"}</span></div>
        <div class="meta-line">Pw MO365: <span class="meta-value">${u.pw_mo365 || "-"}</span></div>
        <div class="meta-line">Pass Bragalis: <span class="meta-value">${u.pass_bragalis || "-"}</span></div>
      </div>
    </div>
  `).join("");
}
function toggleUserExtra(id) {
  const box = el(id);
  if (!box) return;
  box.style.display = box.style.display === "none" ? "block" : "none";
}
function filtrarUsers() {
  const txt = normalizarTexto(el("searchUsers")?.value || "");
  const mo365 = normalizarTexto(el("filterUsersMO365")?.value || "");
  const pistola = normalizarTexto(el("filterUsersPistola")?.value || "");

  const filtrados = usersData.filter(u => {
    const textoOk =
      normalizarTexto(u.nome).includes(txt) ||
      normalizarTexto(u.zona).includes(txt) ||
      normalizarTexto(u.user_pc_eye).includes(txt) ||
      normalizarTexto(u.pass_remote).includes(txt) ||
      normalizarTexto(u.op_pistola).includes(txt) ||
      normalizarTexto(u.pass_pistola).includes(txt) ||
      normalizarTexto(u.nome_pc).includes(txt) ||
      normalizarTexto(u.teamviewer).includes(txt) ||
      normalizarTexto(u.email_bragalis).includes(txt) ||
      normalizarTexto(u.user_mo365).includes(txt);

    let mo365Ok = true;
    if (mo365 === "sim") mo365Ok = temMO365(u);
    if (mo365 === "nao") mo365Ok = !temMO365(u);

    let pistolaOk = true;
    if (pistola === "sim") pistolaOk = temPistola(u);
    if (pistola === "nao") pistolaOk = !temPistola(u);

    return textoOk && mo365Ok && pistolaOk;
  });

  renderUsers(filtrados);
}
/* =========================
   DARK MODE
========================= */
function aplicarDarkMode(ativo) {
  document.body.classList.toggle("dark", ativo);
  document.documentElement.classList.toggle("dark", ativo);
  localStorage.setItem("modo", ativo ? "dark" : "light");
  if (el("darkSwitch")) el("darkSwitch").checked = ativo;
}

/* =========================
   INIT
========================= */
window.onload = () => {
  const sw = el("darkSwitch");
  const darkAtivo = localStorage.getItem("modo") === "dark";
  aplicarDarkMode(darkAtivo);

  if (sw) {
    sw.addEventListener("change", () => aplicarDarkMode(sw.checked));
  }

  carregarChecklist();
  renderImpressoras();
  preencherDropdownManutencao();
  renderPistolas();
  renderPortas();
  renderUsers();
  mudarPagina("dashboard");
};
