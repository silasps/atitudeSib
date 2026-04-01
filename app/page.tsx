import SectionRenderer from "@/components/sections/SectionRenderer";
import { projectTheme } from "@/data/project-theme";

export default function HomePage() {
  const theme = projectTheme;

  return (
    <main className="bg-zinc-50 text-zinc-900">
      <div className="mx-auto max-w-6xl space-y-4 px-6 py-10">
        <header className="flex flex-col gap-2 border-b border-zinc-200 pb-6">
          <p className="text-xs uppercase tracking-[0.4em] text-zinc-500">
            Institucional · O Atitude
          </p>
          <h1 className="text-3xl font-extrabold">{theme.name}</h1>
          <p className="max-w-3xl text-sm text-zinc-600">
            Uma experiência modular pronta para outros projetos sociais.
          </p>
        </header>

        <div className="space-y-10">
          {theme.sections.map((section) => (
            <SectionRenderer key={section.id} section={section} />
          ))}
        </div>
      </div>
    </main>
  );
}
