import React, { useState, useEffect } from 'react';
import { Map } from './Map';
import { MapLegend } from './MapLegend';
import { Indicators } from './Indicators';
import { AlertBanner } from './AlertBanner';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Search, ArrowLeft, Droplets } from 'lucide-react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select';

interface Sensor {
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

interface PublicDashboardProps {
  onBack: () => void;
}

export function PublicDashboard({ onBack }: PublicDashboardProps) {
  const [sensores, setSensores] = useState<Sensor[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [bairroFiltro, setBairroFiltro] = useState<string>('Todos');
  const [statusFiltro, setStatusFiltro] = useState<string>('Todos');

  // ============================
  // 🔵 Buscar dados reais da API
  // ============================
  useEffect(() => {
    async function carregarSensores() {
      try {
        const resp = await fetch("http://localhost:5000/sensores");
        const dados = await resp.json();
        setSensores(dados);
      } catch (error) {
        console.error("Erro ao carregar sensores:", error);
      }
    }

    carregarSensores();

    // Atualizar automaticamente (10s)
    const intervalo = setInterval(carregarSensores, 10000);
    return () => clearInterval(intervalo);
  }, []);

  // Lista de bairros únicos
  const bairros = ['Todos', ...Array.from(new Set(sensores.map(s => s.bairro)))];

  // ================
  // 🔍 Aplicar filtros
  // ================
  let sensoresFiltrados = sensores;

  if (bairroFiltro !== 'Todos') {
    sensoresFiltrados = sensoresFiltrados.filter(s => s.bairro === bairroFiltro);
  }

  if (statusFiltro !== 'Todos') {
    sensoresFiltrados = sensoresFiltrados.filter(s => s.status === statusFiltro);
  }

  if (searchTerm) {
    sensoresFiltrados = sensoresFiltrados.filter(s =>
      s.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.bairro.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  // Se existe algum sensor crítico
  const temCriticos = sensores.some(s => s.status === 'Crítico');

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      
      {/* Topbar Público */}
      <div className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">

            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Droplets className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-white text-xl">REDAP - Painel Público</h1>
                <p className="text-xs text-gray-400">Monitoramento de Alagamentos em Tempo Real</p>
              </div>
            </div>

            <Button
              onClick={onBack}
              variant="outline"
              className="bg-gray-800 border-gray-600 text-gray-100 hover:bg-gray-700 hover:text-white transition-colors duration-200 flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>

          </div>
        </div>
      </div>

      {/* Aviso de sensores críticos */}
      {temCriticos && <AlertBanner sensores={sensores} />}

      <div className="container mx-auto p-4 pb-8">

        {/* Filtros */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
            <Input
              placeholder="Buscar parada ou bairro..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-900 border-gray-700 text-white placeholder:text-gray-500"
            />
          </div>

          {/* Filtro por Bairro */}
          <Select value={bairroFiltro} onValueChange={setBairroFiltro}>
            <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
              <SelectValue placeholder="Filtrar por bairro" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-700">
              {bairros.map(bairro => (
                <SelectItem key={bairro} value={bairro} className="text-white hover:bg-gray-800">
                  {bairro}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Filtro por Status */}
          <Select value={statusFiltro} onValueChange={setStatusFiltro}>
            <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
              <SelectValue placeholder="Filtrar por status" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-700">
              <SelectItem value="Todos" className="text-white hover:bg-gray-800">Todos</SelectItem>
              <SelectItem value="Normal" className="text-white hover:bg-gray-800">Normal</SelectItem>
              <SelectItem value="Alerta" className="text-white hover:bg-gray-800">Alerta</SelectItem>
              <SelectItem value="Risco" className="text-white hover:bg-gray-800">Risco</SelectItem>
              <SelectItem value="Crítico" className="text-white hover:bg-gray-800">Crítico</SelectItem>
            </SelectContent>
          </Select>

        </div>

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Mapa */}
          <div className="lg:col-span-2 space-y-6">
            <Map sensores={sensoresFiltrados} />
            <MapLegend />
          </div>

          {/* Indicadores */}
          <div className="space-y-6">
            <Indicators
              sensores={sensores}
              onStatusClick={(status) => {
                setStatusFiltro(status === statusFiltro ? 'Todos' : status);
              }}
              statusAtivo={statusFiltro}
            />
          </div>

        </div>

      </div>

      {/* Footer */}
      <footer className="bg-[#1A1A1A] py-6 mt-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-white text-sm">© 2025 Sistema de Monitoramento – Todos os direitos reservados.</p>
        </div>
      </footer>

    </div>
  );
}
