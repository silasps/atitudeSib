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
        <h2 className="text-3xl font-bold text-zinc-900 md:text-4xl">{title}</h2>
        <p className="max-w-3xl text-sm leading-7 text-zinc-600">{subtitle}</p>
      </div>

      <div className="mt-8 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2">
        {stories.map((story) => (
          <article
            key={`${story.id}-${story.title}`}
            className="min-w-[300px] flex-1 snap-center overflow-hidden rounded-[2rem] border border-zinc-200 bg-white shadow-sm shadow-zinc-200 transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div
              className="h-56 w-full overflow-hidden bg-zinc-100"
              style={{
                backgroundImage: story.imageUrl
                  ? `linear-gradient(180deg, rgba(0,0,0,0.08), rgba(0,0,0,0.58)), url('${story.imageUrl}')`
                  : undefined,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="flex h-full items-end p-5">
                <span className="rounded-full border border-white/15 bg-black/25 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.35em] text-white backdrop-blur-sm">
                  Galeria
                </span>
              </div>
            </div>
            <div className="p-5">
              <h3 className="text-xl font-semibold text-zinc-900">{story.title}</h3>
              <p className="mt-3 text-sm leading-7 text-zinc-600">
                {story.description}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
