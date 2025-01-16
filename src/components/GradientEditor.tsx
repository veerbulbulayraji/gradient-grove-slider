import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

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
  const sliderRef = useRef<HTMLDivElement>(null);
  const wheelRef = useRef<HTMLDivElement>(null);

  const gradientString = `linear-gradient(${angle}deg, ${colorStops
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

  const handleAngleWheel = (e: React.MouseEvent) => {
    if (!wheelRef.current) return;
    
    const rect = wheelRef.current.getBoundingClientRect();
    const center = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };
    
    const angle = Math.atan2(
      e.clientY - center.y,
      e.clientX - center.x
    ) * (180 / Math.PI) + 90;
    
    setAngle(Math.round(angle));
  };

  const copyToClipboard = () => {
    const css = `background: ${gradientString};`;
    navigator.clipboard.writeText(css);
    toast.success('CSS copied to clipboard!');
  };

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
          <div
            ref={wheelRef}
            className="angle-wheel"
            onClick={handleAngleWheel}
          >
            <div
              className="angle-line"
              style={{ transform: `rotate(${angle}deg)` }}
            />
          </div>
          
          <div className="flex-1">
            <div
              ref={sliderRef}
              className="gradient-slider mb-4"
              style={{ background: gradientString }}
            >
              {colorStops.map((stop) => (
                <div
                  key={stop.id}
                  className="color-stop"
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
                </div>
              ))}
            </div>
            
            <div className="flex gap-4">
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