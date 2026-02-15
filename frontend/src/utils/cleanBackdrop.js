/**
 * Nettoie tous les backdrops de modals Bootstrap et réinitialise le body
 * Utilisez cette fonction si l'écran reste flou après fermeture d'un modal
 * 
 * Utilisation dans la console :
 * window.cleanBackdrop()
 */
export const cleanBackdrop = () => {
  console.log('🧹 Nettoyage des backdrops...');
  
  // Supprimer tous les backdrops
  const backdrops = document.querySelectorAll('.modal-backdrop');
  console.log(`   Trouvé ${backdrops.length} backdrop(s)`);
  backdrops.forEach(backdrop => backdrop.remove());
  
  // Supprimer tous les modals ouverts
  const modals = document.querySelectorAll('.modal.show');
  console.log(`   Trouvé ${modals.length} modal(s) ouvert(s)`);
  modals.forEach(modal => {
    modal.classList.remove('show');
    modal.style.display = 'none';
  });
  
  // Réinitialiser le body
  document.body.classList.remove('modal-open');
  document.body.style.overflow = '';
  document.body.style.paddingRight = '';
  
  console.log('✅ Nettoyage terminé !');
};

// Exposer la fonction globalement pour utilisation dans la console
if (typeof window !== 'undefined') {
  window.cleanBackdrop = cleanBackdrop;
}

export default cleanBackdrop;
