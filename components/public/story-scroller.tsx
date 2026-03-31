type Story = {
  id: number | string;
  title: string;
  description: string;
  imageUrl?: string;
};

type Props = {
  title: string;
  subtitle: string;
  stories: Story[];
};

export default function StoryScroller({ title, subtitle, stories }: Props) {
  if (!stories.length) {
    return null;
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-16" aria-label="Histórias do projeto">
      <div className="flex flex-col gap-1">
        <p className="text-xs uppercase tracking-[0.4em] text-zinc-500">Histórias reais</p>
        <h2 className="text-3xl font-bold text-zinc-900">{title}</h2>
        <p className="max-w-3xl text-sm text-zinc-600">{subtitle}</p>
      </div>

      <div className="mt-8 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2">
        {stories.map((story) => (
          <article
            key={`${story.id}-${story.title}`}
            className="min-w-[280px] flex-1 snap-center rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm shadow-zinc-200 transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div
              className="h-48 w-full overflow-hidden rounded-2xl bg-zinc-100"
              style={{
                backgroundImage: story.imageUrl
                  ? `linear-gradient(180deg, rgba(0,0,0,0.2), rgba(0,0,0,0.6)), url('${story.imageUrl}')`
                  : undefined,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
            <h3 className="mt-4 text-xl font-semibold text-zinc-900">
              {story.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-600">
              {story.description}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
