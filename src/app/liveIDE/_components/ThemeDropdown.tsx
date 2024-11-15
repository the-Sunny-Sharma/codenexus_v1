import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import monacoThemes from "monaco-themes/themes/themelist.json";

interface ThemeOption {
  label: string;
  value: string;
  key: string;
}

interface ThemeDropdownProps {
  handleThemeChange: (value: string) => void;
  theme: ThemeOption;
}

const ThemeDropdown: React.FC<ThemeDropdownProps> = ({
  handleThemeChange,
  theme,
}) => {
  return (
    <Select onValueChange={handleThemeChange} value={theme.value}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select Theme" />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(monacoThemes).map(([themeId, themeName]) => (
          <SelectItem key={themeId} value={themeId}>
            {themeName}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default ThemeDropdown;
