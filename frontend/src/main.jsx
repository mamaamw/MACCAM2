import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import { I18nProvider } from './i18n/I18nContext'
import './index.css'
import './fix-blur.css' // Fix pour supprimer le flou

// Nettoyer tous les backdrops de modals au démarrage
const cleanAllBackdrops = () => {
  const backdrops = document.querySelectorAll('.modal-backdrop');
  backdrops.forEach(backdrop => backdrop.remove());
  const modals = document.querySelectorAll('.modal.show');
  modals.forEach(modal => {
    modal.classList.remove('show');
    modal.style.display = 'none';
  });
  document.body.classList.remove('modal-open');
  document.body.classList.remove('pace-running');
  document.body.style.overflow = '';
  document.body.style.paddingRight = '';
};

// Nettoyer immédiatement et répéter plusieurs fois pour être sûr
cleanAllBackdrops();
setTimeout(cleanAllBackdrops, 100);
setTimeout(cleanAllBackdrops, 500);
setTimeout(cleanAllBackdrops, 1000);

// Créer un observateur qui surveille et supprime automatiquement tout backdrop qui apparaît
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (node.classList && node.classList.contains('modal-backdrop')) {
        node.remove();
      }
    });
  });
  
  // Forcer le body à rester scrollable
  if (document.body.classList.contains('modal-open')) {
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
  }
});

// Observer les changements dans le body
observer.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ['class', 'style']
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
})

const rootElement = document.getElementById('root')

if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <BrowserRouter>
        <QueryClientProvider client={queryClient}>
          <I18nProvider>
            <App />
            <Toaster position="top-right" />
          </I18nProvider>
        </QueryClientProvider>
      </BrowserRouter>
    </React.StrictMode>,
  )
}
