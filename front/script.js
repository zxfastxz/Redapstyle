const map = L.map('map').setView([-8.05, -34.9], 12);
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { attribution: '' }).addTo(map);

const busSvgIcon = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
  <path d="M17 12q-2.075 0-3.537-1.463T12 7q0-2.05 1.45-3.525T17 2q2.075 0 3.538 1.462T22 7t-1.463 3.538T17 12m-.5-4h1V4h-1zm.5 2q.2 0 .35-.15t.15-.35t-.15-.35T17 9t-.35.15t-.15.35t.15.35t.35.15M6.5 17q.625 0 1.063-.437T8 15.5t-.437-1.062T6.5 14t-1.062.438T5 15.5t.438 1.063T6.5 17m7 0q.625 0 1.063-.437T15 15.5t-.437-1.062T13.5 14t-1.062.438T12 15.5t.438 1.063T13.5 17M4 22q-.425 0-.712-.288T3 21v-2.05q-.5-.525-.75-1.162T2 16.5V7q0-2.225 2.063-3.113T11.275 3q-.6.85-.937 1.863T10 7q0 .275.013.513t.062.487H4v3h7.275q.95 1.35 2.438 2.175T17 14q.275 0 .513-.012t.487-.063V16.5q0 .65-.25 1.288T17 18.95V21q0 .425-.288.713T16 22h-1q-.425 0-.712-.288T14 21v-1H6v1q0 .425-.288.713T5 22z"/>
</svg>`;

const indicadores = ["Temperatura (°C)", "Umidade (%)", "Ruído (dB)", "CO₂ (ppm)"];
const cardsRow = document.getElementById("cardsRow");
const indicatorsList = document.getElementById("indicatorsList");
const alertBanner = document.getElementById("alertBanner");
let interval = null;
let historico = [];
let busMarkers = [];

function obterStatus(valor) {
  const v = parseFloat(valor);
  if (v < 50) return "normal";
  if (v < 70) return "alerta";
  if (v < 85) return "risco";
  return "situacaocritica";
}

function gerarDados() {
  const data = {};
  indicadores.forEach(ind => {
    const val = (Math.random() * 100).toFixed(1);
    data[ind] = { valor: val, status: obterStatus(val) };
  });
  return data;
}

function atualizarInterface() {
  cardsRow.innerHTML = '';
  indicatorsList.innerHTML = '';
  const dados = gerarDados();

  indicadores.forEach(ind => {
    const { valor, status } = dados[ind];
    const card = document.createElement('div');
    card.className = `card status-${status}`;
    card.innerHTML = `<strong>${ind}</strong><span class="value">${valor}</span>`;
    cardsRow.appendChild(card);

    const indItem = document.createElement('div');
    indItem.className = "ind-item";
    indItem.textContent = `${ind}: ${valor} (${status})`;
    indicatorsList.appendChild(indItem);

    historico.push({ indicador: ind, valor, status, data: new Date().toLocaleString() });
  });

  atualizarGraficos();
  atualizarMapa(dados);
  verificarCritico();
}

function atualizarGraficos() {
  const ctx1 = document.getElementById("chart1").getContext("2d");
  const ctx2 = document.getElementById("chart2").getContext("2d");

  new Chart(ctx1, {
    type: "radar",
    data: {
      labels: indicadores,
      datasets: [{
        label: "Níveis Atuais",
        data: indicadores.map(() => Math.random() * 100),
        backgroundColor: "rgba(88, 166, 255, 0.2)",
        borderColor: "#58a6ff",
        borderWidth: 2,
        pointBackgroundColor: "#58a6ff"
      }]
    },
    options: {
      scales: {
        r: {
          angleLines: { color: "#444" },
          grid: { color: "#333" },
          pointLabels: { color: "#e6edf3" },
          ticks: { color: "#999", backdropColor: "transparent" }
        }
      },
      plugins: {
        legend: { display: false }
      }
    }
  });

  new Chart(ctx2, {
    type: "pie",
    data: {
      labels: ['Normal', 'Alerta', 'Risco', 'Crítico'],
      datasets: [{
        data: [45, 25, 20, 10],
        backgroundColor: ['#4caf50', '#ffeb3b', '#ff9800', '#ff4d4d']
      }]
    },
    options: {
      plugins: {
        legend: {
          labels: { color: '#e6edf3' }
        }
      }
    }
  });
}

function atualizarMapa() {
  busMarkers.forEach(m => map.removeLayer(m));
  busMarkers = [];

  const paradas = [
    { nome: "Parada Boa Viagem", coords: [-8.117, -34.894] },
    { nome: "Parada Derby", coords: [-8.052, -34.903] },
    { nome: "Parada Afogados", coords: [-8.085, -34.917] },
    { nome: "Parada Cais do Porto", coords: [-8.060, -34.871] }
  ];

  paradas.forEach(p => {
    const sensor = gerarDados();
    const status = Object.values(sensor)[0].status;

    const icon = L.divIcon({
      className: 'custom-bus-icon',
      html: busSvgIcon
    });

    const marker = L.marker(p.coords, { icon })
      .addTo(map)
      .bindTooltip(`${p.nome}<br>Status: <strong>${status.toUpperCase()}</strong>`, {
        permanent: false,
        direction: "top"
      });

    busMarkers.push(marker);
  });
}

function verificarCritico() {
  const critico = document.querySelector(".status-situacaocritica");
  alertBanner.classList.toggle("hidden", !critico);
}

function exportarCSV() {
  const csv = "Indicador,Valor,Status,Data\n" +
    historico.map(h => `${h.indicador},${h.valor},${h.status},${h.data}`).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "historico.csv";
  a.click();
}

document.getElementById("startSim").addEventListener("click", () => {
  if (!interval) {
    atualizarInterface();
    interval = setInterval(atualizarInterface, 10000);
    document.getElementById("startSim").textContent = "⏸️ Parar Simulação";
  } else {
    clearInterval(interval);
    interval = null;
    document.getElementById("startSim").textContent = "▶️ Iniciar Simulação";
  }
});

document.getElementById("exportCsv").addEventListener("click", exportarCSV);
