import { requireRole } from '@/lib/auth'
import { createClient } from '@/lib/supabase-server'
import { ImageIcon, Plus } from 'lucide-react'

export default async function SiteGaleriaPage() {
  const { profile } = await requireRole(['admin', 'superadmin'])
  const supabase = await createClient()

  const { data: fotos } = await supabase
    .from('site_galeria')
    .select('id, titulo, imagem_url, descricao, created_at')
    .eq('org_id', profile.org_id)
    .order('created_at', { ascending: false })

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Galeria de Fotos</h1>
          <p className="text-gray-500 text-sm mt-1">Imagens exibidas no site público</p>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg bg-gray-900 opacity-50 cursor-not-allowed"
          disabled
          title="Upload em breve disponível"
        >
          <Plus size={16} />
          Adicionar foto
        </button>
      </div>

      {(!fotos || fotos.length === 0) ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <ImageIcon size={40} className="text-gray-300 mb-4" />
          <h3 className="text-gray-700 font-medium mb-1">Nenhuma foto na galeria</h3>
          <p className="text-gray-400 text-sm max-w-sm">
            Adicione fotos para exibir no site público. O upload de imagens estará disponível em breve.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {fotos.map((foto) => (
            <div key={foto.id} className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
              {foto.imagem_url ? (
                <img
                  src={foto.imagem_url}
                  alt={foto.titulo || ''}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon size={32} className="text-gray-300" />
                </div>
              )}
              {foto.titulo && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white text-xs font-medium truncate">{foto.titulo}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 bg-amber-50 border border-amber-200 rounded-xl p-5">
        <p className="text-sm text-amber-800">
          <strong>Upload de imagens em breve.</strong> O armazenamento de arquivos no Supabase Storage será configurado na próxima versão,
          com isolamento por tenant (bucket por org_id).
        </p>
      </div>
    </div>
  )
}
