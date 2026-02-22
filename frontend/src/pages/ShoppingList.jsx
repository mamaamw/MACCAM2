import React, { useState, useEffect } from 'react';
import shoppingListService from '../services/shoppingListService';
import toast from '../utils/toast';
import ConfirmModal from '../components/ConfirmModal';
import { formatWeekLabel, compareWeeks } from '../utils/dateHelpers';

const ShoppingList = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [collapsedCategories, setCollapsedCategories] = useState({});
  const [hideChecked, setHideChecked] = useState(false);
  const [viewMode, setViewMode] = useState('grouped'); // grouped, list
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    title: '',
    message: '',
    onConfirm: null,
    type: 'primary'
  });
  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    unit: '',
    category: 'Autre',
    notes: ''
  });

  const categories = [
    { name: 'Fruits & Légumes', icon: 'feather-aperture', color: 'success' },
    { name: 'Viandes & Poissons', icon: 'feather-package', color: 'danger' },
    { name: 'Produits laitiers', icon: 'feather-droplet', color: 'info' },
    { name: 'Épicerie', icon: 'feather-shopping-bag', color: 'warning' },
    { name: 'Boulangerie', icon: 'feather-sun', color: 'secondary' },
    { name: 'Boissons', icon: 'feather-coffee', color: 'primary' },
    { name: 'Surgelés', icon: 'feather-wind', color: 'cyan' },
    { name: 'Autre', icon: 'feather-more-horizontal', color: 'dark' }
  ];

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await shoppingListService.getItems();
      setItems(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await shoppingListService.updateItem(editingItem.id, formData);
      } else {
        await shoppingListService.addItem(formData);
      }
      setShowModal(false);
      setEditingItem(null);
      setFormData({ name: '', quantity: '', unit: '', category: 'Autre', notes: '' });
      fetchItems();
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleToggleCheck = async (item) => {
    try {
      await shoppingListService.toggleCheck(item.id, !item.isChecked);
      fetchItems();
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleDeleteItem = async (id) => {
    if (window.confirm('Supprimer cet item ?')) {
      try {
        await shoppingListService.deleteItem(id);
        fetchItems();
      } catch (error) {
        console.error('Erreur:', error);
      }
    }
  };

  const handleClearChecked = async () => {
    const checkedCount = items.filter(item => item.isChecked).length;
    if (checkedCount === 0) {
      toast.warning('Aucun item coché à supprimer');
      return;
    }
    
    setConfirmModal({
      show: true,
      title: 'Supprimer les items cochés',
      message: `Voulez-vous vraiment supprimer les ${checkedCount} items cochés ?`,
      type: 'danger',
      onConfirm: async () => {
        setConfirmModal({ show: false, title: '', message: '', onConfirm: null, type: 'primary' });
        try {
          await shoppingListService.clearChecked();
          fetchItems();
          toast.success(`${checkedCount} item${checkedCount > 1 ? 's' : ''} supprimé${checkedCount > 1 ? 's' : ''}`);
        } catch (error) {
          console.error('Erreur:', error);
          toast.error('Erreur lors de la suppression');
        }
      }
    });
  };

  const handleToggleCategoryCheck = async (categoryItems, shouldCheck, categoryName) => {
    const itemsToToggle = categoryItems.filter(item => item.isChecked !== shouldCheck);
    
    if (itemsToToggle.length === 0) {
      return;
    }
    
    const action = shouldCheck ? 'cocher' : 'décocher';
    
    // Afficher le modal de confirmation
    setConfirmModal({
      show: true,
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} la catégorie`,
      message: `Voulez-vous vraiment ${action} tous les ${itemsToToggle.length} items de la catégorie "${categoryName}" ?`,
      type: shouldCheck ? 'success' : 'warning',
      onConfirm: async () => {
        setConfirmModal({ show: false, title: '', message: '', onConfirm: null, type: 'primary' });
        try {
          for (const item of itemsToToggle) {
            await shoppingListService.toggleCheck(item.id, shouldCheck);
          }
          fetchItems();
        } catch (error) {
          console.error('Erreur lors de la mise à jour de la catégorie:', error);
        }
      }
    });
  };

  const handleToggleAllChecked = async () => {
    // Vérifier si tous les items sont cochés
    const allChecked = items.every(item => item.isChecked);
    const shouldCheck = !allChecked;
    
    const itemsToToggle = items.filter(item => item.isChecked !== shouldCheck);
    
    if (itemsToToggle.length === 0) {
      return;
    }
    
    const action = shouldCheck ? 'cocher' : 'décocher';
    
    // Afficher le modal de confirmation
    setConfirmModal({
      show: true,
      title: `${action.charAt(0).toUpperCase() + action.slice(1)} tous les items`,
      message: `Voulez-vous vraiment ${action} tous les ${itemsToToggle.length} items de votre liste de courses ?`,
      type: shouldCheck ? 'success' : 'warning',
      onConfirm: async () => {
        setConfirmModal({ show: false, title: '', message: '', onConfirm: null, type: 'primary' });
        try {
          for (const item of itemsToToggle) {
            await shoppingListService.toggleCheck(item.id, shouldCheck);
          }
          fetchItems();
        } catch (error) {
          console.error('Erreur lors de la mise à jour globale:', error);
        }
      }
    });
  };

  const openModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        quantity: item.quantity || '',
        unit: item.unit || '',
        category: item.category,
        notes: item.notes || ''
      });
    } else {
      setEditingItem(null);
      setFormData({ name: '', quantity: '', unit: '', category: 'Autre', notes: '' });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setFormData({ name: '', quantity: '', unit: '', category: 'Autre', notes: '' });
  };

  const toggleCategory = (category) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const getCategoryConfig = (categoryName) => {
    return categories.find(c => c.name === categoryName) || categories[categories.length - 1];
  };

  // Grouper les items par semaine, puis par catégorie
  const groupedByWeek = items.reduce((acc, item) => {
    const weekKey = item.weekOf || 'no-week';
    if (!acc[weekKey]) {
      acc[weekKey] = {};
    }
    
    const category = item.category || 'Autre';
    if (!acc[weekKey][category]) {
      acc[weekKey][category] = [];
    }
    
    acc[weekKey][category].push(item);
    return acc;
  }, {});

  // Filtrer les items cochés si hideChecked est activé
  const filteredGroupedByWeek = Object.entries(groupedByWeek).reduce((acc, [weekKey, categories]) => {
    const filteredCategories = Object.entries(categories).reduce((catAcc, [category, catItems]) => {
      const filtered = hideChecked ? catItems.filter(item => !item.isChecked) : catItems;
      if (filtered.length > 0) {
        catAcc[category] = filtered;
      }
      return catAcc;
    }, {});
    
    // Inclure seulement les semaines qui ont des catégories avec des items
    if (Object.keys(filteredCategories).length > 0) {
      acc[weekKey] = filteredCategories;
    }
    
    return acc;
  }, {});

  // Statistiques
  const totalItems = items.length;
  const checkedItems = items.filter(item => item.isChecked).length;
  const uncheckedItems = totalItems - checkedItems;
  const progress = totalItems > 0 ? (checkedItems / totalItems) * 100 : 0;

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
    <>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left d-flex align-items-center">
          <div className="page-header-title">
            <h5 className="m-b-10">Liste de courses</h5>
          </div>
          <ul className="breadcrumb">
            <li className="breadcrumb-item"><a href="/">Accueil</a></li>
            <li className="breadcrumb-item">Liste de courses</li>
          </ul>
        </div>
        <div className="page-header-right ms-auto">
          <button className="btn btn-primary" onClick={() => openModal()}>
            <i className="feather-plus me-2"></i>
            Ajouter un item
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="row">
          <div className="col-lg-12">
            <div className="card stretch stretch-full">
              <div className="card-header">
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                  <h5 className="card-title mb-0">
                    <i className="feather-shopping-cart me-2"></i>
                    Mes courses
                    <span className="badge bg-soft-primary text-primary ms-2">{uncheckedItems} restants</span>
                  </h5>
                  <div className="d-flex gap-2 align-items-center flex-wrap">
                    {/* Toggle hide checked */}
                    <div className="form-check form-switch mb-0">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="hideChecked"
                        checked={hideChecked}
                        onChange={(e) => setHideChecked(e.target.checked)}
                      />
                      <label className="form-check-label" htmlFor="hideChecked">
                        Masquer cochés
                      </label>
                    </div>

                    {/* View Mode Toggle */}
                    <div className="btn-group" role="group">
                      <button
                        type="button"
                        className={`btn btn-sm ${viewMode === 'grouped' ? 'btn-primary' : 'btn-light-brand'}`}
                        onClick={() => setViewMode('grouped')}
                        title="Vue groupée"
                      >
                        <i className="feather-grid"></i>
                      </button>
                      <button
                        type="button"
                        className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-light-brand'}`}
                        onClick={() => setViewMode('list')}
                        title="Vue liste"
                      >
                        <i className="feather-list"></i>
                      </button>
                    </div>

                    {/* Toggle all checked button */}
                    {totalItems > 0 && (
                      <button 
                        className={`btn btn-sm ${items.every(item => item.isChecked) ? 'btn-light-brand' : 'btn-success'}`}
                        onClick={handleToggleAllChecked}
                        title={items.every(item => item.isChecked) ? 'Tout décocher' : 'Tout cocher'}
                      >
                        <i className={`feather-${items.every(item => item.isChecked) ? 'x' : 'check-square'} me-1`}></i>
                        {items.every(item => item.isChecked) ? 'Tout décocher' : 'Tout cocher'}
                      </button>
                    )}

                    {/* Clear checked button */}
                    {checkedItems > 0 && (
                      <button className="btn btn-sm btn-danger" onClick={handleClearChecked}>
                        <i className="feather-trash-2 me-1"></i>
                        Supprimer cochés ({checkedItems})
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="card-body">
                {/* Progress Bar */}
                {totalItems > 0 && (
                  <div className="mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-muted small">{checkedItems} / {totalItems} items complétés</span>
                      <span className="fw-bold text-success">{Math.round(progress)}%</span>
                    </div>
                    <div className="progress" style={{ height: '10px' }}>
                      <div
                        className="progress-bar bg-success progress-bar-striped progress-bar-animated"
                        role="progressbar"
                        style={{ width: `${progress}%` }}
                        aria-valuenow={progress}
                        aria-valuemin="0"
                        aria-valuemax="100"
                      ></div>
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {totalItems === 0 ? (
                  <div className="text-center py-5">
                    <i className="feather-shopping-cart" style={{ fontSize: '4rem', color: '#cbd5e1' }}></i>
                    <h5 className="mt-3 text-muted">Votre liste de courses est vide</h5>
                    <p className="text-muted">Ajoutez des items manuellement ou depuis une recette</p>
                    <button className="btn btn-primary mt-3" onClick={() => openModal()}>
                      <i className="feather-plus me-2"></i>
                      Ajouter votre premier item
                    </button>
                  </div>
                ) : viewMode === 'grouped' ? (
                  /* Vue groupée par semaine puis catégorie */
                  <div className="accordion accordion-flush" id="shoppingListAccordion">
                    {Object.entries(filteredGroupedByWeek)
                      .sort(([weekA], [weekB]) => compareWeeks(weekA === 'no-week' ? null : weekA, weekB === 'no-week' ? null : weekB))
                      .map(([weekKey, weekCategories]) => {
                        const weekLabel = weekKey === 'no-week' ? 'Sans semaine' : formatWeekLabel(weekKey);
                        const weekItems = Object.values(weekCategories).flat();
                        const weekChecked = weekItems.filter(i => i.isChecked).length;
                        const weekTotal = weekItems.length;

                        return (
                          <div key={weekKey} className="mb-4">
                            {/* En-tête de semaine */}
                            <div className="d-flex align-items-center mb-3 pb-2 border-bottom">
                              <h5 className="mb-0 text-primary">
                                <i className="feather-calendar me-2"></i>
                                {weekLabel}
                              </h5>
                              <span className="badge bg-soft-primary text-primary ms-3">
                                {weekTotal - weekChecked} / {weekTotal} items
                              </span>
                            </div>

                            {/* Catégories de cette semaine */}
                            {Object.entries(weekCategories)
                              .sort(([catA], [catB]) => catA.localeCompare(catB))
                              .map(([categoryName, categoryItems]) => {
                                const catConfig = getCategoryConfig(categoryName);
                                const catChecked = categoryItems.filter(i => i.isChecked).length;
                                const catTotal = categoryItems.length;
                                const categoryKey = `${weekKey}-${categoryName}`;
                                const isCollapsed = collapsedCategories[categoryKey];

                                return (
                                  <div key={categoryKey} className="accordion-item border rounded-3 mb-3">
                                    <h2 className="accordion-header">
                                      <button
                                        className={`accordion-button ${isCollapsed ? 'collapsed' : ''} fw-semibold`}
                                        type="button"
                                        onClick={() => toggleCategory(categoryKey)}
                                      >
                                        <i className={`${catConfig.icon} me-3 fs-4 text-${catConfig.color}`}></i>
                                        <span>{categoryName}</span>
                                        {/* Bouton pour tout cocher/décocher */}
                                        <span
                                          className="btn btn-sm btn-light-brand ms-auto me-2"
                                          role="button"
                                          style={{ cursor: 'pointer' }}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            const allChecked = categoryItems.every(i => i.isChecked);
                                            handleToggleCategoryCheck(categoryItems, !allChecked, categoryName);
                                          }}
                                          title={categoryItems.every(i => i.isChecked) ? 'Tout décocher' : 'Tout cocher'}
                                        >
                                          <i className={`feather-${categoryItems.every(i => i.isChecked) ? 'x' : 'check'} me-1`}></i>
                                          {categoryItems.every(i => i.isChecked) ? 'Décocher' : 'Cocher'}
                                        </span>
                                        <span className="badge bg-soft-secondary text-secondary me-3">
                                          {catTotal - catChecked} / {catTotal}
                                        </span>
                                      </button>
                                    </h2>
                                    <div className={`accordion-collapse collapse ${!isCollapsed ? 'show' : ''}`}>
                                      <div className="accordion-body p-0">
                                        {categoryItems.map(item => (
                                  <div
                                    key={item.id}
                                    className={`d-flex align-items-start p-3 border-bottom ${item.isChecked ? 'bg-light' : ''}`}
                                  >
                                    {/* Checkbox */}
                                    <div className="form-check me-3 mt-1">
                                      <input
                                        className="form-check-input"
                                        type="checkbox"
                                        checked={item.isChecked}
                                        onChange={() => handleToggleCheck(item)}
                                      />
                                    </div>
                                  {/* Image de l'ingrédient */}
                                  {item.image && (
                                    <div className="me-3 d-none d-sm-block">
                                      <img
                                        src={item.image}
                                        alt={item.name}
                                        className="rounded"
                                        style={{
                                          width: '50px',
                                          height: '50px',
                                          objectFit: 'cover',
                                          opacity: item.isChecked ? 0.5 : 1
                                        }}
                                        onError={(e) => {
                                          e.target.style.display = 'none';
                                        }}
                                      />
                                    </div>
                                  )}
                                    {/* Item Info */}
                                    <div className="flex-grow-1">
                                      <div className={`${item.isChecked ? 'text-decoration-line-through text-muted' : ''}`}>
                                        <span className="fw-medium">{item.name}</span>
                                        {(item.quantity || item.unit) && (
                                          <span className="text-muted ms-2">
                                            {item.quantity} {item.unit}
                                          </span>
                                        )}
                                      </div>
                                      {/* Afficher les notes (contient infos recettes et portions) */}
                                      {item.notes && (
                                        <div className="small text-primary mt-1">
                                          <i className="feather-book-open me-1"></i>
                                          {item.notes}
                                        </div>
                                      )}
                                      {/* Afficher recipeTitle uniquement si pas de notes */}
                                      {!item.notes && item.recipeTitle && (
                                        <div className="small text-primary mt-1">
                                          <i className="feather-book-open me-1"></i>
                                          {item.recipeTitle} ({item.servings} portions)
                                        </div>
                                      )}
                                    </div>

                                    {/* Actions */}
                                    <div className="d-flex gap-1 ms-3">
                                      <button
                                        className="btn btn-sm btn-icon btn-light"
                                        onClick={() => openModal(item)}
                                        title="Modifier"
                                      >
                                        <i className="feather-edit-2"></i>
                                      </button>
                                      <button
                                        className="btn btn-sm btn-icon btn-light text-danger"
                                        onClick={() => handleDeleteItem(item.id)}
                                        title="Supprimer"
                                      >
                                        <i className="feather-trash-2"></i>
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  /* Vue liste simple */
                  <div className="list-group list-group-flush">
                    {(hideChecked ? items.filter(i => !i.isChecked) : items).map(item => (
                      <div
                        key={item.id}
                        className={`list-group-item d-flex align-items-start ${item.isChecked ? 'bg-light' : ''}`}
                      >
                        {/* Checkbox */}
                        <div className="form-check me-3 mt-1">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={item.isChecked}
                            onChange={() => handleToggleCheck(item)}
                          />
                        </div>

                        {/* Image de l'ingrédient */}
                        {item.image && (
                          <div className="me-3 d-none d-sm-block">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="rounded"
                              style={{
                                width: '50px',
                                height: '50px',
                                objectFit: 'cover',
                                opacity: item.isChecked ? 0.5 : 1
                              }}
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          </div>
                        )}

                        {/* Category Badge */}
                        <span className={`badge bg-soft-${getCategoryConfig(item.category).color} text-${getCategoryConfig(item.category).color} me-3 mt-1`}>
                          {item.category}
                        </span>

                        {/* Item Info */}
                        <div className="flex-grow-1">
                          <div className={`${item.isChecked ? 'text-decoration-line-through text-muted' : ''}`}>
                            <span className="fw-medium">{item.name}</span>
                            {(item.quantity || item.unit) && (
                              <span className="text-muted ms-2">
                                {item.quantity} {item.unit}
                              </span>
                            )}
                          </div>
                          {/* Afficher les notes (contient infos recettes et portions) */}
                          {item.notes && (
                            <div className="small text-primary mt-1">
                              <i className="feather-book-open me-1"></i>
                              {item.notes}
                            </div>
                          )}
                          {/* Afficher recipeTitle uniquement si pas de notes */}
                          {!item.notes && item.recipeTitle && (
                            <div className="small text-primary mt-1">
                              <i className="feather-book-open me-1"></i>
                              {item.recipeTitle} ({item.servings} portions)
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="d-flex gap-1 ms-3">
                          <button
                            className="btn btn-sm btn-icon btn-light"
                            onClick={() => openModal(item)}
                            title="Modifier"
                          >
                            <i className="feather-edit-2"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-icon btn-light text-danger"
                            onClick={() => handleDeleteItem(item.id)}
                            title="Supprimer"
                          >
                            <i className="feather-trash-2"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Ajouter/Modifier */}
      {showModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingItem ? 'Modifier l\'item' : 'Ajouter un item'}
                </h5>
                <button type="button" className="btn-close" onClick={closeModal}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label">Nom *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Ex: Tomates"
                        required
                      />
                    </div>

                    <div className="col-6">
                      <label className="form-label">Quantité</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                        placeholder="Ex: 500"
                      />
                    </div>

                    <div className="col-6">
                      <label className="form-label">Unité</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.unit}
                        onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                        placeholder="Ex: g, ml, pièces"
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label">Catégorie</label>
                      <select
                        className="form-select"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      >
                        {categories.map(cat => (
                          <option key={cat.name} value={cat.name}>{cat.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-12">
                      <label className="form-label">Notes</label>
                      <textarea
                        className="form-control"
                        rows="2"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Notes optionnelles..."
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeModal}>
                    Annuler
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <i className="feather-check me-2"></i>
                    {editingItem ? 'Modifier' : 'Ajouter'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmation */}
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
    </>
  );
};

export default ShoppingList;
