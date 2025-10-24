import React, { useState, useEffect } from 'react';
import { Topbar } from './components/Topbar';
import { Map } from './components/Map';
import { SensorCards } from './components/SensorCards';
import { Indicators } from './components/Indicators';
import { Charts } from './components/Charts';
import { AlertBanner } from './components/AlertBanner';
import { AlertHistory } from './components/AlertHistory';
import { Statistics } from './components/Statistics';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Input } from './components/ui/input';
import { Search } from 'lucide-react';

export interface Sensor {
  id: number;
  nome: string;
  lat: number;
  lng: number;
  bairro: string;
  nivelAgua: number;
  temperatura: number;
  umidade: number;
  status: 'Normal' | 'Alerta' | 'Risco' | 'Crítico';
}

export interface HistoricalData {
  timestamp: number;
  sensorId: number;
  nivelAgua: number;
  temperatura: number;
  umidade: number;
  status: string;
}

export interface AlertEvent {
  id: number;
  timestamp: number;
  sensorId: number;
  sensorNome: string;
  status: 'Crítico' | 'Risco';
  nivelAgua: number;
  message: string;
}

const sensoresIniciais = [
  { id: 1, nome: "Parada Boa Viagem", lat: -8.117, lng: -34.894, bairro: "Boa Viagem" },
  { id: 2, nome: "Parada Derby", lat: -8.052, lng: -34.903, bairro: "Derby" },
  { id: 3, nome: "Parada Afogados", lat: -8.085, lng: -34.917, bairro: "Afogados" },
  { id: 4, nome: "Parada Santo Amaro", lat: -8.058, lng: -34.894, bairro: "Santo Amaro" },
  { id: 5, nome: "Parada Iputinga", lat: -8.062, lng: -34.925, bairro: "Iputinga" },
  { id: 6, nome: "Parada Cais do Porto", lat: -8.060, lng: -34.871, bairro: "Cais do Porto" },
  { id: 7, nome: "Parada Torre", lat: -8.046, lng: -34.894, bairro: "Torre" },
  { id: 8, nome: "Parada Casa Amarela", lat: -8.025, lng: -34.910, bairro: "Casa Amarela" },
  { id: 9, nome: "Parada Encruzilhada", lat: -8.068, lng: -34.895, bairro: "Encruzilhada" },
  { id: 10, nome: "Parada Piedade", lat: -8.075, lng: -34.905, bairro: "Piedade" },
  { id: 11, nome: "Parada Cordeiro", lat: -8.093, lng: -34.918, bairro: "Cordeiro" },
  { id: 12, nome: "Parada Madalena", lat: -8.065, lng: -34.908, bairro: "Madalena" },
  { id: 13, nome: "Parada Pina", lat: -8.095, lng: -34.875, bairro: "Pina" },
  { id: 14, nome: "Parada Recife Antigo", lat: -8.063, lng: -34.880, bairro: "Recife Antigo" },
  { id: 15, nome: "Parada Boa Vista", lat: -8.056, lng: -34.893, bairro: "Boa Vista" }
];

const calcularStatus = (nivelAgua: number): 'Normal' | 'Alerta' | 'Risco' | 'Crítico' => {
  if (nivelAgua < 10) return 'Normal';
  if (nivelAgua < 20) return 'Alerta';
  if (nivelAgua < 30) return 'Risco';
  return 'Crítico';
};

const gerarDadosSimulados = (): Omit<Sensor, 'id' | 'nome' | 'lat' | 'lng' | 'bairro'> => {
  const nivelAgua = Math.floor(Math.random() * 40);
  const temperatura = 22 + Math.random() * 10;
  const umidade = 60 + Math.random() * 30;
  const status = calcularStatus(nivelAgua);
  
  return { nivelAgua, temperatura, umidade, status };
};

