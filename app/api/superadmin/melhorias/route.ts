import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase-server'
import { getSession } from '@/lib/auth'

export async function GET() {
  const session = await getSession()
  if (!session || session.profile.role !== 'superadmin') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
  }

  const supabase = await createServiceClient()
  const { data, error } = await supabase
    .from('sugestoes_melhoria')
    .select('*, profiles(nome, email)')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
