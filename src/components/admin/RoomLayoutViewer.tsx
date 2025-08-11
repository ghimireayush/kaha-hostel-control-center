import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, RotateCcw, Maximize2, Info } from "lucide-react";
import { KahaLogo } from "@/components/common/KahaLogo";

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
    bedType?: 'single' | 'bunk' | 'double';
    bedId?: string;
    bedLabel?: string;
    status?: 'available' | 'booked' | 'occupied';
    position?: 'top' | 'middle' | 'bottom';
    orientation?: 'north' | 'south' | 'east' | 'west';
    bunkLevels?: number;
    levels?: Array<{
      id: string;
      position: 'top' | 'middle' | 'bottom';
      bedId: string;
      status?: 'available' | 'booked' | 'occupied';
      assignedTo?: string;
    }>;
  };
}

interface RoomLayoutViewerProps {
  layout: {
    dimensions: { length: number; width: number; height: number };
    elements: RoomElement[];
    theme: { wallColor: string; floorColor: string };
    createdAt: string;
  };
  roomName: string;
}

export const RoomLayoutViewer = ({ layout, roomName }: RoomLayoutViewerProps) => {
  const [scale, setScale] = useState(25);
  const [showInfo, setShowInfo] = useState(false);

  const handleZoom = (delta: number) => {
    setScale(Math.max(10, Math.min(50, scale + delta)));
  };

  const resetView = () => {
    setScale(25);
  };

  const getElementColor = (element: RoomElement) => {
    switch (element.type) {
      case 'single-bed':
        return element.properties?.status === 'occupied' ? '#ef4444' : 
               element.properties?.status === 'booked' ? '#f59e0b' : '#10b981';
      case 'bunk-bed':
        return '#8b5cf6';
      case 'desk':
        return '#6366f1';
      case 'chair':
        return '#f59e0b';
      case 'wardrobe':
        return '#8b5a2b';
      case 'door':
        return '#64748b';
      case 'window':
        return '#0ea5e9';
      default:
        return '#6b7280';
    }
  };

  const getElementIcon = (element: RoomElement) => {
    switch (element.type) {
      case 'single-bed':
        return '🛏️';
      case 'bunk-bed':
        return '🏠';
      case 'desk':
        return '🪑';
      case 'chair':
        return '💺';
      case 'wardrobe':
        return '🚪';
      case 'door':
        return '🚪';
      case 'window':
        return '🪟';
      default:
        return '📦';
    }
  };

  const bedElements = layout.elements.filter(e => e.type === 'single-bed' || e.type === 'bunk-bed');
  const totalBeds = bedElements.reduce((count, element) => {
    if (element.type === 'bunk-bed') {
      return count + (element.properties?.bunkLevels || 2);
    }
    return count + 1;
  }, 0);

  const occupiedBeds = bedElements.reduce((count, element) => {
    if (element.type === 'bunk-bed') {
      return count + (element.properties?.levels?.filter(level => level.status === 'occupied').length || 0);
    }
    return count + (element.properties?.status === 'occupied' ? 1 : 0);
  }, 0);

  if (!layout) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <div className="relative">
          <svg width="48" height="72" viewBox="0 0 55 83" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-pulse mx-auto">
            <g clipPath="url(#clip0_319_901)">
              <path d="M27.3935 0.0466309C12.2652 0.0466309 0 12.2774 0 27.3662C0 40.746 7.8608 47.9976 16.6341 59.8356C25.9039 72.3432 27.3935 74.1327 27.3935 74.1327C27.3935 74.1327 31.3013 69.0924 37.9305 59.9483C46.5812 48.0201 54.787 40.746 54.787 27.3662C54.787 12.2774 42.5218 0.0466309 27.3935 0.0466309Z" fill="#07A64F"/>
              <path d="M31.382 79.0185C31.382 81.2169 29.5957 83 27.3935 83C25.1913 83 23.4051 81.2169 23.4051 79.0185C23.4051 76.8202 25.1913 75.0371 27.3935 75.0371C29.5957 75.0371 31.382 76.8202 31.382 79.0185Z" fill="#07A64F"/>
              <path d="M14.4383 33.34C14.4383 33.34 14.0063 32.3905 14.8156 33.0214C15.6249 33.6522 27.3516 47.8399 39.7618 33.2563C39.7618 33.2563 41.0709 31.8047 40.2358 33.4816C39.4007 35.1585 28.1061 50.8718 14.4383 33.34Z" fill="#231F20"/>
              <path d="M27.3935 47.6498C38.5849 47.6498 47.6548 38.5926 47.6548 27.424C47.6548 16.2554 38.5817 7.19824 27.3935 7.19824C16.2052 7.19824 7.12885 16.2522 7.12885 27.424C7.12885 34.9878 11.2882 41.5795 17.4465 45.0492L13.1389 55.2554C14.2029 56.6233 15.2992 58.0427 16.4083 59.5329L21.7574 46.858C23.5469 47.373 25.4363 47.6498 27.3935 47.6498Z" fill="#8b5cf6"/>
              <path d="M45.2334 27.4241C45.2334 37.2602 37.2469 45.2327 27.3935 45.2327C17.5401 45.2327 9.55353 37.2602 9.55353 27.4241C9.55353 17.588 17.5401 9.61548 27.3935 9.61548C37.2437 9.61548 45.2334 17.588 45.2334 27.4241Z" fill="white"/>
              <path d="M14.4383 33.3398C14.4383 33.3398 14.0063 32.3903 14.8156 33.0211C15.6249 33.652 27.3516 47.8396 39.7618 33.2561C39.7618 33.2561 41.0709 31.8045 40.2358 33.4814C39.4007 35.1583 28.1061 50.8716 14.4383 33.3398Z" fill="#231F20"/>
            </g>
            <defs>
              <clipPath id="clip0_319_901">
                <rect width="54.787" height="82.9534" fill="white" transform="translate(0 0.0466309)"/>
              </clipPath>
            </defs>
          </svg>
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-[#07A64F] border-r-purple-500"></div>
        </div>
        <p className="text-gray-600">Loading room layout...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Room Info */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{roomName}</h3>
          <p className="text-sm text-gray-600">
            {layout.dimensions.length}m × {layout.dimensions.width}m × {layout.dimensions.height}m
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowInfo(!showInfo)}
            className="text-blue-600 hover:text-blue-700"
          >
            <Info className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleZoom(-5)}
            disabled={scale <= 10}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm text-gray-600 min-w-[60px] text-center">
            {scale * 4}%
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleZoom(5)}
            disabled={scale >= 50}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={resetView}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Room Stats */}
      {showInfo && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{totalBeds}</div>
            <div className="text-sm text-gray-600">Total Beds</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{occupiedBeds}</div>
            <div className="text-sm text-gray-600">Occupied</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{layout.elements.length}</div>
            <div className="text-sm text-gray-600">Elements</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round((occupiedBeds / totalBeds) * 100) || 0}%
            </div>
            <div className="text-sm text-gray-600">Occupancy</div>
          </div>
        </div>
      )}

      {/* Room Canvas */}
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
        <div className="p-4">
          <svg
            width="100%"
            height="400"
            viewBox={`0 0 ${layout.dimensions.length * scale} ${layout.dimensions.width * scale}`}
            className="border border-gray-300 rounded"
            style={{ backgroundColor: layout.theme.floorColor || '#f8f9fa' }}
          >
            {/* Room boundaries */}
            <rect
              x="0"
              y="0"
              width={layout.dimensions.length * scale}
              height={layout.dimensions.width * scale}
              fill="none"
              stroke="#374151"
              strokeWidth="2"
            />

            {/* Grid */}
            <defs>
              <pattern
                id="grid"
                width={scale}
                height={scale}
                patternUnits="userSpaceOnUse"
              >
                <path
                  d={`M ${scale} 0 L 0 0 0 ${scale}`}
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="0.5"
                />
              </pattern>
            </defs>
            <rect
              width="100%"
              height="100%"
              fill="url(#grid)"
            />

            {/* Elements */}
            {layout.elements.map((element) => {
              const x = element.x * scale;
              const y = element.y * scale;
              const width = element.width * scale;
              const height = element.height * scale;
              const centerX = x + width / 2;
              const centerY = y + height / 2;

              return (
                <g key={element.id}>
                  <rect
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    fill={getElementColor(element)}
                    stroke="#374151"
                    strokeWidth="1"
                    rx="2"
                    transform={`rotate(${element.rotation} ${centerX} ${centerY})`}
                    opacity="0.8"
                  />
                  
                  {/* Element label */}
                  <text
                    x={centerX}
                    y={centerY}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="10"
                    fill="white"
                    fontWeight="bold"
                    transform={`rotate(${element.rotation} ${centerX} ${centerY})`}
                  >
                    {getElementIcon(element)}
                  </text>

                  {/* Bed ID for beds */}
                  {(element.type === 'single-bed' || element.type === 'bunk-bed') && element.properties?.bedLabel && (
                    <text
                      x={centerX}
                      y={centerY + 12}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="8"
                      fill="white"
                      fontWeight="bold"
                      transform={`rotate(${element.rotation} ${centerX} ${centerY})`}
                    >
                      {element.properties.bedLabel}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span className="text-sm">Available Bed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-500 rounded"></div>
          <span className="text-sm">Booked Bed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span className="text-sm">Occupied Bed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-purple-500 rounded"></div>
          <span className="text-sm">Bunk Bed</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-indigo-500 rounded"></div>
          <span className="text-sm">Furniture</span>
        </div>
      </div>

      {/* Layout Info */}
      <div className="text-xs text-gray-500 text-center">
        Layout created: {new Date(layout.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}
      </div>
    </div>
  );
};