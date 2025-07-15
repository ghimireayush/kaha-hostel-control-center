
import { useRef, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Move, RotateCw, Copy, Trash2, Ruler, Grid3X3 } from "lucide-react";
import { elementTypes } from "./ElementLibraryPanel";

// Emoji mapping function for room elements
const getElementEmoji = (elementType: string, properties?: any): string => {
  const emojiMap: Record<string, string> = {
    'single-bed': '🛏️',
    'bunk-bed': '🛏️',
    'double-bed': '🛌',
    'kids-bed': '🧸',
    'study-table': '📚',
    'study-chair': '🪑',
    'study-lamp': '💡',
    'monitor': '🖥️',
    'charging-port': '🔌',
    'headphone-hanger': '🎧',
    'bookshelf': '📚',
    'door': '🚪',
    'window': '🪟',
    'wall-partition': '🧱',
    'room-label': '🚩',
    'toilet': '🚽',
    'shower': '🚿',
    'wash-basin': '🧼',
    'dustbin': '🗑️',
    'luggage-rack': '🧳',
    'fire-extinguisher': '🧯',
    'locker': '🔐',
    'laundry-basket': '🧺',
    'fan': '🌀',
    'ac-unit': '❄️',
    'call-button': '🔔'
  };

  // Special handling for bunk beds with position
  if (elementType === 'bunk-bed' && properties?.position) {
    if (properties.position === 'top') return '🛌⬆️';
    if (properties.position === 'bottom') return '🛌⬇️';
  }

  return emojiMap[elementType] || '📦';
};

interface BunkLevel {
  id: string;
  position: 'top' | 'middle' | 'bottom';
  assignedTo?: string;
  bedId: string;
}

interface RoomElement {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  properties?: {
    bedType?: 'single' | 'bunk' | 'double' | 'kids';
    bedId?: string;
    position?: 'top' | 'middle' | 'bottom';
    orientation?: 'north' | 'south' | 'east' | 'west';
    drawers?: number;
    brightness?: number;
    hingeType?: 'left' | 'right';
    isOpen?: boolean;
    material?: 'wood' | 'metal' | 'plastic';
    color?: string;
    portType?: 'USB' | 'Type-C' | 'Universal';
    bunkLevels?: number;
    levels?: BunkLevel[];
    isLocked?: boolean;
  };
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
  selectedElements: string[];
  theme: RoomTheme;
  scale: number;
  showGrid: boolean;
  snapToGrid: boolean;
  duplicateMode: boolean;
  onMouseDown: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onMouseMove: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onMouseUp: () => void;
  onElementSelect: (id: string, multiSelect?: boolean) => void;
  onElementsMove: (ids: string[], deltaX: number, deltaY: number) => void;
  onElementRotate: (id: string) => void;
  onElementDuplicate: (id: string) => void;
  onElementDelete: (id: string) => void;
  checkCollisions: (element: RoomElement, excludeId?: string) => boolean;
  warnings: string[];
}

