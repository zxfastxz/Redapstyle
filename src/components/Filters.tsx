import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card } from './ui/card';

interface FiltersProps {
  zonaFiltro: string;
  onZonaChange: (zona: string) => void;
  bairroFiltro: string;
  onBairroChange: (bairro: string) => void;
  dashboardFiltro: string;
  onDashboardChange: (dashboard: string) => void;
}

// Mapeamento de zonas e bairros de Recife
const zonasBairros = {
  'Zona Sul': ['Boa Viagem', 'Pina'],
  'Zona Oeste': ['Afogados', 'Cordeiro', 'Iputinga', 'Torre'],
  'Zona Norte': ['Casa Amarela', 'Derby', 'Santo Amaro', 'Encruzilhada', 'Piedade', 'Madalena', 'Cais do Porto', 'Recife Antigo', 'Boa Vista']
};

export const getZonaPorBairro = (bairro: string): string => {
  for (const [zona, bairros] of Object.entries(zonasBairros)) {
    if (bairros.includes(bairro)) {
      return zona;
    }
  }
  return 'Zona Sul'; // default
};

export function Filters({ 
  zonaFiltro, 
  onZonaChange, 
  bairroFiltro, 
  onBairroChange,
  dashboardFiltro,
  onDashboardChange 
}: FiltersProps) {
  
  // Obter bairros disponíveis baseado na zona selecionada
  const bairrosDisponiveis = zonaFiltro && zonaFiltro !== 'Todas' 
    ? zonasBairros[zonaFiltro as keyof typeof zonasBairros] || []
    : Object.values(zonasBairros).flat();

  // Resetar bairro se não estiver disponível na nova zona
  React.useEffect(() => {
    if (zonaFiltro !== 'Todas' && bairroFiltro !== 'Todos') {
      const bairrosZona = zonasBairros[zonaFiltro as keyof typeof zonasBairros] || [];
      if (!bairrosZona.includes(bairroFiltro)) {
        onBairroChange('Todos');
      }
    }
  }, [zonaFiltro, bairroFiltro, onBairroChange]);

  return (
    <Card className="bg-gray-900 border-gray-800 p-4 mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Filtro de Dashboard */}
        <div>
          <label className="block text-white text-sm mb-2">Dashboard</label>
          <Select value={dashboardFiltro} onValueChange={onDashboardChange}>
            <SelectTrigger className="w-full bg-gray-800 border-gray-700 text-white">
              <SelectValue placeholder="Selecione o dashboard" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="Geral" className="text-white focus:bg-gray-700 focus:text-white">Geral</SelectItem>
              <SelectItem value="Alertas" className="text-white focus:bg-gray-700 focus:text-white">Alertas</SelectItem>
              <SelectItem value="Gráficos" className="text-white focus:bg-gray-700 focus:text-white">Gráficos</SelectItem>
              <SelectItem value="Histórico" className="text-white focus:bg-gray-700 focus:text-white">Histórico</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Filtro de Zona */}
        <div>
          <label className="block text-white text-sm mb-2">Zona</label>
          <Select value={zonaFiltro} onValueChange={onZonaChange}>
            <SelectTrigger className="w-full bg-gray-800 border-gray-700 text-white">
              <SelectValue placeholder="Selecione a zona" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="Todas" className="text-white focus:bg-gray-700 focus:text-white">Todas as Zonas</SelectItem>
              <SelectItem value="Zona Sul" className="text-white focus:bg-gray-700 focus:text-white">Zona Sul</SelectItem>
              <SelectItem value="Zona Oeste" className="text-white focus:bg-gray-700 focus:text-white">Zona Oeste</SelectItem>
              <SelectItem value="Zona Norte" className="text-white focus:bg-gray-700 focus:text-white">Zona Norte</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Filtro de Bairro */}
        <div>
          <label className="block text-white text-sm mb-2">Bairro</label>
          <Select value={bairroFiltro} onValueChange={onBairroChange}>
            <SelectTrigger className="w-full bg-gray-800 border-gray-700 text-white">
              <SelectValue placeholder="Selecione o bairro" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700">
              <SelectItem value="Todos" className="text-white focus:bg-gray-700 focus:text-white">Todos os Bairros</SelectItem>
              {bairrosDisponiveis.sort().map(bairro => (
                <SelectItem key={bairro} value={bairro} className="text-white focus:bg-gray-700 focus:text-white">
                  {bairro}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  );
}