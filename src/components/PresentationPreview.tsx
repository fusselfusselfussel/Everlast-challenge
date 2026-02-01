'use client';

import { useState, useEffect } from 'react';
import { useRecordingStore } from '@/store/recording-store';
import { Button } from './ui/Button';
import { Card } from './ui/Card';

const TEMPLATE_CONFIGS: Record<string, {
  background: string;
  primary: string;
  text: string;
  border: string;
  titleFont: string;
  bodyFont: string;
  decorations: 'modern-blue' | 'organic-warm' | 'dark-yellow';
}> = {
  'dark-yellow': {
    background: '#000000',
    primary: '#FFFF00',
    text: '#FFFF00',
    border: '#FFFF00',
    titleFont: 'Inter, sans-serif',
    bodyFont: 'Inter, sans-serif',
    decorations: 'dark-yellow',
  },
  'modern-blue': {
    background: '#FFFFFF',
    primary: '#2563EB',
    text: '#000000',
    border: '#2563EB',
    titleFont: 'Montserrat, sans-serif',
    bodyFont: 'Montserrat, sans-serif',
    decorations: 'modern-blue',
  },
  'organic-warm': {
    background: '#F5F5DC',
    primary: '#FF8C00',
    text: '#8B7355',
    border: '#C4A048',
    titleFont: 'Playfair Display, serif',
    bodyFont: 'Lato, sans-serif',
    decorations: 'organic-warm',
  },
};

