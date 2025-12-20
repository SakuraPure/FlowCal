import clsx from 'clsx';
import { useState, useRef, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { DraggableTask } from '@/components/dnd/DraggableTask';
import { TaskDetailModal } from '@/components/task/TaskDetailModal';
import { FolderTree } from '@/components/inbox/FolderTree';
import { Plus, FolderPlus, PanelLeftClose, PanelLeftOpen, X, Folder as FolderIcon,
  // Essentials
  Inbox, Calendar, List, CheckSquare, Clock, Timer, Archive, Trash2, Bell, Bookmark, Tag, Search, Filter, Settings, Share, Link,
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
import { v4 as uuidv4 } from 'uuid';
import { ThemeToggle } from '@/components/common/ThemeToggle';
// import { LanguageToggle } from '@/components/common/LanguageToggle'; // Removed per user feedback
import { useTranslation } from 'react-i18next';

export const InboxPane = () => {
  const { t } = useTranslation();
  const { tasks, addTask, currentFolderId, addFolder } = useStore();
  
  // Filter tasks by current folder
  // Filter tasks by current folder
  const filteredTasks = tasks.filter(t => {
    if (currentFolderId === 'inbox') {
      return t.listId === 'inbox' && t.status === 'todo';
    }
    if (currentFolderId === 'in_progress') {
      return t.status === 'in_progress';
    }
    if (currentFolderId === 'done') {
      return t.status === 'done';
    }
    // For other folders, show tasks in that list
    return t.listId === currentFolderId;
  });
  
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Sidebar State
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAddingFolder, setIsAddingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderIcon, setNewFolderIcon] = useState('folder');
  const [iconTab, setIconTab] = useState<'icon' | 'emoji'>('icon');
  const newFolderInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAddingFolder && newFolderInputRef.current) {
      newFolderInputRef.current.focus();
    }
  }, [isAddingFolder]);

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    addTask({
      id: uuidv4(),
      title: newTaskTitle,
      status: 'todo',
      listId: currentFolderId === 'inbox' ? 'inbox' : currentFolderId,
      priority: 'medium',
      tags: [],
      subtasks: []
    });
    setNewTaskTitle('');
  };

  const startAddFolder = () => {
    setIsAddingFolder(true);
    setNewFolderName('');
    setNewFolderIcon('folder');
    setIconTab('icon');
    if (!isSidebarOpen) setIsSidebarOpen(true);
  };

  const confirmAddFolder = () => {
    if (newFolderName.trim()) {
      addFolder({
        id: uuidv4(),
        name: newFolderName.trim(),
        parentId: null,
        icon: newFolderIcon,
        color: 'gray'
      });
    }
    setIsAddingFolder(false);
    setNewFolderName('');
  };

  const cancelAddFolder = () => {
    setIsAddingFolder(false);
    setNewFolderName('');
  };

  const handleTaskClick = (taskId: string) => {
    setSelectedTaskId(taskId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTaskId(null);
  };

  return (
    <div className={clsx(
      "h-full w-full",
      "bg-white dark:bg-gray-900",
      "rounded-3xl",
      "shadow-xl shadow-gray-200/50 dark:shadow-black/50",
      "border border-gray-100 dark:border-gray-800",
      "flex overflow-hidden relative"
    )}>
      {/* Sidebar Toggle (Absolute) */}
      <button 
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="absolute left-3 top-3 z-50 text-gray-400 hover:text-gray-600 transition-colors"
      >
        {isSidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
      </button>

      {/* Sidebar */}
      <div className={clsx(
        "bg-gray-50/50 dark:bg-gray-900/50 border-r border-gray-100 dark:border-gray-800 flex flex-col transition-all duration-300 ease-in-out overflow-hidden catch-error",
        isSidebarOpen ? "w-40 opacity-100 py-3 px-2" : "w-0 opacity-0 p-0 border-none"
      )}>
        <div className="flex justify-between items-center mb-4 px-2 mt-8 h-6 relative">
          {isAddingFolder ? (
            <div className="absolute inset-x-0 -top-2 bg-white dark:bg-gray-800 p-2 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-center gap-2 mb-2">
                 <input
                  ref={newFolderInputRef}
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') confirmAddFolder();
                    if (e.key === 'Escape') cancelAddFolder();
                  }}
                  className="w-full text-xs border border-gray-200 rounded p-1.5 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
                  placeholder={t('tasks.add_task')} // "New List..."
                />
              </div>
              
              {/* Icon Picker */}
              {/* Icon Type Tabs */}
              <div className="flex gap-2 mb-2 pb-2 border-b border-gray-100 dark:border-gray-700">
                  <button 
                      onClick={() => setIconTab('icon')}
                      className={clsx("text-xs font-bold px-2 py-1 rounded-md transition-colors", iconTab === 'icon' ? "bg-black text-white" : "text-gray-400 hover:text-gray-600")}
                  >
                      Icons
                  </button>
                  <button 
                      onClick={() => setIconTab('emoji')}
                      className={clsx("text-xs font-bold px-2 py-1 rounded-md transition-colors", iconTab === 'emoji' ? "bg-black text-white" : "text-gray-400 hover:text-gray-600")}
                  >
                      Emoji
                  </button>
              </div>

              {/* Icon Picker Grid */}
              <div className="flex flex-wrap gap-1 mb-2 max-h-48 overflow-y-auto no-scrollbar content-start">
                {iconTab === 'icon' ? (
                    // Lucide Icons
                    [
                      // Essentials
                      { id: 'folder', icon: FolderIcon }, { id: 'inbox', icon: Inbox }, { id: 'calendar', icon: Calendar }, { id: 'list', icon: List }, { id: 'check-square', icon: CheckSquare }, { id: 'clock', icon: Clock }, { id: 'timer', icon: Timer }, { id: 'archive', icon: Archive }, { id: 'trash-2', icon: Trash2 }, { id: 'bell', icon: Bell }, { id: 'bookmark', icon: Bookmark }, { id: 'tag', icon: Tag }, { id: 'search', icon: Search }, { id: 'filter', icon: Filter }, { id: 'settings', icon: Settings }, { id: 'share', icon: Share }, { id: 'link', icon: Link },
                      // Life & Work
                      { id: 'briefcase', icon: Briefcase }, { id: 'user', icon: User }, { id: 'graduation-cap', icon: GraduationCap }, { id: 'building', icon: Building }, { id: 'banknote', icon: Banknote }, { id: 'wallet', icon: Wallet }, { id: 'credit-card', icon: CreditCard }, { id: 'shopping-cart', icon: ShoppingCart }, { id: 'shopping-bag', icon: ShoppingBag }, { id: 'gift', icon: Gift },
                      // Home
                      { id: 'home', icon: Home }, { id: 'coffee', icon: Coffee }, { id: 'utensils', icon: Utensils }, { id: 'bed', icon: Bed }, { id: 'key', icon: Key }, { id: 'sofa', icon: Sofa },
                      // Nature & Travel
                      { id: 'sun', icon: Sun }, { id: 'moon', icon: Moon }, { id: 'cloud', icon: Cloud }, { id: 'droplets', icon: Droplets }, { id: 'zap', icon: Zap }, { id: 'flame', icon: Flame }, { id: 'snowflake', icon: Snowflake }, { id: 'trees', icon: Trees }, { id: 'sprout', icon: Sprout }, { id: 'map', icon: Map }, { id: 'map-pin', icon: MapPin }, { id: 'plane', icon: Plane }, { id: 'car', icon: Car }, { id: 'bike', icon: Bike }, { id: 'train', icon: Train }, { id: 'truck', icon: Truck }, { id: 'rocket', icon: Rocket }, { id: 'umbrella', icon: Umbrella }, { id: 'tent', icon: Tent },
                      // Tech
                      { id: 'monitor', icon: Monitor }, { id: 'laptop', icon: Laptop }, { id: 'smartphone', icon: Smartphone }, { id: 'wifi', icon: Wifi }, { id: 'bluetooth', icon: Bluetooth }, { id: 'globe', icon: Globe }, { id: 'server', icon: Server }, { id: 'database', icon: Database }, { id: 'code', icon: Code }, { id: 'terminal', icon: Terminal }, { id: 'cpu', icon: Cpu }, { id: 'mouse', icon: Mouse }, { id: 'keyboard', icon: Keyboard }, { id: 'headphones', icon: Headphones }, { id: 'speaker', icon: Speaker },
                      // Media
                      { id: 'image', icon: Image }, { id: 'video', icon: Video }, { id: 'film', icon: Film }, { id: 'music', icon: Music }, { id: 'mic', icon: Mic }, { id: 'book', icon: Book }, { id: 'book-open', icon: BookOpen }, { id: 'newspaper', icon: Newspaper }, { id: 'camera', icon: Camera }, { id: 'gamepad', icon: Gamepad }, { id: 'play', icon: Play }, { id: 'pause', icon: Pause }, { id: 'volume-2', icon: Volume2 },
                      // Misc
                      { id: 'star', icon: Star }, { id: 'heart', icon: Heart }, { id: 'flag', icon: Flag }, { id: 'trophy', icon: Trophy }, { id: 'medal', icon: Medal }, { id: 'crown', icon: Crown }, { id: 'smile', icon: Smile }, { id: 'frown', icon: Frown }, { id: 'ghost', icon: Ghost }, { id: 'skull', icon: Skull }, { id: 'palette', icon: Palette }, { id: 'lightbulb', icon: Lightbulb }, { id: 'lock', icon: Lock }, { id: 'unlock', icon: Unlock }, { id: 'eye', icon: Eye }, { id: 'shield', icon: Shield },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setNewFolderIcon(item.id)}
                        className={clsx(
                          "p-1.5 rounded-md transition-colors flex items-center justify-center w-7 h-7",
                          newFolderIcon === item.id 
                            ? "bg-blue-100 text-blue-600" 
                            : "text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                        )}
                        title={item.id}
                      >
                        <item.icon size={16} />
                      </button>
                    ))
                ) : (
                    // Emoji Grid
                    [
                       // Smileys
                       '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚',
                       '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳', '😏', '😒', '😞', '😔', '心配', '😟', '😕', '🙁', '☹️',
                       '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓',
                       '🤗', '🤔', '🤭', '🤫', '🤥', '😶', '😐', '😑', '😬', '🙄', '😯', '😦', '😧', '😮', '😲', '🥱', '😴', '🤤', '😪', '😵',
                       '🤐', '🥴', '🤢', '🤮', '🤧', '😷', '🤒', '🤕', '🤑', '🤠', '😈', '👿', 'ww', '💀', '☠️', '💩', '🤡', '👹', '👺', '👻',
                       '👽', '👾', '🤖',
                       
                       // Hand Signs
                       '👋', '🤚', '🖐', '✋', '🖖', '👌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎',
                       '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏', '💅', '🤳', '💪',
                       
                       // Body
                       '🧠', '🦷', '🦴', '👀', '👁', '👅', '👄', '👶', '🧒', '👦', '👧', '🧑', '👱', '👨', '🧔', '👩', '🦲', '🦱', '🦰', '👱‍♀️',
                       '👱‍♂️', '👴', '👵', '🙍', '🙍‍♂️', '🙍‍♀️', '🙎', '🙎‍♂️', '🙎‍♀️', '🙅', '🙅‍♂️', '🙅‍♀️', '🙆', '🙆‍♂️', '🙆‍♀️', '💁', '💁‍♂️', '💁‍♀️',
                       '🙋', '🙋‍♂️', '🙋‍♀️', '🙇', '🙇‍♂️', '🙇‍♀️', '🤦', '🤦‍♂️', '🤦‍♀️', '🤷', '🤷‍♂️', '🤷‍♀️', '👨‍⚕️', '👩‍⚕️', '👨‍🎓', '👩‍🎓',
                       '👨‍💻', '👩‍💻', '👨‍💼', '👩‍💼', '👨‍🔧', '👩‍🔧', '👨‍🔬', '👩‍🔬', '👨‍🚀', '👩‍🚀', '👮', '👮‍♂️', '👮‍♀️', '🕵️', '🕵️‍♂️', '🕵️‍♀️', '🧙', '🧙‍♂️', '🧙‍♀️', '🧛',
                       '🧛‍♂️', '🧛‍♀️', '🧟', '🧟‍♂️', '🧟‍♀️', '🧞', '🧞‍♂️', '🧞‍♀️', '🧜', '🧜‍♂️', '🧜‍♀️', '🧚', '🧚‍♂️', '🧚‍♀️',
                       
                       // Animals
                       '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', 'cow', '🐷', '🐽', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒',
                       '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜',
                       '🦟', '🦗', '🕷', '🕸', '🐢', '🐍', '🦎', '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🐋', '🦈',
                       '🐊', '🐅', '🐆', '🦓', '🦍', '🦧', '🐘', '🦛', '🦏', '🐪', '🐫', '🦒', '🦘', '🐃', '🐂', '🐄', '🐎', '🐖', '🐏', '🐑', '🦙',
                       '🐐', '🦌', '🐕', '🐩', '🦮', '🐕‍🦺', '🐈', '🐓', '🦃', '🦚', '🦜', '🦢', '🦩', '🐇', '🦝', '🦨', '🦡', '🦦', '🦥', '🐁', '🐀',
                       '🐿', '🦔', '🐾', '🐉', '🐲',
                       
                       // Nature
                       '🌵', '🎄', '🌲', '🌳', '🌴', '🌱', '🌿', '☘️', '🍀', '🎍', '🎋', '🍃', '🍂', '🍁', '🍄', '🐚', '🌾', '💐', '🌷', '🌹', '🥀',
                       '🌺', '🌸', '🌼', '🌻', '🌞', '🌝', '🌛', '🌜', '🌚', '🌕', '🌖', '🌗', '🌘', '🌑', '🌒', '🌓', '🌔', '🌙', '🌎', '🌍', '🌏',
                       '🪐', '💫', '⭐️', '🌟', '✨', '⚡️', '☄️', '💥', '🔥', '🌪', '🌈', '☀️', '🌤', '⛅️', '🌥', '☁️', '🌦', '🌧', '⛈', '🌩',
                       '🌨', '❄️', '☃️', '⛄️', '🌬', '💨', '💧', '💦', '☔️', '☂️', '🌊', '🌫',
                       
                       // Food
                       '🍏', '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦',
                       '🥬', '🥒', '🌶', '🌽', '🥕', '🧄', '🧅', '🥔', '🍠', '🥐', '🥯', '🍞', '🥖', '🥨', '🧀', '🥚', '🍳', '🧈', '🥞', '🧇',
                       '🥓', '🥩', '🍗', '🍖', '🦴', '🌭', '🍔', '🍟', '🍕', '🥪', '🥙', '🧆', '🌮', '🌯', '🥗', '🥘', '🥫', '🍝', '🍜', '🍲',
                       '🍛', '🍣', '🍱', '🥟', '🦪', '🍤', '🍙', '🍚', '🍘', '🍥', '🥠', '🍢', '🍡', '🍧', '🍨', '🍦', '🥧', '🧁', '🍰', '🎂',
                       '🍮', '🍭', '🍬', '🍫', '🍿', '🍩', '🍪', '🌰', '🥜', '🍯', '🥛', '🍼', '☕️', '🍵', '🧃', '🥤', '🍶', '🍺', '🍻', '🥂',
                       '🍷', '🥃', '🍸', '🍹', '🧉', '🍾', '🧊', '🥄', '🍴', '🍽', '🥣', '🥡', '🥢', '🧂',
                       
                       // Activities
                       '⚽', '🏀', '🏈', '⚾️', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🥅', '⛳️', '🪁',
                       '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛷', '⛸', '🥌', '🎿', '⛷', '🏂', '🪂', '🏋️', '🏋️‍♂️', '🏋️‍♀️', '🤼', '🤼‍♂️', '🤼‍♀️',
                       '🤸', '🤸‍♂️', '🤸‍♀️', '⛹️', '⛹️‍♂️', '⛹️‍♀️', '🤺', '🤾', '🤾‍♂️', '🤾‍♀️', '🏌️', '🏌️‍♂️', '🏌️‍♀️', '🏇', '🧘', '🧘‍♂️', '🧘‍♀️', '🏄',
                       '🏄‍♂️', '🏄‍♀️', '🏊', '🏊‍♂️', '🏊‍♀️', '🤽', '🤽‍♂️', '🤽‍♀️', '🚣', '🚣‍♂️', '🚣‍♀️', '🧗', '🧗‍♂️', '🧗‍♀️', '🚵', '🚵‍♂️', '🚵‍♀️', '🚴',
                       '🚴‍♂️', '🚴‍♀️', '🏆', '🥇', '🥈', '🥉', '🏅', '🎖', '🏵', '🎗', '🎫', '🎟', '🎪', '🤹', '🤹‍♂️', '🤹‍♀️', '🎭', '🩰', '🎨', '🎬',
                       '🎤', '🎧', '🎼', '🎹', '🥁', '🎷', '🎺', '🎸', '🪕', '🎻', '🎲', '♟', '🎯', '🎳', '🎮', '🎰', '🧩',
                       
                       // Travel
                       '🚗', '🚕', '🚙', '🚌', '🚎', '🏎', '🚓', '🚑', '🚒', '🚐', '🚚', '🚛', '🚜', '🦯', '🦽', '🦼', '🛴', '🚲', '🛵', '🏍',
                       '🛺', '🚨', '🚔', '🚍', '🚘', '🚖', '🚡', '🚠', '🚟', '🚃', '🚋', '🚞', '🚝', '🚄', '🚅', '🚈', '🚂', '🚆', '🚇', '🚊',
                       '🚉', '✈️', '🛫', '🛬', '🛩', '💺', '🛰', '🚀', '🛸', '🚁', '🛶', '⛵️', '🚤', '🛥', '🛳', '⛴', '🚢', '⚓️', '⛽️', '🚧',
                       '🚦', '🚥', '🚏', '🗺', '🗿', '🗽', '🗼', '🏰', '🏯', '🏟', '🎡', '🎢', '🎠', '⛲️', '⛱', '🏖', '🏝', '🏜', '🌋', '⛰',
                       '🏔', '🗻', '🏕', '⛺️', '🏠', '🏡', '🏘', '🏚', '🏗', '🏭', '🏢', '🏬', '🏣', '🏤', '🏥', '🏦', '🏨', '🏪', '🏫', '🏩',
                       '💒', '🏛', '⛪️', '🕌', '🕍', '🛕', '🕋', '⛩', '🛤', '🛣', '🗾', '🎑', '🏞', '🌅', '🌄', '🌠', '🎇', '🎆', '🌇', '🌆',
                       '🏙', '🌃', '🌌', '🌉', '🌁',
                       
                       // Objectives
                       '⌚️', '📱', '📲', '💻', '⌨️', '🖥', '🖨', '🖱', '🖲', '🕹', '🗜', '💽', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥',
                       '📽', '🎞', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙', '🎚', '🎛', '🧭', '⏱', '⏲', '⏰', '🕰', '⌛️', '⏳', '📡', '🔋',
                       '🔌', '💡', '🔦', '🕯', '🪔', '🧯', '🛢', '💸', '💵', '💴', '💶', '💷', '💰', '💳', '💎', '⚖️', '🧰', '🔧', '🔨', '⚒',
                       '🛠', '⛏', '🔩', '⚙️', '🧱', '⛓', '🧲', '🔫', '💣', '🧨', '🪓', '🔪', '🗡', '⚔️', '🛡', '🚬', '⚰️', '⚱️', '🏺', '🔮',
                       '📿', '🧿', '💈', '⚗️', '🔭', '🔬', '🕳', '🩹', '🩺', '💊', '💉', '🩸', '🧬', '🦠', '🧫', '🧪', '🌡', '🧹', '🧺', '🧻',
                       '🚽', '🚰', '🚿', '🛁', '🛀', '🧼', '🪒', '🧽', '🧴', '🛎', '🔑', '🗝', '🚪', '🪑', '🛋', '🛏', '🛌', '🧸', '🖼', '🛍',
                       '🛒', '🎁', '🎈', '🎏', '🎀', '🎊', '🎉', '🎎', '🏮', '🎐', '🧧', '✉️', '📩', '📨', '📧', '💌', '📥', '📤', '📦', '🏷',
                       '📪', '📫', '📬', '📭', '📮', '📯', '📜', '📃', '📄', '📑', '🧾', '📊', '📈', '📉', '🗒', '🗓', '📆', '📅', '🗑', '📇',
                       '🗃', '🗳', '🗄', '📋', '📁', '📂', '🗂', '🗞', '📰', '📓', '📔', '📒', '📕', '📗', '📘', '📙', '📚', '📖', '🔖', '🧷',
                       '🔗', '📎', '🖇', '📐', '📏', '🧮', '📌', '📍', '✂️', '🖊', '🖋', '✒️', '🖌', '🖍', '📝', '✏️', '🔍', '🔎', '🔏', '🔐',
                       '🔒', '🔓',
                       
                       // Symbols
                       '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️',
                       '✝️', '☪️', '🕉', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈️', '♉️', '♊️', '♋️', '♌️', '♍️', '♎️', '♏️', '♐️',
                       '♑️', '♒️', '♓️', '🆔', '⚛️', '🉑', '☢️', '☣️', '📴', '📳', '🈶', '🈚️', '🈸', '🈺', '🈷️', '✴️', '🆚', '💮', '🉐', '㊙️',
                       '㊗️', '🈴', '🈵', '🈹', '🈲', '🅰️', '🅱️', '🆎', '🆑', '🅾️', '🆘', '❌', '⭕️', '🛑', '⛔️', '📛', '🚫', '💯', '💢', '♨️',
                       '🚷', '🚯', '🚳', '🚱', '🔞', '📵', '🚭', '❗️', '❕', '❓', '❔', '‼️', '⁉️', '🔅', '🔆', '〽️', '⚠️', '🚸', '🔱', '⚜️',
                       '🔰', '♻️', '✅', '🈯️', '💹', '❇️', '✳️', '❎', '🌐', '💠', 'Ⓜ️', '🌀', '💤', '🏧', '🚾', '♿️', '🅿️', '🈳', '🈂️', '🛂',
                       '🛃', '🛄', '🛅', '🚹', '🚺', '🚼', '🚻', '🚮', '🎦', '📶', '🈁', '🔣', 'ℹ️', '🔤', '🔡', '🔠', '🆖', '🆗', '🆙', '🆒',
                       '🆕', '🆓', '0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟', '🔢', '#️⃣', '*️⃣', '⏏️', '▶️', '⏸',
                       '⏯', '⏹', '⏺', '⏭', '⏮', '⏩', '⏪', '⏫', '⏬', '◀️', '🔼', '🔽', '➡️', '⬅️', '⬆️', '⬇️', '↗️', '↘️', '↙️', '↖️',
                       '↕️', '↔️', '↪️', '↩️', '⤴️', '⤵️', '🔀', '🔁', '🔂', '🔄', '🔃', '🎵', '🎶', '➕', '➖', '➗', '✖️', '♾', '💲', '💱',
                       '™️', '©️', '®️', '〰️', '➰', '➿', '🔚', '🔙', '🔛', '🔝', '🔜', '✔️', '☑️', '🔘', '🔴', '🟠', '🟡', '🟢', '🔵', '🟣',
                       '⚫', '⚪', '🟤', '🔺', '🔻', '🔸', '🔹', '🔶', '🔷', '🔳', '🔲', '▪️', '▫️', '◾️', '◽️', '◼️', '◻️', '🟥', '🟧', '🟨', '🟩',
                       '🟦', '🟪', '⬛', '⬜', '🟫', '🔈', '🔇', '🔉', '🔊', '🔔', '🔕', '📣', '📢', '👁‍🗨', '💬', '💭', '🗯', '♠️', '♣️', '♥️',
                       '♦️', '🃏', '🎴', '🀄️', '🕐', '🕑', '🕒', '🕓', '🕔', '🕕', '🕖', '🕗', '🕘', '🕙', '🕚', '🕛', '🕜', '🕝', '🕞', '🕟',
                       '🕠', '🕡', '🕢', '🕣', '🕤', '🕥', '🕦', '🕧',
                    ].map((emoji) => (
                        <button
                            key={emoji}
                            onClick={() => setNewFolderIcon(emoji)}
                            className={clsx(
                              "p-1 rounded-md transition-colors flex items-center justify-center w-7 h-7 text-lg leading-none",
                              newFolderIcon === emoji
                                ? "bg-blue-100" 
                                : "hover:bg-gray-50"
                            )}
                        >
                            {emoji}
                        </button>
                    ))
                )}
              </div>

              <div className="flex justify-end gap-2">
                 <button onClick={cancelAddFolder} className="p-1 text-gray-400 hover:text-gray-600"><X size={14}/></button>
                 <button onClick={confirmAddFolder} disabled={!newFolderName.trim()} className="p-1 px-2 bg-black text-white rounded text-xs disabled:opacity-50">Create</button>
              </div>
            </div>
          ) : (
            <>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap animate-in fade-in duration-200">{t('tasks.lists')}</h3>
              <button onClick={startAddFolder} className="text-gray-400 hover:text-blue-500 transition-colors">
                <FolderPlus size={14} />
              </button>
            </>
          )}
        </div>
        
        
        <div className="flex-1 overflow-y-auto no-scrollbar px-0">
          <FolderTree parentId={null} />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-4 min-w-0">
        <div className="flex justify-between items-center mb-4 pl-8 relative z-20"> {/* Added padding-left for toggle button space */}
          <div className="flex items-center gap-2 overflow-hidden flex-1 min-w-0">
            <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 whitespace-nowrap overflow-hidden text-ellipsis">
              {currentFolderId === 'inbox' ? t('inbox') : t('tasks.title')}
            </h2>
            <span className="text-xs font-medium text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full flex-shrink-0">
              {filteredTasks.length}
            </span>
          </div>
          <div className="ml-2 flex items-center gap-2 flex-shrink-0">
            {/* LanguageToggle removed */}
            <ThemeToggle />
          </div>
        </div>

        {/* Quick Add Input */}
        <form onSubmit={handleQuickAdd} className="mb-4 relative flex-shrink-0">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder={t('tasks.add_task')}
            className="w-full pl-3 pr-10 py-2.5 bg-gray-50 dark:bg-gray-800 border-none rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 text-gray-900 dark:text-gray-100 transition-all placeholder-gray-400 dark:placeholder-gray-500"
          />
          <button 
            type="submit"
            disabled={!newTaskTitle.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-blue-500 hover:bg-blue-50 rounded-lg disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
          >
            <Plus size={18} />
          </button>
        </form>
        
        <div className="flex-1 overflow-y-auto no-scrollbar pb-4">
          {filteredTasks.map((task) => (
            <div key={task.id} onClick={() => handleTaskClick(task.id)}>
              <DraggableTask task={task} />
            </div>
          ))}
          {filteredTasks.length === 0 && (
            <div className="flex flex-col items-center justify-center h-40 text-gray-300">
              <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-2">
                <Plus size={24} />
              </div>
              <p className="text-sm">{t('tasks.no_tasks_in_list')}</p>
            </div>
          )}
        </div>
      </div>

      <TaskDetailModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        taskId={selectedTaskId}
        onNavigate={setSelectedTaskId}
      />
    </div>
  );
};
