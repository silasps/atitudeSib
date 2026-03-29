type PageTitleProps = {
  title: string;
  subtitle?: string;
};

export function PageTitle({ title, subtitle }: PageTitleProps) {
  return (
    <div className="space-y-1">
      <h1 className="text-2xl font-bold text-zinc-900">{title}</h1>
      {subtitle ? <p className="text-sm text-zinc-500">{subtitle}</p> : null}
    </div>
  );
}