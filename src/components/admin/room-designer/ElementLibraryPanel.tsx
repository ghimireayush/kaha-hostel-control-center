
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Bed, 
  DoorOpen, 
  Square, 
  Box,
  Zap,
  Lightbulb,
  Tv,
  Armchair,
  Flame,
  ImageIcon,
  Speaker,
  Plus
} from "lucide-react";

export interface ElementType {
  type: string;
  icon: any;
  label: string;
  color: string;
  defaultSize: { width: number; height: number };
  description: string;
  category: 'furniture' | 'fixtures' | 'electrical' | 'safety';
}

const elementTypes: ElementType[] = [
  { 
    type: 'bed', 
    icon: Bed, 
    label: 'Bed', 
    color: '#3B82F6', 
    defaultSize: { width: 2, height: 1 },
    description: 'Single, bunk, or capsule bed',
    category: 'furniture'
  },
  { 
    type: 'door', 
    icon: DoorOpen, 
    label: 'Door', 
    color: '#8B5CF6', 
    defaultSize: { width: 1, height: 0.2 },
    description: 'Room entrance/exit',
    category: 'fixtures'
  },
  { 
    type: 'window', 
    icon: Square, 
    label: 'Window', 
    color: '#10B981', 
    defaultSize: { width: 1.5, height: 0.3 },
    description: 'Natural light source',
    category: 'fixtures'
  },
  { 
    type: 'cupboard', 
    icon: Box, 
    label: 'Cupboard', 
    color: '#F59E0B', 
    defaultSize: { width: 1, height: 0.6 },
    description: 'Storage furniture',
    category: 'furniture'
  },
  { 
    type: 'charging-port', 
    icon: Zap, 
    label: 'Charging Port', 
    color: '#EF4444', 
    defaultSize: { width: 0.2, height: 0.2 },
    description: 'Power outlet for devices',
    category: 'electrical'
  },
  { 
    type: 'light', 
    icon: Lightbulb, 
    label: 'Light', 
    color: '#FBBF24', 
    defaultSize: { width: 0.5, height: 0.5 },
    description: 'Ceiling or wall light',
    category: 'electrical'
  },
  { 
    type: 'tv', 
    icon: Tv, 
    label: 'TV', 
    color: '#1F2937', 
    defaultSize: { width: 1.2, height: 0.8 },
    description: 'Entertainment display',
    category: 'electrical'
  },
  { 
    type: 'chair', 
    icon: Armchair, 
    label: 'Chair/Sofa', 
    color: '#7C3AED', 
    defaultSize: { width: 0.8, height: 0.8 },
    description: 'Seating furniture',
    category: 'furniture'
  },
  { 
    type: 'fire-safety', 
    icon: Flame, 
    label: 'Fire Safety', 
    color: '#DC2626', 
    defaultSize: { width: 0.3, height: 0.3 },
    description: 'Fire extinguisher/alarm',
    category: 'safety'
  },
  { 
    type: 'wall-decor', 
    icon: ImageIcon, 
    label: 'Wall Decor', 
    color: '#9333EA', 
    defaultSize: { width: 0.6, height: 0.4 },
    description: 'Artwork or decoration',
    category: 'fixtures'
  },
  { 
    type: 'speaker', 
    icon: Speaker, 
    label: 'Speaker', 
    color: '#059669', 
    defaultSize: { width: 0.4, height: 0.4 },
    description: 'Audio system',
    category: 'electrical'
  }
];

interface ElementLibraryPanelProps {
  onAddElement: (type: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export const ElementLibraryPanel = ({ onAddElement, selectedCategory, onCategoryChange }: ElementLibraryPanelProps) => {
  const categories = [
    { id: 'all', label: 'All Items', count: elementTypes.length },
    { id: 'furniture', label: 'Furniture', count: elementTypes.filter(e => e.category === 'furniture').length },
    { id: 'fixtures', label: 'Fixtures', count: elementTypes.filter(e => e.category === 'fixtures').length },
    { id: 'electrical', label: 'Electrical', count: elementTypes.filter(e => e.category === 'electrical').length },
    { id: 'safety', label: 'Safety', count: elementTypes.filter(e => e.category === 'safety').length },
  ];

  const filteredElements = selectedCategory === 'all' 
    ? elementTypes 
    : elementTypes.filter(e => e.category === selectedCategory);

  return (
    <TooltipProvider>
      <div className="w-80 bg-white border-r border-gray-200 h-full flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Box className="h-5 w-5 text-purple-500" />
            Element Library
          </h3>
          
          {/* Category Filters */}
          <div className="space-y-2">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "ghost"}
                size="sm"
                onClick={() => onCategoryChange(category.id)}
                className="w-full justify-between text-left"
              >
                <span>{category.label}</span>
                <Badge variant="secondary" className="ml-2">
                  {category.count}
                </Badge>
              </Button>
            ))}
          </div>
        </div>

        {/* Elements Grid */}
        <div className="flex-1 p-4 overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            {filteredElements.map((element) => {
              const Icon = element.icon;
              return (
                <Tooltip key={element.type}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      className="h-20 flex flex-col items-center gap-2 p-3 hover:scale-105 transition-transform cursor-grab active:cursor-grabbing"
                      onClick={() => onAddElement(element.type)}
                      style={{ borderColor: element.color + '40' }}
                    >
                      <Icon 
                        className="h-6 w-6" 
                        style={{ color: element.color }}
                      />
                      <span className="text-xs text-center leading-tight">
                        {element.label}
                      </span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <div className="text-center">
                      <p className="font-medium">{element.label}</p>
                      <p className="text-sm text-gray-600">{element.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Size: {element.defaultSize.width}m × {element.defaultSize.height}m
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>

          {/* Add Custom Element */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <Button
              variant="dashed"
              className="w-full h-16 flex flex-col items-center gap-2 border-2 border-dashed border-gray-300 hover:border-purple-400 text-gray-600 hover:text-purple-600"
            >
              <Plus className="h-5 w-5" />
              <span className="text-sm">Add Custom Item</span>
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-xs text-gray-600 space-y-1">
            <div className="flex justify-between">
              <span>Total Elements:</span>
              <span className="font-medium">{filteredElements.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Category:</span>
              <span className="font-medium capitalize">{selectedCategory}</span>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export { elementTypes };
