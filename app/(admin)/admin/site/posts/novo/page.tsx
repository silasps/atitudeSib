import { requireRole } from '@/lib/auth'
import NovoPostForm from './novo-post-form'

export default async function NovoPostPage() {
  await requireRole(['admin', 'superadmin'])
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl">
      <div className="mb-6">
        <a href="/admin/site/posts" className="text-sm text-gray-400 hover:text-gray-600 mb-3 inline-block">← Publicações</a>
        <h1 className="text-2xl font-bold text-gray-900">Nova publicação</h1>
      </div>
      <NovoPostForm />
    </div>
  )
}
