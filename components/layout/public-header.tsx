import Link from "next/link";

type PublicHeaderProps = {
  projectName: string;
  projectSubtitle?: string | null;
};

export function PublicHeader({
  projectName,
  projectSubtitle,
}: PublicHeaderProps) {
  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
        <div>
          <Link href="/" className="text-2xl font-bold text-zinc-900">
            {projectName}
          </Link>
          {projectSubtitle ? (
            <p className="text-sm text-zinc-500">{projectSubtitle}</p>
          ) : null}
        </div>

        <nav className="hidden items-center gap-6 text-sm text-zinc-700 md:flex">
          <Link href="/">Início</Link>
          <Link href="/quem-somos">Quem somos</Link>
          <Link href="/o-que-estamos-fazendo">O que fazemos</Link>
          <Link href="/faca-parte">Faça parte</Link>
          <Link href="/contato">Contato</Link>
          <Link
            href="/seja-voluntario"
            className="rounded-xl bg-zinc-900 px-4 py-2 font-medium text-white"
          >
            Seja voluntário
          </Link>
        </nav>
      </div>
    </header>
  );
}