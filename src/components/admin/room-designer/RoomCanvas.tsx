import { useRef, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Move, RotateCw, Copy, Trash2, Ruler, Grid3X3 } from "lucide-react";
import { elementTypes } from "./ElementLibraryPanel";

// Enhanced emoji mapping function for room elements
const getElementEmoji = (elementType: string, properties?: any): string => {
  const emojiMap: Record<string, string> = {
    'single-bed': '🛏️',
    'bunk-bed': '🛏️', 
    'double-bed': '🛌',
    'kids-bed': '🧸',
    'study-table': '📚',
    'study-chair': '🪑',
    'chair': '🪑',
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

  // Special handling for bunk beds
  if (elementType === 'bunk-bed') {
    if (properties?.position === 'top') return '🛌⬆️';
    if (properties?.position === 'bottom') return '🛌⬇️';
    return '🛏️'; // Default bunk bed emoji
  }

  return emojiMap[elementType] || '📦';
};

// Get element display name
const getElementDisplayName = (elementType: string, properties?: any): string => {
  const nameMap: Record<string, string> = {
    'single-bed': 'Single Bed',
    'bunk-bed': 'Bunk Bed',
    'double-bed': 'Double Bed',
    'kids-bed': 'Kids Bed',
    'study-table': 'Study Table',
    'study-chair': 'Study Chair',
    'chair': 'Chair',
    'study-lamp': 'Lamp',
    'monitor': 'Monitor',
    'charging-port': 'Charger',
    'headphone-hanger': 'Headphones',
    'bookshelf': 'Bookshelf',
    'door': 'Door',
    'window': 'Window',
    'wall-partition': 'Wall',
    'room-label': 'Label',
    'toilet': 'Toilet',
    'shower': 'Shower',
    'wash-basin': 'Basin',
    'dustbin': 'Dustbin',
    'luggage-rack': 'Luggage',
    'fire-extinguisher': 'Fire Ext.',
    'locker': 'Locker',
    'laundry-basket': 'Laundry',
    'fan': 'Fan',
    'ac-unit': 'AC',
    'call-button': 'Call Button'
  };

  // Special handling for bunk beds with bed IDs
  if (elementType === 'bunk-bed' && properties?.bedId) {
    return properties.bedId;
  }

  // For beds with bed IDs
  if (elementType.includes('bed') && properties?.bedId) {
    return properties.bedId;
  }

  return nameMap[elementType] || elementType.replace('-', ' ');
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
      
      // Clear shadows for element rendering
      ctx.shadowColor = 'transparent';
      
      // Special handling for bunk beds
      if (element.type === 'bunk-bed') {
        // Draw bunk bed levels with enhanced visibility
        const levels = element.properties?.levels || [];
        const levelHeight = height / levels.length;
        
        levels.forEach((level, index) => {
          const levelY = -height/2 + (index * levelHeight);
          
          // Draw level separator with better visibility
          if (index > 0) {
            ctx.strokeStyle = '#1F2937';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(-width/2, levelY);
            ctx.lineTo(width/2, levelY);
            ctx.stroke();
          }
          
          // Draw level indicator with enhanced emojis
          const levelIcon = level.position === 'top' ? '🛌⬆️' : 
                           level.position === 'middle' ? '🛌↔️' : '🛌⬇️';
          
          ctx.font = `${Math.min(width, levelHeight) * 0.4}px Arial`;
          ctx.fillStyle = level.assignedTo ? '#10B981' : '#6B7280';
          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';
          ctx.fillText(levelIcon, -width/2 + 8, levelY + levelHeight/2);
          
          // Draw assignment status with better visibility
          if (level.assignedTo) {
            ctx.font = `bold ${Math.min(width, levelHeight) * 0.14}px Arial`;
            ctx.fillStyle = '#FFFFFF';
            ctx.strokeStyle = 'rgba(0,0,0,0.7)';
            ctx.lineWidth = 2;
            const assignmentText = level.assignedTo.substring(0, 8);
            ctx.strokeText(assignmentText, -width/2 + 35, levelY + levelHeight/2);
            ctx.fillText(assignmentText, -width/2 + 35, levelY + levelHeight/2);
          } else {
            ctx.font = `${Math.min(width, levelHeight) * 0.12}px Arial`;
            ctx.fillStyle = '#9CA3AF';
            ctx.fillText('Unassigned', -width/2 + 35, levelY + levelHeight/2);
          }
        });
        
        // Draw main bed ID with enhanced visibility
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `bold ${Math.min(width, height) * 0.14}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.strokeStyle = 'rgba(0,0,0,0.8)';
        ctx.lineWidth = 3;
        
        const bedId = element.properties?.bedId || 'BUNK';
        ctx.strokeText(bedId, 0, -height/2 + 8);
        ctx.fillText(bedId, 0, -height/2 + 8);
      } else {
        // Enhanced emoji display with better sizing and positioning
        const emoji = getElementEmoji(element.type, element.properties);
        const elementName = getElementDisplayName(element.type, element.properties);
        
        // Responsive emoji sizing with better visibility
        const emojiSize = Math.min(Math.max(width * 0.5, 28), 52);
        
        ctx.font = `${emojiSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Draw emoji with enhanced shadow for better visibility
        ctx.shadowColor = 'rgba(0,0,0,0.4)';
        ctx.shadowBlur = 3;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        
        // Position emoji slightly above center to make room for text
        ctx.fillText(emoji, 0, -height/8);
        ctx.shadowColor = 'transparent';
        
        // Draw element name below emoji with enhanced visibility
        ctx.fillStyle = '#374151';
        ctx.font = `bold ${Math.max(width * 0.12, 10)}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 3;
        
        // Truncate long names to fit
        let displayName = elementName;
        if (displayName.length > 10) {
          displayName = displayName.substring(0, 8) + '..';
        }
        
        ctx.strokeText(displayName, 0, height/3);
        ctx.fillText(displayName, 0, height/3);
      }
      
      // Enhanced selection indicators with better visibility
      if (isSelected && !isLocked) {
        const handleSize = 10;
        
        // Selection border around element bounds with enhanced visibility
        ctx.strokeStyle = '#3B82F6';
        ctx.lineWidth = 4;
        ctx.setLineDash([6, 6]);
        ctx.strokeRect(-width/2 - 4, -height/2 - 4, width + 8, height + 8);
        ctx.setLineDash([]);
        
        // Corner handles positioned at element corners with better visibility
        ctx.fillStyle = '#3B82F6';
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 3;
        
        const corners = [
          [-width/2 - 4, -height/2 - 4],
          [width/2 + 4, -height/2 - 4],
          [-width/2 - 4, height/2 + 4],
          [width/2 + 4, height/2 + 4]
        ];
        
        corners.forEach(([hx, hy]) => {
          ctx.fillRect(hx - handleSize/2, hy - handleSize/2, handleSize, handleSize);
          ctx.strokeRect(hx - handleSize/2, hy - handleSize/2, handleSize, handleSize);
        });
        
        // Rotation handle above element with enhanced visibility
        ctx.fillStyle = '#10B981';
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, -height/2 - 25, 8, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        
        // Connection line to rotation handle
        ctx.strokeStyle = '#10B981';
        ctx.lineWidth = 3;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(0, -height/2 - 4);
        ctx.lineTo(0, -height/2 - 17);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      
      // Draw lock indicator with enhanced visibility
      if (isLocked) {
        ctx.fillStyle = '#EF4444';
        ctx.font = 'bold 18px Arial';
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 3;
        ctx.strokeText('🔒', width/2 - 12, -height/2 + 18);
        ctx.fillText('🔒', width/2 - 12, -height/2 + 18);
      }
      
      // Draw collision warning with enhanced animation and visibility
      if (hasCollision) {
        ctx.fillStyle = '#DC2626';
        ctx.font = 'bold 20px Arial';
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 4;
        ctx.strokeText('⚠️', 0, -height/2 - 25);
        ctx.fillText('⚠️', 0, -height/2 - 25);
      }
      
      // Enhanced hover effect around element bounds
      if (isHovered && !isSelected) {
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.8)';
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
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
    
    // Show enhanced tooltip for hovered element
    if (hoveredEl) {
      const elementName = getElementDisplayName(hoveredEl.type, hoveredEl.properties);
      setTooltip({
        x: e.clientX,
        y: e.clientY - 50,
        text: elementName
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
        
        {/* Enhanced Tooltip */}
        {tooltip && (
          <div 
            className="fixed z-50 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg shadow-lg pointer-events-none transform -translate-x-1/2 font-medium"
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
            <div className="text-gray-600">🛌⬆️ Top • 🛌↔️ Middle • 🛌⬇️ Bottom levels</div>
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