export function PresentationPreview() {
  const { slides, setSlides, selectedTemplate } = useRecordingStore();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [editableSlides, setEditableSlides] = useState<any[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const template = TEMPLATE_CONFIGS[selectedTemplate] || TEMPLATE_CONFIGS['dark-yellow'];

  useEffect(() => {
    console.log('[Preview] Slides received:', slides);
    console.log('[Preview] Slides length:', slides?.length);
    if (slides) {
      // Flatten slides structure: merge content into slide object
      const flattened = slides.map((slide: any) => ({
        type: slide.type,
        order: slide.order,
        ...slide.content
      }));
      console.log('[Preview] Flattened slides:', flattened);
      setEditableSlides(flattened);
    }
  }, [slides]);

  useEffect(() => {
    setIsRefreshing(true);
    const timer = setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [selectedTemplate]);

  const currentSlide = editableSlides[currentSlideIndex];

  const handleTextEdit = (field: string, value: string) => {
    const updated = [...editableSlides];
    updated[currentSlideIndex] = {
      ...updated[currentSlideIndex],
      [field]: value,
    };
    setEditableSlides(updated);
  };

  const handleSaveChanges = () => {
    // Convert flattened slides back to nested structure
    const nested = editableSlides.map((slide: any) => {
      const { type, order, ...content } = slide;
      return {
        type,
        order,
        content
      };
    });
    setSlides(nested);
  };

  const handleRefresh = () => {
    if (slides) {
      const flattened = slides.map((slide: any) => ({
        type: slide.type,
        order: slide.order,
        ...slide.content
      }));
      setEditableSlides(flattened);
    }
  };

  if (!currentSlide) {
    return (
      <Card className="p-12 text-center">
        <p className="text-text/50">No slides available</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-primary">
            Slide Preview
          </h2>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleRefresh}
              variant="ghost"
              className="text-sm"
            >
              Reset Changes
            </Button>
            <Button
              onClick={handleSaveChanges}
              variant="secondary"
              className="text-sm"
            >
              Save Changes
            </Button>
          </div>
        </div>

        {isRefreshing && (
          <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10 rounded">
            <p className="text-primary">Updating preview...</p>
          </div>
        )}

        <div className="relative">
          <div 
            className="aspect-video rounded-lg relative overflow-hidden transition-all duration-500"
            style={{ 
              backgroundColor: template.background,
              padding: '50px 70px',
              fontFamily: template.bodyFont,
            }}
          >
            {/* Decorative Elements */}
            {template.decorations === 'modern-blue' && (
              <>
                <div 
                  className="absolute rounded-full"
                  style={{
                    top: '-80px',
                    right: '-80px',
                    width: '200px',
                    height: '200px',
                    border: `4px solid ${template.primary}`,
                    opacity: 0.08,
                  }}
                />
                <div 
                  className="absolute rounded"
                  style={{
                    bottom: '-60px',
                    left: '-60px',
                    width: '150px',
                    height: '150px',
                    border: '3px solid #000000',
                    opacity: 0.1,
                    transform: 'rotate(15deg)',
                  }}
                />
              </>
            )}
            
            {template.decorations === 'organic-warm' && (
              <>
                {/* Corner decorations */}
                <div className="absolute rounded" style={{ top: '30px', left: '30px', width: '120px', height: '120px', border: `2px solid ${template.border}`, borderRight: 'none', borderBottom: 'none', opacity: 0.25 }} />
                <div className="absolute rounded" style={{ top: '30px', right: '30px', width: '120px', height: '120px', border: `2px solid ${template.border}`, borderLeft: 'none', borderBottom: 'none', opacity: 0.25 }} />
                <div className="absolute rounded" style={{ bottom: '30px', left: '30px', width: '120px', height: '120px', border: `2px solid ${template.border}`, borderRight: 'none', borderTop: 'none', opacity: 0.25 }} />
                <div className="absolute rounded" style={{ bottom: '30px', right: '30px', width: '120px', height: '120px', border: `2px solid ${template.border}`, borderLeft: 'none', borderTop: 'none', opacity: 0.25 }} />
                {/* Circle decorations */}
                <div className="absolute rounded-full" style={{ top: '50px', left: '50%', transform: 'translateX(-50%)', width: '100px', height: '100px', border: `2px solid ${template.primary}`, opacity: 0.15 }} />
                <div className="absolute rounded-full" style={{ bottom: '50px', left: '50%', transform: 'translateX(-50%)', width: '100px', height: '100px', border: `2px solid ${template.primary}`, opacity: 0.15 }} />
              </>
            )}

            {currentSlide.type === 'title' && (
              <div className="flex flex-col justify-center items-center h-full relative z-10">
                <div 
                  className="rounded-xl p-16 text-center"
                  style={{
                    backgroundColor: template.background,
                    border: template.decorations === 'organic-warm' ? `4px solid ${template.border}` : 'none',
                    boxShadow: template.decorations === 'organic-warm' ? '0 8px 30px rgba(255, 140, 0, 0.15)' : 'none',
                  }}
                >
                  <input
                    type="text"
                    value={currentSlide.title || ''}
                    onChange={(e) => handleTextEdit('title', e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-center mb-6"
                    style={{ 
                      color: template.primary,
                      fontSize: '60px',
                      fontWeight: 700,
                      fontFamily: template.titleFont,
                      letterSpacing: '-0.5px',
                    }}
                    placeholder="[Main Title]"
                  />
                  {template.decorations === 'organic-warm' && (
                    <div 
                      className="mx-auto mb-6"
                      style={{
                        width: '180px',
                        height: '3px',
                        background: `linear-gradient(90deg, transparent, ${template.border}, transparent)`,
                        borderRadius: '2px',
                      }}
                    />
                  )}
                  <input
                    type="text"
                    value={currentSlide.subtitle || ''}
                    onChange={(e) => handleTextEdit('subtitle', e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-center"
                    style={{ 
                      color: template.decorations === 'organic-warm' ? template.border : template.primary,
                      fontSize: '22px',
                      fontWeight: 400,
                      fontFamily: template.bodyFont,
                      letterSpacing: '0.5px',
                    }}
                    placeholder="[Subtitle/Date/Presenter]"
                  />
                </div>
              </div>
            )}

            {currentSlide.type === 'bullet' && (
              <div className="flex flex-col h-full relative z-10">
                {/* Title with decorative border and accent line */}
                <div className="relative mb-8">
                  <input
                    type="text"
                    value={currentSlide.title || ''}
                    onChange={(e) => handleTextEdit('title', e.target.value)}
                    className="w-full bg-transparent border-none outline-none pb-4"
                    style={{ 
                      color: template.primary,
                      fontSize: '40px',
                      fontWeight: 700,
                      fontFamily: template.titleFont,
                      borderBottom: `3px solid ${template.decorations === 'organic-warm' ? template.border : template.primary}`,
                    }}
                    placeholder="[Slide Title]"
                  />
                  {/* Decorative accent line */}
                  {template.decorations === 'organic-warm' && (
                    <div 
                      className="absolute"
                      style={{
                        bottom: '0px',
                        right: '0',
                        width: '80px',
                        height: '3px',
                        backgroundColor: template.primary,
                        opacity: 0.6,
                      }}
                    />
                  )}
                  {template.decorations === 'modern-blue' && (
                    <div 
                      className="absolute"
                      style={{
                        right: '0',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '100px',
                        height: '2px',
                        backgroundColor: '#000000',
                        opacity: 0.3,
                      }}
                    />
                  )}
                </div>
                
                {/* Bullets */}
                <div className="flex flex-col gap-4 flex-1">
                  {currentSlide.bullets?.slice(0, 3).map((bullet: any, idx: number) => {
                    const bulletText = typeof bullet === 'string' ? bullet : bullet.text;
                    const subPoints = typeof bullet === 'object' ? bullet.subPoints : undefined;
                    
                    return (
                      <div 
                        key={idx}
                        className="flex items-start rounded-lg relative"
                        style={{
                          backgroundColor: template.background,
                          border: `2px solid ${template.decorations === 'organic-warm' ? template.border : template.primary}`,
                          padding: '16px 20px',
                        }}
                      >
                        {/* Small decorative dot before bullet */}
                        <div 
                          className="absolute rounded-full"
                          style={{
                            left: template.decorations === 'organic-warm' ? '8px' : '-2px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: '6px',
                            height: '6px',
                            backgroundColor: template.primary,
                            opacity: template.decorations === 'organic-warm' ? 0.8 : 0.6,
                          }}
                        />
                        
                        {/* Bullet marker */}
                        {template.decorations === 'modern-blue' ? (
                          <div 
                            className="flex-shrink-0 rounded-full flex items-center justify-center"
                            style={{
                              minWidth: '45px',
                              height: '45px',
                              backgroundColor: template.primary,
                              color: '#FFFFFF',
                              fontSize: '22px',
                              fontWeight: 600,
                              marginRight: '18px',
                            }}
                          >
                            {idx + 1}
                          </div>
                        ) : (
                          <div 
                            className="flex-shrink-0 rounded-full"
                            style={{
                              minWidth: '14px',
                              height: '14px',
                              backgroundColor: template.primary,
                              marginRight: '20px',
                              marginTop: '6px',
                              boxShadow: template.decorations === 'organic-warm' ? '0 2px 8px rgba(255, 140, 0, 0.3)' : 'none',
                            }}
                          />
                        )}
                        
                        {/* Content */}
                        <div className="flex-1">
                          <input
                            type="text"
                            value={bulletText}
                            onChange={(e) => {
                              const updated = [...editableSlides];
                              if (typeof updated[currentSlideIndex].bullets[idx] === 'string') {
                                updated[currentSlideIndex].bullets[idx] = e.target.value;
                              } else {
                                updated[currentSlideIndex].bullets[idx].text = e.target.value;
                              }
                              setEditableSlides(updated);
                            }}
                            className="w-full bg-transparent border-none outline-none mb-1"
                            style={{ 
                              color: template.primary,
                              fontSize: '24px',
                              fontWeight: 600,
                              fontFamily: template.titleFont,
                            }}
                            placeholder={`[Bullet Title ${idx + 1}]`}
                          />
                          {subPoints && subPoints.length > 0 ? (
                            <div className="space-y-1 mt-2">
                              {subPoints.map((sub: string, subIdx: number) => (
                                <input
                                  key={subIdx}
                                  type="text"
                                  value={sub}
                                  onChange={(e) => {
                                    const updated = [...editableSlides];
                                    updated[currentSlideIndex].bullets[idx].subPoints[subIdx] = e.target.value;
                                    setEditableSlides(updated);
                                  }}
                                  className="w-full bg-transparent border-none outline-none"
                                  style={{ 
                                    color: template.text,
                                    fontSize: '18px',
                                    fontWeight: 400,
                                    fontFamily: template.bodyFont,
                                    lineHeight: '1.4',
                                  }}
                                  placeholder={`[Bullet Text ${idx + 1}]`}
                                />
                              ))}
                            </div>
                          ) : (
                            <input
                              type="text"
                              value=""
                              className="w-full bg-transparent border-none outline-none"
                              style={{ 
                                color: template.text,
                                fontSize: '18px',
                                fontWeight: 400,
                                fontFamily: template.bodyFont,
                                lineHeight: '1.4',
                              }}
                              placeholder={`[Bullet Text ${idx + 1}]`}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {currentSlide.type === 'two-column' && (
              <div className="flex flex-col h-full relative z-10">
                <div className="relative mb-8">
                  <input
                    type="text"
                    value={currentSlide.title || ''}
                    onChange={(e) => handleTextEdit('title', e.target.value)}
                    className="w-full bg-transparent border-none outline-none pb-4"
                    style={{ 
                      color: template.primary,
                      fontSize: '40px',
                      fontWeight: 700,
                      fontFamily: template.titleFont,
                      borderBottom: `3px solid ${template.primary}`,
                    }}
                    placeholder="[Comparison Title]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-6 flex-1">
                  <div 
                    className="flex flex-col rounded-lg"
                    style={{
                      backgroundColor: template.background,
                      border: `3px solid ${template.primary}`,
                      padding: '20px',
                      boxShadow: template.decorations === 'modern-blue' ? `0 4px 20px rgba(37, 99, 235, 0.1)` : 'none',
                    }}
                  >
                    <input
                      type="text"
                      value={currentSlide.leftTitle || 'Left Column'}
                      onChange={(e) => handleTextEdit('leftTitle', e.target.value)}
                      className="bg-transparent border-none outline-none pb-3 mb-4"
                      style={{ 
                        color: template.primary,
                        fontSize: '26px',
                        fontWeight: 700,
                        fontFamily: template.titleFont,
                        borderBottom: `2px solid ${template.primary}`,
                      }}
                      placeholder="[Column 1 Header]"
                    />
                    <div className="flex-1">
                      {currentSlide.leftContent?.map((item: string, idx: number) => (
                        <input
                          key={idx}
                          type="text"
                          value={item}
                          onChange={(e) => {
                            const updated = [...editableSlides];
                            updated[currentSlideIndex].leftContent[idx] = e.target.value;
                            setEditableSlides(updated);
                          }}
                          className="w-full bg-transparent border-none outline-none mb-2"
                          style={{ 
                            color: template.text,
                            fontSize: '18px',
                            fontWeight: 400,
                            fontFamily: template.bodyFont,
                            lineHeight: '1.5',
                          }}
                          placeholder="[Column 1 Text]"
                        />
                      ))}
                    </div>
                  </div>
                  <div 
                    className="flex flex-col rounded-lg"
                    style={{
                      backgroundColor: template.background,
                      border: `3px solid ${template.primary}`,
                      padding: '20px',
                      boxShadow: template.decorations === 'modern-blue' ? `0 4px 20px rgba(37, 99, 235, 0.1)` : 'none',
                    }}
                  >
                    <input
                      type="text"
                      value={currentSlide.rightTitle || 'Right Column'}
                      onChange={(e) => handleTextEdit('rightTitle', e.target.value)}
                      className="bg-transparent border-none outline-none pb-3 mb-4"
                      style={{ 
                        color: template.primary,
                        fontSize: '26px',
                        fontWeight: 700,
                        fontFamily: template.titleFont,
                        borderBottom: `2px solid ${template.primary}`,
                      }}
                      placeholder="[Column 2 Header]"
                    />
                    <div className="flex-1">
                      {currentSlide.rightContent?.map((item: string, idx: number) => (
                        <input
                          key={idx}
                          type="text"
                          value={item}
                          onChange={(e) => {
                            const updated = [...editableSlides];
                            updated[currentSlideIndex].rightContent[idx] = e.target.value;
                            setEditableSlides(updated);
                          }}
                          className="w-full bg-transparent border-none outline-none mb-2"
                          style={{ 
                            color: template.text,
                            fontSize: '18px',
                            fontWeight: 400,
                            fontFamily: template.bodyFont,
                            lineHeight: '1.5',
                          }}
                          placeholder="[Column 2 Text]"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentSlide.type === 'table' && (
              <div className="flex flex-col h-full relative z-10">
                <div className="relative mb-8">
                  <input
                    type="text"
                    value={currentSlide.title || ''}
                    onChange={(e) => handleTextEdit('title', e.target.value)}
                    className="w-full bg-transparent border-none outline-none pb-4"
                    style={{ 
                      color: template.primary,
                      fontSize: '32px',
                      fontWeight: 700,
                      fontFamily: template.titleFont,
                      borderBottom: `3px solid ${template.primary}`,
                    }}
                    placeholder="[Table Title]"
                  />
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr>
                        {currentSlide.headers?.map((header: string, idx: number) => (
                          <th 
                            key={idx} 
                            className="p-2"
                            style={{ 
                              border: `2px solid ${template.border}`,
                              backgroundColor: template.primary,
                            }}
                          >
                            <input
                              type="text"
                              value={header}
                              onChange={(e) => {
                                const updated = [...editableSlides];
                                updated[currentSlideIndex].headers[idx] = e.target.value;
                                setEditableSlides(updated);
                              }}
                              className="w-full bg-transparent outline-none text-center"
                              style={{ 
                                color: template.decorations === 'modern-blue' ? '#FFFFFF' : '#000000',
                                fontWeight: 700,
                                fontSize: '16px',
                                fontFamily: template.titleFont,
                              }}
                              placeholder={`Header ${idx + 1}`}
                            />
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {currentSlide.rows?.map((row: string[], rowIdx: number) => (
                        <tr key={rowIdx}>
                          {row.map((cell: string, cellIdx: number) => (
                            <td 
                              key={cellIdx} 
                              className="p-2"
                              style={{ 
                                border: `2px solid ${template.border}`,
                                backgroundColor: template.background,
                              }}
                            >
                              <input
                                type="text"
                                value={cell}
                                onChange={(e) => {
                                  const updated = [...editableSlides];
                                  updated[currentSlideIndex].rows[rowIdx][cellIdx] = e.target.value;
                                  setEditableSlides(updated);
                                }}
                                className="w-full bg-transparent outline-none text-center"
                                style={{ 
                                  color: template.text,
                                  fontSize: '14px',
                                  fontFamily: template.bodyFont,
                                }}
                                placeholder={`Cell ${rowIdx + 1},${cellIdx + 1}`}
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {currentSlide.type === 'flowchart' && (
              <div className="flex flex-col h-full relative z-10">
                <div className="relative mb-8">
                  <input
                    type="text"
                    value={currentSlide.title || ''}
                    onChange={(e) => handleTextEdit('title', e.target.value)}
                    className="w-full bg-transparent border-none outline-none pb-4"
                    style={{ 
                      color: template.primary,
                      fontSize: '32px',
                      fontWeight: 700,
                      fontFamily: template.titleFont,
                      borderBottom: `3px solid ${template.primary}`,
                    }}
                    placeholder="[Process Title]"
                  />
                </div>
                <div className="space-y-3 flex-1">
                  {currentSlide.steps?.map((step: any, idx: number) => (
                    <div 
                      key={idx} 
                      className="rounded p-3"
                      style={{
                        backgroundColor: `${template.primary}10`,
                        border: `2px solid ${template.border}`,
                      }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span 
                          className="font-bold"
                          style={{ 
                            color: template.primary,
                            fontFamily: template.titleFont,
                          }}
                        >
                          {idx + 1}.
                        </span>
                        <input
                          type="text"
                          value={step.step}
                          onChange={(e) => {
                            const updated = [...editableSlides];
                            updated[currentSlideIndex].steps[idx].step = e.target.value;
                            setEditableSlides(updated);
                          }}
                          className="flex-1 bg-transparent border-none outline-none"
                          style={{ 
                            color: template.primary,
                            fontWeight: 600,
                            fontSize: '18px',
                            fontFamily: template.titleFont,
                          }}
                          placeholder={`Step ${idx + 1}`}
                        />
                      </div>
                      {step.description && (
                        <input
                          type="text"
                          value={step.description}
                          onChange={(e) => {
                            const updated = [...editableSlides];
                            updated[currentSlideIndex].steps[idx].description = e.target.value;
                            setEditableSlides(updated);
                          }}
                          className="w-full bg-transparent border-none outline-none"
                          style={{ 
                            color: template.text,
                            fontSize: '14px',
                            fontFamily: template.bodyFont,
                          }}
                          placeholder="Description"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <Button
              onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
              disabled={currentSlideIndex === 0}
              variant="secondary"
            >
              ← Previous
            </Button>

            <div className="text-center">
              <p className="text-sm text-text/70">
                Slide {currentSlideIndex + 1} of {editableSlides.length}
              </p>
              <p className="text-xs text-text/50 mt-1">
                Type: {currentSlide.type}
              </p>
            </div>

            <Button
              onClick={() => setCurrentSlideIndex(Math.min(editableSlides.length - 1, currentSlideIndex + 1))}
              disabled={currentSlideIndex === editableSlides.length - 1}
              variant="secondary"
            >
              Next →
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-2 overflow-x-auto">
          {editableSlides.map((slide, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlideIndex(idx)}
              className={`flex-shrink-0 w-32 h-20 rounded border-2 transition-all hover:scale-105 active:scale-95 ${
                idx === currentSlideIndex
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary hover:bg-primary/10 hover:shadow-lg hover:shadow-yellow-400/30'
              }`}
            >
              <div className="w-full h-full bg-black/80 rounded flex flex-col items-center justify-center p-2">
                <span className="text-yellow-400 text-xs font-semibold truncate w-full text-center">
                  {slide.title || `Slide ${idx + 1}`}
                </span>
                <span className="text-yellow-400/50 text-[10px] mt-1">
                  {slide.type}
                </span>
              </div>
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}
