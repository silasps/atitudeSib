import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Ostrich Social',
  description: 'Plataforma de gestão para projetos sociais',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
