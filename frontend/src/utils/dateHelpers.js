/**
 * Obtenir le lundi de la semaine pour une date donnée
 * @param {Date|string} date - La date
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
 * @param {Date|string} weekStart - Le début de semaine
 * @returns {string} - Format: "Semaine du 21 fév 2026"
 */
export function formatWeekLabel(weekStart) {
  if (!weekStart) return 'Sans semaine';
  
  const date = new Date(weekStart);
  const options = { day: 'numeric', month: 'short', year: 'numeric' };
  return `Semaine du ${date.toLocaleDateString('fr-FR', options)}`;
}

/**
 * Comparer deux dates de semaine
 * @param {Date|string} weekA
 * @param {Date|string} weekB
 * @returns {number} - -1 si A < B, 0 si égal, 1 si A > B
 */
export function compareWeeks(weekA, weekB) {
  if (!weekA && !weekB) return 0;
  if (!weekA) return 1; // Items sans semaine viennent à la fin
  if (!weekB) return -1;
  
  const dateA = new Date(weekA);
  const dateB = new Date(weekB);
  
  return dateA.getTime() - dateB.getTime();
}
