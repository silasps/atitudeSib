"use client";

import { createContext, useContext, useMemo, useState } from "react";
import type { ProjectTheme } from "@/types/public-section";
import { projectTheme as defaultTheme } from "@/data/project-theme";

type ProjectThemeContextType = {
  theme: ProjectTheme;
  setTheme: (theme: ProjectTheme) => void;
};

const ProjectThemeContext = createContext<ProjectThemeContextType | null>(null);

export function ProjectThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setTheme] = useState<ProjectTheme>(defaultTheme);

  const value = useMemo(() => ({ theme, setTheme }), [theme]);

  return (
    <ProjectThemeContext.Provider value={value}>
      {children}
    </ProjectThemeContext.Provider>
  );
}

export function useProjectTheme() {
  const context = useContext(ProjectThemeContext);
  if (!context) {
    throw new Error(
      "useProjectTheme deve ser usado dentro de ProjectThemeProvider"
    );
  }
  return context;
}
