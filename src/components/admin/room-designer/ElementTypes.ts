
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
  Desk,
  Bath,
  Trash2,
  Luggage,
  Wind,
  Bell,
  BookOpen,
  Headphones,
  Monitor,
  Fan
} from "lucide-react";

export interface ElementType {
  type: string;
  icon: any;
  emoji: string;
  label: string;
  color: string;
  defaultSize: { width: number; height: number };
  description: string;
  category: 'beds' | 'study' | 'openings' | 'utilities' | 'furniture' | 'fixtures';
  tags: string[];
  popular?: boolean;
  customizable?: {
    bedType?: boolean;
    orientation?: boolean;
    size?: boolean;
    bedId?: boolean;
    position?: boolean;
    drawers?: boolean;
    brightness?: boolean;
    type?: boolean;
    hinge?: boolean;
    openClose?: boolean;
  };
}

export const elementTypes: ElementType[] = [
  // BEDS CATEGORY
  { 
    type: 'single-bed', 
    icon: Bed, 
    emoji: '🛏️',
    label: 'Single Bed', 
    color: '#3B82F6', 
    defaultSize: { width: 2, height: 1 },
    description: 'Standard single bed',
    category: 'beds',
    tags: ['sleep', 'bedroom', 'single'],
    popular: true,
    customizable: { bedType: true, orientation: true, size: true, bedId: true }
  },
  { 
    type: 'bunk-bed', 
    icon: Bed, 
    emoji: '🛏️',
    label: 'Bunk Bed', 
    color: '#1E40AF', 
    defaultSize: { width: 2.2, height: 1.2 },
    description: 'Space-saving bunk bed with top/bottom options',
    category: 'beds',
    tags: ['sleep', 'bedroom', 'bunk', 'space-saving'],
    popular: true,
    customizable: { bedType: true, orientation: true, position: true, bedId: true }
  },
  { 
    type: 'double-bed', 
    icon: Bed, 
    emoji: '🛌',
    label: 'Double Bed', 
    color: '#1D4ED8', 
    defaultSize: { width: 2.5, height: 1.5 },
    description: 'Spacious double bed',
    category: 'beds',
    tags: ['sleep', 'bedroom', 'double', 'spacious'],
    customizable: { orientation: true, size: true, bedId: true }
  },
  { 
    type: 'kids-bed', 
    icon: Bed, 
    emoji: '🧸',
    label: 'Kids Bed', 
    color: '#F59E0B', 
    defaultSize: { width: 1.8, height: 0.9 },
    description: 'Smaller bed designed for children',
    category: 'beds',
    tags: ['sleep', 'bedroom', 'kids', 'small'],
    customizable: { orientation: true, bedId: true }
  },

  // STUDY ZONE CATEGORY
  { 
    type: 'study-table', 
    icon: Desk, 
    emoji: '🪵',
    label: 'Study Table', 
    color: '#8B5CF6', 
    defaultSize: { width: 1.2, height: 0.6 },
    description: 'Wooden/metal study desk with optional drawers',
    category: 'study',
    tags: ['study', 'desk', 'work', 'furniture'],
    popular: true,
    customizable: { size: true, drawers: true, type: true }
  },
  { 
    type: 'study-chair', 
    icon: Armchair, 
    emoji: '🪑',
    label: 'Study Chair', 
    color: '#7C3AED', 
    defaultSize: { width: 0.6, height: 0.6 },
    description: 'Ergonomic chair for studying',
    category: 'study',
    tags: ['seating', 'study', 'chair', 'comfort'],
    popular: true,
    customizable: { type: true }
  },
  { 
    type: 'study-lamp', 
    icon: Lightbulb, 
    emoji: '💡',
    label: 'Study Lamp', 
    color: '#FBBF24', 
    defaultSize: { width: 0.3, height: 0.3 },
    description: 'Adjustable desk lamp with brightness control',
    category: 'study',
    tags: ['lighting', 'study', 'lamp', 'adjustable'],
    customizable: { brightness: true, type: true }
  },
  { 
    type: 'monitor', 
    icon: Monitor, 
    emoji: '🖥️',
    label: 'Monitor', 
    color: '#1F2937', 
    defaultSize: { width: 0.8, height: 0.5 },
    description: 'Desk-mounted computer monitor',
    category: 'study',
    tags: ['technology', 'monitor', 'screen', 'desk'],
    customizable: { size: true }
  },
  { 
    type: 'charging-port', 
    icon: Zap, 
    emoji: '🔌',
    label: 'Charging Port', 
    color: '#EF4444', 
    defaultSize: { width: 0.2, height: 0.2 },
    description: 'USB/Type-C charging station',
    category: 'study',
    tags: ['power', 'charge', 'electricity', 'USB'],
    popular: true,
    customizable: { type: true }
  },
  { 
    type: 'headphone-hanger', 
    icon: Headphones, 
    emoji: '🎧',
    label: 'Headphone Hanger', 
    color: '#059669', 
    defaultSize: { width: 0.2, height: 0.2 },
    description: 'Wall or desk-mounted headphone storage',
    category: 'study',
    tags: ['audio', 'storage', 'headphones', 'accessories']
  },
  { 
    type: 'bookshelf', 
    icon: BookOpen, 
    emoji: '📚',
    label: 'Bookshelf', 
    color: '#92400E', 
    defaultSize: { width: 0.8, height: 1.8 },
    description: 'Storage for books and study materials',
    category: 'study',
    tags: ['storage', 'books', 'study', 'shelving'],
    customizable: { size: true }
  },

  // OPENINGS & STRUCTURE
  { 
    type: 'door', 
    icon: DoorOpen, 
    emoji: '🚪',
    label: 'Door', 
    color: '#8B5CF6', 
    defaultSize: { width: 1, height: 0.2 },
    description: 'Room entrance with left/right hinge options',
    category: 'openings',
    tags: ['entrance', 'access', 'door'],
    popular: true,
    customizable: { hinge: true }
  },
  { 
    type: 'window', 
    icon: Square, 
    emoji: '🪟',
    label: 'Window', 
    color: '#10B981', 
    defaultSize: { width: 1.5, height: 0.3 },
    description: 'Natural light source with open/close toggle',
    category: 'openings',
    tags: ['light', 'view', 'window', 'ventilation'],
    popular: true,
    customizable: { size: true, openClose: true }
  },
  { 
    type: 'wall-partition', 
    icon: Square, 
    emoji: '🧱',
    label: 'Wall Partition', 
    color: '#6B7280', 
    defaultSize: { width: 2, height: 0.2 },
    description: 'Room divider or partition wall',
    category: 'openings',
    tags: ['wall', 'partition', 'divider', 'structure'],
    customizable: { size: true }
  },
  { 
    type: 'room-label', 
    icon: ImageIcon, 
    emoji: '🚩',
    label: 'Room Label', 
    color: '#DC2626', 
    defaultSize: { width: 0.5, height: 0.3 },
    description: 'Room identification and labeling',
    category: 'openings',
    tags: ['label', 'identification', 'signage']
  },

  // UTILITIES & OTHER ELEMENTS
  { 
    type: 'toilet', 
    icon: Bath, 
    emoji: '🚽',
    label: 'Toilet', 
    color: '#0891B2', 
    defaultSize: { width: 0.6, height: 0.8 },
    description: 'Bathroom toilet for suite rooms',
    category: 'utilities',
    tags: ['bathroom', 'toilet', 'sanitary', 'suite']
  },
  { 
    type: 'shower', 
    icon: Bath, 
    emoji: '🚿',
    label: 'Shower', 
    color: '#0EA5E9', 
    defaultSize: { width: 1, height: 1 },
    description: 'Shower area with enclosure',
    category: 'utilities',
    tags: ['bathroom', 'shower', 'bathing', 'sanitary']
  },
  { 
    type: 'wash-basin', 
    icon: Bath, 
    emoji: '🧼',
    label: 'Wash Basin', 
    color: '#06B6D4', 
    defaultSize: { width: 0.6, height: 0.4 },
    description: 'Hand washing and grooming station',
    category: 'utilities',
    tags: ['bathroom', 'sink', 'washing', 'hygiene']
  },
  { 
    type: 'dustbin', 
    icon: Trash2, 
    emoji: '🚮',
    label: 'Dustbin', 
    color: '#65A30D', 
    defaultSize: { width: 0.3, height: 0.4 },
    description: 'Waste disposal container',
    category: 'utilities',
    tags: ['waste', 'trash', 'cleaning', 'hygiene']
  },
  { 
    type: 'luggage-rack', 
    icon: Luggage, 
    emoji: '🧳',
    label: 'Luggage Rack', 
    color: '#A3A3A3', 
    defaultSize: { width: 1, height: 0.5 },
    description: 'Storage rack for suitcases and bags',
    category: 'utilities',
    tags: ['storage', 'luggage', 'bags', 'travel']
  },
  { 
    type: 'fire-extinguisher', 
    icon: Flame, 
    emoji: '🧯',
    label: 'Fire Extinguisher', 
    color: '#DC2626', 
    defaultSize: { width: 0.3, height: 0.3 },
    description: 'Emergency fire safety equipment',
    category: 'utilities',
    tags: ['safety', 'fire', 'emergency', 'protection'],
    popular: true
  },
  { 
    type: 'locker', 
    icon: Box, 
    emoji: '🗄️',
    label: 'Personal Locker', 
    color: '#F59E0B', 
    defaultSize: { width: 0.4, height: 1.8 },
    description: 'Secure personal storage locker',
    category: 'utilities',
    tags: ['storage', 'security', 'personal', 'locker'],
    popular: true
  },
  { 
    type: 'laundry-basket', 
    icon: Box, 
    emoji: '🧺',
    label: 'Laundry Basket', 
    color: '#8B5CF6', 
    defaultSize: { width: 0.5, height: 0.6 },
    description: 'Clothes storage and organization',
    category: 'utilities',
    tags: ['laundry', 'clothes', 'storage', 'organization']
  },
  { 
    type: 'fan', 
    icon: Fan, 
    emoji: '🌬️',
    label: 'Ceiling Fan', 
    color: '#374151', 
    defaultSize: { width: 1.2, height: 1.2 },
    description: 'Ceiling-mounted ventilation fan',
    category: 'utilities',
    tags: ['ventilation', 'cooling', 'air', 'ceiling']
  },
  { 
    type: 'ac-unit', 
    icon: Wind, 
    emoji: '❄️',
    label: 'AC Unit', 
    color: '#0EA5E9', 
    defaultSize: { width: 0.8, height: 0.4 },
    description: 'Air conditioning unit for climate control',
    category: 'utilities',
    tags: ['cooling', 'climate', 'air-conditioning', 'comfort']
  },
  { 
    type: 'call-button', 
    icon: Bell, 
    emoji: '🔔',
    label: 'Call Button', 
    color: '#F59E0B', 
    defaultSize: { width: 0.2, height: 0.2 },
    description: 'Emergency or service call button',
    category: 'utilities',
    tags: ['communication', 'emergency', 'service', 'call']
  }
];

export const categories = [
  { id: 'all', label: 'All Items', count: elementTypes.length, emoji: '📦' },
  { id: 'popular', label: 'Popular', count: elementTypes.filter(e => e.popular).length, emoji: '⭐' },
  { id: 'beds', label: 'Beds', count: elementTypes.filter(e => e.category === 'beds').length, emoji: '🛏️' },
  { id: 'study', label: 'Study Zone', count: elementTypes.filter(e => e.category === 'study').length, emoji: '📚' },
  { id: 'openings', label: 'Openings & Structure', count: elementTypes.filter(e => e.category === 'openings').length, emoji: '🚪' },
  { id: 'utilities', label: 'Utilities & Others', count: elementTypes.filter(e => e.category === 'utilities').length, emoji: '🧹' },
];
