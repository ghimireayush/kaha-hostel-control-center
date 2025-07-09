
import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Bed, 
  DoorOpen, 
  Square, 
  RotateCw, 
  Grid3X3, 
  Save, 
  Undo, 
  Redo,
  Plus,
  Trash2,
  Tv,
  Lightbulb,
  Zap,
  Flame,
  Speaker,
  Armchair,
  ImageIcon,
  Eye,
  Box,
  Palette,
  View,
  ZoomIn,
  ZoomOut,
  Move3D,
  AlertTriangle,
  Maximize2
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface RoomElement {
  id: string;
  type: 'bed' | 'door' | 'window' | 'cupboard' | 'charging-port' | 'light' | 'tv' | 'chair' | 'fire-safety' | 'wall-decor' | 'speaker';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  properties?: {
    bedType?: 'single' | 'bunk' | 'capsule';
    bedId?: string;
    gender?: 'mixed' | 'male' | 'female';
    color?: string;
    brand?: string;
    wattage?: number;
  };
}

interface RoomTheme {
  name: string;
  wallColor: string;
  floorColor: string;
  wallTexture?: string;
  floorTexture?: string;
}

interface RoomDesignerProps {
  onSave: (layout: any) => void;
  onClose: () => void;
  roomData?: any;
}

export const RoomDesigner = ({ onSave, onClose, roomData }: RoomDesignerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({
    length: roomData?.dimensions?.length || 10,
    width: roomData?.dimensions?.width || 8,
    height: roomData?.dimensions?.height || 3
  });
  
  const [elements, setElements] = useState<RoomElement[]>(roomData?.elements || []);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [draggedElement, setDraggedElement] = useState<string | null>(null);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [scale, setScale] = useState(30);
  const [showGrid, setShowGrid] = useState(true);
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  const [currentTheme, setCurrentTheme] = useState<RoomTheme>({
    name: 'Modern',
    wallColor: '#F8F9FA',
    floorColor: '#E9ECEF'
  });
  const [history, setHistory] = useState<RoomElement[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [collisionWarnings, setCollisionWarnings] = useState<string[]>([]);
  
  const themes: RoomTheme[] = [
    { name: 'Modern', wallColor: '#F8F9FA', floorColor: '#E9ECEF' },
    { name: 'Minimal', wallColor: '#FFFFFF', floorColor: '#F5F5F5' },
    { name: 'Vintage', wallColor: '#FFF8DC', floorColor: '#DEB887' },
    { name: 'Cozy', wallColor: '#F4E4BC', floorColor: '#CD853F' },
    { name: 'Industrial', wallColor: '#36454F', floorColor: '#708090' },
    { name: 'Tropical', wallColor: '#F0FFF0', floorColor: '#98FB98' }
  ];

  const elementTypes = [
    { type: 'bed', icon: Bed, label: 'Bed', color: '#3B82F6', defaultSize: { width: 2, height: 1 } },
    { type: 'door', icon: DoorOpen, label: 'Door', color: '#8B5CF6', defaultSize: { width: 1, height: 0.2 } },
    { type: 'window', icon: Square, label: 'Window', color: '#10B981', defaultSize: { width: 1.5, height: 0.3 } },
    { type: 'cupboard', icon: Box, label: 'Cupboard', color: '#F59E0B', defaultSize: { width: 1, height: 0.6 } },
    { type: 'charging-port', icon: Zap, label: 'Charging Port', color: '#EF4444', defaultSize: { width: 0.2, height: 0.2 } },
    { type: 'light', icon: Lightbulb, label: 'Light', color: '#FBBF24', defaultSize: { width: 0.5, height: 0.5 } },
    { type: 'tv', icon: Tv, label: 'TV', color: '#1F2937', defaultSize: { width: 1.2, height: 0.8 } },
    { type: 'chair', icon: Armchair, label: 'Chair/Sofa', color: '#7C3AED', defaultSize: { width: 0.8, height: 0.8 } },
    { type: 'fire-safety', icon: Flame, label: 'Fire Safety', color: '#DC2626', defaultSize: { width: 0.3, height: 0.3 } },
    { type: 'wall-decor', icon: ImageIcon, label: 'Wall Decor', color: '#9333EA', defaultSize: { width: 0.6, height: 0.4 } },
    { type: 'speaker', icon: Speaker, label: 'Speaker', color: '#059669', defaultSize: { width: 0.4, height: 0.4 } }
  ];

  const floorTypes = [
    { name: 'Wood', color: '#DEB887' },
    { name: 'Tile', color: '#E9ECEF' },
    { name: 'Marble', color: '#F8F9FA' },
    { name: 'Carpet', color: '#CD853F' },
    { name: 'Concrete', color: '#708090' }
  ];

  const snapToGridPosition = (value: number) => {
    if (!snapToGrid) return value;
    const gridSize = 0.5;
    return Math.round(value / gridSize) * gridSize;
  };

  const checkCollisions = (newElement: RoomElement, excludeId?: string) => {
    return elements.some(element => {
      if (element.id === excludeId) return false;
      
      const overlap = !(
        newElement.x >= element.x + element.width ||
        newElement.x + newElement.width <= element.x ||
        newElement.y >= element.y + element.height ||
        newElement.y + newElement.height <= element.y
      );
      
      return overlap;
    });
  };

  const validateDimensions = () => {
    const warnings: string[] = [];
    
    if (dimensions.length < 2 || dimensions.width < 2) {
      warnings.push("Room dimensions too small (minimum 2m x 2m)");
    }
    
    if (dimensions.length > 20 || dimensions.width > 20) {
      warnings.push("Room dimensions very large (maximum recommended 20m x 20m)");
    }
    
    if (dimensions.height < 2.2) {
      warnings.push("Room height too low (minimum 2.2m recommended)");
    }
    
    // Check if elements are within room bounds
    elements.forEach(element => {
      if (element.x + element.width > dimensions.length || element.y + element.height > dimensions.width) {
        warnings.push(`${element.type} extends beyond room boundaries`);
      }
    });
    
    return warnings;
  };

  const addToHistory = () => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...elements]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setElements([...history[historyIndex - 1]]);
      toast.success("Undone");
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setElements([...history[historyIndex + 1]]);
      toast.success("Redone");
    }
  };

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw floor
    ctx.fillStyle = currentTheme.floorColor;
    ctx.fillRect(0, 0, dimensions.length * scale, dimensions.width * scale);
    
    // Draw grid
    if (showGrid) {
      ctx.strokeStyle = '#00000020';
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
      
      // Element color and styling
      const elementType = elementTypes.find(t => t.type === element.type);
      const isSelected = selectedElement === element.id;
      const hasCollision = checkCollisions(element, element.id);
      
      // Draw element background
      ctx.fillStyle = hasCollision ? '#EF4444' : isSelected ? '#3B82F6' : elementType?.color || '#6B7280';
      ctx.fillRect(-width/2, -height/2, width, height);
      
      // Draw element border
      ctx.strokeStyle = isSelected ? '#1D4ED8' : hasCollision ? '#DC2626' : '#1F2937';
      ctx.lineWidth = isSelected ? 3 : 2;
      ctx.strokeRect(-width/2, -height/2, width, height);
      
      // Draw element icon/label
      ctx.fillStyle = '#FFFFFF';
      ctx.font = `${Math.min(width, height) * 0.3}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText(element.type.toUpperCase().replace('-', ' '), 0, 4);
      
      // Draw selection handles
      if (isSelected) {
        const handleSize = 6;
        ctx.fillStyle = '#3B82F6';
        ctx.fillRect(-width/2 - handleSize/2, -height/2 - handleSize/2, handleSize, handleSize);
        ctx.fillRect(width/2 - handleSize/2, -height/2 - handleSize/2, handleSize, handleSize);
        ctx.fillRect(-width/2 - handleSize/2, height/2 - handleSize/2, handleSize, handleSize);
        ctx.fillRect(width/2 - handleSize/2, height/2 - handleSize/2, handleSize, handleSize);
      }
      
      // Draw collision warning
      if (hasCollision) {
        ctx.fillStyle = '#DC2626';
        ctx.font = '12px Arial';
        ctx.fillText('⚠', 0, -height/2 - 10);
      }
      
      ctx.restore();
    });
    
    // Draw room dimensions
    ctx.fillStyle = '#374151';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${dimensions.length}m`, dimensions.length * scale / 2, -10);
    ctx.save();
    ctx.translate(-15, dimensions.width * scale / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(`${dimensions.width}m`, 0, 0);
    ctx.restore();
  };

  useEffect(() => {
    drawCanvas();
    setCollisionWarnings(validateDimensions());
  }, [elements, selectedElement, dimensions, showGrid, scale, currentTheme]);

  const addElement = (type: RoomElement['type']) => {
    const elementType = elementTypes.find(t => t.type === type);
    if (!elementType) return;
    
    const newElement: RoomElement = {
      id: Date.now().toString(),
      type,
      x: 1,
      y: 1,
      width: elementType.defaultSize.width,
      height: elementType.defaultSize.height,
      rotation: 0,
      zIndex: elements.length,
      properties: type === 'bed' ? {
        bedType: 'single',
        bedId: `BED-${elements.filter(e => e.type === 'bed').length + 1}`,
        gender: 'mixed'
      } : {}
    };
    
    addToHistory();
    setElements([...elements, newElement]);
    setSelectedElement(newElement.id);
    toast.success(`${type.replace('-', ' ')} added to room`);
  };

  const updateElement = (id: string, updates: Partial<RoomElement>) => {
    addToHistory();
    setElements(elements.map(el => 
      el.id === id ? { ...el, ...updates } : el
    ));
  };

  const deleteElement = (id: string) => {
    addToHistory();
    setElements(elements.filter(el => el.id !== id));
    if (selectedElement === id) {
      setSelectedElement(null);
    }
    toast.success("Element deleted");
  };

  const rotateElement = (id: string) => {
    const element = elements.find(el => el.id === id);
    if (element) {
      updateElement(id, { rotation: (element.rotation + 90) % 360 });
    }
  };

  const duplicateElement = (id: string) => {
    const element = elements.find(el => el.id === id);
    if (element) {
      const newElement = {
        ...element,
        id: Date.now().toString(),
        x: element.x + 1,
        y: element.y + 1,
        zIndex: elements.length
      };
      addToHistory();
      setElements([...elements, newElement]);
      setSelectedElement(newElement.id);
      toast.success("Element duplicated");
    }
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;
    
    // Find clicked element (top-most first)
    const sortedElements = [...elements].sort((a, b) => b.zIndex - a.zIndex);
    const clickedElement = sortedElements.find(element => 
      x >= element.x && x <= element.x + element.width &&
      y >= element.y && y <= element.y + element.height
    );
    
    if (clickedElement) {
      setSelectedElement(clickedElement.id);
      setDraggedElement(clickedElement.id);
    } else {
      setSelectedElement(null);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!draggedElement) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = snapToGridPosition((e.clientX - rect.left) / scale);
    const y = snapToGridPosition((e.clientY - rect.top) / scale);
    
    // Boundary checks
    const element = elements.find(el => el.id === draggedElement);
    if (element) {
      const constrainedX = Math.max(0, Math.min(x, dimensions.length - element.width));
      const constrainedY = Math.max(0, Math.min(y, dimensions.width - element.height));
      updateElement(draggedElement, { x: constrainedX, y: constrainedY });
    }
  };

  const handleCanvasMouseUp = () => {
    setDraggedElement(null);
  };

  const handleZoom = (delta: number) => {
    setScale(Math.max(10, Math.min(50, scale + delta)));
  };

  const saveLayout = () => {
    const layout = {
      dimensions,
      elements,
      theme: currentTheme,
      createdAt: new Date().toISOString(),
      warnings: collisionWarnings
    };
    onSave(layout);
    toast.success("Room layout saved successfully!");
  };

  const selectedElementData = elements.find(el => el.id === selectedElement);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Box className="h-5 w-5" />
              God-Tier Room Designer
              {collisionWarnings.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {collisionWarnings.length} Warning{collisionWarnings.length > 1 ? 's' : ''}
                </Badge>
              )}
            </div>
            <div className="flex gap-2">
              <Button onClick={undo} size="sm" variant="outline" disabled={historyIndex <= 0}>
                <Undo className="h-4 w-4" />
              </Button>
              <Button onClick={redo} size="sm" variant="outline" disabled={historyIndex >= history.length - 1}>
                <Redo className="h-4 w-4" />
              </Button>
              <Button onClick={saveLayout} size="sm">
                <Save className="h-4 w-4 mr-2" />
                Save Layout
              </Button>
              <Button onClick={onClose} variant="outline" size="sm">
                Close
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left Panel - Controls */}
            <div className="space-y-6">
              {/* Room Dimensions */}
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Maximize2 className="h-4 w-4" />
                  Room Dimensions
                </h3>
                <div className="space-y-2">
                  <div>
                    <Label>Length (m)</Label>
                    <Input
                      type="number"
                      value={dimensions.length}
                      onChange={(e) => setDimensions({...dimensions, length: Number(e.target.value)})}
                      min="2"
                      max="20"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <Label>Width (m)</Label>
                    <Input
                      type="number"
                      value={dimensions.width}
                      onChange={(e) => setDimensions({...dimensions, width: Number(e.target.value)})}
                      min="2"
                      max="20"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <Label>Height (m)</Label>
                    <Input
                      type="number"
                      value={dimensions.height}
                      onChange={(e) => setDimensions({...dimensions, height: Number(e.target.value)})}
                      min="2.2"
                      max="5"
                      step="0.1"
                    />
                  </div>
                </div>
              </div>

              {/* Room Theme */}
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Room Theme
                </h3>
                <Select value={currentTheme.name} onValueChange={(value) => {
                  const theme = themes.find(t => t.name === value);
                  if (theme) setCurrentTheme(theme);
                }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {themes.map((theme) => (
                      <SelectItem key={theme.name} value={theme.name}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded border"
                            style={{ backgroundColor: theme.wallColor }}
                          />
                          {theme.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tools */}
              <div className="space-y-4">
                <h3 className="font-semibold">God Mode Tools</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={snapToGrid ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSnapToGrid(!snapToGrid)}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={showGrid ? "default" : "outline"}
                    size="sm"
                    onClick={() => setShowGrid(!showGrid)}
                  >
                    Grid
                  </Button>
                  <Button
                    variant={viewMode === '3d' ? "default" : "outline"}
                    size="sm"
                    onClick={() => setViewMode(viewMode === '2d' ? '3d' : '2d')}
                  >
                    <Move3D className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowGrid(!showGrid)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleZoom(5)}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleZoom(-5)}
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Add Elements */}
              <div className="space-y-4">
                <h3 className="font-semibold">🔄 Drag & Drop Elements</h3>
                <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
                  {elementTypes.map(({ type, icon: Icon, label }) => (
                    <Button
                      key={type}
                      variant="outline"
                      size="sm"
                      onClick={() => addElement(type as RoomElement['type'])}
                      className="flex items-center gap-2 justify-start"
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Center - Canvas */}
            <div className="lg:col-span-3">
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                  <Badge variant="outline">
                    {viewMode === '2d' ? '2D View' : '3D View'} • Scale: {scale}px/m
                  </Badge>
                  <div className="flex gap-2">
                    <Badge variant="outline">
                      {dimensions.length}m × {dimensions.width}m × {dimensions.height}m
                    </Badge>
                    <Badge variant="secondary">
                      {elements.length} elements
                    </Badge>
                  </div>
                </div>
                
                {collisionWarnings.length > 0 && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 text-red-800 font-medium mb-2">
                      <AlertTriangle className="h-4 w-4" />
                      Validation Warnings
                    </div>
                    <ul className="text-sm text-red-700 space-y-1">
                      {collisionWarnings.map((warning, index) => (
                        <li key={index}>• {warning}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <canvas
                  ref={canvasRef}
                  width={dimensions.length * scale}
                  height={dimensions.width * scale}
                  className="border border-gray-300 bg-white cursor-crosshair rounded-lg shadow-sm"
                  onMouseDown={handleCanvasMouseDown}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                />
                
                <div className="mt-4 text-sm text-gray-600 space-y-1">
                  <div>🎯 <strong>Click</strong> elements to select • <strong>Drag</strong> to move • <strong>Snap-to-grid:</strong> {snapToGrid ? 'ON' : 'OFF'}</div>
                  <div>⚡ <strong>Power outlets:</strong> {elements.filter(e => e.type === 'charging-port').length} • <strong>Fire safety:</strong> {elements.filter(e => e.type === 'fire-safety').length}</div>
                </div>
              </div>
            </div>

            {/* Right Panel - Element Properties */}
            <div className="space-y-4">
              <h3 className="font-semibold">✨ Element Properties</h3>
              
              {selectedElementData ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="capitalize">
                      {selectedElementData.type.replace('-', ' ')}
                    </Badge>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => rotateElement(selectedElementData.id)}
                        title="Rotate"
                      >
                        <RotateCw className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => duplicateElement(selectedElementData.id)}
                        title="Duplicate"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteElement(selectedElementData.id)}
                        className="text-red-600 hover:text-red-700"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label>Width (m)</Label>
                        <Input
                          type="number"
                          value={selectedElementData.width}
                          onChange={(e) => updateElement(selectedElementData.id, { width: Number(e.target.value) })}
                          step="0.1"
                          min="0.1"
                        />
                      </div>
                      <div>
                        <Label>Height (m)</Label>
                        <Input
                          type="number"
                          value={selectedElementData.height}
                          onChange={(e) => updateElement(selectedElementData.id, { height: Number(e.target.value) })}
                          step="0.1"
                          min="0.1"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label>Z-Index (Layer)</Label>
                      <Input
                        type="number"
                        value={selectedElementData.zIndex}
                        onChange={(e) => updateElement(selectedElementData.id, { zIndex: Number(e.target.value) })}
                        min="0"
                      />
                    </div>
                    
                    {selectedElementData.type === 'bed' && selectedElementData.properties && (
                      <>
                        <div>
                          <Label>Bed ID</Label>
                          <Input
                            value={selectedElementData.properties.bedId || ''}
                            onChange={(e) => updateElement(selectedElementData.id, {
                              properties: { ...selectedElementData.properties, bedId: e.target.value }
                            })}
                          />
                        </div>
                        <div>
                          <Label>Bed Type</Label>
                          <Select
                            value={selectedElementData.properties.bedType || 'single'}
                            onValueChange={(value) => updateElement(selectedElementData.id, {
                              properties: { ...selectedElementData.properties, bedType: value as any }
                            })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="single">Single Bed</SelectItem>
                              <SelectItem value="bunk">Bunk Bed</SelectItem>
                              <SelectItem value="capsule">Capsule</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Gender Assignment</Label>
                          <Select
                            value={selectedElementData.properties.gender || 'mixed'}
                            onValueChange={(value) => updateElement(selectedElementData.id, {
                              properties: { ...selectedElementData.properties, gender: value as any }
                            })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="mixed">Mixed</SelectItem>
                              <SelectItem value="male">Male Only</SelectItem>
                              <SelectItem value="female">Female Only</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </>
                    )}
                  </div>
                  
                  {checkCollisions(selectedElementData, selectedElementData.id) && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-2 text-red-800 text-sm">
                        <AlertTriangle className="h-4 w-4" />
                        Collision detected! This element overlaps with another.
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-gray-500 p-4 text-center border-2 border-dashed border-gray-300 rounded-lg">
                  <Box className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  Select an element to edit properties
                </div>
              )}
              
              {/* Elements List */}
              <div className="space-y-2">
                <h4 className="font-medium">Room Elements ({elements.length})</h4>
                <div className="space-y-1 max-h-60 overflow-y-auto">
                  {elements
                    .sort((a, b) => b.zIndex - a.zIndex)
                    .map(element => {
                      const elementType = elementTypes.find(t => t.type === element.type);
                      const Icon = elementType?.icon || Box;
                      
                      return (
                        <div
                          key={element.id}
                          className={cn(
                            "p-2 rounded border cursor-pointer transition-colors",
                            selectedElement === element.id 
                              ? 'bg-blue-50 border-blue-300' 
                              : 'bg-gray-50 hover:bg-gray-100',
                            checkCollisions(element, element.id) && 'border-red-300 bg-red-50'
                          )}
                          onClick={() => setSelectedElement(element.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              <span className="text-sm capitalize">{element.type.replace('-', ' ')}</span>
                              {checkCollisions(element, element.id) && (
                                <AlertTriangle className="h-3 w-3 text-red-500" />
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {element.properties?.bedId && (
                                <Badge variant="secondary" className="text-xs">
                                  {element.properties.bedId}
                                </Badge>
                              )}
                              <Badge variant="outline" className="text-xs">
                                L{element.zIndex}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  
                  {elements.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Box className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm">No elements added yet</p>
                      <p className="text-xs">Click the buttons above to add elements</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