export default function App() {
  const [sensores, setSensores] = useState<Sensor[]>([]);
  const [historico, setHistorico] = useState<HistoricalData[]>([]);
  const [simulacaoAtiva, setSimulacaoAtiva] = useState(false);
  const [bairroFiltro, setBairroFiltro] = useState<string>('Todos');
  const [statusFiltro, setStatusFiltro] = useState<string>('Todos');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [alertas, setAlertas] = useState<AlertEvent[]>([]);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<Date>(new Date());

  // Inicializar sensores
  useEffect(() => {
    const sensoresComDados = sensoresIniciais.map(s => ({
      ...s,
      ...gerarDadosSimulados()
    }));
    setSensores(sensoresComDados);
    
    // Adicionar dados históricos iniciais
    const historicosIniciais: HistoricalData[] = [];
    sensoresComDados.forEach(sensor => {
      for (let i = 5; i >= 0; i--) {
        historicosIniciais.push({
          timestamp: Date.now() - i * 10000,
          sensorId: sensor.id,
          nivelAgua: sensor.nivelAgua + Math.random() * 5 - 2.5,
          temperatura: sensor.temperatura + Math.random() * 2 - 1,
          umidade: sensor.umidade + Math.random() * 5 - 2.5,
          status: sensor.status
        });
      }
    });
    setHistorico(historicosIniciais);
  }, []);

  // Simulação em tempo real
  useEffect(() => {
    if (!simulacaoAtiva) return;

    const intervalo = setInterval(() => {
      setSensores(prev => {
        const novos = prev.map(s => ({
          ...s,
          ...gerarDadosSimulados()
        }));
        
        // Adicionar ao histórico
        const timestamp = Date.now();
        const novosHistoricos = novos.map(sensor => ({
          timestamp,
          sensorId: sensor.id,
          nivelAgua: sensor.nivelAgua,
          temperatura: sensor.temperatura,
          umidade: sensor.umidade,
          status: sensor.status
        }));
        
        setHistorico(prev => [...prev, ...novosHistoricos].slice(-60)); // Manter últimos 60 registros
        
        // Detectar novos alertas críticos ou de risco
        novos.forEach(sensor => {
          const anterior = prev.find(p => p.id === sensor.id);
          if (sensor.status === 'Crítico' || sensor.status === 'Risco') {
            if (!anterior || (anterior.status !== 'Crítico' && anterior.status !== 'Risco')) {
              const novoAlerta: AlertEvent = {
                id: Date.now() + sensor.id,
                timestamp,
                sensorId: sensor.id,
                sensorNome: sensor.nome,
                status: sensor.status,
                nivelAgua: sensor.nivelAgua,
                message: `${sensor.nome} entrou em estado ${sensor.status.toLowerCase()} com ${sensor.nivelAgua.toFixed(1)}cm`
              };
              setAlertas(prev => [novoAlerta, ...prev].slice(0, 20)); // Manter últimos 20 alertas
            }
          }
        });
        
        setUltimaAtualizacao(new Date());
        
        return novos;
      });
    }, 10000);

    return () => clearInterval(intervalo);
  }, [simulacaoAtiva]);

  const toggleSimulacao = () => {
    setSimulacaoAtiva(!simulacaoAtiva);
  };

  const exportarCSV = () => {
    const headers = ['Sensor', 'Bairro', 'Nível Água (cm)', 'Temperatura (°C)', 'Umidade (%)', 'Status', 'Data/Hora'];
    const rows = sensores.map(s => [
      s.nome,
      s.bairro,
      s.nivelAgua.toFixed(1),
      s.temperatura.toFixed(1),
      s.umidade.toFixed(1),
      s.status,
      new Date().toLocaleString('pt-BR')
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `redap_dados_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const bairros = ['Todos', ...Array.from(new Set(sensores.map(s => s.bairro)))];
  
  // Aplicar filtros
  let sensoresFiltrados = sensores;
  
  // Filtro por bairro
  if (bairroFiltro !== 'Todos') {
    sensoresFiltrados = sensoresFiltrados.filter(s => s.bairro === bairroFiltro);
  }
  
  // Filtro por status
  if (statusFiltro !== 'Todos') {
    sensoresFiltrados = sensoresFiltrados.filter(s => s.status === statusFiltro);
  }
  
  // Filtro por busca
  if (searchTerm) {
    sensoresFiltrados = sensoresFiltrados.filter(s => 
      s.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.bairro.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  const temCriticos = sensores.some(s => s.status === 'Crítico');
  const mostrarCards = bairroFiltro !== 'Todos' || searchTerm !== '' || statusFiltro !== 'Todos';

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <Topbar 
        simulacaoAtiva={simulacaoAtiva}
        onToggleSimulacao={toggleSimulacao}
        onExportarCSV={exportarCSV}
      />
      
      {temCriticos && <AlertBanner sensores={sensores} />}
      
      <div className="container mx-auto p-4 pb-8">
        {/* Filtros e Busca */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
            <Input
              placeholder="Buscar parada ou bairro..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-900 border-gray-700 text-gray-100 placeholder:text-gray-500"
            />
          </div>
          <Select value={bairroFiltro} onValueChange={setBairroFiltro}>
            <SelectTrigger className="w-full sm:w-[220px] bg-gray-900 border-gray-700">
              <SelectValue placeholder="Filtrar por bairro" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-700 text-white">
              {bairros.map(bairro => (
                <SelectItem key={bairro} value={bairro}>{bairro}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna Esquerda - 2/3 */}
          <div className="lg:col-span-2 space-y-6">
            <Map sensores={sensoresFiltrados} />
            
            {mostrarCards && <SensorCards sensores={sensoresFiltrados} />}
            
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="bg-gray-900 border border-gray-800 w-full justify-start">
                <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                <TabsTrigger value="charts">Gráficos</TabsTrigger>
                <TabsTrigger value="history">Histórico de Alertas</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="mt-4">
                <Statistics 
                  sensores={sensores} 
                  ultimaAtualizacao={ultimaAtualizacao}
                  simulacaoAtiva={simulacaoAtiva}
                />
              </TabsContent>
              
              <TabsContent value="charts" className="mt-4">
                <Charts sensores={sensores} historico={historico} />
              </TabsContent>
              
              <TabsContent value="history" className="mt-4">
                <AlertHistory alertas={alertas} />
              </TabsContent>
            </Tabs>
          </div>

          {/* Coluna Direita - 1/3 */}
          <div className="space-y-6">
            <Indicators 
              sensores={sensores} 
              onStatusClick={(status) => {
                setStatusFiltro(status === statusFiltro ? 'Todos' : status);
                setBairroFiltro('Todos');
                setSearchTerm('');
              }}
              statusAtivo={statusFiltro}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
