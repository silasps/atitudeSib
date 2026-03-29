type StatCardProps = {
  title: string;
  value: string;
  description: string;
};

export function StatCard({ title, value, description }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-zinc-500">{title}</p>
      <h3 className="mt-2 text-3xl font-bold text-zinc-900">{value}</h3>
      <p className="mt-2 text-sm text-zinc-400">{description}</p>
    </div>
  );
}