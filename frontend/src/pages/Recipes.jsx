import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import recipeService from '../services/recipeService'
import shoppingListService from '../services/shoppingListService'
import mealPlanService from '../services/mealPlanService'
import toast from '../utils/toast'

export default function Recipes() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(false)
  const [activeView, setActiveView] = useState('grid') // grid, list, detail
  const [selectedRecipe, setSelectedRecipe] = useState(null)
  const [showServingsModal, setShowServingsModal] = useState(false)
  const [showPlannerModal, setShowPlannerModal] = useState(false)
  const [servingsInput, setServingsInput] = useState(4)
  const [plannerDates, setPlannerDates] = useState([{ date: '', mealType: 'lunch', servings: 4 }])
  
  // Filtres
  const [filters, setFilters] = useState({
    category: '',
    difficulty: '',
    search: '',
    isFavorite: false
  })

  useEffect(() => {
    loadRecipes()
  }, [filters])

  const loadRecipes = async () => {
    setLoading(true)
    try {
      const response = await recipeService.getRecipes(filters)
      if (response.success) {
        setRecipes(response.data.map(r => ({
          ...r,
          ingredients: JSON.parse(r.ingredients),
          steps: JSON.parse(r.steps),
          tags: r.tags ? JSON.parse(r.tags) : []
        })))
      }
    } catch (error) {
      console.error('Erreur lors du chargement des recettes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette recette ?')) return
    try {
      await recipeService.deleteRecipe(id)
      loadRecipes()
      if (selectedRecipe?.id === id) {
        setSelectedRecipe(null)
        setActiveView('grid')
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
      toast.error(error.message || 'Erreur lors de la suppression')
    }
  }

  const handleToggleFavorite = async (id) => {
    try {
      await recipeService.toggleFavorite(id)
      loadRecipes()
      if (selectedRecipe?.id === id) {
        setSelectedRecipe({ ...selectedRecipe, isFavorite: !selectedRecipe.isFavorite })
      }
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const handleViewRecipe = (recipe) => {
    setSelectedRecipe(recipe)
    setActiveView('detail')
  }

  const handleOpenServingsModal = (recipe) => {
    setSelectedRecipe(recipe)
    setServingsInput(recipe.servings || 4)
    setShowServingsModal(true)
  }

  const handleOpenPlannerModal = (recipe) => {
    setSelectedRecipe(recipe)
    // Définir la date du lendemain par défaut
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const dateStr = tomorrow.toISOString().split('T')[0]
    setPlannerDates([{ date: dateStr, mealType: 'lunch', servings: recipe.servings || 4 }])
    setShowPlannerModal(true)
  }

  const handleAddDateSlot = () => {
    setPlannerDates([...plannerDates, { date: '', mealType: 'lunch', servings: selectedRecipe?.servings || 4 }])
  }

  const handleRemoveDateSlot = (index) => {
    setPlannerDates(plannerDates.filter((_, i) => i !== index))
  }

  const handleUpdateDateSlot = (index, field, value) => {
    const updated = [...plannerDates]
    updated[index][field] = value
    setPlannerDates(updated)
  }

  const handleAddToPlanner = async () => {
    // Vérifier que toutes les dates sont remplies
    if (plannerDates.some(d => !d.date)) {
      toast.warning('Veuillez remplir toutes les dates')
      return
    }

    try {
      const response = await mealPlanService.createMultipleMealPlans(
        selectedRecipe.id,
        plannerDates
      )
      if (response.success) {
        // Ajouter automatiquement les ingrédients à la liste de courses pour chaque repas planifié
        try {
          for (const planDate of plannerDates) {
            await shoppingListService.addFromRecipe(
              selectedRecipe.id, 
              planDate.servings || selectedRecipe.servings,
              planDate.date // Passer la date du meal plan
            )
          }
        } catch (error) {
          console.error('Erreur lors de l\'ajout à la liste de courses:', error)
          // Ne pas bloquer si l'ajout à la liste échoue
        }
        
        toast.success(response.message || 'Recette ajoutée au planificateur et ingrédients ajoutés à la liste de courses !')
        setShowPlannerModal(false)
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error)
      toast.error('Erreur lors de l\'ajout au planificateur')
    }
  }

  const handleAddToShoppingList = async () => {
    try {
      const response = await shoppingListService.addFromRecipe(selectedRecipe.id, servingsInput)
      if (response.success) {
        toast.success(response.message || 'Recette ajoutée à la liste de courses !')
        setShowServingsModal(false)
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error)
      toast.error('Erreur lors de l\'ajout à la liste de courses')
    }
  }

  const getTotalTime = (recipe) => {
    const prep = recipe.prepTime || 0
    const cook = recipe.cookTime || 0
    return prep + cook
  }

  const categories = ['Entrée', 'Plat', 'Dessert', 'Boisson', 'Apéritif', 'Accompagnement', 'Sauce']
  const difficulties = ['Facile', 'Moyenne', 'Difficile', 'Inconnue']

  return (
    <>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left d-flex align-items-center">
          <div className="page-header-title">
            <h5 className="m-b-10">Mes Recettes</h5>
          </div>
          <ul className="breadcrumb">
            <li className="breadcrumb-item"><a href="/">Accueil</a></li>
            <li className="breadcrumb-item">Recettes</li>
          </ul>
        </div>
        <div className="page-header-right ms-auto">
          <button className="btn btn-primary" onClick={() => navigate('/recipes/new')}>
            <i className="feather-plus me-2"></i>
            Nouvelle Recette
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="row">
          {/* Sidebar Filtres */}
          <div className="col-xl-3">
            <div className="card stretch stretch-full">
              <div className="card-header">
                <h5 className="card-title">Filtres</h5>
              </div>
              <div className="card-body">
                {/* Recherche */}
                <div className="mb-4">
                  <label className="form-label">Rechercher</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Titre, ingrédient..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  />
                </div>

                {/* Catégorie */}
                <div className="mb-4">
                  <label className="form-label">Catégorie</label>
                  <select
                    className="form-select"
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  >
                    <option value="">Toutes</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Difficulté */}
                <div className="mb-4">
                  <label className="form-label">Difficulté</label>
                  <select
                    className="form-select"
                    value={filters.difficulty}
                    onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
                  >
                    <option value="">Toutes</option>
                    {difficulties.map(diff => (
                      <option key={diff} value={diff}>{diff}</option>
                    ))}
                  </select>
                </div>

                {/* Favoris */}
                <div className="form-check form-switch">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="favFilter"
                    checked={filters.isFavorite}
                    onChange={(e) => setFilters({ ...filters, isFavorite: e.target.checked })}
                  />
                  <label className="form-check-label" htmlFor="favFilter">
                    Favoris uniquement
                  </label>
                </div>

                <button
                  className="btn btn-light w-100 mt-4"
                  onClick={() => setFilters({ category: '', difficulty: '', search: '', isFavorite: false })}
                >
                  Réinitialiser
                </button>
              </div>
            </div>
          </div>

          {/* Contenu Principal */}
          <div className="col-xl-9">
            {activeView === 'detail' && selectedRecipe ? (
              /* Vue détaillée d'une recette */
              <div className="card stretch stretch-full">
                <div className="card-header d-flex align-items-center justify-content-between">
                  <button className="btn btn-sm btn-light" onClick={() => setActiveView('grid')}>
                    <i className="feather-arrow-left me-2"></i>
                    Retour
                  </button>
                  <div>
                    <button className="btn btn-sm btn-success me-2" onClick={() => handleOpenServingsModal(selectedRecipe)}>
                      <i className="feather-shopping-cart me-2"></i>
                      Faire cette recette
                    </button>
                    <button className="btn btn-sm btn-light me-2" onClick={() => navigate(`/recipes/${selectedRecipe.id}/edit`)}>
                      <i className="feather-edit"></i>
                    </button>
                    <button className="btn btn-sm btn-light me-2" onClick={() => handleToggleFavorite(selectedRecipe.id)}>
                      <i className={`feather-heart ${selectedRecipe.isFavorite ? 'text-danger' : ''}`}></i>
                    </button>
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(selectedRecipe.id)}>
                      <i className="feather-trash-2"></i>
                    </button>
                  </div>
                </div>
                <div className="card-body">
                  {selectedRecipe.image && (
                    <img src={selectedRecipe.image} alt={selectedRecipe.title} className="img-fluid rounded mb-4" style={{ maxHeight: '400px', width: '100%', objectFit: 'cover' }} />
                  )}
                  
                  <h2 className="mb-3">{selectedRecipe.title}</h2>
                  
                  {selectedRecipe.description && (
                    <p className="text-muted mb-4">{selectedRecipe.description}</p>
                  )}

                  <div className="row mb-4">
                    <div className="col-md-3">
                      <div className="d-flex align-items-center">
                        <i className="feather-clock me-2 text-primary"></i>
                        <div>
                          <small className="text-muted">Préparation</small>
                          <div className="fw-semibold">{selectedRecipe.prepTime || 0} min</div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="d-flex align-items-center">
                        <i className="feather-clock me-2 text-warning"></i>
                        <div>
                          <small className="text-muted">Cuisson</small>
                          <div className="fw-semibold">{selectedRecipe.cookTime || 0} min</div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="d-flex align-items-center">
                        <i className="feather-users me-2 text-success"></i>
                        <div>
                          <small className="text-muted">Portions</small>
                          <div className="fw-semibold">{selectedRecipe.servings}</div>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="d-flex align-items-center">
                        <i className="feather-bar-chart me-2 text-info"></i>
                        <div>
                          <small className="text-muted">Difficulté</small>
                          <div className="fw-semibold">{selectedRecipe.difficulty}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <span className="badge bg-primary me-2">{selectedRecipe.category}</span>
                    {selectedRecipe.cuisine && (
                      <span className="badge bg-info me-2">{selectedRecipe.cuisine}</span>
                    )}
                    {selectedRecipe.tags.map(tag => (
                      <span key={tag} className="badge bg-secondary me-2">{tag}</span>
                    ))}
                  </div>

                  <hr />

                  <div className="row">
                    <div className="col-md-5">
                      <h5 className="mb-3">Ingrédients</h5>
                      <ul className="list-unstyled">
                        {selectedRecipe.ingredients.map((ing, index) => (
                          <li key={index} className="mb-2">
                            <i className="feather-check text-success me-2"></i>
                            <strong>{ing.quantity} {ing.unit}</strong> {ing.name}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="col-md-7">
                      <h5 className="mb-3">Étapes</h5>
                      <ol className="ps-3">
                        {selectedRecipe.steps.map((step, index) => (
                          <li key={index} className="mb-3">{step}</li>
                        ))}
                      </ol>
                    </div>
                  </div>

                  {selectedRecipe.notes && (
                    <>
                      <hr />
                      <div>
                        <h6>Notes personnelles</h6>
                        <p className="text-muted">{selectedRecipe.notes}</p>
                      </div>
                    </>
                  )}

                  {selectedRecipe.source && (
                    <>
                      <hr />
                      <div>
                        <h6>Source</h6>
                        <p>
                          {selectedRecipe.source}
                          {selectedRecipe.sourceUrl && (
                            <a href={selectedRecipe.sourceUrl} target="_blank" rel="noopener noreferrer" className="ms-2">
                              <i className="feather-external-link"></i>
                            </a>
                          )}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              /* Vue grille des recettes */
              <>
                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Chargement...</span>
                    </div>
                  </div>
                ) : recipes.length === 0 ? (
                  <div className="card">
                    <div className="card-body text-center py-5">
                      <i className="feather-book-open" style={{ fontSize: '48px', color: '#ddd' }}></i>
                      <h5 className="mt-3">Aucune recette</h5>
                      <p className="text-muted">Créez votre première recette pour commencer !</p>
                      <button className="btn btn-primary" onClick={() => navigate('/recipes/new')}>
                        <i className="feather-plus me-2"></i>
                        Nouvelle Recette
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="row">
                    {recipes.map(recipe => (
                      <div key={recipe.id} className="col-xl-4 col-md-6 mb-4">
                        <div className="card h-100">
                          {recipe.image && (
                            <img
                              src={recipe.image}
                              className="card-img-top"
                              alt={recipe.title}
                              style={{ height: '200px', objectFit: 'cover', cursor: 'pointer' }}
                              onClick={() => handleViewRecipe(recipe)}
                            />
                          )}
                          <div className="card-body">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <h6 className="card-title mb-0" style={{ cursor: 'pointer' }} onClick={() => handleViewRecipe(recipe)}>
                                {recipe.title}
                              </h6>
                              <button
                                className="btn btn-sm btn-link p-0"
                                onClick={() => handleToggleFavorite(recipe.id)}
                              >
                                <i className={`feather-heart ${recipe.isFavorite ? 'text-danger' : ''}`}></i>
                              </button>
                            </div>
                            
                            {recipe.description && (
                              <p className="card-text small text-muted mb-3">{recipe.description.substring(0, 80)}...</p>
                            )}

                            <div className="mb-3">
                              <span className="badge bg-primary me-1">{recipe.category}</span>
                              <span className="badge bg-secondary">{recipe.difficulty}</span>
                            </div>

                            <div className="d-flex justify-content-between text-muted small mb-3">
                              <span><i className="feather-clock me-1"></i>{getTotalTime(recipe)} min</span>
                              <span><i className="feather-users me-1"></i>{recipe.servings} parts</span>
                            </div>

                            <div className="d-flex gap-2">
                              <button className="btn btn-sm btn-light" onClick={() => handleViewRecipe(recipe)}>
                                <i className="feather-eye me-1"></i>
                                Voir
                              </button>
                              <button 
                                className="btn btn-sm btn-info" 
                                onClick={() => handleOpenPlannerModal(recipe)}
                                title="Planifier cette recette"
                              >
                                <i className="feather-calendar"></i>
                              </button>
                              <button 
                                className="btn btn-sm btn-success" 
                                onClick={() => handleOpenServingsModal(recipe)}
                                title="Ajouter à la liste de courses"
                              >
                                <i className="feather-shopping-cart"></i>
                              </button>
                              <button className="btn btn-sm btn-light" onClick={() => navigate(`/recipes/${recipe.id}/edit`)}>
                                <i className="feather-edit"></i>
                              </button>
                              <button className="btn btn-sm btn-light" onClick={() => handleDelete(recipe.id)}>
                                <i className="feather-trash-2"></i>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modal pour sélectionner les portions */}
      {showServingsModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Faire cette recette</h5>
                <button type="button" className="btn-close" onClick={() => setShowServingsModal(false)}></button>
              </div>
              <div className="modal-body">
                <p className="text-muted mb-3">
                  Combien de portions souhaitez-vous préparer ?
                </p>
                <div className="mb-3">
                  <label className="form-label">Nombre de portions</label>
                  <input
                    type="number"
                    min="1"
                    value={servingsInput}
                    onChange={(e) => setServingsInput(parseInt(e.target.value) || 1)}
                    className="form-control"
                  />
                  <small className="text-muted">
                    Les quantités d'ingrédients seront automatiquement ajustées
                  </small>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowServingsModal(false)}>
                  Annuler
                </button>
                <button type="button" className="btn btn-success" onClick={handleAddToShoppingList}>
                  <i className="feather-shopping-cart me-2"></i>
                  Ajouter à la liste de courses
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal pour planifier les repas */}
      {showPlannerModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="feather-calendar me-2"></i>
                  Planifier "{selectedRecipe?.title}"
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowPlannerModal(false)}></button>
              </div>
              <div className="modal-body">
                <p className="text-muted mb-4">
                  Sélectionnez une ou plusieurs dates pour planifier cette recette
                </p>

                {plannerDates.map((slot, index) => (
                  <div key={index} className="card mb-3">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h6 className="mb-0">Repas #{index + 1}</h6>
                        {plannerDates.length > 1 && (
                          <button
                            className="btn btn-sm btn-light text-danger"
                            onClick={() => handleRemoveDateSlot(index)}
                          >
                            <i className="feather-x"></i>
                          </button>
                        )}
                      </div>

                      <div className="row g-3">
                        <div className="col-md-5">
                          <label className="form-label">Date</label>
                          <input
                            type="date"
                            className="form-control"
                            value={slot.date}
                            onChange={(e) => handleUpdateDateSlot(index, 'date', e.target.value)}
                            required
                          />
                        </div>

                        <div className="col-md-4">
                          <label className="form-label">Type de repas</label>
                          <select
                            className="form-select"
                            value={slot.mealType}
                            onChange={(e) => handleUpdateDateSlot(index, 'mealType', e.target.value)}
                          >
                            <option value="breakfast">Petit-déjeuner</option>
                            <option value="lunch">Déjeuner</option>
                            <option value="dinner">Dîner</option>
                            <option value="snack">Collation</option>
                          </select>
                        </div>

                        <div className="col-md-3">
                          <label className="form-label">Portions</label>
                          <input
                            type="number"
                            className="form-control"
                            min="1"
                            value={slot.servings}
                            onChange={(e) => handleUpdateDateSlot(index, 'servings', parseInt(e.target.value) || 1)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  className="btn btn-light border-dashed w-100"
                  onClick={handleAddDateSlot}
                >
                  <i className="feather-plus me-2"></i>
                  Ajouter une autre date
                </button>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowPlannerModal(false)}>
                  Annuler
                </button>
                <button type="button" className="btn btn-primary" onClick={handleAddToPlanner}>
                  <i className="feather-calendar me-2"></i>
                  Ajouter au planificateur
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
