
import { Globe } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

export const LanguageToggle = () => {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
    >
      <Globe className="h-4 w-4" />
      <span className="font-medium">
        {language === "en" ? "English" : "नेपाली"}
      </span>
    </button>
  );
};
