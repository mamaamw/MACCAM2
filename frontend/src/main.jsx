import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './index.css'

console.log('🚀 main.jsx - Démarrage de l\'application React')

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
})

console.log('📦 QueryClient créé')

const rootElement = document.getElementById('root')
console.log('🎯 Root element:', rootElement)

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <App />
          <Toaster position="top-right" />
        </QueryClientProvider>
      </BrowserRouter>
    </React.StrictMode>,
  )
  console.log('✅ Application React montée avec succès')
} else {
  console.error('❌ Élément #root non trouvé!')
}
