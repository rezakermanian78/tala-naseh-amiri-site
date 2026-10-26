import { lazy, Suspense } from 'react'
import App from './App'
import { isAdminRoute } from './lib/route'

// The admin panel is a separate, lazily loaded bundle so the public site doesn't grow.
const AdminApp = lazy(() => import('./admin/AdminApp'))

export default function Root() {
  return isAdminRoute ? (
    <Suspense fallback={<div className="min-h-svh bg-canvas" aria-busy="true" />}>
      <AdminApp />
    </Suspense>
  ) : (
    <App />
  )
}
