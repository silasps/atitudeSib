import { headers } from 'next/headers'
import { resolveOrgFromHost, getSiteConfig } from '@/lib/tenant'
import { COLOR_PALETTE } from '@/types'

export default async function PublicHomePage() {
  const headersList = await headers()
  const host = headersList.get('host') || 'localhost'
  const tenantSlug = headersList.get('x-tenant-slug')

  const tenantResult = tenantSlug ? await resolveOrgFromHost(host) : null
  const siteConfig = tenantResult ? await getSiteConfig(tenantResult.org.id) : null

  // Se não há tenant ou o site não está publicado, mostra a landing da plataforma
  if (!tenantResult || !siteConfig?.publicado) {
    return <PlatformLanding />
  }

  const colors = COLOR_PALETTE[siteConfig.cor_primaria as keyof typeof COLOR_PALETTE]
    || COLOR_PALETTE['azul-oceano']

  // Injeta CSS variables no head via style tag inline
  return (
    <>
      <style>{`
        :root {
          --color-primary: ${colors.primary};
          --color-primary-light: ${colors.secondary};
        }
      `}</style>
      <div className="min-h-screen">
        {/* Hero */}
        <section
          className="relative flex items-center justify-center min-h-[80vh] text-white px-6"
          style={{ backgroundColor: colors.primary }}
        >
          {siteConfig.hero_imagem_url && (
            <div
              className="absolute inset-0 bg-cover bg-center opacity-20"
              style={{ backgroundImage: `url(${siteConfig.hero_imagem_url})` }}
            />
          )}
          <div className="relative text-center max-w-3xl">
            {siteConfig.logo_url && (
              <img
                src={siteConfig.logo_url}
                alt={tenantResult.org.nome}
                className="h-20 w-auto mx-auto mb-8 object-contain"
              />
            )}
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              {siteConfig.hero_titulo || tenantResult.org.nome}
            </h1>
            {siteConfig.hero_subtitulo && (
              <p className="text-xl md:text-2xl text-white/90 mb-8">
                {siteConfig.hero_subtitulo}
              </p>
            )}
            {siteConfig.hero_cta_texto && (
              <a
                href="#sobre"
                className="inline-block px-8 py-3 bg-white rounded-full font-semibold transition hover:bg-white/90"
                style={{ color: colors.primary }}
              >
                {siteConfig.hero_cta_texto}
              </a>
            )}
          </div>
        </section>

        {/* Sobre */}
        {siteConfig.secoes_ativas.includes('sobre') && siteConfig.sobre_texto && (
          <section id="sobre" className="py-20 px-6 max-w-5xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  {siteConfig.sobre_titulo || 'Quem Somos'}
                </h2>
                <p className="text-gray-600 text-lg leading-relaxed whitespace-pre-line">
                  {siteConfig.sobre_texto}
                </p>
                {siteConfig.missao && (
                  <div
                    className="mt-6 p-4 rounded-xl border-l-4 bg-gray-50"
                    style={{ borderColor: colors.primary }}
                  >
                    <p className="text-sm font-semibold text-gray-500 mb-1">Nossa Missão</p>
                    <p className="text-gray-700">{siteConfig.missao}</p>
                  </div>
                )}
              </div>
              {siteConfig.sobre_imagem_url && (
                <img
                  src={siteConfig.sobre_imagem_url}
                  alt="Sobre nós"
                  className="w-full rounded-2xl object-cover shadow-lg aspect-square"
                />
              )}
            </div>
          </section>
        )}

        {/* Contato */}
        {siteConfig.secoes_ativas.includes('contato') && (
          <footer
            className="py-16 px-6 text-white text-center"
            style={{ backgroundColor: colors.primary }}
          >
            <h2 className="text-2xl font-bold mb-6">Entre em Contato</h2>
            <div className="flex flex-wrap justify-center gap-6 text-white/80">
              {siteConfig.contato?.email && (
                <a href={`mailto:${siteConfig.contato.email}`} className="hover:text-white">
                  {siteConfig.contato.email}
                </a>
              )}
              {siteConfig.contato?.telefone && (
                <span>{siteConfig.contato.telefone}</span>
              )}
              {siteConfig.contato?.endereco && (
                <span>{siteConfig.contato.endereco}</span>
              )}
            </div>
            <div className="flex justify-center gap-4 mt-6">
              {siteConfig.redes_sociais?.instagram && (
                <a href={siteConfig.redes_sociais.instagram} target="_blank" rel="noreferrer"
                   className="text-white/70 hover:text-white text-sm">
                  Instagram
                </a>
              )}
              {siteConfig.redes_sociais?.facebook && (
                <a href={siteConfig.redes_sociais.facebook} target="_blank" rel="noreferrer"
                   className="text-white/70 hover:text-white text-sm">
                  Facebook
                </a>
              )}
            </div>
            <p className="mt-8 text-white/40 text-xs">
              Powered by Ostrick Social
            </p>
          </footer>
        )}
      </div>
    </>
  )
}

function PlatformLanding() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center px-6">
      <div className="text-center text-white max-w-2xl">
        <div className="w-24 h-24 bg-white/20 rounded-3xl flex items-center justify-center mx-auto mb-8">
          <span className="text-4xl font-black">OS</span>
        </div>
        <h1 className="text-5xl font-bold mb-4">Ostrick Social</h1>
        <p className="text-xl text-blue-200 mb-8">
          Plataforma completa de gestão para projetos sociais e ONGs
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <a
            href="/entrar"
            className="px-8 py-3 bg-white text-blue-900 font-semibold rounded-full hover:bg-blue-50 transition"
          >
            Acessar plataforma
          </a>
        </div>
      </div>
    </div>
  )
}
