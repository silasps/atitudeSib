'use server'

import { createServiceClient } from '@/lib/supabase-server'
import { headers } from 'next/headers'
import { createHash, randomInt } from 'crypto'
import { TERMOS_ALUNO_CONTENT } from '@/lib/termos/content-aluno'

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://ostricksocial.com.br'

function hashOtp(otp: string, token: string) {
  return createHash('sha256').update(otp + token).digest('hex')
}

async function getValidTermo(token: string) {
  const supabase = await createServiceClient()
  const { data } = await supabase
    .from('termos_ficha')
    .select('*, alunos(nome, email)')
    .eq('token', token)
    .single()
  if (!data) return null
  if (data.status === 'assinado') return data
  if (new Date(data.expires_at) < new Date()) return null
  return data
}

export async function requestOtpTermoAction(
  token: string,
  email: string,
): Promise<{ error?: string }> {
  const termo = await getValidTermo(token)
  if (!termo || termo.status === 'assinado') return { error: 'Link inválido ou já assinado.' }

  const otp = String(randomInt(100000, 999999))
  const hash = hashOtp(otp, token)
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString()

  const supabase = await createServiceClient()
  await supabase
    .from('termos_ficha')
    .update({ otp_hash: hash, otp_expires_at: expiresAt })
    .eq('token', token)

  if (!process.env.RESEND_API_KEY) {
    console.log(`[Termos OTP] código=${otp} para ${email} (Resend não configurado)`)
    return {}
  }

  const from = `${process.env.EMAIL_FROM_NAME ?? 'Projeto Social'} <${process.env.EMAIL_FROM ?? 'noreply@ostricksocial.com.br'}>`
  const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 16px;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
<tr><td style="background:#1d4ed8;padding:28px 40px;text-align:center;">
  <p style="margin:0;font-size:20px;font-weight:700;color:#fff;">Projeto Social</p>
  <p style="margin:6px 0 0;font-size:12px;color:rgba(255,255,255,0.6);">Assinatura Digital de Termos</p>
</td></tr>
<tr><td style="padding:36px 40px;">
  <p style="margin:0 0 20px;font-size:15px;color:#333;line-height:1.6;">
    Seu código de confirmação para assinar os termos é:
  </p>
  <div style="background:#f8fafc;border:2px dashed #e2e8f0;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
    <p style="margin:0;font-size:40px;font-weight:800;color:#1d4ed8;letter-spacing:8px;">${otp}</p>
    <p style="margin:8px 0 0;font-size:12px;color:#94a3b8;">Válido por 15 minutos</p>
  </div>
  <p style="margin:0;font-size:13px;color:#94a3b8;line-height:1.5;">
    Se você não solicitou este código, ignore este e-mail.
  </p>
</td></tr>
</table></td></tr></table>
</body></html>`

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: email,
        subject: `${otp} — Código para assinar os termos`,
        html,
      }),
    })
  } catch (err) {
    console.error('[Termos OTP] Erro ao enviar e-mail:', err)
    return { error: 'Erro ao enviar o código. Tente novamente.' }
  }
  return {}
}

export async function signTermoAlunoAction(
  token: string,
  otp: string,
  name: string,
  email: string,
  autorizaImagem: boolean,
  geo?: { lat: number; lng: number } | null,
): Promise<{ error?: string }> {
  const supabase = await createServiceClient()
  const { data: termo } = await supabase
    .from('termos_ficha')
    .select('*')
    .eq('token', token)
    .single()

  if (!termo) return { error: 'Link não encontrado.' }
  if (termo.status === 'assinado') return { error: 'Este termo já foi assinado.' }
  if (new Date(termo.expires_at) < new Date()) return { error: 'Link expirado.' }
  if (!termo.otp_hash) return { error: 'Solicite um código primeiro.' }
  if (!termo.otp_expires_at || new Date(termo.otp_expires_at) < new Date())
    return { error: 'Código expirado. Solicite um novo.' }
  if (hashOtp(otp.trim(), token) !== termo.otp_hash)
    return { error: 'Código incorreto. Verifique e tente novamente.' }

  const headersList = await headers()
  const ip =
    headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    headersList.get('x-real-ip') ??
    'desconhecido'
  const userAgent = headersList.get('user-agent') ?? 'desconhecido'
  const signedAt = new Date().toISOString()

  const evidence = {
    signed_at: signedAt,
    signer_name: name,
    signer_email: email,
    signer_ip: ip,
    signer_user_agent: userAgent,
    signer_location: geo ?? null,
    termos_assinados: TERMOS_ALUNO_CONTENT.termos.map(t => t.id),
    autoriza_imagem: autorizaImagem,
    otp_confirmed: true,
    lei_referencia: 'Lei 14.063/2020',
  }

  await supabase.from('termos_ficha').update({
    status: 'assinado',
    signed_at: signedAt,
    signed_by_name: name,
    signed_by_email: email,
    ip_address: ip,
    user_agent: userAgent,
    geolocation: geo ? { lat: geo.lat, lng: geo.lng } : null,
    evidence_json: evidence,
    otp_hash: null,
    otp_expires_at: null,
  }).eq('token', token)

  // Atualiza autorização de imagem no registro do aluno
  if (termo.aluno_id) {
    await supabase.from('alunos').update({
      autorizacao_imagem: autorizaImagem,
    }).eq('id', termo.aluno_id)
  }

  await sendConfirmacaoEmail(name, email, signedAt, token)

  return {}
}

async function sendConfirmacaoEmail(
  signerName: string,
  signerEmail: string,
  signedAt: string,
  token: string,
) {
  if (!process.env.RESEND_API_KEY) return

  const dateStr = new Date(signedAt).toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })

  const from = `${process.env.EMAIL_FROM_NAME ?? 'Projeto Social'} <${process.env.EMAIL_FROM ?? 'noreply@ostricksocial.com.br'}>`
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL ?? process.env.EMAIL_FROM ?? ''

  const html = (para: string) =>
    `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:32px 16px;">
<tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#fff;border-radius:16px;overflow:hidden;">
<tr><td style="background:#1d4ed8;padding:28px 40px;text-align:center;">
  <p style="margin:0;font-size:20px;font-weight:700;color:#fff;">Projeto Social</p>
  <p style="margin:6px 0 0;font-size:12px;color:rgba(255,255,255,0.6);">Termos assinados com sucesso</p>
</td></tr>
<tr><td style="padding:36px 40px;">
  <div style="background:#f0fdf4;border:1px solid #86efac;border-radius:12px;padding:20px;text-align:center;margin-bottom:24px;">
    <p style="margin:0;font-size:24px;">✅</p>
    <p style="margin:8px 0 0;font-size:15px;font-weight:600;color:#166534;">Ficha e termos assinados eletronicamente</p>
  </div>
  <p style="margin:0 0 8px;font-size:14px;color:#333;">Olá, <strong>${para}</strong>!</p>
  <p style="margin:0 0 24px;font-size:14px;color:#555;line-height:1.7;">
    Os termos de matrícula, participação, responsabilidade, uso de imagem e LGPD foram assinados eletronicamente.
  </p>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:8px;padding:16px 20px;margin-bottom:24px;">
    <tr>
      <td style="font-size:12px;color:#64748b;padding:4px 0;">Signatário</td>
      <td style="font-size:13px;color:#1e293b;font-weight:600;text-align:right;padding:4px 0;">${signerName}</td>
    </tr>
    <tr>
      <td style="font-size:12px;color:#64748b;padding:4px 0;">E-mail</td>
      <td style="font-size:13px;color:#1e293b;text-align:right;padding:4px 0;">${signerEmail}</td>
    </tr>
    <tr>
      <td style="font-size:12px;color:#64748b;padding:4px 0;">Data e hora</td>
      <td style="font-size:13px;color:#1e293b;text-align:right;padding:4px 0;">${dateStr}</td>
    </tr>
    <tr>
      <td style="font-size:12px;color:#64748b;padding:4px 0;">ID do registro</td>
      <td style="font-size:11px;color:#64748b;text-align:right;padding:4px 0;">${token.slice(0, 16)}…</td>
    </tr>
  </table>
  <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.6;">
    Esta assinatura eletrônica tem validade jurídica nos termos da Lei 14.063/2020 e é reconhecida pelo Poder Judiciário brasileiro.
  </p>
</td></tr>
</table></td></tr></table>
</body></html>`

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: signerEmail,
        subject: 'Termos assinados — Ficha de matrícula confirmada',
        html: html(signerName.split(' ')[0]),
      }),
    })
    if (adminEmail) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from,
          to: adminEmail,
          subject: `[Termos assinados] ${signerName}`,
          html: html('Administrador'),
        }),
      })
    }
  } catch (err) {
    console.error('[Termos] Erro ao enviar confirmação:', err)
  }
}
