import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Box, AlertTriangle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { RoomSetupWizard } from "./room-designer/RoomSetupWizard";
import { ElementLibraryPanel } from "./room-designer/ElementLibraryPanel";
import { PropertiesPanel } from "./room-designer/PropertiesPanel";
import { DesignerToolbar } from "./room-designer/DesignerToolbar";
import { RoomCanvas } from "./room-designer/RoomCanvas";

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
  // Wizard state
  const [showWizard, setShowWizard] = useState(!roomData);
  
  // Room setup
  const [dimensions, setDimensions] = useState({
    length: roomData?.dimensions?.length || 10,
    width: roomData?.dimensions?.width || 8,
    height: roomData?.dimensions?.height || 3
  });
  
  const [currentTheme, setCurrentTheme] = useState<RoomTheme>(
    roomData?.theme || {
      name: 'Modern',
      wallColor: '#F8F9FA',
      floorColor: '#E9ECEF'
    }
  );
  
  // Designer state
  const [elements, setElements] = useState<RoomElement[]>(roomData?.elements || []);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [draggedElement, setDraggedElement] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // View controls
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [scale, setScale] = useState(30);
  const [showGrid, setShowGrid] = useState(true);
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  
  // History
  const [history, setHistory] = useState<RoomElement[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // Validation
  const [collisionWarnings, setCollisionWarnings] = useState<string[]>([]);

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

  const handleWizardComplete = (setup: { dimensions: any; theme: RoomTheme }) => {
    setDimensions(setup.dimensions);
    setCurrentTheme(setup.theme);
    setShowWizard(false);
    toast.success("Room setup complete! Start designing your layout.");
  };

  const addElement = (type: string) => {
    const elementTypes = [
      { type: 'bed', defaultSize: { width: 2, height: 1 } },
      { type: 'door', defaultSize: { width: 1, height: 0.2 } },
      { type: 'window', defaultSize: { width: 1.5, height: 0.3 } },
      { type: 'cupboard', defaultSize: { width: 1, height: 0.6 } },
      { type: 'charging-port', defaultSize: { width: 0.2, height: 0.2 } },
      { type: 'light', defaultSize: { width: 0.5, height: 0.5 } },
      { type: 'tv', defaultSize: { width: 1.2, height: 0.8 } },
      { type: 'chair', defaultSize: { width: 0.8, height: 0.8 } },
      { type: 'fire-safety', defaultSize: { width: 0.3, height: 0.3 } },
      { type: 'wall-decor', defaultSize: { width: 0.6, height: 0.4 } },
      { type: 'speaker', defaultSize: { width: 0.4, height: 0.4 } }
    ];
    
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

  const handleZoom = (delta: number) => {
    setScale(Math.max(10, Math.min(50, scale + delta)));
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
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
      setSelectedElement(clickedElement.id);
      setDraggedElement(clickedElement.id);
    } else {
      setSelectedElement(null);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!draggedElement) return;
    
    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const x = snapToGridPosition((e.clientX - rect.left) / scale);
    const y = snapToGridPosition((e.clientY - rect.top) / scale);
    
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

  const clearRoom = () => {
    addToHistory();
    setElements([]);
    setSelectedElement(null);
    toast.success("Room cleared");
  };

  const handleExport = () => {
    toast.info("Export feature coming soon!");
  };

  const handleImport = () => {
    toast.info("Import feature coming soon!");
  };

  useEffect(() => {
    setCollisionWarnings(validateDimensions());
  }, [elements, dimensions]);

  const selectedElementData = elements.find(el => el.id === selectedElement);

  if (showWizard) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" onClick={onClose}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Rooms
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Room Designer</h1>
              <p className="text-gray-600">Create your perfect room layout</p>
            </div>
          </div>
          
          <RoomSetupWizard 
            onComplete={handleWizardComplete}
            initialData={{ dimensions, theme: currentTheme }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onClose}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Rooms
            </Button>
            <div className="flex items-center gap-2">
              <Box className="h-6 w-6 text-purple-500" />
              <h1 className="text-xl font-bold">God-Tier Room Designer</h1>
              {collisionWarnings.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {collisionWarnings.length} Warning{collisionWarnings.length > 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          </div>
          
          <Button 
            variant="outline" 
            onClick={() => setShowWizard(true)}
            className="text-purple-600 hover:text-purple-700"
          >
            Room Setup
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <DesignerToolbar
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onUndo={undo}
        onRedo={redo}
        scale={scale}
        onZoomIn={() => handleZoom(5)}
        onZoomOut={() => handleZoom(-5)}
        showGrid={showGrid}
        onToggleGrid={() => setShowGrid(!showGrid)}
        snapToGrid={snapToGrid}
        onToggleSnap={() => setSnapToGrid(!snapToGrid)}
        viewMode={viewMode}
        onToggleViewMode={() => setViewMode(viewMode === '2d' ? '3d' : '2d')}
        onSave={saveLayout}
        onClear={clearRoom}
        onExport={handleExport}
        onImport={handleImport}
        elementCount={elements.length}
        roomDimensions={dimensions}
      />

      {/* Main Designer Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Element Library */}
        <ElementLibraryPanel
          onAddElement={addElement}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        {/* Canvas */}
        <RoomCanvas
          dimensions={dimensions}
          elements={elements}
          selectedElement={selectedElement}
          theme={currentTheme}
          scale={scale}
          showGrid={showGrid}
          onMouseDown={handleCanvasMouseDown}
          onMouseMove={handleCanvasMouseMove}
          onMouseUp={handleCanvasMouseUp}
          checkCollisions={checkCollisions}
          warnings={collisionWarnings}
        />

        {/* Properties Panel */}
        <PropertiesPanel
          selectedElement={selectedElementData}
          onUpdateElement={updateElement}
          onDeleteElement={deleteElement}
          onRotateElement={rotateElement}
          onDuplicateElement={duplicateElement}
          hasCollision={selectedElementData ? checkCollisions(selectedElementData, selectedElementData.id) : false}
        />
      </div>
    </div>
  );
};
