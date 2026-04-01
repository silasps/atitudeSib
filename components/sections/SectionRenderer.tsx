"use client";

import type { SectionData } from "@/types/public-section";

type Props = {
  section: SectionData;
  isAdmin?: boolean;
  onUpdate?: (id: string, changes: Partial<SectionData>) => void;
};

const placeholderGradient =
  "linear-gradient(135deg, rgba(15,23,42,0.8), rgba(59,130,246,0.6))";

function AdminControls({
  section,
  onUpdate,
}: {
  section: SectionData;
  onUpdate?: (id: string, changes: Partial<SectionData>) => void;
}) {
  if (!onUpdate) return null;

  return (
    <div className="mt-4 flex flex-wrap gap-3 border-t border-dashed border-zinc-200 pt-3 text-sm text-zinc-600">
      <label className="flex items-center gap-2">
        Visível
        <input
          type="checkbox"
          checked={section.isVisible ?? true}
          onChange={(event) =>
            onUpdate(section.id, { isVisible: event.target.checked })
          }
        />
      </label>
      <button
        type="button"
        onClick={() =>
          onUpdate(section.id, { title: (section.title ?? "").trim() })
        }
        className="rounded-full border border-zinc-300 px-3 py-1 text-xs"
      >
        Salvar seção
      </button>
    </div>
  );
}

export default function SectionRenderer({
  section,
  isAdmin = false,
  onUpdate,
}: Props) {
  if (section.isVisible === false && !isAdmin) {
    return null;
  }

  const wrapperClass = `mb-10 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm ${
    isAdmin ? "ring-2 ring-dashed ring-zinc-300" : ""
  }`;

  const imageStyle = section.media?.url
    ? { backgroundImage: `url(${section.media.url})` }
    : {
        background: placeholderGradient,
        opacity: 0.8,
      };

  const sectionContent = (
    <article className={wrapperClass}>
      {section.media && section.media.position === "full" ? (
        <div
          className="relative mb-6 h-64 w-full rounded-2xl bg-cover bg-center"
          style={imageStyle}
        />
      ) : null}

      {section.title ? (
        <h2 className="text-3xl font-semibold text-zinc-900">{section.title}</h2>
      ) : null}

      {section.subtitle ? (
        <p className="mt-2 text-sm uppercase tracking-[0.3em] text-zinc-500">
          {section.subtitle}
        </p>
      ) : null}

      {section.description ? (
        <p className="mt-4 text-zinc-600">{section.description}</p>
      ) : null}

      {section.list ? (
        <ul className="mt-4 space-y-2 text-sm text-zinc-700">
          {section.list.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-zinc-900" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      ) : null}

      {section.projects ? (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {section.projects.map((project) => (
            <div
              key={project.title}
              className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4"
            >
              <h3 className="text-lg font-semibold text-zinc-900">
                {project.title}
              </h3>
              <p className="mt-2 text-sm text-zinc-700">{project.description}</p>
              {project.media ? (
                <div
                  className="mt-3 h-32 rounded-xl bg-cover bg-center"
                  style={{
                    backgroundImage: `url(${project.media.url})`,
                  }}
                />
              ) : null}
            </div>
          ))}
        </div>
      ) : null}

      {section.stats ? (
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {section.stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border bg-white p-4 shadow-sm">
              <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">
                {stat.label}
              </p>
              <p className="mt-2 text-2xl font-bold text-zinc-900">{stat.value}</p>
            </div>
          ))}
        </div>
      ) : null}

      {section.iframe ? (
        <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-200">
          <div
            className="h-[300px] w-full"
            dangerouslySetInnerHTML={{ __html: section.iframe }}
          />
        </div>
      ) : null}

      {section.cta ? (
        <div className="mt-6 flex flex-wrap gap-3">
          <a
            href={section.cta.href}
            className="rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white"
          >
            {section.cta.label}
          </a>
          {section.ctaSecondary ? (
            <a
              href={section.ctaSecondary.href}
              className="rounded-full border border-zinc-300 px-6 py-3 text-sm font-semibold text-zinc-900"
            >
              {section.ctaSecondary.label}
            </a>
          ) : null}
        </div>
      ) : null}

      {isAdmin ? (
        <AdminControls section={section} onUpdate={onUpdate} />
      ) : null}
    </article>
  );

  return section.media && section.media.position === "left" ? (
    <div className="mb-10 flex flex-col gap-6 lg:flex-row">
      <div className="flex-1">{sectionContent}</div>
      <div
        className="flex-1 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm"
        style={imageStyle}
      >
        <div className="text-sm uppercase tracking-[0.3em] text-white/80">
          Imagem lateral
        </div>
      </div>
    </div>
  ) : (
    sectionContent
  );
}
