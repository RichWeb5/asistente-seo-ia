'use client';

import { FileText, Target, FolderOpen } from 'lucide-react';

const TYPE_CONFIG = {
  blog: { label: 'Blog Posts', icon: FileText, color: 'blue', description: 'Artículos informativos para atraer tráfico orgánico' },
  landing_page: { label: 'Landing Pages', icon: Target, color: 'green', description: 'Páginas de conversión para keywords transaccionales' },
  category: { label: 'Categorías', icon: FolderOpen, color: 'yellow', description: 'Páginas de categoría para organizar contenido' },
  comparison_page: { label: 'Comparativas', icon: FileText, color: 'purple', description: 'Contenido comparativo para intención comercial' },
};

const COLOR_CLASSES = {
  blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: 'text-blue-500' },
  green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', icon: 'text-green-500' },
  yellow: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700', icon: 'text-yellow-500' },
  purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', icon: 'text-purple-500' },
};

export default function OpportunityList({ plan, onSelectArticle }) {
  if (!plan || plan.length === 0) return null;

  // Agrupar por tipo de oportunidad
  const grouped = {};
  plan.forEach((item, index) => {
    const type = item.opportunityType || 'blog';
    if (!grouped[type]) grouped[type] = [];
    grouped[type].push({ ...item, index });
  });

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([type, items]) => {
        const config = TYPE_CONFIG[type] || TYPE_CONFIG.blog;
        const colors = COLOR_CLASSES[config.color] || COLOR_CLASSES.blue;
        const Icon = config.icon;

        return (
          <div key={type}>
            <div className="flex items-center gap-2 mb-3">
              <Icon className={`w-5 h-5 ${colors.icon}`} />
              <h3 className="text-lg font-semibold text-gray-900">
                {config.label} ({items.length})
              </h3>
            </div>
            <p className="text-sm text-gray-600 mb-3">{config.description}</p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {items.map((item) => (
                <button
                  key={item.index}
                  onClick={() => onSelectArticle(item.index)}
                  className={`${colors.bg} ${colors.border} border rounded-lg p-4 text-left hover:shadow-md transition-shadow`}
                >
                  <p className={`font-medium text-sm ${colors.text}`}>{item.keyword}</p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                    {item.volume > 0 && <span>Vol: {item.volume.toLocaleString('es')}</span>}
                    {item.difficulty > 0 && <span>KD: {item.difficulty}</span>}
                  </div>
                  <p className="text-xs text-gray-500 mt-1 truncate">{item.title}</p>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
