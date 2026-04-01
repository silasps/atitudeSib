"use client";

import { useState } from "react";
import { PageTitle } from "@/components/ui/page-title";
import SectionRenderer from "@/components/sections/SectionRenderer";
import type { SectionData } from "@/types/public-section";
import { projectTheme } from "@/data/project-theme";

type SectionFormProps = {
  section: SectionData;
  onChange: (id: string, changes: Partial<SectionData>) => void;
};

function SectionForm({ section, onChange }: SectionFormProps) {
  return (
    <div className="space-y-4 rounded-2xl border border-dashed border-zinc-200 bg-white/80 p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-semibold text-zinc-900">{section.title ?? "Seção sem título"}</h3>
        <label className="flex items-center gap-2 text-sm text-zinc-600">
          Visível
          <input
            type="checkbox"
            checked={section.isVisible ?? true}
            onChange={(event) =>
              onChange(section.id, { isVisible: event.target.checked })
            }
          />
        </label>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="text-sm text-zinc-600">
          Título
          <input
            type="text"
            className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm"
            value={section.title ?? ""}
            onChange={(event) =>
              onChange(section.id, { title: event.target.value })
            }
          />
        </label>
        <label className="text-sm text-zinc-600">
          Subtítulo
          <input
            type="text"
            className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm"
            value={section.subtitle ?? ""}
            onChange={(event) =>
              onChange(section.id, { subtitle: event.target.value })
            }
          />
        </label>
      </div>
      <label className="text-sm text-zinc-600">
        Descrição
        <textarea
          rows={3}
          className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm"
          value={section.description ?? ""}
          onChange={(event) =>
            onChange(section.id, { description: event.target.value })
          }
        />
      </label>
      <label className="text-sm text-zinc-600">
        URL da imagem
        <input
          type="text"
          className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm"
          value={section.media?.url ?? ""}
          onChange={(event) =>
            onChange(section.id, {
              media: { ...section.media, url: event.target.value },
            })
          }
        />
      </label>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="text-sm text-zinc-600">
          CTA label
          <input
            type="text"
            className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm"
            value={section.cta?.label ?? ""}
            onChange={(event) =>
              onChange(section.id, {
                cta: { ...section.cta, label: event.target.value } as any,
              })
            }
          />
        </label>
        <label className="text-sm text-zinc-600">
          CTA link
          <input
            type="text"
            className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 text-sm"
            value={section.cta?.href ?? ""}
            onChange={(event) =>
              onChange(section.id, {
                cta: { ...section.cta, href: event.target.value } as any,
              })
            }
          />
        </label>
      </div>
      {section.type === "map" ? (
        <label className="text-sm text-zinc-600">
          Iframe do mapa
          <textarea
            rows={3}
            className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 text-xs"
            value={section.iframe ?? ""}
            onChange={(event) =>
              onChange(section.id, { iframe: event.target.value })
            }
          />
        </label>
      ) : null}
    </div>
  );
}

export default function InstitucionalAdminPage() {
  const [sections, setSections] = useState<SectionData[]>(projectTheme.sections);

  const handleUpdate = (id: string, changes: Partial<SectionData>) => {
    setSections((prev) =>
      prev.map((section) => (section.id === id ? { ...section, ...changes } : section))
    );
  };

  return (
    <div className="space-y-6">
      <PageTitle
        title="Editor institucional"
        subtitle="Modifique a mesma página pública em modo visual controlado."
      />

      <div className="space-y-8">
        {sections.map((section) => (
          <div key={section.id} className="space-y-4 rounded-3xl bg-white/60 p-5 shadow-sm">
            <SectionForm section={section} onChange={handleUpdate} />
            <div className="mt-4">
              <SectionRenderer section={section} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
