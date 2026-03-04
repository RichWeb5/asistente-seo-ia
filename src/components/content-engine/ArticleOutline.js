'use client';

import { X, FileText, Link2, HelpCircle, Hash, Target } from 'lucide-react';

const INTENT_LABELS = {
  informational: { label: 'Informacional', class: 'badge-info' },
  transactional: { label: 'Transaccional', class: 'badge-success' },
  commercial: { label: 'Comercial', class: 'badge-warning' },
  navigational: { label: 'Navegacional', class: 'badge-purple' },
};

export default function ArticleOutline({ article, onClose }) {
  if (!article) return null;

  const intentInfo = INTENT_LABELS[article.intent] || INTENT_LABELS.informational;

  return (
    <div className="card">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`badge ${intentInfo.class}`}>{intentInfo.label}</span>
            <span className="badge badge-info">{article.opportunityType}</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900">{article.keyword}</h2>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Título optimizado */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <FileText className="w-4 h-4 text-primary-600" />
          <h3 className="font-semibold text-gray-900">Título Optimizado</h3>
        </div>
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-3">
          <p className="text-primary-800 font-medium">{article.title}</p>
          <p className="text-xs text-primary-600 mt-1">{article.title.length} caracteres</p>
        </div>
      </div>

      {/* Meta descripción */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-4 h-4 text-primary-600" />
          <h3 className="font-semibold text-gray-900">Meta Descripción</h3>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <p className="text-gray-700 text-sm">{article.metaDescription}</p>
          <p className={`text-xs mt-1 ${article.metaDescription.length > 160 ? 'text-red-500' : 'text-green-600'}`}>
            {article.metaDescription.length} / 160 caracteres
          </p>
        </div>
      </div>

      {/* Estructura de headings */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Hash className="w-4 h-4 text-primary-600" />
          <h3 className="font-semibold text-gray-900">Estructura de Contenido</h3>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
          <p className="font-bold text-gray-900">
            <span className="text-xs text-primary-600 mr-2">H1</span>
            {article.headings?.h1}
          </p>
          {article.headings?.h2s?.map((h2, i) => (
            <div key={i} className="ml-4">
              <p className="font-semibold text-gray-800">
                <span className="text-xs text-blue-600 mr-2">H2</span>
                {h2}
              </p>
              {article.headings?.h3Map?.[h2]?.map((h3, j) => (
                <p key={j} className="ml-4 text-sm text-gray-600">
                  <span className="text-xs text-gray-400 mr-2">H3</span>
                  {h3}
                </p>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Foco semántico */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-900 mb-2">Enfoque Semántico</h3>
        <div className="flex flex-wrap gap-1.5">
          {article.semanticFocus?.map((term, i) => (
            <span key={i} className="badge badge-info">{term}</span>
          ))}
        </div>
      </div>

      {/* FAQs */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <HelpCircle className="w-4 h-4 text-primary-600" />
          <h3 className="font-semibold text-gray-900">Preguntas Frecuentes</h3>
        </div>
        <div className="space-y-2">
          {article.faqs?.map((faq, i) => (
            <div key={i} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="font-medium text-gray-900 text-sm">{faq.question}</p>
              <p className="text-gray-600 text-xs mt-1">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Enlazado interno */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Link2 className="w-4 h-4 text-primary-600" />
          <h3 className="font-semibold text-gray-900">Recomendación de Enlazado Interno</h3>
        </div>
        <div className="space-y-2">
          {article.internalLinking?.map((link, i) => (
            <div key={i} className="flex items-start gap-2 text-sm">
              <span className="badge badge-info text-[10px]">{link.type}</span>
              <p className="text-gray-700">{link.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
