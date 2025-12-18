import React from 'react';
import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';
import { Menu, Transition } from '@headlessui/react';
import clsx from 'clsx';

export const LanguageToggle: React.FC = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const currentLang = i18n.language;

  // Map for display names
  const langNames: Record<string, string> = {
    en: 'English',
    zh: '中文'
  };

  return (
    <Menu as="div" className="relative inline-block text-left z-50">
      <Menu.Button className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-gray-500 dark:text-gray-400">
        <Languages className="w-5 h-5" />
      </Menu.Button>
      <Transition
        as={React.Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-2 w-32 origin-top-right divide-y divide-gray-100 rounded-xl bg-white dark:bg-zinc-800 shadow-lg ring-1 ring-black/5 focus:outline-none z-[100]">
          <div className="p-1">
            {Object.keys(langNames).map((lng) => (
              <Menu.Item key={lng}>
                {() => (
                  <button
                    onClick={() => changeLanguage(lng)}
                    className={clsx(
                      'group flex w-full items-center rounded-lg px-2 py-2 text-sm transition-colors',
                      {
                        'bg-violet-500 text-white': currentLang.startsWith(lng), // simplistic check
                        'text-gray-900 dark:text-gray-100 hover:bg-violet-100 dark:hover:bg-violet-900/30': !currentLang.startsWith(lng),
                      }
                    )}
                  >
                    {langNames[lng]}
                  </button>
                )}
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};
