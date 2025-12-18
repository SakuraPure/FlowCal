import { enUS, zhCN } from "date-fns/locale";
import { useTranslation } from "react-i18next";

export const useDateLocale = () => {
  const { i18n } = useTranslation();

  const localeMap: Record<string, any> = {
    en: enUS,
    zh: zhCN,
  };

  // Handle cases like 'en-US' or 'zh-CN'
  const lang = i18n.language?.split("-")[0] || "en";

  return localeMap[lang] || enUS;
};
