import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { v4 as uuidv4 } from '@/lib/utils';

interface ColorStop {
  color: string;
  position: number;
  id: string;
}

const GradientEditor = () => {
  const [angle, setAngle] = useState(90);
  const [colorStops, setColorStops] = useState<ColorStop[]>([
    { color: '#4A90E2', position: 0, id: '1' },
    { color: '#50E3C2', position: 100, id: '2' },
  ]);
  const [draggingStop, setDraggingStop] = useState<string | null>(null);
  const [isDraggingAngle, setIsDraggingAngle] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const wheelRef = useRef<HTMLDivElement>(null);

  const gradientString = `linear-gradient(${angle}deg, ${colorStops
    .sort((a, b) => a.position - b.position)
    .map((stop) => `${stop.color} ${stop.position}%`)
    .join(', ')})`;

  const handleStopDrag = (e: React.MouseEvent | MouseEvent, stopId: string) => {
    if (!sliderRef.current) return;
    
    const rect = sliderRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const position = Math.max(0, Math.min(100, (x / rect.width) * 100));
    
    setColorStops(stops =>
      stops.map(stop =>
        stop.id === stopId ? { ...stop, position } : stop
      )
    );
  };

  const handleColorChange = (color: string, stopId: string) => {
    setColorStops(stops =>
      stops.map(stop =>
        stop.id === stopId ? { ...stop, color } : stop
      )
    );
  };

  const handleSliderClick = (e: React.MouseEvent) => {
    if (!sliderRef.current || draggingStop) return;
    
    const rect = sliderRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const position = (x / rect.width) * 100;
    
    const newStop: ColorStop = {
      color: '#FFFFFF',
      position,
      id: uuidv4(),
    };
    
    setColorStops(prev => [...prev, newStop]);
  };

  const handleAngleChange = (e: React.MouseEvent | MouseEvent) => {
    if (!wheelRef.current) return;
    
    const rect = wheelRef.current.getBoundingClientRect();
    const center = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };
    
    let angle = Math.atan2(
      e.clientY - center.y,
      e.clientX - center.x
    ) * (180 / Math.PI) + 90;

    // Normalize angle to 0-360 range
    angle = ((angle % 360) + 360) % 360;
    
    setAngle(Math.round(angle));
  };

  const removeColorStop = (stopId: string) => {
    if (colorStops.length <= 2) {
      toast.error('Minimum 2 color stops required');
      return;
    }
    setColorStops(stops => stops.filter(stop => stop.id !== stopId));
  };

  const copyToClipboard = () => {
    const css = `background: ${gradientString};`;
    navigator.clipboard.writeText(css);
    toast.success('CSS copied to clipboard!');
  };

  useEffect(() => {
    if (!isDraggingAngle) return;

    const handleMouseMove = (e: MouseEvent) => {
      handleAngleChange(e);
    };

    const handleMouseUp = () => {
      setIsDraggingAngle(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingAngle]);

  useEffect(() => {
    if (!draggingStop) return;

    const handleMouseMove = (e: MouseEvent) => {
      handleStopDrag(e, draggingStop);
    };

    const handleMouseUp = () => {
      setDraggingStop(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingStop]);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card className="p-6">
        <div
          className="w-full h-48 rounded-lg mb-6"
          style={{ background: gradientString }}
        />
        
        <div className="flex gap-6 mb-6">
          <div className="relative">
            <div
              ref={wheelRef}
              className="angle-wheel"
              onMouseDown={(e) => {
                e.preventDefault();
                setIsDraggingAngle(true);
                handleAngleChange(e);
              }}
            >
              <div
                className="angle-line"
                style={{ transform: `rotate(${angle}deg)` }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-medium">{angle}°</span>
              </div>
            </div>
          </div>
          
          <div className="flex-1">
            <div
              ref={sliderRef}
              className="gradient-slider mb-4 cursor-pointer"
              style={{ background: gradientString }}
              onClick={handleSliderClick}
            >
              {colorStops.map((stop) => (
                <div
                  key={stop.id}
                  className="color-stop group"
                  style={{
                    left: `${stop.position}%`,
                    backgroundColor: stop.color
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setDraggingStop(stop.id);
                  }}
                >
                  <input
                    type="color"
                    value={stop.color}
                    onChange={(e) => handleColorChange(e.target.value, stop.id)}
                    className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                  />
                  {colorStops.length > 2 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeColorStop(stop.id);
                      }}
                      className="absolute -top-6 left-1/2 -translate-x-1/2 bg-white p-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            <div className="flex gap-4 flex-wrap">
              {colorStops.map((stop) => (
                <div key={stop.id} className="flex items-center gap-2">
                  <Input
                    type="text"
                    value={stop.color}
                    onChange={(e) => handleColorChange(e.target.value, stop.id)}
                    className="w-24"
                  />
                  <Input
                    type="number"
                    value={Math.round(stop.position)}
                    onChange={(e) => {
                      const position = Math.max(0, Math.min(100, Number(e.target.value)));
                      handleColorChange(stop.color, stop.id);
                    }}
                    className="w-20"
                  />
                  <span>%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative">
          <Input
            value={`background: ${gradientString};`}
            readOnly
            className="pr-24"
          />
          <Button
            className="absolute right-1 top-1"
            size="sm"
            onClick={copyToClipboard}
          >
            Copy
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default GradientEditor;