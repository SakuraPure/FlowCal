import { useState } from 'react';
import { useStore, type Folder } from '@/store/useStore';
import clsx from 'clsx';
import { ChevronRight, ChevronDown, Folder as FolderIcon,
  // Essentials
  Inbox, Calendar, List, CheckSquare, Clock, CheckCircle2, Timer, Archive, Trash2, Bell, Bookmark, Tag, Search, Filter, Settings, Share, Link,
  // Life & Work
  Briefcase, User, GraduationCap, Building, Banknote, Wallet, CreditCard, ShoppingCart, ShoppingBag, Gift,
  // Home & Living
  Home, Coffee, Utensils, Bed, Key, Sofa,
  // Nature & Travel
  Sun, Moon, Cloud, Droplets, Zap, Flame, Snowflake, Trees, Sprout, Map, MapPin, Plane, Car, Bike, Train, Truck, Rocket, Umbrella, Tent,
  // Tech
  Monitor, Laptop, Smartphone, Wifi, Bluetooth, Globe, Server, Database, Code, Terminal, Cpu, Mouse, Keyboard, Headphones, Speaker,
  // Media
  Image, Video, Film, Music, Mic, Book, BookOpen, Newspaper, Camera, Gamepad, Play, Pause, Volume2,
  // Misc
  Star, Heart, Flag, Trophy, Medal, Crown, Smile, Frown, Ghost, Skull, Palette, Lightbulb, Lock, Unlock, Eye, Shield
} from 'lucide-react';
import { useDroppable } from '@dnd-kit/core';
import { useTranslation } from 'react-i18next';

interface FolderTreeProps {
  parentId: string | null;
  level?: number;
}

export const FolderTree = ({ parentId, level = 0 }: FolderTreeProps) => {
  const { folders, currentFolderId, setCurrentFolderId } = useStore();
  const currentLevelFolders = folders.filter(f => f.parentId === parentId);

  if (currentLevelFolders.length === 0) return null;

  return (
    <div className="flex flex-col gap-1">
      {currentLevelFolders.map((folder) => (
        <FolderItem 
          key={folder.id} 
          folder={folder} 
          level={level} 
          isActive={currentFolderId === folder.id}
          onClick={() => setCurrentFolderId(folder.id)}
        />
      ))}
    </div>
  );
};

interface FolderItemProps {
  folder: Folder;
  level: number;
  isActive: boolean;
  onClick: () => void;
}

const FolderItem = ({ folder, level, isActive, onClick }: FolderItemProps) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(true);
  const { folders, deleteFolder } = useStore();
  const hasChildren = folders.some(f => f.parentId === folder.id);

  const { isOver, setNodeRef } = useDroppable({
    id: `folder-${folder.id}`,
    data: { type: 'folder', folderId: folder.id },
  });

  const getIcon = () => {
    if (folder.icon === 'inbox') return <Inbox size={16} />;
    if (folder.id === 'in_progress') return <Clock size={16} className="text-blue-500" />;
    if (folder.id === 'done') return <CheckCircle2 size={16} className="text-green-500" />;
    if (folder.name === 'Work') return <Briefcase size={16} />;
    if (folder.name === 'Personal') return <User size={16} />;
    
    // Dynamic icons
    // We map common IDs to icons components
    const LucideIcons: Record<string, React.ElementType> = {
      // Essentials
      folder: FolderIcon, inbox: Inbox, calendar: Calendar, list: List, 'check-square': CheckSquare, clock: Clock, timer: Timer, archive: Archive, 'trash-2': Trash2, bell: Bell, bookmark: Bookmark, tag: Tag, search: Search, filter: Filter, settings: Settings, share: Share, link: Link,
      // Life & Work
      briefcase: Briefcase, user: User, 'graduation-cap': GraduationCap, building: Building, banknote: Banknote, wallet: Wallet, 'credit-card': CreditCard, 'shopping-cart': ShoppingCart, 'shopping-bag': ShoppingBag, gift: Gift,
      // Home & Living
      home: Home, coffee: Coffee, utensils: Utensils, bed: Bed, key: Key, sofa: Sofa,
      // Nature & Travel
      sun: Sun, moon: Moon, cloud: Cloud, droplets: Droplets, zap: Zap, flame: Flame, snowflake: Snowflake, trees: Trees, sprout: Sprout, map: Map, 'map-pin': MapPin, plane: Plane, car: Car, bike: Bike, train: Train, truck: Truck, rocket: Rocket, umbrella: Umbrella, tent: Tent,
      // Tech
      monitor: Monitor, laptop: Laptop, smartphone: Smartphone, wifi: Wifi, bluetooth: Bluetooth, globe: Globe, server: Server, database: Database, code: Code, terminal: Terminal, cpu: Cpu, mouse: Mouse, keyboard: Keyboard, headphones: Headphones, speaker: Speaker,
      // Media
      image: Image, video: Video, film: Film, music: Music, mic: Mic, book: Book, 'book-open': BookOpen, newspaper: Newspaper, camera: Camera, gamepad: Gamepad, play: Play, pause: Pause, 'volume-2': Volume2,
      // Misc
      star: Star, heart: Heart, flag: Flag, trophy: Trophy, medal: Medal, crown: Crown, smile: Smile, frown: Frown, ghost: Ghost, skull: Skull, palette: Palette, lightbulb: Lightbulb, lock: Lock, unlock: Unlock, eye: Eye, shield: Shield
    };

    const IconComponent = folder.icon ? LucideIcons[folder.icon] : null;
    if (IconComponent) {
      return <IconComponent size={16} className={clsx(folder.color && `text-${folder.color}-500`)} />;
    }
    
    // Fallback: Assume it's an emoji
    return <span className="text-base leading-none">{folder.icon || '📁'}</span>;
  };

  return (
    <div>
      <div 
        ref={setNodeRef}
        className={clsx(
          "group flex items-center gap-1.5 pr-2 py-2 rounded-lg cursor-pointer transition-colors text-sm font-medium relative",
          isActive ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50",
          isOver && "bg-blue-100 ring-2 ring-blue-300"
        )}
        style={{ paddingLeft: `${level * 10 + 4}px` }}
        onClick={onClick}
      >
        <button 
          className={clsx("p-0.5 rounded hover:bg-gray-200 text-gray-400", !hasChildren && "invisible")}
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
        >
          {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        </button>
        
        {getIcon()}
        <span className="truncate flex-1">{folder.id === 'inbox' || folder.name === 'Inbox' ? t('inbox') : folder.name}</span>
        
        {/* Delete Button */}
        {folder.id !== 'inbox' && (
           <button
             onClick={(e) => {
               e.stopPropagation();
               if (confirm(t('common.delete') + '?')) {
                   deleteFolder(folder.id);
               }
             }}
             className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
             title={t('common.delete')}
           >
             <Trash2 size={14} />
           </button>
        )}
      </div>

      {hasChildren && isExpanded && (
        <FolderTree parentId={folder.id} level={level + 1} />
      )}
    </div>
  );
};
