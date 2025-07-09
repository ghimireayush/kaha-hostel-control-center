
import { useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";
import { elementTypes } from "./ElementLibraryPanel";

interface RoomElement {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  properties?: any;
}

interface RoomTheme {
  name: string;
  wallColor: string;
  floorColor: string;
}

interface RoomCanvasProps {
  dimensions: { length: number; width: number; height: number };
  elements: RoomElement[];
  selectedElement: string | null;
  theme: RoomTheme;
  scale: number;
  showGrid: boolean;
  onMouseDown: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onMouseMove: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onMouseUp: () => void;
  checkCollisions: (element: RoomElement, excludeId?: string) => boolean;
  warnings: string[];
}

export const RoomCanvas = ({
  dimensions,
  elements,
  selectedElement,
  theme,
  scale,
  showGrid,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  checkCollisions,
  warnings
}: RoomCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw floor
    ctx.fillStyle = theme.floorColor;
    ctx.fillRect(0, 0, dimensions.length * scale, dimensions.width * scale);
    
    // Draw grid
    if (showGrid) {
      ctx.strokeStyle = '#00000015';
      ctx.lineWidth = 1;
      const gridSize = 0.5 * scale;
      
      for (let x = 0; x <= dimensions.length * scale; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, dimensions.width * scale);
        ctx.stroke();
      }
      
      for (let y = 0; y <= dimensions.width * scale; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(dimensions.length * scale, y);
        ctx.stroke();
      }
    }
    
    // Draw room walls
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 4;
    ctx.strokeRect(0, 0, dimensions.length * scale, dimensions.width * scale);
    
    // Draw elements sorted by zIndex
    const sortedElements = [...elements].sort((a, b) => a.zIndex - b.zIndex);
    
    sortedElements.forEach(element => {
      const x = element.x * scale;
      const y = element.y * scale;
      const width = element.width * scale;
      const height = element.height * scale;
      
      ctx.save();
      ctx.translate(x + width/2, y + height/2);
      ctx.rotate(element.rotation * Math.PI / 180);
      
      // Element styling
      const elementType = elementTypes.find(t => t.type === element.type);
      const isSelected = selectedElement === element.id;
      const hasCollision = checkCollisions(element, element.id);
      
      // Draw element background with gradient
      if (isSelected) {
        const gradient = ctx.createLinearGradient(-width/2, -height/2, width/2, height/2);
        gradient.addColorStop(0, '#3B82F6');
        gradient.addColorStop(1, '#1D4ED8');
        ctx.fillStyle = gradient;
      } else if (hasCollision) {
        ctx.fillStyle = '#EF4444';
      } else {
        ctx.fillStyle = elementType?.color || '#6B7280';
      }
      
      ctx.fillRect(-width/2, -height/2, width, height);
      
      // Draw element border
      ctx.strokeStyle = isSelected ? '#1D4ED8' : hasCollision ? '#DC2626' : '#1F2937';
      ctx.lineWidth = isSelected ? 3 : 2;
      ctx.strokeRect(-width/2, -height/2, width, height);
      
      // Draw element label
      ctx.fillStyle = '#FFFFFF';
      ctx.font = `${Math.min(width, height) * 0.25}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const label = element.type.toUpperCase().replace('-', ' ');
      ctx.fillText(label, 0, 0);
      
      // Draw bed ID for beds
      if (element.type === 'bed' && element.properties?.bedId) {
        ctx.font = `${Math.min(width, height) * 0.15}px Arial`;
        ctx.fillText(element.properties.bedId, 0, height * 0.15);
      }
      
      // Draw selection handles
      if (isSelected) {
        const handleSize = 6;
        ctx.fillStyle = '#3B82F6';
        // Corner handles
        ctx.fillRect(-width/2 - handleSize/2, -height/2 - handleSize/2, handleSize, handleSize);
        ctx.fillRect(width/2 - handleSize/2, -height/2 - handleSize/2, handleSize, handleSize);
        ctx.fillRect(-width/2 - handleSize/2, height/2 - handleSize/2, handleSize, handleSize);
        ctx.fillRect(width/2 - handleSize/2, height/2 - handleSize/2, handleSize, handleSize);
        
        // Rotation handle
        ctx.fillStyle = '#10B981';
        ctx.beginPath();
        ctx.arc(0, -height/2 - 20, 4, 0, 2 * Math.PI);
        ctx.fill();
        
        // Connection line to rotation handle
        ctx.strokeStyle = '#10B981';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, -height/2);
        ctx.lineTo(0, -height/2 - 16);
        ctx.stroke();
      }
      
      // Draw collision warning
      if (hasCollision) {
        ctx.fillStyle = '#DC2626';
        ctx.font = '16px Arial';
        ctx.fillText('⚠', 0, -height/2 - 15);
      }
      
      ctx.restore();
    });
    
    // Draw room dimensions
    ctx.fillStyle = '#374151';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(`${dimensions.length}m`, dimensions.length * scale / 2, -10);
    
    ctx.save();
    ctx.translate(-15, dimensions.width * scale / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(`${dimensions.width}m`, 0, 0);
    ctx.restore();
  };

  useEffect(() => {
    drawCanvas();
  }, [elements, selectedElement, dimensions, showGrid, scale, theme]);

  return (
    <div className="flex-1 flex flex-col bg-gray-50 p-4">
      {/* Canvas Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <Badge variant="outline">
            2D View • Scale: {scale}px/m
          </Badge>
          <Badge variant="secondary">
            {dimensions.length}m × {dimensions.width}m × {dimensions.height}m
          </Badge>
          <Badge variant="outline">
            {elements.length} elements
          </Badge>
        </div>
      </div>
      
      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-800 font-medium mb-2">
            <AlertTriangle className="h-4 w-4" />
            Validation Warnings ({warnings.length})
          </div>
          <ul className="text-sm text-red-700 space-y-1">
            {warnings.slice(0, 3).map((warning, index) => (
              <li key={index}>• {warning}</li>
            ))}
            {warnings.length > 3 && (
              <li className="text-red-600 font-medium">
                ... and {warnings.length - 3} more warnings
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Canvas Container */}
      <div className="flex-1 flex items-center justify-center">
        <div className="border-2 border-gray-300 rounded-lg shadow-lg bg-white p-4">
          <canvas
            ref={canvasRef}
            width={dimensions.length * scale}
            height={dimensions.width * scale}
            className="cursor-crosshair rounded border border-gray-200"
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            style={{ maxWidth: '100%', maxHeight: '70vh' }}
          />
        </div>
      </div>
      
      {/* Canvas Footer */}
      <div className="mt-4 text-sm text-gray-600 space-y-1 text-center">
        <div>🎯 <strong>Click</strong> elements to select • <strong>Drag</strong> to move • <strong>Right-click</strong> for context menu</div>
        <div>⚡ <strong>Power outlets:</strong> {elements.filter(e => e.type === 'charging-port').length} • <strong>Fire safety:</strong> {elements.filter(e => e.type === 'fire-safety').length} • <strong>Beds:</strong> {elements.filter(e => e.type === 'bed').length}</div>
      </div>
    </div>
  );
};
