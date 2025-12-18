import { Moon, Sun, Monitor } from "lucide-react";
import { useStore, type Theme } from "@/store/useStore";
import clsx from "clsx";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";

export const ThemeToggle = () => {
  const { theme, setTheme } = useStore();

  const icons = {
    light: <Sun size={18} />,
    dark: <Moon size={18} />,
    system: <Monitor size={18} />,
  };

  return (
    <div className="relative z-50">
      <Menu>
        <MenuButton
          className={clsx(
            "p-2 rounded-xl transition-all duration-300",
            "hover:bg-gray-100 dark:hover:bg-gray-800",
            "text-gray-500 dark:text-gray-400",
            "active:scale-95"
          )}
        >
          {icons[theme]}
        </MenuButton>

        <MenuItems
          transition
          anchor="bottom end"
          portal
          className={clsx(
            "w-36 origin-top-right rounded-xl border p-1 text-sm/6 focus:outline-none transition duration-100 ease-out z-[100]",
            "bg-white/80 dark:bg-gray-900/90 backdrop-blur-xl",
            "border-gray-200 dark:border-gray-800",
            "shadow-xl shadow-gray-200/50 dark:shadow-black/50",
            "data-[closed]:scale-95 data-[closed]:opacity-0"
          )}
        >
          {Object.keys(icons).map((key) => (
            <MenuItem key={key}>
              <button
                onClick={() => setTheme(key as Theme)}
                className={clsx(
                  "group flex w-full items-center gap-2 rounded-lg py-1.5 px-3",
                  "data-[focus]:bg-gray-100 dark:data-[focus]:bg-gray-800",
                  theme === key ? "text-blue-600 dark:text-blue-400 font-medium" : "text-gray-700 dark:text-gray-300"
                )}
              >
                {icons[key as Theme]}
                <span className="capitalize">{key}</span>
              </button>
            </MenuItem>
          ))}
        </MenuItems>
      </Menu>
    </div>
  );
};
