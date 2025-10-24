import React from 'react';
import { Card } from './ui/card';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Sensor, HistoricalData } from '../App';

interface ChartsProps {
  sensores: Sensor[];
  historico: HistoricalData[];
}

export function Charts({ sensores, historico }: ChartsProps) {
  // Dados do gráfico de linha (últimas 6 leituras)
  const dadosLinha = React.useMemo(() => {
    const timestamps = Array.from(new Set(historico.map(h => h.timestamp))).sort().slice(-6);
    
    return timestamps.map(timestamp => {
      const dados = historico.filter(h => h.timestamp === timestamp);
      const item: any = {
        hora: new Date(timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };
      
      dados.forEach(d => {
        const sensor = sensores.find(s => s.id === d.sensorId);
        if (sensor) {
          item[sensor.bairro] = d.nivelAgua.toFixed(1);
        }
      });
      
      return item;
    });
  }, [historico, sensores]);

  // Dados do gráfico de pizza
  const dadosPizza = [
    { nome: 'Normal', valor: sensores.filter(s => s.status === 'Normal').length, cor: '#22c55e' },
    { nome: 'Alerta', valor: sensores.filter(s => s.status === 'Alerta').length, cor: '#eab308' },
    { nome: 'Risco', valor: sensores.filter(s => s.status === 'Risco').length, cor: '#f97316' },
    { nome: 'Crítico', valor: sensores.filter(s => s.status === 'Crítico').length, cor: '#ef4444' },
  ].filter(d => d.valor > 0);

  const bairros = Array.from(new Set(sensores.map(s => s.bairro)));
  const cores = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Gráfico de Linha */}
      <Card className="bg-gray-900 border-gray-800 p-5 hover:border-gray-700 transition-all">
        <h3 className="mb-4 text-gray-100">Histórico de Nível da Água</h3>
        <p className="text-sm text-gray-400 mb-4">Últimas 6 leituras por bairro</p>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={dadosLinha}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="hora" 
              stroke="#9ca3af" 
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#9ca3af" 
              label={{ value: 'cm', angle: -90, position: 'insideLeft', fill: '#9ca3af' }}
              style={{ fontSize: '12px' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1f2937', 
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#f3f4f6'
              }}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            {bairros.map((bairro, index) => (
              <Line 
                key={bairro}
                type="monotone" 
                dataKey={bairro} 
                stroke={cores[index % cores.length]} 
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Gráfico de Pizza */}
      <Card className="bg-gray-900 border-gray-800 p-5 hover:border-gray-700 transition-all">
        <h3 className="mb-4 text-gray-100">Distribuição de Status</h3>
        <p className="text-sm text-gray-400 mb-4">Proporção de sensores por status</p>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={dadosPizza}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ nome, percent }) => `${nome} ${(percent * 100).toFixed(0)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="valor"
            >
              {dadosPizza.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.cor} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1f2937', 
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#f3f4f6'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
