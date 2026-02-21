// Système de notification toast
let toastContainer = null;

// Créer le conteneur de toasts s'il n'existe pas
function getToastContainer() {
  if (!toastContainer) {
    toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'toast-container';
      toastContainer.className = 'position-fixed top-0 end-0 p-3';
      toastContainer.style.zIndex = '9999';
      document.body.appendChild(toastContainer);
    }
  }
  return toastContainer;
}

// Fonction pour afficher un toast
function showToast(message, type = 'info', duration = 3000) {
  const container = getToastContainer();
  
  // Mapper les types aux couleurs Bootstrap
  const bgClass = {
    success: 'bg-success',
    error: 'bg-danger',
    danger: 'bg-danger',
    warning: 'bg-warning',
    info: 'bg-info',
    primary: 'bg-primary'
  }[type] || 'bg-info';

  const iconClass = {
    success: 'feather-check-circle',
    error: 'feather-x-circle',
    danger: 'feather-x-circle',
    warning: 'feather-alert-triangle',
    info: 'feather-info',
    primary: 'feather-bell'
  }[type] || 'feather-info';

  // Créer l'élément toast
  const toast = document.createElement('div');
  toast.className = `toast align-items-center text-white ${bgClass} border-0 mb-2`;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'assertive');
  toast.setAttribute('aria-atomic', 'true');
  
  toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">
        <i class="${iconClass} me-2"></i>
        ${message}
      </div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
  `;

  container.appendChild(toast);

  // Initialiser et afficher le toast Bootstrap
  const bsToast = new window.bootstrap.Toast(toast, {
    autohide: true,
    delay: duration
  });
  
  bsToast.show();

  // Supprimer l'élément du DOM après fermeture
  toast.addEventListener('hidden.bs.toast', () => {
    toast.remove();
  });
}

// Fonctions helper pour différents types
export const toast = {
  success: (message, duration) => showToast(message, 'success', duration),
  error: (message, duration) => showToast(message, 'error', duration || 4000),
  warning: (message, duration) => showToast(message, 'warning', duration),
  info: (message, duration) => showToast(message, 'info', duration),
  show: showToast
};

export default toast;
