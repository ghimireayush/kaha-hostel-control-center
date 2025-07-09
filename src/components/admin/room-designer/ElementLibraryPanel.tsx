
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  Plus,
  Search,
  Filter,
  Sparkles,
  Copy,
  Wand2
} from "lucide-react";

export interface ElementType {
  type: string;
  icon: any;
  label: string;
  color: string;
  defaultSize: { width: number; height: number };
  description: string;
  category: 'furniture' | 'fixtures' | 'electrical' | 'safety' | 'decor';
  tags: string[];
  popular?: boolean;
}

const elementTypes: ElementType[] = [
  { 
    type: 'bed', 
    icon: Bed, 
    label: 'Bed', 
    color: '#3B82F6', 
    defaultSize: { width: 2, height: 1 },
    description: 'Single, bunk, or capsule bed',
    category: 'furniture',
    tags: ['sleep', 'bedroom', 'furniture'],
    popular: true
  },
  { 
    type: 'door', 
    icon: DoorOpen, 
    label: 'Door', 
    color: '#8B5CF6', 
    defaultSize: { width: 1, height: 0.2 },
    description: 'Room entrance/exit',
    category: 'fixtures',
    tags: ['entrance', 'access', 'door'],
    popular: true
  },
  { 
    type: 'window', 
    icon: Square, 
    label: 'Window', 
    color: '#10B981', 
    defaultSize: { width: 1.5, height: 0.3 },
    description: 'Natural light source',
    category: 'fixtures',
    tags: ['light', 'view', 'window'],
    popular: true
  },
  { 
    type: 'cupboard', 
    icon: Box, 
    label: 'Cupboard', 
    color: '#F59E0B', 
    defaultSize: { width: 1, height: 0.6 },
    description: 'Storage furniture',
    category: 'furniture',
    tags: ['storage', 'cabinet', 'organize'],
    popular: true
  },
  { 
    type: 'charging-port', 
    icon: Zap, 
    label: 'Charging Port', 
    color: '#EF4444', 
    defaultSize: { width: 0.2, height: 0.2 },
    description: 'Power outlet for devices',
    category: 'electrical',
    tags: ['power', 'charge', 'electricity'],
    popular: true
  },
  { 
    type: 'light', 
    icon: Lightbulb, 
    label: 'Light', 
    color: '#FBBF24', 
    defaultSize: { width: 0.5, height: 0.5 },
    description: 'Ceiling or wall light',
    category: 'electrical',
    tags: ['lighting', 'illumination', 'bulb']
  },
  { 
    type: 'tv', 
    icon: Tv, 
    label: 'TV', 
    color: '#1F2937', 
    defaultSize: { width: 1.2, height: 0.8 },
    description: 'Entertainment display',
    category: 'electrical',
    tags: ['entertainment', 'screen', 'media']
  },
  { 
    type: 'chair', 
    icon: Armchair, 
    label: 'Chair/Sofa', 
    color: '#7C3AED', 
    defaultSize: { width: 0.8, height: 0.8 },
    description: 'Seating furniture',
    category: 'furniture',
    tags: ['seating', 'comfort', 'furniture']
  },
  { 
    type: 'fire-safety', 
    icon: Flame, 
    label: 'Fire Safety', 
    color: '#DC2626', 
    defaultSize: { width: 0.3, height: 0.3 },
    description: 'Fire extinguisher/alarm',
    category: 'safety',
    tags: ['safety', 'fire', 'emergency']
  },
  { 
    type: 'wall-decor', 
    icon: ImageIcon, 
    label: 'Wall Decor', 
    color: '#9333EA', 
    defaultSize: { width: 0.6, height: 0.4 },
    description: 'Artwork or decoration',
    category: 'decor',
    tags: ['art', 'decoration', 'wall']
  },
  { 
    type: 'speaker', 
    icon: Speaker, 
    label: 'Speaker', 
    color: '#059669', 
    defaultSize: { width: 0.4, height: 0.4 },
    description: 'Audio system',
    category: 'electrical',
    tags: ['audio', 'sound', 'music']
  }
];

interface ElementLibraryPanelProps {
  onAddElement: (type: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  onDuplicateMode?: (enabled: boolean) => void;
  duplicateMode?: boolean;
}

export const ElementLibraryPanel = ({ 
  onAddElement, 
  selectedCategory, 
  onCategoryChange,
  onDuplicateMode,
  duplicateMode = false
}: ElementLibraryPanelProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showPopularOnly, setShowPopularOnly] = useState(false);

  const categories = [
    { id: 'all', label: 'All Items', count: elementTypes.length, icon: Box },
    { id: 'popular', label: 'Popular', count: elementTypes.filter(e => e.popular).length, icon: Sparkles },
    { id: 'furniture', label: 'Furniture', count: elementTypes.filter(e => e.category === 'furniture').length, icon: Armchair },
    { id: 'fixtures', label: 'Fixtures', count: elementTypes.filter(e => e.category === 'fixtures').length, icon: Square },
    { id: 'electrical', label: 'Electrical', count: elementTypes.filter(e => e.category === 'electrical').length, icon: Zap },
    { id: 'safety', label: 'Safety', count: elementTypes.filter(e => e.category === 'safety').length, icon: Flame },
    { id: 'decor', label: 'Decor', count: elementTypes.filter(e => e.category === 'decor').length, icon: ImageIcon },
  ];

