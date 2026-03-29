import Link from "next/link";

type PublicFooterProps = {
  projectName: string;
  projectSubtitle?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  contactWhatsapp?: string | null;
};

export function PublicFooter({
  projectName,
  projectSubtitle,
  contactEmail,
  contactPhone,
  contactWhatsapp,
}: PublicFooterProps) {
  return (
    <footer className="border-t border-zinc-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-4 md: p-6 px-6 py-10 md:grid-cols-3">
        <div>
          <h4 className="font-semibold text-zinc-900">{projectName}</h4>
          <p className="mt-2 text-sm text-zinc-500">{projectSubtitle}</p>
        </div>

        <div>
          <h4 className="font-semibold text-zinc-900">Contato</h4>
          <div className="mt-2 space-y-1 text-sm text-zinc-500">
            <p>{contactEmail || "E-mail não informado"}</p>
            <p>{contactPhone || "Telefone não informado"}</p>
            <p>{contactWhatsapp || "WhatsApp não informado"}</p>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-zinc-900">Links rápidos</h4>
          <div className="mt-2 space-y-1 text-sm text-zinc-500">
            <p>
              <Link href="/quem-somos">Quem somos</Link>
            </p>
            <p>
              <Link href="/o-que-estamos-fazendo">O que fazemos</Link>
            </p>
            <p>
              <Link href="/faca-parte">Faça parte</Link>
            </p>
            <p>
              <Link href="/seja-voluntario">Seja voluntário</Link>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}