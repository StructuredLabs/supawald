import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import AppLayout from './layouts/AppLayout'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Supawald',
  description: 'A minimal, clean file management system built with Next.js and Supabase Storage',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  )
}