  const getFilteredElements = () => {
    let filtered = elementTypes;

    // Apply category filter
    if (selectedCategory === 'popular') {
      filtered = filtered.filter(e => e.popular);
    } else if (selectedCategory !== 'all') {
      filtered = filtered.filter(e => e.category === selectedCategory);
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(e => 
        e.label.toLowerCase().includes(query) ||
        e.description.toLowerCase().includes(query) ||
        e.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    return filtered;
  };

  const filteredElements = getFilteredElements();

  const handleElementClick = (elementType: string) => {
    onAddElement(elementType);
  };

  const handleDragStart = (e: React.DragEvent, elementType: string) => {
    e.dataTransfer.setData('text/plain', elementType);
    e.dataTransfer.effectAllowed = 'copy';
    
    // Add visual feedback
    const dragImage = e.currentTarget.cloneNode(true) as HTMLElement;
    dragImage.style.transform = 'rotate(5deg) scale(1.1)';
    dragImage.style.opacity = '0.8';
    e.dataTransfer.setDragImage(dragImage, 50, 50);
  };

  return (
    <TooltipProvider>
      <div className="w-80 bg-white border-r border-gray-200 h-full flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Box className="h-5 w-5 text-purple-500" />
            Element Library
            {duplicateMode && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                <Copy className="h-3 w-3 mr-1" />
                Duplicate Mode
              </Badge>
            )}
          </h3>
          
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search elements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 text-sm"
            />
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2 mb-4">
            <Button
              size="sm"
              variant={duplicateMode ? "default" : "outline"}
              onClick={() => onDuplicateMode?.(!duplicateMode)}
              className="flex-1"
            >
              <Copy className="h-4 w-4 mr-1" />
              {duplicateMode ? 'Exit' : 'Duplicate'}
            </Button>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  variant="outline"
                  className="px-3"
                >
                  <Wand2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Auto-suggest layout (coming soon)</p>
              </TooltipContent>
            </Tooltip>
          </div>
          
          {/* Category Filters */}
          <div className="space-y-2">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onCategoryChange(category.id)}
                  className="w-full justify-between text-left hover:scale-[1.02] transition-transform"
                >
                  <div className="flex items-center gap-2">
                    <IconComponent className="h-4 w-4" />
                    <span>{category.label}</span>
                  </div>
                  <Badge variant="secondary" className="ml-2">
                    {category.count}
                  </Badge>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Elements Grid */}
        <div className="flex-1 p-4 overflow-y-auto">
          {filteredElements.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No elements found</p>
              <p className="text-xs">Try a different search or category</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filteredElements.map((element) => {
                const Icon = element.icon;
                return (
                  <Tooltip key={element.type}>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        className="h-20 flex flex-col items-center gap-2 p-3 hover:scale-105 transition-all duration-200 cursor-grab active:cursor-grabbing relative group"
                        onClick={() => handleElementClick(element.type)}
                        draggable
                        onDragStart={(e) => handleDragStart(e, element.type)}
                        style={{ 
                          borderColor: element.color + '40',
                          background: selectedCategory === 'popular' && element.popular 
                            ? 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)' 
                            : undefined
                        }}
                      >
                        {element.popular && (
                          <Sparkles className="absolute top-1 right-1 h-3 w-3 text-yellow-500" />
                        )}
                        <Icon 
                          className="h-6 w-6 group-hover:scale-110 transition-transform" 
                          style={{ color: element.color }}
                        />
                        <span className="text-xs text-center leading-tight font-medium">
                          {element.label}
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-xs">
                      <div className="text-center">
                        <p className="font-medium">{element.label}</p>
                        <p className="text-sm text-gray-600 mb-2">{element.description}</p>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {element.tags.slice(0, 3).map(tag => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500">
                          Size: {element.defaultSize.width}m × {element.defaultSize.height}m
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                          💡 Click to add • Drag to place
                        </p>
                      </div>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
          )}

          {/* Add Custom Element */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              className="w-full h-16 flex flex-col items-center gap-2 border-2 border-dashed border-gray-300 hover:border-purple-400 text-gray-600 hover:text-purple-600 hover:bg-purple-50 transition-all duration-200"
            >
              <Plus className="h-5 w-5" />
              <span className="text-sm font-medium">Add Custom Item</span>
            </Button>
          </div>
        </div>

        {/* Quick Stats & Tips */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-xs text-gray-600 space-y-2">
            <div className="flex justify-between items-center">
              <span>Showing {filteredElements.length} elements</span>
              <Badge variant="outline" className="text-xs">
                {selectedCategory === 'all' ? 'All' : selectedCategory}
              </Badge>
            </div>
            
            {searchQuery && (
              <div className="text-blue-600 bg-blue-50 p-2 rounded text-center">
                🔍 "{searchQuery}" - {filteredElements.length} found
              </div>
            )}
            
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-2 rounded text-center">
              <p className="text-purple-700 font-medium text-xs">
                💡 Pro Tip: Alt + Drag = Duplicate
              </p>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export { elementTypes };
