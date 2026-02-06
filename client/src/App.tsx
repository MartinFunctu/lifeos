import { Routes, Route, BrowserRouter, Navigate } from 'react-router-dom'
import BaseLayout from 'layouts/BaseLayout'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StaticsInitialzer } from '@/lib/statics'
import { useEffect } from 'react'
import AdminLoginPage from './pages/admin/AdminLoginPage'
import AdminDashboard from 'pages/admin/AdminDashboard'
import AdminLayout from 'layouts/AdminLayout'
import routes from 'routes'

import { Toaster } from "@/components/ui/sonner"

export const queryClient = new QueryClient()

export const enterQueryParamsString = window.location.search.split('?').at(1)

function App() {
  useEffect(() => {
    // Statics initialization or other side effects
  }, [])


  return (
    <QueryClientProvider client={queryClient}>
      <StaticsInitialzer />

      <BrowserRouter>

        <Routes>
          <Route element={<BaseLayout />}>
            <Route path="/" element={<Navigate to={routes.ADMIN_DASHBOARD} replace />} />
            <Route path={routes.ADMIN_LOGIN} element={<AdminLoginPage />} />
            <Route path="/admin" element={<Navigate to={routes.ADMIN_DASHBOARD} />} />
          </Route>

          <Route element={<AdminLayout />}>

            <Route path={routes.ADMIN_DASHBOARD} element={<AdminDashboard />} />
          </Route>
        </Routes>

      </BrowserRouter>
      <Toaster />
    </QueryClientProvider>
  )
}

export default App
