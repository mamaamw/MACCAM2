/**
 * Obtenir le lundi de la semaine pour une date donnée
 * @param {Date} date - La date
 * @returns {Date} - Le lundi de la semaine (00:00:00)
 */
export function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay(); // 0 = dimanche, 1 = lundi, ..., 6 = samedi
  const diff = day === 0 ? -6 : 1 - day; // Si dimanche, reculer de 6 jours, sinon calculer le diff jusqu'à lundi
  
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0); // Mettre à minuit
  
  return d;
}

/**
 * Formater une date de semaine pour l'affichage
 * @param {Date} weekStart - Le début de semaine
 * @returns {string} - Format: "Semaine du 21 fév 2026"
 */
export function formatWeekLabel(weekStart) {
  const options = { day: 'numeric', month: 'short', year: 'numeric' };
  return `Semaine du ${weekStart.toLocaleDateString('fr-FR', options)}`;
}
