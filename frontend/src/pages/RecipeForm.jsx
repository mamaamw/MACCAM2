import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import recipeService from '../services/recipeService'
import toast from '../utils/toast'

export default function RecipeForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(false)
  
  // Import
  const [importUrl, setImportUrl] = useState('')
  const [importLoading, setImportLoading] = useState(false)
  const [importError, setImportError] = useState('')
  
  // Formulaire
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Plat',
    difficulty: 'Inconnue',
    prepTime: '',
    cookTime: '',
    servings: 0,
    ingredients: [{ name: '', quantity: '', unit: '' }],
    steps: [''],
    image: '',
    tags: [],
    cuisine: '',
    isPublic: false,
    isFavorite: false,
    notes: '',
    source: '',
    sourceUrl: ''
  })
  
  const [newTag, setNewTag] = useState('')
  
  const categories = ['Entrée', 'Plat', 'Dessert', 'Boisson', 'Apéritif', 'Accompagnement', 'Sauce']
  const difficulties = ['Facile', 'Moyenne', 'Difficile', 'Inconnue']
  const cuisines = ['Française', 'Italienne', 'Asiatique', 'Mexicaine', 'Méditerranéenne', 'Autre']

  useEffect(() => {
    if (id) {
      loadRecipe()
    }
  }, [id])

  const loadRecipe = async () => {
    setLoading(true)
    try {
      const response = await recipeService.getRecipe(id)
      if (response.success) {
        const recipe = response.data
        setFormData({
          ...recipe,
          ingredients: JSON.parse(recipe.ingredients),
          steps: JSON.parse(recipe.steps),
          tags: recipe.tags ? JSON.parse(recipe.tags) : []
        })
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error)
      toast.error('Impossible de charger la recette')
      navigate('/recipes')
    } finally {
      setLoading(false)
    }
  }

  const handleImport = async () => {
    if (!importUrl.trim()) {
      setImportError('Veuillez entrer une URL')
      return
    }

    setImportLoading(true)
    setImportError('')
    
    try {
      const response = await recipeService.importFromUrl(importUrl)
      if (response.success) {
        const data = response.data;
        setFormData({
          ...formData,
          title: data.title || '',
          description: data.description || '',
          category: data.category || 'Plat',
          difficulty: data.difficulty || 'Inconnue',
          prepTime: data.prepTime || '',
          cookTime: data.cookTime || '',
          servings: data.servings || 0,
          image: data.image || '',
          cuisine: data.cuisine || '',
          source: data.source || '',
          sourceUrl: data.sourceUrl || '',
          notes: data.notes || '',
          ingredients: data.ingredients?.length > 0 
            ? data.ingredients 
            : [{ name: '', quantity: '', unit: '' }],
          steps: data.steps?.length > 0 
            ? data.steps 
            : [''],
          tags: data.tags || []
        })
        setImportUrl('')
        toast.success('Recette importée ! Vous pouvez maintenant la modifier avant de la sauvegarder.')
      }
    } catch (error) {
      console.error('Erreur lors de l\'import:', error)
      setImportError(error.message || 'Impossible d\'importer cette recette')
    } finally {
      setImportLoading(false)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (id) {
        await recipeService.updateRecipe(id, formData)
      } else {
        await recipeService.createRecipe(formData)
      }
      navigate('/recipes')
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      toast.error(error.message || 'Erreur lors de la sauvegarde')
    } finally {
      setLoading(false)
    }
  }

  const addIngredient = () => {
    setFormData({
      ...formData,
      ingredients: [...formData.ingredients, { name: '', quantity: '', unit: '' }]
    })
  }

  const removeIngredient = (index) => {
    setFormData({
      ...formData,
      ingredients: formData.ingredients.filter((_, i) => i !== index)
    })
  }

  const updateIngredient = (index, field, value) => {
    const newIngredients = [...formData.ingredients]
    newIngredients[index][field] = value
    setFormData({ ...formData, ingredients: newIngredients })
  }

  const addStep = () => {
    setFormData({ ...formData, steps: [...formData.steps, ''] })
  }

  const removeStep = (index) => {
    setFormData({ ...formData, steps: formData.steps.filter((_, i) => i !== index) })
  }

  const updateStep = (index, value) => {
    const newSteps = [...formData.steps]
    newSteps[index] = value
    setFormData({ ...formData, steps: newSteps })
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, newTag.trim()] })
      setNewTag('')
    }
  }

  const removeTag = (tag) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) })
  }

  if (loading && id) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="container-fluid p-4">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h4 className="mb-0">
                {id ? 'Modifier la recette' : 'Nouvelle recette'}
              </h4>
              <button 
                type="button" 
                className="btn btn-light"
                onClick={() => navigate('/recipes')}
              >
                <i className="feather-x me-2"></i>
                Annuler
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="card-body">
                {/* Section d'import depuis URL */}
                {!id && (
                  <div className="alert alert-info mb-4">
                    <h6 className="alert-heading mb-3">
                      <i className="feather-download me-2"></i>
                      Importer une recette depuis une URL
                    </h6>
                    <div className="input-group">
                      <input 
                        type="url" 
                        className="form-control"
                        placeholder="https://www.marmiton.org/recettes/..." 
                        value={importUrl}
                        onChange={(e) => setImportUrl(e.target.value)}
                        disabled={importLoading}
                      />
                      <button 
                        type="button"
                        className="btn btn-primary" 
                        onClick={handleImport}
                        disabled={importLoading || !importUrl.trim()}
                      >
                        {importLoading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Import...
                          </>
                        ) : (
                          <>
                            <i className="feather-download me-2"></i>
                            Importer
                          </>
                        )}
                      </button>
                    </div>
                    {importError && (
                      <div className="text-danger mt-2 small">
                        <i className="feather-alert-circle me-1"></i>
                        {importError}
                      </div>
                    )}
                    <small className="text-muted mt-2 d-block">
                      Sites supportés : Marmiton, CuisineAZ, Recette Healthy, Tangerine Zest, et tout site avec des données structurées
                    </small>
                  </div>
                )}

                <div className="row g-3">
                  {/* Informations de base */}
                  <div className="col-12">
                    <label className="form-label">Titre *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    ></textarea>
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">Catégorie *</label>
                    <select
                      className="form-select"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      required
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">Difficulté</label>
                    <select
                      className="form-select"
                      value={formData.difficulty}
                      onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    >
                      {difficulties.map(diff => (
                        <option key={diff} value={diff}>{diff}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">Type de cuisine</label>
                    <select
                      className="form-select"
                      value={formData.cuisine}
                      onChange={(e) => setFormData({ ...formData, cuisine: e.target.value })}
                    >
                      <option value="">- Sélectionner -</option>
                      {cuisines.map(cuisine => (
                        <option key={cuisine} value={cuisine}>{cuisine}</option>
                      ))}
                    </select>
                  </div>

                  {/* Temps et portions */}
                  <div className="col-md-4">
                    <label className="form-label">Temps de préparation (min)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.prepTime}
                      onChange={(e) => setFormData({ ...formData, prepTime: e.target.value })}
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">Temps de cuisson (min)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.cookTime}
                      onChange={(e) => setFormData({ ...formData, cookTime: e.target.value })}
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label">Portions</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.servings}
                      onChange={(e) => setFormData({ ...formData, servings: e.target.value })}
                    />
                  </div>

                  {/* Ingrédients */}
                  <div className="col-12">
                    <hr />
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h6 className="mb-0">Ingrédients</h6>
                      <button type="button" className="btn btn-sm btn-primary" onClick={addIngredient}>
                        <i className="feather-plus me-2"></i>
                        Ajouter
                      </button>
                    </div>
                    {formData.ingredients.map((ing, index) => (
                      <div key={index} className="row g-2 mb-2">
                        <div className="col-md-2">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Quantité"
                            value={ing.quantity}
                            onChange={(e) => updateIngredient(index, 'quantity', e.target.value)}
                          />
                        </div>
                        <div className="col-md-2">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Unité"
                            value={ing.unit}
                            onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                          />
                        </div>
                        <div className="col-md-7">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Nom de l'ingrédient"
                            value={ing.name}
                            onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                          />
                        </div>
                        <div className="col-md-1">
                          <button
                            type="button"
                            className="btn btn-light w-100"
                            onClick={() => removeIngredient(index)}
                          >
                            <i className="feather-trash-2"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Étapes */}
                  <div className="col-12">
                    <hr />
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h6 className="mb-0">Étapes de préparation</h6>
                      <button type="button" className="btn btn-sm btn-primary" onClick={addStep}>
                        <i className="feather-plus me-2"></i>
                        Ajouter
                      </button>
                    </div>
                    {formData.steps.map((step, index) => (
                      <div key={index} className="row g-2 mb-2">
                        <div className="col-md-1 d-flex align-items-center">
                          <span className="badge bg-primary">{index + 1}</span>
                        </div>
                        <div className="col-md-10">
                          <textarea
                            className="form-control"
                            rows="2"
                            placeholder="Description de l'étape"
                            value={step}
                            onChange={(e) => updateStep(index, e.target.value)}
                          ></textarea>
                        </div>
                        <div className="col-md-1">
                          <button
                            type="button"
                            className="btn btn-light w-100"
                            onClick={() => removeStep(index)}
                          >
                            <i className="feather-trash-2"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Image */}
                  <div className="col-12">
                    <hr />
                    <h6 className="mb-3">Photo</h6>
                  </div>

                  <div className="col-12">
                    <label className="form-label">URL de l'image</label>
                    <input
                      type="url"
                      className="form-control"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      placeholder="https://..."
                    />
                    {formData.image && (
                      <img 
                        src={formData.image} 
                        alt="Aperçu" 
                        className="img-thumbnail mt-2" 
                        style={{ maxHeight: '200px' }}
                        onError={(e) => e.target.style.display = 'none'}
                      />
                    )}
                  </div>

                  {/* Tags */}
                  <div className="col-12">
                    <hr />
                    <h6 className="mb-3">Tags</h6>
                  </div>

                  <div className="col-12">
                    <div className="input-group mb-2">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Ajouter un tag"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      />
                      <button type="button" className="btn btn-primary" onClick={addTag}>
                        Ajouter
                      </button>
                    </div>
                    <div>
                      {formData.tags.map(tag => (
                        <span key={tag} className="badge bg-secondary me-2 mb-2">
                          {tag}
                          <i
                            className="feather-x ms-2"
                            style={{ cursor: 'pointer' }}
                            onClick={() => removeTag(tag)}
                          ></i>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Informations supplémentaires */}
                  <div className="col-12">
                    <hr />
                    <h6 className="mb-3">Informations supplémentaires</h6>
                  </div>

                  <div className="col-12">
                    <label className="form-label">Notes personnelles</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    ></textarea>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">Source</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.source}
                      onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                      placeholder="Ex: Grand-mère, Blog cuisine..."
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label">URL de la source</label>
                    <input
                      type="url"
                      className="form-control"
                      value={formData.sourceUrl}
                      onChange={(e) => setFormData({ ...formData, sourceUrl: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>

                  <div className="col-md-6">
                    <div className="form-check form-switch">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="isPublic"
                        checked={formData.isPublic}
                        onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                      />
                      <label className="form-check-label" htmlFor="isPublic">
                        Recette publique
                      </label>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="form-check form-switch">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="isFavorite"
                        checked={formData.isFavorite}
                        onChange={(e) => setFormData({ ...formData, isFavorite: e.target.checked })}
                      />
                      <label className="form-check-label" htmlFor="isFavorite">
                        Ajouter aux favoris
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card-footer d-flex justify-content-between">
                <button 
                  type="button" 
                  className="btn btn-light"
                  onClick={() => navigate('/recipes')}
                >
                  Annuler
                </button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
