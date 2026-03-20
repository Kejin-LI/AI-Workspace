import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './index.css'
import { LanguageProvider } from './contexts/LanguageContext'
import { HeaderActionsProvider } from './contexts/HeaderActionsContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <HeaderActionsProvider>
          <App />
        </HeaderActionsProvider>
      </LanguageProvider>
    </BrowserRouter>
  </StrictMode>,
)
