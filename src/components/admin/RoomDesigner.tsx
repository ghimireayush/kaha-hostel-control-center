
import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  Trash2
} from "lucide-react";
import { toast } from "sonner";

interface RoomElement {
  id: string;
  type: 'bed' | 'door' | 'window' | 'cupboard';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  properties?: {
    bedType?: 'single' | 'bunk' | 'capsule';
    bedId?: string;
    gender?: 'mixed' | 'male' | 'female';
  };
}

interface RoomDesignerProps {
  onSave: (layout: any) => void;
  onClose: () => void;
  roomData?: any;
}

export const RoomDesigner = ({ onSave, onClose, roomData }: RoomDesignerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({
    length: roomData?.length || 10,
    width: roomData?.width || 8,
    height: roomData?.height || 3
  });
  
  const [elements, setElements] = useState<RoomElement[]>(roomData?.elements || []);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [draggedElement, setDraggedElement] = useState<string | null>(null);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [scale, setScale] = useState(30); // pixels per meter
  const [showGrid, setShowGrid] = useState(true);
  
  const elementTypes = [
    { type: 'bed', icon: Bed, label: 'Bed', color: '#3B82F6' },
    { type: 'door', icon: DoorOpen, label: 'Door', color: '#8B5CF6' },
    { type: 'window', icon: Square, label: 'Window', color: '#10B981' },
    { type: 'cupboard', icon: Square, label: 'Cupboard', color: '#F59E0B' }
  ];

  const snapToGridPosition = (value: number) => {
    if (!snapToGrid) return value;
    const gridSize = 0.5; // 0.5 meter grid
    return Math.round(value / gridSize) * gridSize;
  };

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid
    if (showGrid) {
      ctx.strokeStyle = '#E5E7EB';
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
    
    // Draw room outline
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 3;
    ctx.strokeRect(0, 0, dimensions.length * scale, dimensions.width * scale);
    
    // Draw elements
    elements.forEach(element => {
      const x = element.x * scale;
      const y = element.y * scale;
      const width = element.width * scale;
      const height = element.height * scale;
      
      ctx.save();
      ctx.translate(x + width/2, y + height/2);
      ctx.rotate(element.rotation * Math.PI / 180);
      
      // Element color based on type
      const elementType = elementTypes.find(t => t.type === element.type);
      ctx.fillStyle = selectedElement === element.id ? '#EF4444' : elementType?.color || '#6B7280';
      ctx.fillRect(-width/2, -height/2, width, height);
      
      // Element border
      ctx.strokeStyle = '#1F2937';
      ctx.lineWidth = 2;
      ctx.strokeRect(-width/2, -height/2, width, height);
      
      // Element label
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(element.type.toUpperCase(), 0, 4);
      
      ctx.restore();
    });
  };

  useEffect(() => {
    drawCanvas();
  }, [elements, selectedElement, dimensions, showGrid, scale]);

  const addElement = (type: RoomElement['type']) => {
    const newElement: RoomElement = {
      id: Date.now().toString(),
      type,
      x: 1,
      y: 1,
      width: type === 'bed' ? 2 : type === 'door' ? 1 : 1.5,
      height: type === 'bed' ? 1 : type === 'door' ? 0.2 : 0.3,
      rotation: 0,
      properties: type === 'bed' ? {
        bedType: 'single',
        bedId: `BED-${elements.length + 1}`,
        gender: 'mixed'
      } : undefined
    };
    
    setElements([...elements, newElement]);
    setSelectedElement(newElement.id);
    toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} added to room`);
  };

  const updateElement = (id: string, updates: Partial<RoomElement>) => {
    setElements(elements.map(el => 
      el.id === id ? { ...el, ...updates } : el
    ));
  };

  const deleteElement = (id: string) => {
    setElements(elements.filter(el => el.id !== id));
    if (selectedElement === id) {
      setSelectedElement(null);
    }
    toast.success("Element deleted");
  };

  const rotateElement = (id: string) => {
    updateElement(id, { 
      rotation: (elements.find(el => el.id === id)?.rotation || 0) + 90 
    });
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;
    
    // Find clicked element
    const clickedElement = elements.find(element => 
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
    
    updateElement(draggedElement, { x, y });
  };

  const handleCanvasMouseUp = () => {
    setDraggedElement(null);
  };

  const saveLayout = () => {
    const layout = {
      dimensions,
      elements,
      createdAt: new Date().toISOString()
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
            Room Designer
            <div className="flex gap-2">
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
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Room Dimensions */}
            <div className="space-y-4">
              <h3 className="font-semibold">Room Dimensions (meters)</h3>
              <div className="space-y-2">
                <div>
                  <Label>Length</Label>
                  <Input
                    type="number"
                    value={dimensions.length}
                    onChange={(e) => setDimensions({...dimensions, length: Number(e.target.value)})}
                    min="1"
                    max="20"
                  />
                </div>
                <div>
                  <Label>Width</Label>
                  <Input
                    type="number"
                    value={dimensions.width}
                    onChange={(e) => setDimensions({...dimensions, width: Number(e.target.value)})}
                    min="1"
                    max="20"
                  />
                </div>
                <div>
                  <Label>Height</Label>
                  <Input
                    type="number"
                    value={dimensions.height}
                    onChange={(e) => setDimensions({...dimensions, height: Number(e.target.value)})}
                    min="2"
                    max="5"
                  />
                </div>
              </div>

              {/* Tools */}
              <div className="space-y-2">
                <h3 className="font-semibold">Tools</h3>
                <div className="flex gap-2 flex-wrap">
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
                </div>
              </div>

              {/* Add Elements */}
              <div className="space-y-2">
                <h3 className="font-semibold">Add Elements</h3>
                <div className="grid grid-cols-2 gap-2">
                  {elementTypes.map(({ type, icon: Icon, label }) => (
                    <Button
                      key={type}
                      variant="outline"
                      size="sm"
                      onClick={() => addElement(type as RoomElement['type'])}
                      className="flex items-center gap-2"
                    >
                      <Icon className="h-4 w-4" />
                      {label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Canvas */}
            <div className="lg:col-span-2">
              <div className="border rounded-lg p-4 bg-gray-50">
                <canvas
                  ref={canvasRef}
                  width={dimensions.length * scale}
                  height={dimensions.width * scale}
                  className="border border-gray-300 bg-white cursor-crosshair"
                  onMouseDown={handleCanvasMouseDown}
                  onMouseMove={handleCanvasMouseMove}
                  onMouseUp={handleCanvasMouseUp}
                />
                <div className="mt-2 text-sm text-gray-600">
                  Click elements to select • Drag to move • {snapToGrid ? 'Snap-to-grid enabled' : 'Free positioning'}
                </div>
              </div>
            </div>

            {/* Element Properties */}
            <div className="space-y-4">
              <h3 className="font-semibold">Element Properties</h3>
              {selectedElementData ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="capitalize">
                      {selectedElementData.type}
                    </Badge>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => rotateElement(selectedElementData.id)}
                      >
                        <RotateCw className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteElement(selectedElementData.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
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
                          <select
                            className="w-full px-3 py-2 border rounded-md"
                            value={selectedElementData.properties.bedType || 'single'}
                            onChange={(e) => updateElement(selectedElementData.id, {
                              properties: { ...selectedElementData.properties, bedType: e.target.value as any }
                            })}
                          >
                            <option value="single">Single Bed</option>
                            <option value="bunk">Bunk Bed</option>
                            <option value="capsule">Capsule</option>
                          </select>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500">
                  Select an element to edit its properties
                </div>
              )}
              
              {/* Elements List */}
              <div className="space-y-2">
                <h4 className="font-medium">Room Elements ({elements.length})</h4>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {elements.map(element => (
                    <div
                      key={element.id}
                      className={`p-2 rounded border cursor-pointer ${
                        selectedElement === element.id ? 'bg-blue-50 border-blue-300' : 'bg-gray-50'
                      }`}
                      onClick={() => setSelectedElement(element.id)}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm capitalize">{element.type}</span>
                        {element.properties?.bedId && (
                          <Badge variant="secondary" className="text-xs">
                            {element.properties.bedId}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
