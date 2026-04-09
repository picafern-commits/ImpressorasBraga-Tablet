const lista = document.getElementById("lista");
const alertas = document.getElementById("alertas");

db.collection("printers").onSnapshot(snapshot => {

  lista.innerHTML = "";
  alertas.innerHTML = "";

  snapshot.forEach(doc => {

    const d = doc.data();

    const cores = d.toner || {};
    const waste = d.waste || 0;

    let critico = false;

    let htmlCores = "";

    Object.keys(cores).forEach(cor => {

      let valor = cores[cor];

      let corClasse = "green";
      if (valor <= 10) corClasse = "red";
      else if (valor <= 25) corClasse = "orange";

      if (valor <= 25) critico = true;

      htmlCores += `
        ${cor.toUpperCase()}: ${valor}%
        <div class="bar ${corClasse}" style="width:${valor}%"></div>
      `;
    });

    // Resíduo
    let wasteClasse = "green";
    if (waste >= 80) wasteClasse = "red";
    else if (waste >= 60) wasteClasse = "orange";

    if (waste >= 75) critico = true;

    if (!critico) return;

    const div = document.createElement("div");
    div.className = "card";

    div.innerHTML = `
      <b>${doc.id}</b><br><br>
      ${htmlCores}
      <br>
      Resíduo: ${waste}%
      <div class="bar ${wasteClasse}" style="width:${waste}%"></div>
    `;

    lista.appendChild(div);

    const alerta = document.createElement("div");
    alerta.className = "alert";
    alerta.innerText = "⚠️ Impressora crítica: " + doc.id;

    alertas.appendChild(alerta);

  });

});
