/* REDAP - versão PRO (simulada)
   - múltiplos sensores, seleção, gráficos e CSV export
*/

const SENSORS = [
  { id: 'recife', name: 'Recife - Centro', lat: -8.0476, lon: -34.8770 },
  { id: 'olinda', name: 'Olinda', lat: -7.9991, lon: -34.8556 },
  { id: 'jaboatao', name: 'Jaboatão', lat: -8.1125, lon: -35.0078 },
  { id: 'paulista', name: 'Paulista', lat: -7.9446, lon: -34.8728 }
];

const MAX_HISTORY = 20; 
let sensorData = {}; 
let markers = {};
let selectedSensorId = SENSORS[0].id;
let simulating = false;
let intervalId = null;

// Inicializa históricos
SENSORS.forEach(s => sensorData[s.id] = { labels: [], nivel: [], temp: [] });

// util remove acentos e espaços para classes
function slug(s){ return s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,'').toLowerCase(); }

document.addEventListener('DOMContentLoaded', () => {

  // inicializa mapa
  const map = L.map('map').setView([SENSORS[0].lat, SENSORS[0].lon], 11);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);
  setTimeout(()=>map.invalidateSize(),300);

  // criar marcadores e cards
  const cardsRow = document.getElementById('cardsRow');
  SENSORS.forEach(s=>{
    const m = L.circleMarker([s.lat, s.lon], { radius:9, color:'green', fillColor:'green', fillOpacity:0.8 })
      .addTo(map)
      .bindPopup(`${s.name}`);
    m.on('click', ()=> selectSensor(s.id));
    markers[s.id] = m;

    // card
    const card = document.createElement('div');
    card.className = 'card';
    card.id = `card-${s.id}`;
    card.innerHTML = `<strong>${s.name}</strong>
      <div>Temp: <span class="value" id="temp-${s.id}">-- °C</span></div>
      <div>Umid: <span class="value" id="hum-${s.id}">-- %</span></div>
      <div>Nível: <span class="value" id="nivel-${s.id}">-- cm</span></div>
      <div>Status: <span class="value" id="status-${s.id}">--</span></div>
      <div style="margin-top:8px"><button class="btn tiny" onclick="centerOn('${s.id}')">Centralizar</button></div>`;
    cardsRow.appendChild(card);
  });

  // charts
  const ctxN = document.getElementById('chartNivel').getContext('2d');
  const ctxT = document.getElementById('chartTemp').getContext('2d');

  const chartNivel = new Chart(ctxN, {
    type:'line',
    data: { labels: [], datasets:[{ label:'Nível (cm)', data:[], borderColor:'#58a6ff', backgroundColor:'rgba(88,166,255,0.12)', tension:0.25, fill:true }]},
    options: { plugins:{legend:{labels:{color:'#e6edf3'}}}, scales:{x:{ticks:{color:'#8b949e'}}, y:{ticks:{color:'#8b949e'}}}}
  });

  const chartTemp = new Chart(ctxT, {
    type:'line',
    data: { labels: [], datasets:[{ label:'Temperatura (°C)', data:[], borderColor:'#ffb86b', backgroundColor:'rgba(255,184,107,0.12)', tension:0.25, fill:true }]},
    options: { plugins:{legend:{labels:{color:'#e6edf3'}}}, scales:{x:{ticks:{color:'#8b949e'}}, y:{ticks:{color:'#8b949e'}}}}
  });

  // UI Controls
  document.getElementById('btnFitAll').addEventListener('click', ()=> map.fitBounds(SENSORS.map(s=>[s.lat,s.lon]), {padding:[50,50]}));
  document.getElementById('ackAlert').addEventListener('click', ()=> document.getElementById('alertBanner').classList.add('hidden'));
  document.getElementById('btnExport').addEventListener('click', exportCSV);

  // botão iniciar/parar simulação
  document.getElementById('btnStart').addEventListener('click', ()=>{
    if(!simulating){
      simulating = true;
      document.getElementById('btnStart').textContent = '⏸ Parar Simulação';
      performUpdate();
      intervalId = setInterval(performUpdate, 10000);
    } else {
      simulating = false;
      document.getElementById('btnStart').textContent = '▶ Iniciar Simulação';
      clearInterval(intervalId);
    }
  });

  selectSensor(selectedSensorId);

  // Funções auxiliares
  function centerOn(sensorId){
    const s = SENSORS.find(x=>x.id===sensorId);
    if(!s) return;
    map.setView([s.lat,s.lon],14,{animate:true});
    markers[sensorId].openPopup();
  }

  window.selectSensor = function(sensorId){
    selectedSensorId = sensorId;
    document.getElementById('selectedName').textContent = SENSORS.find(s=>s.id===sensorId).name;
    document.querySelectorAll('.card').forEach(c=>c.style.border = 'none');
    const cdom = document.getElementById(`card-${sensorId}`);
    if(cdom) cdom.style.border = '2px solid rgba(88,166,255,0.12)';
    updateChartsFor(sensorId);
  };

  async function performUpdate(){
    const now = new Date();
    let anyCritical = false;

    SENSORS.forEach(s=>{
      const temperatura = +(22 + Math.random()*8).toFixed(1);
      const umidade = +(50 + Math.random()*35).toFixed(0);
      const nivel = +(Math.random()*35).toFixed(1);

      const hist = sensorData[s.id];
      const label = now.toLocaleTimeString();
      hist.labels.push(label); hist.temp.push(temperatura); hist.nivel.push(nivel);
      if(hist.labels.length>MAX_HISTORY){ hist.labels.shift(); hist.temp.shift(); hist.nivel.shift(); }

      let status = 'Normal';
      if(nivel>25) status='Situação Crítica';
      else if(nivel>20) status='Risco';
      else if(nivel>15) status='Alerta';
      if(status==='Situação Crítica') anyCritical = true;

      const color = statusColor(status);
      markers[s.id].setStyle({ color, fillColor: color });
      markers[s.id].bindPopup(`<strong>${s.name}</strong><br>
        Temp: ${temperatura} °C<br>Umid: ${umidade} %<br>Nível: ${nivel} cm<br>Status: ${status}`);

      const setText = (id, val)=>{ const el = document.getElementById(id); if(el) el.textContent = val; };
      setText(`temp-${s.id}`, `${temperatura} °C`);
      setText(`hum-${s.id}`, `${umidade} %`);
      setText(`nivel-${s.id}`, `${nivel} cm`);
      const statusEl = document.getElementById(`status-${s.id}`);
      if(statusEl){ 
        statusEl.textContent = status; 
        statusEl.className=''; 
        statusEl.classList.add('status-'+slug(status)); 
        if(status==='Situação Crítica'){
          statusEl.classList.add('oscillate'); // efeito de destaque
        } else statusEl.classList.remove('oscillate');
      }

      if(s.id === selectedSensorId) updateChartsFor(s.id);
    });

    document.getElementById('lastUpdate').textContent = now.toLocaleTimeString();
    document.getElementById('activeSensors').textContent = SENSORS.length;
    document.getElementById('globalAlert').textContent = anyCritical ? 'Situação Crítica' : 'Normal';
    document.getElementById('globalAlert').className = anyCritical ? 'status-situacaocritica oscillate' : 'status-normal';
    const banner = document.getElementById('alertBanner');
    if(anyCritical) banner.classList.remove('hidden');
    else banner.classList.add('hidden');
  }

  function updateChartsFor(sensorId){
    const hist = sensorData[sensorId];
    chartNivel.data.labels = [...hist.labels];
    chartNivel.data.datasets[0].data = [...hist.nivel];
    chartNivel.update();

    chartTemp.data.labels = [...hist.labels];
    chartTemp.data.datasets[0].data = [...hist.temp];
    chartTemp.update();
  }

  function statusColor(status){
    if(status==='Normal') return 'green';
    if(status==='Alerta') return 'yellow';
    if(status==='Risco') return 'orange';
    return 'red';
  }

  function exportCSV(){
    let csv = "Sensor,Horário,Temperatura,Umidade,Nível,Status\n";
    SENSORS.forEach(s=>{
      const hist = sensorData[s.id];
      hist.labels.forEach((time,i)=>{
        const temp = hist.temp[i];
        const nivel = hist.nivel[i];
        csv += `${s.name},${time},${temp},${50+i},${nivel},${getStatus(nivel)}\n`;
      });
    });
    const blob = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "historico_sensores.csv";
    link.click();
  }

  function getStatus(nivel){
    if(nivel>25) return 'Situação Crítica';
    if(nivel>20) return 'Risco';
    if(nivel>15) return 'Alerta';
    return 'Normal';
  }

});
