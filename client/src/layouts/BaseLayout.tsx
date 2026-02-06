import { Outlet, useSearchParams } from 'react-router-dom'
import { useEffect } from 'react'
import { userStore } from 'stores/userStore'
import { cn } from '@/lib/utils'
import { Sidebar } from '@/components/ui/sidebar'

export default function BaseLayout({}: {}) {
  return (
    <div className={cn("flex min-h-screen flex-col")}>
      <main className={`grow animate-fade-in bg-background`}>
        <Outlet />
      </main>
    </div>
  )
}