export const RoomCanvas = ({
  dimensions,
  elements,
  selectedElement,
  selectedElements,
  theme,
  scale,
  showGrid,
  snapToGrid,
  duplicateMode,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onElementSelect,
  onElementsMove,
  onElementRotate,
  onElementDuplicate,
  onElementDelete,
  checkCollisions,
  warnings
}: RoomCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [contextMenu, setContextMenu] = useState<{x: number, y: number, elementId: string} | null>(null);
  const [dragStart, setDragStart] = useState<{x: number, y: number} | null>(null);
  const [showMeasurement, setShowMeasurement] = useState(false);
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{x: number, y: number, text: string} | null>(null);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background with subtle texture
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, theme.floorColor);
    gradient.addColorStop(1, theme.floorColor + 'CC');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, dimensions.length * scale, dimensions.width * scale);
    
    if (showGrid) {
      ctx.strokeStyle = '#00000010';
      ctx.lineWidth = 1;
      const gridSize = 0.5 * scale;
      const majorGridSize = 1 * scale;
      
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
      
      ctx.strokeStyle = '#00000020';
      ctx.lineWidth = 2;
      
      for (let x = 0; x <= dimensions.length * scale; x += majorGridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, dimensions.width * scale);
        ctx.stroke();
      }
      
      for (let y = 0; y <= dimensions.width * scale; y += majorGridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(dimensions.length * scale, y);
        ctx.stroke();
      }
    }
    
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 6;
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.strokeRect(0, 0, dimensions.length * scale, dimensions.width * scale);
    ctx.shadowColor = 'transparent';
    
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
      const isSelected = selectedElements.includes(element.id);
      const isHovered = hoveredElement === element.id;
      const hasCollision = checkCollisions(element, element.id);
      const isLocked = element.properties?.isLocked;
      
      // Enhanced shadow for depth
      if (isSelected || isHovered) {
        ctx.shadowColor = 'rgba(0,0,0,0.4)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;
      }
      
      // Draw element background with enhanced gradients
      if (isSelected) {
        const gradient = ctx.createLinearGradient(-width/2, -height/2, width/2, height/2);
        gradient.addColorStop(0, '#3B82F6');
        gradient.addColorStop(0.5, '#1D4ED8');
        gradient.addColorStop(1, '#1E40AF');
        ctx.fillStyle = gradient;
      } else if (hasCollision) {
        const gradient = ctx.createLinearGradient(-width/2, -height/2, width/2, height/2);
        gradient.addColorStop(0, '#EF4444');
        gradient.addColorStop(1, '#DC2626');
        ctx.fillStyle = gradient;
      } else if (isHovered) {
        const baseColor = elementType?.color || '#6B7280';
        const gradient = ctx.createLinearGradient(-width/2, -height/2, width/2, height/2);
        gradient.addColorStop(0, baseColor);
        gradient.addColorStop(1, baseColor + 'CC');
        ctx.fillStyle = gradient;
      } else {
        ctx.fillStyle = elementType?.color || '#6B7280';
      }
      
      ctx.fillRect(-width/2, -height/2, width, height);
      
      // Enhanced borders
      ctx.strokeStyle = isSelected ? '#1D4ED8' : hasCollision ? '#DC2626' : isHovered ? '#6B7280' : '#1F2937';
      ctx.lineWidth = isSelected ? 4 : isHovered ? 3 : 2;
      if (isLocked) {
        ctx.setLineDash([8, 4]);
      }
      ctx.strokeRect(-width/2, -height/2, width, height);
      ctx.setLineDash([]);
      
      // Clear shadows
      ctx.shadowColor = 'transparent';
      
      // Special handling for bunk beds
      if (element.type === 'bunk-bed') {
        // Draw bunk bed levels
        const levels = element.properties?.levels || [];
        const levelHeight = height / levels.length;
        
        levels.forEach((level, index) => {
          const levelY = -height/2 + (index * levelHeight);
          
          // Draw level separator
          if (index > 0) {
            ctx.strokeStyle = '#1F2937';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(-width/2, levelY);
            ctx.lineTo(width/2, levelY);
            ctx.stroke();
          }
          
        // Draw level indicator with enhanced emojis
        const levelIcon = level.position === 'top' ? '🛌⬆️' : 
                         level.position === 'middle' ? '🛌↕️' : '🛌⬇️';
        
        ctx.font = `${Math.min(width, levelHeight) * 0.3}px Arial`;
        ctx.fillStyle = level.assignedTo ? '#10B981' : '#6B7280';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(levelIcon, -width/2 + 5, levelY + levelHeight/2);
          
          // Draw assignment status
          if (level.assignedTo) {
            ctx.font = `bold ${Math.min(width, levelHeight) * 0.12}px Arial`;
            ctx.fillStyle = '#FFFFFF';
            ctx.strokeStyle = 'rgba(0,0,0,0.5)';
            ctx.lineWidth = 1;
            const assignmentText = level.assignedTo.substring(0, 8);
            ctx.strokeText(assignmentText, -width/2 + 30, levelY + levelHeight/2);
            ctx.fillText(assignmentText, -width/2 + 30, levelY + levelHeight/2);
          } else {
            ctx.font = `${Math.min(width, levelHeight) * 0.1}px Arial`;
            ctx.fillStyle = '#9CA3AF';
            ctx.fillText('Unassigned', -width/2 + 30, levelY + levelHeight/2);
          }
        });
        
        // Draw main bed ID
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `bold ${Math.min(width, height) * 0.12}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.strokeStyle = 'rgba(0,0,0,0.5)';
        ctx.lineWidth = 2;
        
        const bedId = element.properties?.bedId || 'BUNK';
        ctx.strokeText(bedId, 0, -height/2 + 5);
        ctx.fillText(bedId, 0, -height/2 + 5);
      } else {
        // Standard element emoji drawing with enhanced styling
        const elementTypeData = elementTypes.find(t => t.type === element.type);
        const emoji = getElementEmoji(element.type, element.properties);
        
        // Calculate optimal emoji size based on element dimensions
        const emojiSize = Math.min(width, height) * 0.6;
        const maxEmojiSize = Math.min(40, emojiSize);
        const minEmojiSize = Math.max(16, emojiSize);
        const finalEmojiSize = Math.max(minEmojiSize, Math.min(maxEmojiSize, emojiSize));
        
        ctx.font = `${finalEmojiSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Add subtle shadow for emoji
        if (isSelected || isHovered) {
          ctx.shadowColor = 'rgba(0,0,0,0.3)';
          ctx.shadowBlur = 2;
          ctx.shadowOffsetX = 1;
          ctx.shadowOffsetY = 1;
        }
        
        ctx.fillText(emoji, 0, 0);
        ctx.shadowColor = 'transparent';
        
        // Draw bed ID for regular beds (smaller and positioned below emoji)
        if (element.type.includes('bed') && element.properties?.bedId) {
          const idFontSize = Math.min(width, height) * 0.15;
          ctx.font = `bold ${Math.max(8, Math.min(14, idFontSize))}px Arial`;
          ctx.fillStyle = '#FFFFFF';
          ctx.strokeStyle = 'rgba(0,0,0,0.8)';
          ctx.lineWidth = 1;
          const yOffset = finalEmojiSize * 0.4;
          ctx.strokeText(element.properties.bedId, 0, yOffset);
          ctx.fillText(element.properties.bedId, 0, yOffset);
        }
      }
      
      // Draw selection handles with animations
      if (isSelected && !isLocked) {
        const handleSize = 8;
        const handleColor = '#3B82F6';
        ctx.fillStyle = handleColor;
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        
        // Corner handles
        const corners = [
          [-width/2, -height/2],
          [width/2, -height/2],
          [-width/2, height/2],
          [width/2, height/2]
        ];
        
        corners.forEach(([hx, hy]) => {
          ctx.fillRect(hx - handleSize/2, hy - handleSize/2, handleSize, handleSize);
          ctx.strokeRect(hx - handleSize/2, hy - handleSize/2, handleSize, handleSize);
        });
        
        // Rotation handle with pulsing effect
        ctx.fillStyle = '#10B981';
        ctx.strokeStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(0, -height/2 - 20, 6, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        
        // Connection line to rotation handle
        ctx.strokeStyle = '#10B981';
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(0, -height/2);
        ctx.lineTo(0, -height/2 - 14);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      
      // Draw lock indicator
      if (isLocked) {
        ctx.fillStyle = '#EF4444';
        ctx.font = 'bold 16px Arial';
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.strokeText('🔒', width/2 - 15, -height/2 + 15);
        ctx.fillText('🔒', width/2 - 15, -height/2 + 15);
      }
      
      // Draw collision warning with animation
      if (hasCollision) {
        ctx.fillStyle = '#DC2626';
        ctx.font = 'bold 18px Arial';
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 3;
        ctx.strokeText('⚠', 0, -height/2 - 20);
        ctx.fillText('⚠', 0, -height/2 - 20);
      }
      
      // Hover effect
      if (isHovered && !isSelected) {
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.6)';
        ctx.lineWidth = 3;
        ctx.setLineDash([8, 4]);
        ctx.strokeRect(-width/2 - 2, -height/2 - 2, width + 4, height + 4);
        ctx.setLineDash([]);
      }
      
      ctx.restore();
    });
    
    // Draw room dimensions with enhanced styling
    ctx.fillStyle = '#374151';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3;
    
    const lengthText = `${dimensions.length}m`;
    ctx.strokeText(lengthText, dimensions.length * scale / 2, -15);
    ctx.fillText(lengthText, dimensions.length * scale / 2, -15);
    
    ctx.save();
    ctx.translate(-20, dimensions.width * scale / 2);
    ctx.rotate(-Math.PI / 2);
    const widthText = `${dimensions.width}m`;
    ctx.strokeText(widthText, 0, 0);
    ctx.fillText(widthText, 0, 0);
    ctx.restore();

    if (snapToGrid && selectedElements.length > 0) {
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      
      const gridSize = 0.5 * scale;
      for (let x = 0; x <= dimensions.length * scale; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, dimensions.width * scale);
        ctx.stroke();
      }
      ctx.setLineDash([]);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;
    
    // Find hovered element
    const sortedElements = [...elements].sort((a, b) => b.zIndex - a.zIndex);
    const hoveredEl = sortedElements.find(element => 
      x >= element.x && x <= element.x + element.width &&
      y >= element.y && y <= element.y + element.height
    );
    
    setHoveredElement(hoveredEl?.id || null);
    
    // Show tooltip for hovered element
    if (hoveredEl) {
      const elementTypeData = elementTypes.find(t => t.type === hoveredEl.type);
      setTooltip({
        x: e.clientX,
        y: e.clientY - 40,
        text: elementTypeData?.label || hoveredEl.type
      });
    } else {
      setTooltip(null);
    }
    
    onMouseMove(e);
  };

  const handleCanvasRightClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    
    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;
    
    const sortedElements = [...elements].sort((a, b) => b.zIndex - a.zIndex);
    const clickedElement = sortedElements.find(element => 
      x >= element.x && x <= element.x + element.width &&
      y >= element.y && y <= element.y + element.height
    );
    
    if (clickedElement) {
      setContextMenu({
        x: e.clientX,
        y: e.clientY,
        elementId: clickedElement.id
      });
    }
  };

  useEffect(() => {
    drawCanvas();
  }, [elements, selectedElement, selectedElements, dimensions, showGrid, scale, theme, hoveredElement]);

  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-br from-gray-50 to-gray-100 p-4 relative">
      {/* Enhanced Canvas Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2 flex-wrap">
          <Badge variant="outline" className="bg-white shadow-sm">
            <Grid3X3 className="h-3 w-3 mr-1" />
            2D View • {scale}px/m
          </Badge>
          <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
            <Ruler className="h-3 w-3 mr-1" />
            {dimensions.length}m × {dimensions.width}m × {dimensions.height}m
          </Badge>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            {elements.length} elements
          </Badge>
          {selectedElements.length > 1 && (
            <Badge variant="default" className="bg-purple-600">
              {selectedElements.length} selected
            </Badge>
          )}
          {elements.filter(e => e.type === 'bunk-bed').length > 0 && (
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
              🛏️ {elements.filter(e => e.type === 'bunk-bed').length} Bunk Beds
            </Badge>
          )}
        </div>
        
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowMeasurement(!showMeasurement)}
            className={showMeasurement ? "bg-blue-50 border-blue-300" : ""}
          >
            <Ruler className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Enhanced Warnings */}
      {warnings.length > 0 && (
        <div className="mb-4 p-4 bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-400 rounded-lg shadow-sm">
          <div className="flex items-center gap-2 text-red-800 font-medium mb-2">
            <AlertTriangle className="h-5 w-5" />
            Design Warnings ({warnings.length})
          </div>
          <ul className="text-sm text-red-700 space-y-1">
            {warnings.slice(0, 3).map((warning, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="text-red-500 mt-0.5">•</span>
                {warning}
              </li>
            ))}
            {warnings.length > 3 && (
              <li className="text-red-600 font-medium flex items-center gap-2">
                <span className="text-red-500">•</span>
                ... and {warnings.length - 3} more warnings
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Enhanced Canvas Container */}
      <div className="flex-1 flex items-center justify-center relative">
        <div className="border-2 border-gray-300 rounded-xl shadow-2xl bg-white p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent pointer-events-none"></div>
          <canvas
            ref={canvasRef}
            width={dimensions.length * scale}
            height={dimensions.width * scale}
            className="cursor-crosshair rounded-lg border border-gray-200 relative z-10"
            onMouseDown={onMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={onMouseUp}
            onContextMenu={handleCanvasRightClick}
            style={{ maxWidth: '100%', maxHeight: '70vh' }}
          />
        </div>
        
        {/* Tooltip */}
        {tooltip && (
          <div 
            className="fixed z-50 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg shadow-lg pointer-events-none transform -translate-x-1/2"
            style={{ left: tooltip.x, top: tooltip.y }}
          >
            {tooltip.text}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        )}
      </div>
      
      {/* Enhanced Canvas Footer */}
      <div className="mt-4 bg-white rounded-lg p-4 shadow-sm border">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="font-medium text-gray-700 mb-1">🎯 Selection</div>
            <div className="text-gray-600">Click to select • Ctrl+Click for multi-select</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-gray-700 mb-1">🛏️ Bunk Beds</div>
            <div className="text-gray-600">🛏️⬆️ Top • 🛏️↕️ Middle • 🛏️⬇️ Bottom levels</div>
          </div>
          <div className="text-center">
            <div className="font-medium text-gray-700 mb-1">📊 Stats</div>
            <div className="text-gray-600">
              <span className="text-blue-600">🔌 {elements.filter(e => e.type === 'charging-port').length}</span> • 
              <span className="text-red-600 ml-2">🧯 {elements.filter(e => e.type === 'fire-extinguisher').length}</span> • 
              <span className="text-green-600 ml-2">🛏️ {elements.filter(e => e.type.includes('bed')).length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div 
          className="fixed bg-white border border-gray-200 rounded-lg shadow-xl z-50 py-2 min-w-[180px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start px-4 py-2 h-auto"
            onClick={() => {
              onElementRotate(contextMenu.elementId);
              setContextMenu(null);
            }}
          >
            <RotateCw className="h-4 w-4 mr-3" />
            Rotate 90°
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start px-4 py-2 h-auto"
            onClick={() => {
              onElementDuplicate(contextMenu.elementId);
              setContextMenu(null);
            }}
          >
            <Copy className="h-4 w-4 mr-3" />
            Duplicate
          </Button>
          <div className="border-t border-gray-100 my-1"></div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start px-4 py-2 h-auto text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => {
              onElementDelete(contextMenu.elementId);
              setContextMenu(null);
            }}
          >
            <Trash2 className="h-4 w-4 mr-3" />
            Delete
          </Button>
        </div>
      )}
    </div>
  );
};
