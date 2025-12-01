import type { Metadata } from 'next'
import { Providers } from './providers'
import './globals.css'

export const metadata: Metadata = {
  title: 'CallFlex - AI Receptionist for Every Business',
  description: 'AI-powered receptionist that answers every call professionally. Set up in 5 minutes with industry-specific templates.',
  keywords: ['AI receptionist', 'virtual receptionist', 'phone answering service', 'business phone'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
