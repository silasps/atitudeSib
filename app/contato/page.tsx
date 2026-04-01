import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";

export default function ContatoPage() {
  return (
    <div className="min-h-screen bg-white text-zinc-900">
      <PublicHeader projectName="O Atitude" projectSubtitle="Projeto Escola Social" />

      <main className="space-y-12 px-6 py-12 md:px-10">
        <section className="mx-auto max-w-5xl rounded-3xl border border-zinc-200 bg-gradient-to-br from-emerald-600 to-cyan-500 p-8 text-white shadow-xl">
          <p className="text-xs uppercase tracking-[0.4em] text-white/80">Contato</p>
          <h1 className="mt-3 text-3xl font-bold">Converse com a equipe do O Atitude</h1>
          <p className="mt-3 text-sm text-white/90">
            Estamos na Rua Vereador Wadislau Bugalski, 3827, bairro Lamenha Grande, Almirante Tamandaré – PR.
          </p>
          <p className="mt-2 text-sm text-white/90">Tel: +55 41 99288-1025 · CNPJ 47.462.832/0001-93</p>
        </section>

        <section className="mx-auto max-w-4xl space-y-4 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-semibold text-zinc-900">Recursos humanos e administrativos</h2>
          <ul className="space-y-2 text-sm text-zinc-700">
            <li>Diretor Presidente: Raimundo Alberto Gonçalves da Silva</li>
            <li>Primeira Secretária: Edilsem Cristina Mengarda Figueirôa</li>
            <li>Segunda Secretária: Jessica Domingues</li>
            <li>Primeiro Tesoureiro: Welliton da Silva Santo</li>
            <li>Segunda Tesoureira: Cristiane Ribeiro Martins</li>
            <li>Conselho Fiscal: Maria da Penha Silva dos Santos, Reinaldo Vicente Traczynski</li>
          </ul>
        </section>

        <section className="mx-auto max-w-4xl space-y-4 rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold text-zinc-900">Recursos e infraestrutura</h3>
          <ul className="space-y-2 text-sm text-zinc-700">
            <li>• Materiais de limpeza e higiene comprados mensalmente.</li>
            <li>• Material didático, equipamentos esportivos e musicais sempre em estoque.</li>
            <li>• Compra de kimonos, violões, halteres, tatames e insumos sob demanda.</li>
            <li>• Recursos para alimentação garantidos semanalmente.</li>
          </ul>
        </section>
      </main>

      <PublicFooter
        projectName="O Atitude"
        projectSubtitle="Projeto Escola Social"
        contactEmail=""
        contactPhone="+55 41 99288-1025"
        contactWhatsapp="+55 41 99288-1025"
      />
    </div>
  );
}
