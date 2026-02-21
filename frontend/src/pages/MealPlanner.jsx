import React, { useState, useEffect } from 'react';
import mealPlanService from '../services/mealPlanService';
import recipeService from '../services/recipeService';
import shoppingListService from '../services/shoppingListService';
import toast from '../utils/toast';
import { useNavigate } from 'react-router-dom';
import ConfirmModal from '../components/ConfirmModal';

const MealPlanner = () => {
  const navigate = useNavigate();
  const [mealPlans, setMealPlans] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('week'); // 'week' or 'month'
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null); // {date, mealType}
  const [selectedRecipe, setSelectedRecipe] = useState('');
  const [servings, setServings] = useState(4);
  const [notes, setNotes] = useState('');
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    title: '',
    message: '',
    onConfirm: null,
    type: 'primary'
  });

  const mealTypes = [
    { key: 'breakfast', label: 'Petit-déjeuner', icon: 'feather-sunrise', color: 'warning' },
    { key: 'lunch', label: 'Déjeuner', icon: 'feather-sun', color: 'primary' },
    { key: 'dinner', label: 'Dîner', icon: 'feather-moon', color: 'info' },
    { key: 'snack', label: 'Collation', icon: 'feather-coffee', color: 'secondary' }
  ];

  useEffect(() => {
    fetchData();
  }, [currentDate, viewMode]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { startDate, endDate } = getDateRange();
      
      // Récupérer les repas planifiés
      const mealPlansRes = await mealPlanService.getMealPlans(
        startDate.toISOString(),
        endDate.toISOString()
      );
      setMealPlans(mealPlansRes.data || []);

      // Récupérer les recettes
      const recipesRes = await recipeService.getRecipes();
      setRecipes(recipesRes.data || []);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const getDateRange = () => {
    const start = new Date(currentDate);
    let end = new Date(currentDate);

    if (viewMode === 'week') {
      // Début de la semaine (lundi)
      const dayOfWeek = start.getDay();
      const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      start.setDate(start.getDate() + diff);
      start.setHours(0, 0, 0, 0);

      // Fin de la semaine (dimanche)
      end = new Date(start);
      end.setDate(end.getDate() + 6);
      end.setHours(23, 59, 59, 999);
    } else {
      // Début du mois
      start.setDate(1);
      start.setHours(0, 0, 0, 0);

      // Fin du mois
      end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);
    }

    return { startDate: start, endDate: end };
  };

  const getDaysInRange = () => {
    const { startDate, endDate } = getDateRange();
    const days = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return days;
  };

  const getMealPlansForDay = (date, mealType) => {
    return mealPlans.filter(mp => {
      const mpDate = new Date(mp.date);
      return mpDate.toDateString() === date.toDateString() && mp.mealType === mealType;
    });
  };

  const handlePreviousPeriod = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setCurrentDate(newDate);
  };

  const handleNextPeriod = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleAddMeal = (date, mealType) => {
    setSelectedSlot({ date, mealType });
    setSelectedRecipe('');
    setServings(4);
    setNotes('');
    setShowAddModal(true);
  };

  const handleSaveMeal = async () => {
    if (!selectedRecipe) {
      toast.warning('Veuillez sélectionner une recette');
      return;
    }

    try {
      await mealPlanService.createMealPlan({
        recipeId: selectedRecipe,
        date: selectedSlot.date.toISOString(),
        mealType: selectedSlot.mealType,
        servings,
        notes
      });

      // Ajouter automatiquement les ingrédients à la liste de courses
      try {
        await shoppingListService.addFromRecipe(selectedRecipe, servings);
      } catch (error) {
        console.error('Erreur lors de l\'ajout à la liste de courses:', error);
        // Ne pas bloquer si l'ajout à la liste échoue
      }

      toast.success('Repas ajouté au calendrier et ingrédients ajoutés à la liste de courses');
      setShowAddModal(false);
      fetchData();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de l\'ajout du repas');
    }
  };

  const handleDeleteMeal = async (id) => {
    try {
      await mealPlanService.deleteMealPlan(id);
      toast.success('Repas supprimé');
      fetchData();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleToggleComplete = async (id) => {
    try {
      await mealPlanService.toggleComplete(id);
      fetchData();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleGenerateShoppingList = () => {
    setConfirmModal({
      show: true,
      title: 'Générer la liste de courses',
      message: `Voulez-vous ajouter tous les ingrédients de cette ${viewMode === 'week' ? 'semaine' : 'mois'} à votre liste de courses ?`,
      type: 'success',
      onConfirm: async () => {
        setConfirmModal({ show: false, title: '', message: '', onConfirm: null, type: 'primary' });
        try {
          let addedCount = 0;
          for (const mealPlan of mealPlans) {
            await shoppingListService.addFromRecipe(mealPlan.recipeId, mealPlan.servings);
            addedCount++;
          }
          toast.success(`${addedCount} recette(s) ajoutée(s) à la liste de courses`);
        } catch (error) {
          console.error('Erreur:', error);
          toast.error('Erreur lors de la génération de la liste de courses');
        }
      }
    });
  };

  const handleDuplicateWeek = () => {
    if (viewMode !== 'week') {
      toast.warning('Cette fonctionnalité est disponible uniquement en vue semaine');
      return;
    }

    setConfirmModal({
      show: true,
      title: 'Dupliquer la semaine',
      message: 'Voulez-vous dupliquer tous les repas de cette semaine à la semaine prochaine ?',
      type: 'primary',
      onConfirm: async () => {
        setConfirmModal({ show: false, title: '', message: '', onConfirm: null, type: 'primary' });
        try {
          // Créer tous les repas de la nouvelle semaine
          const promises = mealPlans.map(meal => {
            const newDate = new Date(meal.date);
            newDate.setDate(newDate.getDate() + 7);
            
            return mealPlanService.createMealPlan({
              recipeId: meal.recipeId,
              date: newDate.toISOString(),
              mealType: meal.mealType,
              servings: meal.servings,
              notes: meal.notes
            });
          });

          await Promise.all(promises);
          toast.success('Semaine dupliquée avec succès');
          
          // Avancer à la semaine suivante
          handleNextPeriod();
        } catch (error) {
          console.error('Erreur:', error);
          toast.error('Erreur lors de la duplication de la semaine');
        }
      }
    });
  };

  const handleExportPDF = () => {
    const { startDate, endDate } = getDateRange();
    const days = getDaysInRange();

    // Créer le contenu HTML pour l'impression
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Planning de repas - ${formatPeriodLabel()}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { text-align: center; color: #333; }
          .period { text-align: center; color: #666; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
          th { background-color: #f8f9fa; font-weight: bold; }
          .meal-type { font-weight: bold; color: #0066cc; }
          .recipe-title { font-weight: bold; }
          .recipe-details { font-size: 0.9em; color: #666; margin-top: 5px; }
          .empty-cell { color: #ccc; text-align: center; }
          @media print { 
            body { margin: 0; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <h1>Planning de Repas</h1>
        <p class="period">${formatPeriodLabel()}</p>
        <table>
          <thead>
            <tr>
              <th style="width: 150px;">Repas / Jour</th>
              ${days.map(day => `
                <th style="text-align: center;">
                  ${day.toLocaleDateString('fr-FR', { weekday: 'short' })}<br>
                  <strong>${day.getDate()}</strong>
                </th>
              `).join('')}
            </tr>
          </thead>
          <tbody>
            ${mealTypes.map(mealType => `
              <tr>
                <td class="meal-type">${mealType.label}</td>
                ${days.map(day => {
                  const mealsInSlot = getMealPlansForDay(day, mealType.key);
                  if (mealsInSlot.length > 0) {
                    return `
                      <td>
                        ${mealsInSlot.map(meal => `
                          <div style="margin-bottom: 10px;">
                            <div class="recipe-title">${meal.recipe.title}</div>
                            <div class="recipe-details">${meal.servings} portions</div>
                            ${meal.notes ? `<div class="recipe-details">${meal.notes}</div>` : ''}
                          </div>
                        `).join('')}
                      </td>
                    `;
                  } else {
                    return '<td class="empty-cell">-</td>';
                  }
                }).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div style="margin-top: 30px; text-align: center;">
          <button onclick="window.print()" style="padding: 10px 20px; background: #0066cc; color: white; border: none; border-radius: 5px; cursor: pointer;">
            Imprimer / Enregistrer en PDF
          </button>
        </div>
      </body>
      </html>
    `;

    // Ouvrir dans une nouvelle fenêtre
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  const formatPeriodLabel = () => {
    if (viewMode === 'week') {
      const { startDate, endDate } = getDateRange();
      return `${startDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} - ${endDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`;
    } else {
      return currentDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    }
  };

  const days = getDaysInRange();

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">
      <div className="row mb-4">
        <div className="col">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-1">Planificateur de Repas</h2>
              <p className="text-muted">Organisez vos repas de la semaine</p>
            </div>
            <div className="d-flex gap-2">
              <button 
                className="btn btn-success"
                onClick={handleGenerateShoppingList}
                disabled={mealPlans.length === 0}
                title="Générer la liste de courses"
              >
                <i className="feather-shopping-cart me-2"></i>
                Liste de courses
              </button>
              <button 
                className="btn btn-info"
                onClick={handleDuplicateWeek}
                disabled={mealPlans.length === 0 || viewMode !== 'week'}
                title="Dupliquer la semaine"
              >
                <i className="feather-copy me-2"></i>
                Dupliquer
              </button>
              <button 
                className="btn btn-secondary"
                onClick={handleExportPDF}
                disabled={mealPlans.length === 0}
                title="Exporter en PDF"
              >
                <i className="feather-download me-2"></i>
                Export PDF
              </button>
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/recipes')}
              >
                <i className="feather-book-open me-2"></i>
                Mes Recettes
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center">
            <div className="btn-group">
              <button
                className={`btn btn-sm ${viewMode === 'week' ? 'btn-primary' : 'btn-light'}`}
                onClick={() => setViewMode('week')}
              >
                <i className="feather-calendar me-1"></i>
                Semaine
              </button>
              <button
                className={`btn btn-sm ${viewMode === 'month' ? 'btn-primary' : 'btn-light'}`}
                onClick={() => setViewMode('month')}
              >
                <i className="feather-grid me-1"></i>
                Mois
              </button>
            </div>

            <div className="d-flex align-items-center gap-3">
              <button className="btn btn-sm btn-light" onClick={handlePreviousPeriod}>
                <i className="feather-chevron-left"></i>
              </button>
              <h5 className="mb-0 text-capitalize">{formatPeriodLabel()}</h5>
              <button className="btn btn-sm btn-light" onClick={handleNextPeriod}>
                <i className="feather-chevron-right"></i>
              </button>
              <button className="btn btn-sm btn-primary" onClick={handleToday}>
                Aujourd'hui
              </button>
            </div>

            <div></div>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="card">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-bordered mb-0">
              <thead className="bg-light">
                <tr>
                  <th style={{ width: '150px' }}>Repas</th>
                  {days.map((day, idx) => {
                    const isToday = day.toDateString() === new Date().toDateString();
                    return (
                      <th key={idx} className={`text-center ${isToday ? 'bg-primary text-white' : ''}`}>
                        <div>{day.toLocaleDateString('fr-FR', { weekday: 'short' })}</div>
                        <div className="fw-bold">{day.getDate()}</div>
                        {isToday && <small>Aujourd'hui</small>}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {mealTypes.map(mealType => (
                  <tr key={mealType.key}>
                    <td className={`bg-light fw-semibold text-${mealType.color}`}>
                      <i className={`${mealType.icon} me-2`}></i>
                      {mealType.label}
                    </td>
                    {days.map((day, dayIdx) => {
                      const mealsInSlot = getMealPlansForDay(day, mealType.key);
                      return (
                        <td key={dayIdx} className="p-2" style={{ minHeight: '120px', verticalAlign: 'top' }}>
                          {mealsInSlot.length > 0 ? (
                            <div className="d-flex flex-column gap-2">
                              {mealsInSlot.map(meal => (
                                <div
                                  key={meal.id}
                                  className={`card card-body p-2 ${meal.completed ? 'bg-light text-muted' : ''}`}
                                  style={{ fontSize: '0.85rem' }}
                                >
                                  <div className="d-flex justify-content-between align-items-start mb-1">
                                    <span className={`fw-medium ${meal.completed ? 'text-decoration-line-through' : ''}`}>
                                      {meal.recipe.title}
                                    </span>
                                    <div className="dropdown">
                                      <button
                                        className="btn btn-sm btn-icon p-0"
                                        data-bs-toggle="dropdown"
                                      >
                                        <i className="feather-more-vertical"></i>
                                      </button>
                                      <ul className="dropdown-menu dropdown-menu-end">
                                        <li>
                                          <button
                                            className="dropdown-item"
                                            onClick={() => handleToggleComplete(meal.id)}
                                          >
                                            <i className={`feather-${meal.completed ? 'rotate-ccw' : 'check'} me-2`}></i>
                                            {meal.completed ? 'Marquer non préparé' : 'Marquer préparé'}
                                          </button>
                                        </li>
                                        <li>
                                          <button
                                            className="dropdown-item"
                                            onClick={() => navigate(`/recipes/${meal.recipe.id}`)}
                                          >
                                            <i className="feather-eye me-2"></i>
                                            Voir la recette
                                          </button>
                                        </li>
                                        <li><hr className="dropdown-divider" /></li>
                                        <li>
                                          <button
                                            className="dropdown-item text-danger"
                                            onClick={() => handleDeleteMeal(meal.id)}
                                          >
                                            <i className="feather-trash-2 me-2"></i>
                                            Supprimer
                                          </button>
                                        </li>
                                      </ul>
                                    </div>
                                  </div>
                                  <small className="text-muted">
                                    <i className="feather-users me-1"></i>
                                    {meal.servings} portions
                                  </small>
                                  {meal.recipe.image && (
                                    <img
                                      src={meal.recipe.image}
                                      alt={meal.recipe.title}
                                      className="rounded mt-2"
                                      style={{ width: '100%', height: '60px', objectFit: 'cover' }}
                                    />
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <button
                              className="btn btn-sm btn-light border-dashed w-100"
                              onClick={() => handleAddMeal(day, mealType.key)}
                            >
                              <i className="feather-plus"></i>
                            </button>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Meal Modal */}
      {showAddModal && (
        <div>
          <div className="modal-backdrop fade show"></div>
          <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Ajouter un repas</h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowAddModal(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Date et Type</label>
                    <div className="input-group">
                      <span className="input-group-text">
                        {selectedSlot?.date.toLocaleDateString('fr-FR')}
                      </span>
                      <span className="input-group-text">
                        {mealTypes.find(mt => mt.key === selectedSlot?.mealType)?.label}
                      </span>
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Recette *</label>
                    <select
                      className="form-select"
                      value={selectedRecipe}
                      onChange={(e) => setSelectedRecipe(e.target.value)}
                    >
                      <option value="">Sélectionner une recette</option>
                      {recipes.map(recipe => (
                        <option key={recipe.id} value={recipe.id}>
                          {recipe.title} ({recipe.category})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Nombre de portions</label>
                    <input
                      type="number"
                      className="form-control"
                      value={servings}
                      onChange={(e) => setServings(parseInt(e.target.value))}
                      min="1"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Notes (optionnel)</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Notes pour ce repas..."
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-light"
                    onClick={() => setShowAddModal(false)}
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleSaveMeal}
                  >
                    Ajouter
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        show={confirmModal.show}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal({ show: false, title: '', message: '', onConfirm: null, type: 'primary' })}
        confirmText="Confirmer"
        cancelText="Annuler"
      />
    </div>
  );
};

export default MealPlanner;
