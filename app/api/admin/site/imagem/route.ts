import { NextResponse } from 'next/server'
import { requireRole } from '@/lib/auth'
import { createServiceClient } from '@/lib/supabase-server'

const BUCKET = 'site-assets'
const MAX_SIZE = 8 * 1024 * 1024

async function ensureBucket(supabase: Awaited<ReturnType<typeof createServiceClient>>) {
  const { data: buckets } = await supabase.storage.listBuckets()
  if (buckets?.some(b => b.id === BUCKET)) return
  await supabase.storage.createBucket(BUCKET, {
    public: true,
    fileSizeLimit: MAX_SIZE,
    allowedMimeTypes: ['image/webp', 'image/png', 'image/jpeg', 'image/svg+xml'],
  })
}

export async function POST(req: Request) {
  const { profile } = await requireRole(['admin', 'superadmin'])

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const slot = (formData.get('slot') as string | null) ?? 'img'

  if (!file) return NextResponse.json({ error: 'Nenhum arquivo enviado' }, { status: 400 })
  if (file.size > MAX_SIZE) return NextResponse.json({ error: 'Imagem muito grande (máx 8MB)' }, { status: 400 })

  const supabase = await createServiceClient()
  await ensureBucket(supabase)

  const ext = file.type === 'image/webp' ? 'webp' : file.type === 'image/png' ? 'png' : file.type === 'image/svg+xml' ? 'svg' : 'jpg'
  const path = `${profile.org_id}/${slot}-${Date.now()}.${ext}`

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type, upsert: true })

  if (error) {
    console.error('[imagem upload]', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path)

  return NextResponse.json({ url: publicUrl })
}
