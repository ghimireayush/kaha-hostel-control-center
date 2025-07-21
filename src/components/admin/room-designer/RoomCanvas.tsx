9
import { useRef, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RotateCw, Copy, Trash2, Ruler, Grid3X3 } from "lucide-react";
import { elementTypes } from "./ElementTypes";

// Enhanced emoji mapping function for room elements
const getElementEmoji = (elementType: string, properties?: any): string => {
  const emojiMap: Record<string, string> = {
    'single-bed': '🛏️',
    'bunk-bed': '🏠',
    'double-bed': '🛌',
    'kids-bed': '🧸',
    'study-table': '🪑',
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
    'room-label': '🏷️',
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

  return emojiMap[elementType] || '📦';
};

// Get element display name with better formatting
const getElementDisplayName = (elementType: string, properties?: any): string => {
  const nameMap: Record<string, string> = {
    'single-bed': 'Single Bed',
    'bunk-bed': 'Bunk Bed',
    'double-bed': 'Double Bed',
    'kids-bed': 'Kids Bed',
    'study-table': 'Study Table',
    'study-chair': 'Study Chair',
    'chair': 'Chair',
    'study-lamp': 'Desk Lamp',
    'monitor': 'Monitor',
    'charging-port': 'Charging Port',
    'headphone-hanger': 'Headphone Hook',
    'bookshelf': 'Bookshelf',
    'door': 'Door',
    'window': 'Window',
    'wall-partition': 'Wall Partition',
    'room-label': 'Room Label',
    'toilet': 'Toilet',
    'shower': 'Shower',
    'wash-basin': 'Wash Basin',
    'dustbin': 'Dustbin',
    'luggage-rack': 'Luggage Rack',
    'fire-extinguisher': 'Fire Extinguisher',
    'locker': 'Locker',
    'laundry-basket': 'Laundry Basket',
    'fan': 'Ceiling Fan',
    'ac-unit': 'AC Unit',
    'call-button': 'Call Button'
  };

  return nameMap[elementType] || elementType.replace('-', ' ');
};

// Get formatted element name with ID
const getFormattedElementName = (elementType: string, properties?: any): string => {
  const baseName = getElementDisplayName(elementType, properties);

  // For bunk beds, show the main bed ID
  if (elementType === 'bunk-bed' && properties?.bedId) {
    return `${properties.bedId} (${baseName})`;
  }

  // For regular beds with bed IDs
  if (elementType.includes('bed') && properties?.bedId) {
    return `${properties.bedId} (${baseName})`;
  }

  return baseName;
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
  onElementsMoveComplete?: () => void;
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
  onElementsMoveComplete,
  onElementRotate,
  onElementDuplicate,
  onElementDelete,
  checkCollisions,
  warnings
}: RoomCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, elementId: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number, y: number } | null>(null);
  const [draggedElementId, setDraggedElementId] = useState<string | null>(null);
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ x: number, y: number, text: string } | null>(null);

  // Reasonable scale for better visibility without being too large
  const canvasScale = Math.max(scale * 2, 60);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    ctx.fillStyle = theme.floorColor;
    ctx.fillRect(0, 0, dimensions.length * canvasScale, dimensions.width * canvasScale);

    // Draw grid
    if (showGrid) {
      ctx.strokeStyle = '#E5E7EB';
      ctx.lineWidth = 1;
      const gridSize = 0.5 * canvasScale;

      for (let x = 0; x <= dimensions.length * canvasScale; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, dimensions.width * canvasScale);
        ctx.stroke();
      }

      for (let y = 0; y <= dimensions.width * canvasScale; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(dimensions.length * canvasScale, y);
        ctx.stroke();
      }
    }

    // Draw room border
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 3;
    ctx.strokeRect(0, 0, dimensions.length * canvasScale, dimensions.width * canvasScale);

    // Draw elements sorted by zIndex
    const sortedElements = [...elements].sort((a, b) => a.zIndex - b.zIndex);

    sortedElements.forEach(element => {
      const x = element.x * canvasScale;
      const y = element.y * canvasScale;
      const width = element.width * canvasScale;
      const height = element.height * canvasScale;

      ctx.save();
      ctx.translate(x + width / 2, y + height / 2);
      ctx.rotate(element.rotation * Math.PI / 180);

      // Element styling
      const isSelected = selectedElements.includes(element.id);
      const isHovered = hoveredElement === element.id;
      const hasCollision = checkCollisions(element, element.id);
      const isDraggingThis = draggedElementId === element.id;

      // Element background
      ctx.fillStyle = isSelected ? '#DBEAFE' : isHovered ? '#F0F9FF' : isDraggingThis ? '#FEF3C7' : '#FFFFFF';
      ctx.strokeStyle = isSelected ? '#3B82F6' : hasCollision ? '#EF4444' : '#D1D5DB';
      ctx.lineWidth = isSelected ? 3 : hasCollision ? 2 : 1;

      // Draw element shape
      ctx.beginPath();
      ctx.roundRect(-width / 2, -height / 2, width, height, 6);
      ctx.fill();
      ctx.stroke();

      // Special handling for bunk beds
      if (element.type === 'bunk-bed') {
        const levels = element.properties?.levels || [];
        const levelHeight = height / Math.max(levels.length, 2);

        // Draw bunk structure
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 2;
        levels.forEach((level, index) => {
          const levelY = -height / 2 + (index * levelHeight);
          if (index > 0) {
            ctx.beginPath();
            ctx.moveTo(-width / 2 + 4, levelY);
            ctx.lineTo(width / 2 - 4, levelY);
            ctx.stroke();
          }
        });
      }

      // Draw emoji - Special handling for bunk beds
      if (element.type === 'bunk-bed') {
        const bunkLevels = element.properties?.bunkLevels || 2;
        const bedEmoji = '🛏️';
        // ULTRA MASSIVE icons to completely fill the entire element box
        const emojiSize = Math.min(width * 1.0, height * 0.7, 100);

        ctx.font = `${emojiSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#1F2937';

        // Calculate the icon area (entire element box)
        const iconAreaHeight = height;
        const levelSpacing = iconAreaHeight / bunkLevels;

        // Draw vertically stacked bed icons
        for (let i = 0; i < bunkLevels; i++) {
          // Position from top to bottom, filling entire box
          const levelY = -height / 2 + (i * levelSpacing) + (levelSpacing * 0.5);
          ctx.fillText(bedEmoji, 0, levelY);

          // Add level indicator (small text on the right side)
          ctx.save();
          ctx.font = `${Math.min(emojiSize * 0.15, 12)}px Arial`;
          ctx.fillStyle = '#6B7280';
          const levelText = i === 0 ? 'TOP' : i === bunkLevels - 1 ? 'BTM' : 'MID';
          ctx.fillText(levelText, width / 2 - 35, levelY);
          ctx.restore();
        }
      } else {
        // Regular emoji for other elements - ULTRA MASSIVE size to completely fill the entire box
        const emoji = getElementEmoji(element.type, element.properties);
        // GIGANTIC size to fill the complete element box
        const emojiSize = Math.min(width * 1.2, height * 1.0, 150);

        ctx.font = `${emojiSize}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#1F2937';
        // Center the icon perfectly in the entire box
        ctx.fillText(emoji, 0, 0);
      }

      ctx.restore();
    });

    // Draw element names OUTSIDE the boxes (after all elements are drawn)
    sortedElements.forEach(element => {
      const x = element.x * canvasScale;
      const y = element.y * canvasScale;
      const width = element.width * canvasScale;
      const height = element.height * canvasScale;

      ctx.save();
      ctx.translate(x + width / 2, y + height / 2);
      ctx.rotate(element.rotation * Math.PI / 180);

      // Draw element name BELOW the element box (outside)
      const elementName = getFormattedElementName(element.type, element.properties);
      ctx.fillStyle = '#374151';
      ctx.font = `bold ${Math.min(width * 0.1, 14)}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';

      // Split text if too long
      const maxWidth = width + 20; // Allow slightly wider text
      const words = elementName.split(' ');
      const lines: string[] = [];
      let currentLine = '';

      words.forEach(word => {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const testWidth = ctx.measureText(testLine).width;

        if (testWidth <= maxWidth) {
          currentLine = testLine;
        } else {
          if (currentLine) lines.push(currentLine);
          currentLine = word;
        }
      });
      if (currentLine) lines.push(currentLine);

      // Position text OUTSIDE and BELOW the element box
      const lineHeight = Math.min(width * 0.1, 16);
      const textStartY = height / 2 + 8; // Start below the element box

      lines.forEach((line, index) => {
        ctx.fillText(line, 0, textStartY + index * lineHeight);
      });

      // Recalculate element states for this loop
      const isSelected = selectedElements.includes(element.id);
      const isHovered = hoveredElement === element.id;
      const hasCollision = checkCollisions(element, element.id);

      // Selection indicators
      if (isSelected) {
        const handleSize = 8;

        // Selection border
        ctx.strokeStyle = '#3B82F6';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(-width / 2 - 4, -height / 2 - 4, width + 8, height + 8);
        ctx.setLineDash([]);

        // Corner handles
        ctx.fillStyle = '#3B82F6';
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;

        const corners = [
          [-width / 2 - 4, -height / 2 - 4],
          [width / 2 + 4, -height / 2 - 4],
          [-width / 2 - 4, height / 2 + 4],
          [width / 2 + 4, height / 2 + 4]
        ];

        corners.forEach(([hx, hy]) => {
          ctx.fillRect(hx - handleSize / 2, hy - handleSize / 2, handleSize, handleSize);
          ctx.strokeRect(hx - handleSize / 2, hy - handleSize / 2, handleSize, handleSize);
        });
      }

      // Collision warning
      if (hasCollision) {
        ctx.fillStyle = '#DC2626';
        ctx.font = 'bold 16px Arial';
        ctx.fillText('⚠️', width / 2 - 12, -height / 2 - 8);
      }

      // Hover effect
      if (isHovered && !isSelected) {
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.6)';
        ctx.lineWidth = 2;
        ctx.setLineDash([3, 3]);
        ctx.strokeRect(-width / 2 - 2, -height / 2 - 2, width + 4, height + 4);
        ctx.setLineDash([]);
      }

      ctx.restore();
    });
  };

  const getElementAtPosition = (x: number, y: number): RoomElement | null => {
    const sortedElements = [...elements].sort((a, b) => b.zIndex - a.zIndex);
    return sortedElements.find(element =>
      x >= element.x && x <= element.x + element.width &&
      y >= element.y && y <= element.y + element.height
    ) || null;
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / canvasScale;
    const y = (e.clientY - rect.top) / canvasScale;

    const clickedElement = getElementAtPosition(x, y);

    if (clickedElement) {
      const isMultiSelect = e.ctrlKey || e.metaKey;

      onElementSelect(clickedElement.id, isMultiSelect);

      // Start dragging only if not locked
      if (!clickedElement.properties?.isLocked) {
        setIsDragging(true);
        setDraggedElementId(clickedElement.id);
        setDragStart({
          x: e.clientX,
          y: e.clientY
        });
      }
    } else {
      if (!e.ctrlKey && !e.metaKey) {
        onElementSelect('', false);
      }
    }

    onMouseDown(e);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / canvasScale;
    const y = (e.clientY - rect.top) / canvasScale;

    // Handle dragging
    if (isDragging && dragStart && draggedElementId) {
      const deltaX = (e.clientX - dragStart.x) / canvasScale;
      const deltaY = (e.clientY - dragStart.y) / canvasScale;

      // Only move if there's significant movement to avoid jitter
      if (Math.abs(deltaX) > 0.01 || Math.abs(deltaY) > 0.01) {
        onElementsMove([draggedElementId], deltaX, deltaY);

        // Update drag start for next movement
        setDragStart({
          x: e.clientX,
          y: e.clientY
        });
      }
    } else {
      // Handle hover effects
      const hoveredEl = getElementAtPosition(x, y);
      setHoveredElement(hoveredEl?.id || null);

      if (hoveredEl) {
        const elementName = getFormattedElementName(hoveredEl.type, hoveredEl.properties);
        setTooltip({
          x: e.clientX,
          y: e.clientY - 50,
          text: elementName
        });
      } else {
        setTooltip(null);
      }
    }

    onMouseMove(e);
  };

  const handleCanvasMouseUp = () => {
    if (isDragging && draggedElementId) {
      // Call the move complete callback to add to history
      onElementsMoveComplete?.();
    }
    setIsDragging(false);
    setDraggedElementId(null);
    setDragStart(null);
    onMouseUp();
  };

  const handleCanvasRightClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();

    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / canvasScale;
    const y = (e.clientY - rect.top) / canvasScale;

    const clickedElement = getElementAtPosition(x, y);

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
  }, [elements, selectedElement, selectedElements, dimensions, showGrid, canvasScale, theme, hoveredElement, draggedElementId]);

  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="flex-1 flex flex-col bg-gray-50 p-4 relative overflow-auto">
      {/* Canvas Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2 flex-wrap">
          <Badge variant="outline" className="bg-white">
            <Grid3X3 className="h-4 w-4 mr-2" />
            2D View • {canvasScale}px/m
          </Badge>
          <Badge variant="secondary">
            <Ruler className="h-4 w-4 mr-2" />
            {dimensions.length}m × {dimensions.width}m
          </Badge>
          <Badge variant="outline" className="bg-green-50 text-green-700">
            📦 {elements.length} elements
          </Badge>
          {selectedElements.length > 0 && (
            <Badge variant="default">
              ✅ {selectedElements.length} selected
            </Badge>
          )}
        </div>
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-400 rounded">
          <div className="flex items-center gap-2 text-red-800 font-medium mb-2">
            <AlertTriangle className="h-5 w-5" />
            Design Warnings ({warnings.length})
          </div>
          <ul className="text-sm text-red-700 space-y-1">
            {warnings.slice(0, 3).map((warning, index) => (
              <li key={index}>• {warning}</li>
            ))}
            {warnings.length > 3 && (
              <li className="font-medium">... and {warnings.length - 3} more</li>
            )}
          </ul>
        </div>
      )}

      {/* Canvas Container */}
      <div className="flex-1 flex items-center justify-center bg-white rounded-lg shadow-sm border p-4">
        <div className="relative overflow-auto max-h-[70vh] max-w-full">
          <canvas
            ref={canvasRef}
            width={dimensions.length * canvasScale}
            height={dimensions.width * canvasScale}
            className="cursor-crosshair border rounded"
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onContextMenu={handleCanvasRightClick}
          />
        </div>

        {/* Tooltip */}
        {tooltip && (
          <div
            className="fixed z-50 bg-gray-900 text-white text-sm px-3 py-2 rounded shadow-lg pointer-events-none"
            style={{ left: tooltip.x, top: tooltip.y }}
          >
            {tooltip.text}
          </div>
        )}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed bg-white border rounded-lg shadow-lg z-50 py-2 min-w-[160px]"
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
            <RotateCw className="h-4 w-4 mr-2" />
            Rotate
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
            <Copy className="h-4 w-4 mr-2" />
            Duplicate
          </Button>
          <div className="border-t my-1"></div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start px-4 py-2 h-auto text-red-600 hover:text-red-700"
            onClick={() => {
              onElementDelete(contextMenu.elementId);
              setContextMenu(null);
            }}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      )}
    </div>
  );
};
