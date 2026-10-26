import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './i18n'
import './index.css'
import { loadSiteData } from './lib/siteData'
import { isAdminRoute } from './lib/route'
import Root from './Root'

// Start fetching content right away, in parallel with the first render.
if (!isAdminRoute) loadSiteData()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
