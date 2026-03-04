'use client';

import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis } from 'recharts';
import { Map } from 'lucide-react';

const INTENT_COLORS = {
  informational: '#3B82F6',
  transactional: '#10B981',
  commercial: '#F59E0B',
  navigational: '#8B5CF6',
};

const INTENT_LABELS = {
  informational: 'Informacional',
  transactional: 'Transaccional',
  commercial: 'Comercial',
  navigational: 'Navegacional',
};

function classifyIntentBasic(keyword) {
  const k = keyword.toLowerCase();
  if (/comprar|precio|barato|oferta|tienda|donde comprar|costo/.test(k)) return 'transactional';
  if (/mejor|comparar|vs|review|opiniones|top \d|ranking/.test(k)) return 'commercial';
  if (/login|iniciar sesión|pagina oficial|contacto/.test(k)) return 'navigational';
  return 'informational';
}

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
        <p className="font-medium text-gray-900 text-sm">{data.keyword}</p>
        <p className="text-xs text-gray-500 mt-1">Volumen: {data.volume?.toLocaleString('es')}</p>
        <p className="text-xs text-gray-500">Dificultad: {data.difficulty}</p>
        <p className="text-xs text-gray-500">Pos. competidor: {data.competitorPosition}</p>
      </div>
    );
  }
  return null;
};

export default function OpportunityMap({ gapKeywords }) {
  if (!gapKeywords || gapKeywords.length === 0) {
    return (
      <div className="card text-center py-8">
        <p className="text-gray-500 text-sm">No hay datos suficientes para el mapa de oportunidades</p>
      </div>
    );
  }

  // Preparar datos por intención
  const dataByIntent = {};
  gapKeywords.forEach((kw) => {
    const intent = classifyIntentBasic(kw.keyword);
    if (!dataByIntent[intent]) dataByIntent[intent] = [];
    dataByIntent[intent].push({
      ...kw,
      x: kw.volume || 0,
      y: kw.difficulty || 0,
      z: Math.max(100 - (kw.competitorPosition || 50), 10),
      intent,
    });
  });

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <Map className="w-5 h-5 text-primary-600" />
        <h3 className="text-lg font-semibold text-gray-900">Mapa de Oportunidad Competitiva</h3>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Eje X = Volumen de búsqueda | Eje Y = Dificultad | Tamaño = Oportunidad (mejor posición del competidor = mayor oportunidad)
      </p>

      {/* Leyenda */}
      <div className="flex gap-4 mb-4 flex-wrap">
        {Object.entries(INTENT_COLORS).map(([intent, color]) => {
          const count = dataByIntent[intent]?.length || 0;
          if (count === 0) return null;
          return (
            <div key={intent} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></div>
              <span className="text-xs text-gray-600">{INTENT_LABELS[intent]} ({count})</span>
            </div>
          );
        })}
      </div>

      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis
              type="number"
              dataKey="x"
              name="Volumen"
              tick={{ fontSize: 11 }}
              label={{ value: 'Volumen', position: 'bottom', fontSize: 12 }}
            />
            <YAxis
              type="number"
              dataKey="y"
              name="Dificultad"
              tick={{ fontSize: 11 }}
              label={{ value: 'KD', angle: -90, position: 'insideLeft', fontSize: 12 }}
            />
            <ZAxis type="number" dataKey="z" range={[30, 200]} />
            <Tooltip content={<CustomTooltip />} />
            {Object.entries(dataByIntent).map(([intent, items]) => (
              <Scatter
                key={intent}
                name={INTENT_LABELS[intent]}
                data={items}
                fill={INTENT_COLORS[intent]}
                fillOpacity={0.7}
              />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
