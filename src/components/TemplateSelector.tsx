'use client';

import { useState } from 'react';
import { useRecordingStore } from '@/store/recording-store';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

const AVAILABLE_TEMPLATES = [
  {
    id: 'dark-yellow',
    name: 'Dark Yellow',
    description: 'Professional dark theme with yellow accents',
    colors: { primary: '#FFFF00', background: '#000000' },
  },
  {
    id: 'modern-blue',
    name: 'Modern Blue',
    description: 'Clean white background with vibrant blue accents',
    colors: { primary: '#2563EB', background: '#FFFFFF' },
  },
  {
    id: 'organic-warm',
    name: 'Organic Warm',
    description: 'Warm beige with orange and ocher highlights',
    colors: { primary: '#FF8C00', background: '#F5F5DC' },
  },
];

export function TemplateSelector() {
  const { selectedTemplate, setSelectedTemplate } = useRecordingStore();
  const [isOpen, setIsOpen] = useState(false);

  const currentTemplate = AVAILABLE_TEMPLATES.find(t => t.id === selectedTemplate) || AVAILABLE_TEMPLATES[0];

  return (
    <div className="relative">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="secondary"
        className="flex items-center gap-2"
      >
        <div 
          className="w-4 h-4 rounded"
          style={{ backgroundColor: currentTemplate.colors.primary }}
        />
        {currentTemplate.name}
        <span className="ml-2">▼</span>
      </Button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          <Card className="absolute right-0 mt-2 w-80 z-50 p-4 space-y-3">
            <h3 className="text-lg font-semibold text-primary mb-3">
              Select Template
            </h3>
            
            {AVAILABLE_TEMPLATES.map((template) => (
              <button
                key={template.id}
                onClick={() => {
                  setSelectedTemplate(template.id);
                  setIsOpen(false);
                }}
                className={`w-full p-4 rounded border-2 transition-all text-left hover:scale-102 active:scale-98 ${
                  selectedTemplate === template.id
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:border-primary hover:bg-primary/10 hover:shadow-md hover:shadow-yellow-400/20'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div 
                    className="w-12 h-12 rounded flex-shrink-0"
                    style={{ backgroundColor: template.colors.background }}
                  >
                    <div 
                      className="w-full h-full flex items-center justify-center text-2xl font-bold"
                      style={{ color: template.colors.primary }}
                    >
                      A
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="font-semibold text-text">
                      {template.name}
                    </h4>
                    <p className="text-xs text-text/60 mt-1">
                      {template.description}
                    </p>
                  </div>

                  {selectedTemplate === template.id && (
                    <div className="text-primary text-xl">✓</div>
                  )}
                </div>
              </button>
            ))}

            <div className="pt-3 border-t border-border">
              <p className="text-xs text-text/50">
                More templates coming soon
              </p>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
