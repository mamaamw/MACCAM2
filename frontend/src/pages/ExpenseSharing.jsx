import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import expenseGroupService from '../services/expenseGroupService';
import expenseService from '../services/expenseService';
import toast from '../utils/toast';
import ConfirmModal from '../components/ConfirmModal';
import ExpensePhotoManager from '../components/expense/ExpensePhotoManager';

const ExpenseSharing = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [editingExpense, setEditingExpense] = useState(null);
  const [balances, setBalances] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    show: false,
    title: '',
    message: '',
    onConfirm: null,
    type: 'primary'
  });

  const [groupForm, setGroupForm] = useState({
    name: '',
    description: '',
    currency: 'EUR',
    members: []
  });

  const [expenseForm, setExpenseForm] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: 'Autre',
    paidById: '',
    participants: []
  });

  const [memberForm, setMemberForm] = useState({
    name: '',
    email: ''
  });

  const [autoSplit, setAutoSplit] = useState(false);
  const [splitByShares, setSplitByShares] = useState(false);
  const [participantShares, setParticipantShares] = useState({});
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [expensePhotos, setExpensePhotos] = useState([]);

  const categories = [
    { label: 'Transport', icon: 'feather-truck', color: 'primary' },
    { label: 'Logement', icon: 'feather-home', color: 'success' },
    { label: 'Nourriture', icon: 'feather-coffee', color: 'warning' },
    { label: 'Activités', icon: 'feather-aperture', color: 'info' },
    { label: 'Shopping', icon: 'feather-shopping-bag', color: 'danger' },
    { label: 'Autre', icon: 'feather-more-horizontal', color: 'secondary' }
  ];

  const currencies = ['EUR', 'USD', 'CAD', 'GBP', 'CHF'];

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      fetchBalances();
    }
  }, [selectedGroup]);

  // Recalculer automatiquement les parts si en mode autoSplit ou splitByShares
  useEffect(() => {
    if (autoSplit && expenseForm.amount && expenseForm.participants.length > 0) {
      const totalAmount = parseFloat(expenseForm.amount);
      const count = expenseForm.participants.length;
      const equalShare = totalAmount / count;
      
      let sumSoFar = 0;
      const updatedParticipants = expenseForm.participants.map((p, index) => {
        if (index === count - 1) {
          return { ...p, share: (totalAmount - sumSoFar).toString() };
        } else {
          sumSoFar += equalShare;
          return { ...p, share: equalShare.toString() };
        }
      });
      
      setExpenseForm(prev => ({
        ...prev,
        participants: updatedParticipants
      }));
    } else if (splitByShares && expenseForm.amount && expenseForm.participants.length > 0) {
      calculateShareAmounts();
    }
  }, [expenseForm.amount, autoSplit, splitByShares]);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const response = await expenseGroupService.getGroups();
      setGroups(response.data || []);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement des groupes');
    } finally {
      setLoading(false);
    }
  };

  const fetchGroupDetails = async (groupId) => {
    try {
      const response = await expenseGroupService.getGroup(groupId);
      setSelectedGroup(response.data);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du chargement du groupe');
    }
  };

  const fetchBalances = async () => {
    if (!selectedGroup) return;
    try {
      const response = await expenseGroupService.getBalances(selectedGroup.id);
      setBalances(response.data);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const openGroupModal = (group = null) => {
    if (group) {
      setEditingGroup(group);
      setGroupForm({
        name: group.name,
        description: group.description || '',
        currency: group.currency,
        members: []
      });
    } else {
      setEditingGroup(null);
      setGroupForm({
        name: '',
        description: '',
        currency: 'EUR',
        members: []
      });
    }
    setShowGroupModal(true);
  };

  const handleGroupSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingGroup) {
        await expenseGroupService.updateGroup(editingGroup.id, groupForm);
        toast.success('Groupe modifié avec succès');
      } else {
        await expenseGroupService.createGroup(groupForm);
        toast.success('Groupe créé avec succès');
      }
      setShowGroupModal(false);
      fetchGroups();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de l\'enregistrement du groupe');
    }
  };

  const handleDeleteGroup = (group) => {
    setConfirmModal({
      show: true,
      title: 'Supprimer le groupe',
      message: `Voulez-vous vraiment supprimer le groupe "${group.name}" ? Toutes les dépenses seront également supprimées.`,
      type: 'danger',
      onConfirm: async () => {
        setConfirmModal({ show: false, title: '', message: '', onConfirm: null, type: 'primary' });
        try {
          await expenseGroupService.deleteGroup(group.id);
          toast.success('Groupe supprimé');
          if (selectedGroup?.id === group.id) {
            setSelectedGroup(null);
          }
          fetchGroups();
        } catch (error) {
          console.error('Erreur:', error);
          toast.error('Erreur lors de la suppression');
        }
      }
    });
  };

  const openExpenseModal = (expense = null) => {
    if (expense) {
      console.log('Opening expense for edit:', { 
        description: expense.description, 
        splitMode: expense.splitMode,
        participants: expense.participants 
      });
      
      setEditingExpense(expense);
      setExpenseForm({
        description: expense.description,
        amount: expense.amount.toString(),
        date: new Date(expense.date).toISOString().split('T')[0],
        category: expense.category || 'Autre',
        paidById: expense.paidById,
        participants: expense.participants.map(p => ({
          memberId: p.memberId,
          share: p.share.toString()
        }))
      });
      setExpensePhotos(expense.photos || []);
      
      // Restaurer le mode de division depuis la base de données
      if (expense.splitMode === 'shares') {
        // Mode par parts : restaurer les parts
        const detectedShares = detectSharesFromAmounts(expense.participants, expense.amount);
        if (detectedShares) {
          setParticipantShares(detectedShares);
        } else {
          // Si la détection échoue, initialiser avec 1 part pour chaque
          const defaultShares = {};
          expense.participants.forEach(p => {
            defaultShares[p.memberId] = 1;
          });
          setParticipantShares(defaultShares);
        }
        setSplitByShares(true);
        setAutoSplit(false);
      } else if (expense.splitMode === 'equal') {
        // Mode équitable
        setAutoSplit(true);
        setSplitByShares(false);
        setParticipantShares({});
      } else {
        // Mode manuel
        setAutoSplit(false);
        setSplitByShares(false);
        setParticipantShares({});
      }
    } else {
      setEditingExpense(null);
      setExpenseForm({
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        category: 'Autre',
        paidById: selectedGroup?.members[0]?.id || '',
        participants: []
      });
      setExpensePhotos([]);
      setAutoSplit(false);
      setSplitByShares(false);
      setParticipantShares({});
    }
    setSelectedPhotos([]);
    setShowExpenseModal(true);
  };

  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    if (!selectedGroup) return;

    // Validation: vérifier que la somme des parts = montant total
    const totalAmount = parseFloat(expenseForm.amount);
    const totalShares = expenseForm.participants.reduce((sum, p) => sum + parseFloat(p.share || 0), 0);
    
    if (Math.abs(totalAmount - totalShares) > 0.01) {
      toast.error(`La somme des parts (${totalShares.toFixed(2)}) doit être égale au montant total (${totalAmount.toFixed(2)})`);
      return;
    }

    try {
      // Déterminer le mode de division
      let splitMode = 'manual';
      if (autoSplit) splitMode = 'equal';
      else if (splitByShares) splitMode = 'shares';
      
      const expenseData = {
        ...expenseForm,
        groupId: selectedGroup.id,
        splitMode: splitMode
      };

      if (editingExpense) {
        await expenseService.updateExpense(editingExpense.id, expenseData);
        
        // Ajouter de nouvelles photos si nécessaire
        if (selectedPhotos.length > 0) {
          await expenseService.addPhotos(editingExpense.id, selectedPhotos);
        }
        
        toast.success('Dépense modifiée avec succès');
      } else {
        await expenseService.createExpense(expenseData, selectedPhotos);
        toast.success('Dépense créée avec succès');
      }
      
      setShowExpenseModal(false);
      fetchGroupDetails(selectedGroup.id);
      fetchBalances();
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de l\'enregistrement de la dépense');
    }
  };

  const handleDeleteExpense = (expense) => {
    setConfirmModal({
      show: true,
      title: 'Supprimer la dépense',
      message: `Voulez-vous vraiment supprimer la dépense "${expense.description}" ?`,
      type: 'danger',
      onConfirm: async () => {
        setConfirmModal({ show: false, title: '', message: '', onConfirm: null, type: 'primary' });
        try {
          await expenseService.deleteExpense(expense.id);
          toast.success('Dépense supprimée');
          fetchGroupDetails(selectedGroup.id);
          fetchBalances();
        } catch (error) {
          console.error('Erreur:', error);
          toast.error('Erreur lors de la suppression');
        }
      }
    });
  };

  const handleSplitEqually = () => {
    if (!expenseForm.amount || expenseForm.participants.length === 0) return;
    
    const totalAmount = parseFloat(expenseForm.amount);
    const count = expenseForm.participants.length;
    const equalShare = totalAmount / count;
    
    // Calculer la part exacte pour chaque participant
    // et ajuster la dernière part pour garantir que la somme = montant total
    let sumSoFar = 0;
    const updatedParticipants = expenseForm.participants.map((p, index) => {
      if (index === count - 1) {
        // Dernière part : ajuster pour que la somme soit exacte
        return { ...p, share: (totalAmount - sumSoFar).toString() };
      } else {
        sumSoFar += equalShare;
        return { ...p, share: equalShare.toString() };
      }
    });
    
    setExpenseForm({
      ...expenseForm,
      participants: updatedParticipants
    });
    setAutoSplit(true);
    setSplitByShares(false);
  };

  const handleSplitByShares = () => {
    if (!expenseForm.amount || expenseForm.participants.length === 0) return;
    
    // Initialiser les parts à 1 si elles n'existent pas
    const shares = {};
    expenseForm.participants.forEach(p => {
      shares[p.memberId] = participantShares[p.memberId] || 1;
    });
    setParticipantShares(shares);
    
    setSplitByShares(true);
    setAutoSplit(false);
    
    // Calculer les montants basés sur les parts
    calculateShareAmounts(shares);
  };

  const calculateShareAmounts = (shares = participantShares) => {
    if (!expenseForm.amount || expenseForm.participants.length === 0) return;
    
    const totalAmount = parseFloat(expenseForm.amount);
    const totalShares = Object.values(shares).reduce((sum, share) => sum + parseFloat(share || 1), 0);
    const amountPerShare = totalAmount / totalShares;
    
    let sumSoFar = 0;
    const updatedParticipants = expenseForm.participants.map((p, index) => {
      const memberShares = parseFloat(shares[p.memberId] || 1);
      
      if (index === expenseForm.participants.length - 1) {
        // Dernière part : ajuster pour que la somme soit exacte
        return { ...p, share: (totalAmount - sumSoFar).toString() };
      } else {
        const amount = memberShares * amountPerShare;
        sumSoFar += amount;
        return { ...p, share: amount.toString() };
      }
    });
    
    setExpenseForm({
      ...expenseForm,
      participants: updatedParticipants
    });
  };

  // Fonction pour détecter les parts à partir des montants
  const detectSharesFromAmounts = (participants, totalAmount) => {
    if (!participants || participants.length === 0) return null;
    
    try {
      // Trouver le plus petit montant (sera considéré comme 1 part ou une fraction)
      const amounts = participants.map(p => parseFloat(p.share));
      const minAmount = Math.min(...amounts);
      
      if (minAmount <= 0) return null;
      
      // Calculer les parts en divisant chaque montant par le minimum
      const calculatedShares = {};
      let allValid = true;
      
      for (const p of participants) {
        const amount = parseFloat(p.share);
        const share = amount / minAmount;
        
        // Vérifier que le share est un multiple de 0.5 (avec une petite tolérance)
        const remainder = share % 0.5;
        if (remainder > 0.02 && remainder < 0.48) {
          allValid = false;
          break;
        }
        
        // Arrondir au 0.5 le plus proche
        calculatedShares[p.memberId] = Math.round(share * 2) / 2;
      }
      
      if (!allValid) return null;
      
      // Vérifier que la reconstitution donne les mêmes montants (avec tolérance)
      const totalShares = Object.values(calculatedShares).reduce((sum, s) => sum + s, 0);
      const amountPerShare = totalAmount / totalShares;
      
      for (const p of participants) {
        const expectedAmount = calculatedShares[p.memberId] * amountPerShare;
        if (Math.abs(expectedAmount - parseFloat(p.share)) > 0.5) {
          return null;
        }
      }
      
      return calculatedShares;
    } catch (error) {
      console.error('Erreur lors de la détection des parts:', error);
      return null;
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!selectedGroup) return;

    try {
      await expenseGroupService.addMember(selectedGroup.id, memberForm);
      toast.success('Membre ajouté avec succès');
      setShowMemberModal(false);
      setMemberForm({ name: '', email: '' });
      fetchGroupDetails(selectedGroup.id);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de l\'ajout du membre');
    }
  };

  const getCategoryConfig = (category) => {
    return categories.find(c => c.label === category) || categories[categories.length - 1];
  };

  const formatCurrency = (amount, currency = 'EUR') => {
    return new Intl.NumberFormat('fr-FR', { 
      style: 'currency', 
      currency 
    }).format(amount);
  };

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
            <h5 className="m-b-10">Partage de dépenses</h5>
          </div>
          <ul className="breadcrumb">
            <li className="breadcrumb-item"><a href="/">Accueil</a></li>
            <li className="breadcrumb-item">Partage de dépenses</li>
          </ul>
        </div>
        <div className="page-header-right ms-auto">
          <button className="btn btn-primary" onClick={() => openGroupModal()}>
            <i className="feather-plus me-2"></i>
            Nouveau groupe
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="row">
          {/* Liste des groupes */}
          <div className="col-lg-4">
            <div className="card stretch stretch-full">
              <div className="card-header">
                <h5 className="card-title">
                  <i className="feather-users me-2"></i>
                  Mes groupes
                </h5>
              </div>
              <div className="card-body p-0">
                {groups.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="feather-users" style={{ fontSize: '3rem', color: '#cbd5e1' }}></i>
                    <p className="text-muted mt-3">Aucun groupe</p>
                    <button className="btn btn-sm btn-primary" onClick={() => openGroupModal()}>
                      Créer un groupe
                    </button>
                  </div>
                ) : (
                  <div className="list-group list-group-flush">
                    {groups.map(group => (
                      <div
                        key={group.id}
                        className={`list-group-item list-group-item-action ${selectedGroup?.id === group.id ? 'active' : ''}`}
                        style={{ cursor: 'pointer' }}
                        onClick={() => fetchGroupDetails(group.id)}
                      >
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="flex-grow-1">
                            <h6 className="mb-1">{group.name}</h6>
                            <small className={selectedGroup?.id === group.id ? 'text-white-50' : 'text-muted'}>
                              {group.members?.length || 0} membres · {group.expenses?.length || 0} dépenses
                            </small>
                          </div>
                          <div className="dropdown" onClick={(e) => e.stopPropagation()}>
                            <button className="btn btn-sm btn-icon btn-light" data-bs-toggle="dropdown">
                              <i className="feather-more-vertical"></i>
                            </button>
                            <ul className="dropdown-menu">
                              <li>
                                <a className="dropdown-item" onClick={() => openGroupModal(group)}>
                                  <i className="feather-edit-2 me-2"></i>Modifier
                                </a>
                              </li>
                              <li><hr className="dropdown-divider" /></li>
                              <li>
                                <a className="dropdown-item text-danger" onClick={() => handleDeleteGroup(group)}>
                                  <i className="feather-trash-2 me-2"></i>Supprimer
                                </a>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Détails du groupe */}
          <div className="col-lg-8">
            {selectedGroup ? (
              <div className="row">
                {/* Soldes */}
                <div className="col-12 mb-4">
                  <div className="card">
                    <div className="card-header">
                      <h5 className="card-title">
                        <i className="feather-trending-up me-2"></i>
                        Soldes
                      </h5>
                    </div>
                    <div className="card-body">
                      {balances && (
                        <>
                          <div className="row mb-4">
                            {balances.balances.map(balance => (
                              <div key={balance.memberId} className="col-md-6 mb-3">
                                <div className={`alert ${balance.balance > 0 ? 'alert-success' : balance.balance < 0 ? 'alert-danger' : 'alert-secondary'} mb-0`}>
                                  <div className="d-flex justify-content-between align-items-center">
                                    <span className="fw-semibold">{balance.memberName}</span>
                                    <span className="badge bg-white text-dark">
                                      {formatCurrency(balance.balance, selectedGroup.currency)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {balances.settlements.length > 0 && (
                            <>
                              <h6 className="mb-3">Remboursements suggérés</h6>
                              <div className="list-group">
                                {balances.settlements.map((settlement, index) => (
                                  <div key={index} className="list-group-item">
                                    <div className="d-flex align-items-center">
                                      <i className="feather-arrow-right text-success me-2"></i>
                                      <span>
                                        <strong>{settlement.fromName}</strong> doit 
                                        <strong className="mx-2">{formatCurrency(settlement.amount, selectedGroup.currency)}</strong>
                                        à <strong>{settlement.toName}</strong>
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </>
                          )}

                          {balances.settlements.length === 0 && (
                            <div className="alert alert-info">
                              <i className="feather-check-circle me-2"></i>
                              Les comptes sont équilibrés !
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Dépenses */}
                <div className="col-12">
                  <div className="card stretch stretch-full">
                    <div className="card-header">
                      <h5 className="card-title">
                        <i className="feather-dollar-sign me-2"></i>
                        Dépenses
                      </h5>
                      <div className="card-header-action">
                        <button className="btn btn-sm btn-primary" onClick={() => openExpenseModal()}>
                          <i className="feather-plus me-1"></i>
                          Ajouter
                        </button>
                      </div>
                    </div>
                    <div className="card-body p-0">
                      {selectedGroup.expenses && selectedGroup.expenses.length > 0 ? (
                        <div className="table-responsive">
                          <table className="table table-hover mb-0">
                            <thead>
                              <tr>
                                <th>Date</th>
                                <th>Description</th>
                                <th>Catégorie</th>
                                <th>Payé par</th>
                                <th className="text-end">Montant</th>
                                <th className="text-center">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedGroup.expenses.map(expense => {
                                const catConfig = getCategoryConfig(expense.category);
                                return (
                                  <tr key={expense.id}>
                                    <td>
                                      <small>{new Date(expense.date).toLocaleDateString('fr-FR')}</small>
                                    </td>
                                    <td>{expense.description}</td>
                                    <td>
                                      <span className={`badge bg-soft-${catConfig.color} text-${catConfig.color}`}>
                                        <i className={`${catConfig.icon} me-1`}></i>
                                        {expense.category || 'Autre'}
                                      </span>
                                    </td>
                                    <td>{expense.paidBy?.name}</td>
                                    <td className="text-end fw-semibold">
                                      {formatCurrency(expense.amount, selectedGroup.currency)}
                                    </td>
                                    <td className="text-center">
                                      <div className="btn-group btn-group-sm">
                                        <button
                                          className="btn btn-light"
                                          onClick={() => openExpenseModal(expense)}
                                          title="Modifier"
                                        >
                                          <i className="feather-edit-2"></i>
                                        </button>
                                        <button
                                          className="btn btn-light text-danger"
                                          onClick={() => handleDeleteExpense(expense)}
                                          title="Supprimer"
                                        >
                                          <i className="feather-trash-2"></i>
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-5">
                          <i className="feather-dollar-sign" style={{ fontSize: '3rem', color: '#cbd5e1' }}></i>
                          <p className="text-muted mt-3">Aucune dépense</p>
                          <button className="btn btn-sm btn-primary" onClick={() => openExpenseModal()}>
                            Ajouter une dépense
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Membres */}
                <div className="col-12 mt-4">
                  <div className="card">
                    <div className="card-header">
                      <h5 className="card-title">
                        <i className="feather-users me-2"></i>
                        Membres
                      </h5>
                      <div className="card-header-action">
                        <button className="btn btn-sm btn-light-brand" onClick={() => setShowMemberModal(true)}>
                          <i className="feather-user-plus me-1"></i>
                          Ajouter
                        </button>
                      </div>
                    </div>
                    <div className="card-body">
                      <div className="row">
                        {selectedGroup.members?.map(member => (
                          <div key={member.id} className="col-md-6 mb-3">
                            <div className="d-flex align-items-center">
                              <div className="avatar avatar-md me-3">
                                {member.user?.avatar ? (
                                  <img src={member.user.avatar} alt={member.name} className="rounded-circle" />
                                ) : (
                                  <div className="avatar-text rounded-circle bg-primary text-white">
                                    {member.name.charAt(0).toUpperCase()}
                                  </div>
                                )}
                              </div>
                              <div>
                                <div className="fw-semibold">{member.name}</div>
                                <small className="text-muted">{member.email}</small>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="card stretch stretch-full">
                <div className="card-body text-center py-5">
                  <i className="feather-inbox" style={{ fontSize: '4rem', color: '#cbd5e1' }}></i>
                  <h5 className="mt-3 text-muted">Sélectionnez un groupe</h5>
                  <p className="text-muted">Choisissez un groupe dans la liste pour voir ses détails</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Groupe */}
      {showGroupModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={handleGroupSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title">
                    {editingGroup ? 'Modifier le groupe' : 'Nouveau groupe'}
                  </h5>
                  <button type="button" className="btn-close" onClick={() => setShowGroupModal(false)}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Nom du groupe *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={groupForm.name}
                      onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-control"
                      rows="3"
                      value={groupForm.description}
                      onChange={(e) => setGroupForm({ ...groupForm, description: e.target.value })}
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Devise</label>
                    <select
                      className="form-select"
                      value={groupForm.currency}
                      onChange={(e) => setGroupForm({ ...groupForm, currency: e.target.value })}
                    >
                      {currencies.map(curr => (
                        <option key={curr} value={curr}>{curr}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowGroupModal(false)}>
                    Annuler
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingGroup ? 'Modifier' : 'Créer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Dépense */}
      {showExpenseModal && selectedGroup && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <form onSubmit={handleExpenseSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title">
                    {editingExpense ? 'Modifier la dépense' : 'Nouvelle dépense'}
                  </h5>
                  <button type="button" className="btn-close" onClick={() => setShowExpenseModal(false)}></button>
                </div>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-8 mb-3">
                      <label className="form-label">Description *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={expenseForm.description}
                        onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Montant ({selectedGroup?.currency || 'EUR'}) *</label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control"
                        value={expenseForm.amount}
                        onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Date</label>
                      <input
                        type="date"
                        className="form-control"
                        value={expenseForm.date}
                        onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Catégorie</label>
                      <select
                        className="form-select"
                        value={expenseForm.category}
                        onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                      >
                        {categories.map(cat => (
                          <option key={cat.label} value={cat.label}>{cat.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Payé par *</label>
                    <select
                      className="form-select"
                      value={expenseForm.paidById}
                      onChange={(e) => setExpenseForm({ ...expenseForm, paidById: e.target.value })}
                      required
                    >
                      <option value="">Sélectionner...</option>
                      {selectedGroup.members?.map(member => (
                        <option key={member.id} value={member.id}>{member.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <label className="form-label mb-0">Participants *</label>
                      <div className="btn-group">
                        <button
                          type="button"
                          className={`btn btn-sm ${autoSplit ? 'btn-brand' : 'btn-light-brand'}`}
                          onClick={handleSplitEqually}
                        >
                          <i className={`feather-${autoSplit ? 'check-circle' : 'divide'} me-1`}></i>
                          Équitable
                          {autoSplit && <span className="badge bg-white text-brand ms-2">Auto</span>}
                        </button>
                        <button
                          type="button"
                          className={`btn btn-sm ${splitByShares ? 'btn-brand' : 'btn-light-brand'}`}
                          onClick={handleSplitByShares}
                        >
                          <i className={`feather-${splitByShares ? 'check-circle' : 'percent'} me-1`}></i>
                          Par parts
                          {splitByShares && <span className="badge bg-white text-brand ms-2">Auto</span>}
                        </button>
                      </div>
                    </div>
                    {splitByShares && (
                      <div className="alert alert-info alert-sm mb-2">
                        <i className="feather-info me-1"></i>
                        <small>Définissez le nombre de parts pour chaque participant. Ex: 2 parts = le double d'une part.</small>
                      </div>
                    )}
                    {selectedGroup.members?.map(member => {
                      const isParticipant = expenseForm.participants.some(p => p.memberId === member.id);
                      const participant = expenseForm.participants.find(p => p.memberId === member.id);
                      
                      return (
                        <div key={member.id} className="d-flex align-items-center mb-2">
                          <div className="form-check me-3">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              checked={isParticipant}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setExpenseForm({
                                    ...expenseForm,
                                    participants: [...expenseForm.participants, { memberId: member.id, share: '0' }]
                                  });
                                  if (splitByShares) {
                                    const newShares = { ...participantShares, [member.id]: 1 };
                                    setParticipantShares(newShares);
                                    setTimeout(() => calculateShareAmounts(newShares), 0);
                                  }
                                } else {
                                  setExpenseForm({
                                    ...expenseForm,
                                    participants: expenseForm.participants.filter(p => p.memberId !== member.id)
                                  });
                                  if (splitByShares) {
                                    const newShares = { ...participantShares };
                                    delete newShares[member.id];
                                    setParticipantShares(newShares);
                                    setTimeout(() => calculateShareAmounts(newShares), 0);
                                  }
                                }
                              }}
                            />
                            <label className="form-check-label">{member.name}</label>
                          </div>
                          {isParticipant && (
                            <div className="d-flex align-items-center ms-auto gap-2">
                              <div className="input-group input-group-sm" style={{ width: '130px' }}>
                                <input
                                  type="number"
                                  step="0.01"
                                  className="form-control form-control-sm"
                                  value={parseFloat(participant.share || 0).toFixed(2)}
                                  readOnly={splitByShares}
                                  onChange={(e) => {
                                    setAutoSplit(false);
                                    setSplitByShares(false);
                                    setExpenseForm({
                                      ...expenseForm,
                                      participants: expenseForm.participants.map(p => 
                                        p.memberId === member.id ? { ...p, share: e.target.value } : p
                                      )
                                    });
                                  }}
                                  style={splitByShares ? { backgroundColor: '#f5f5f5' } : {}}
                                />
                                <span className="input-group-text">{selectedGroup?.currency || 'EUR'}</span>
                              </div>
                              {splitByShares && (
                                <div className="input-group input-group-sm" style={{ width: '140px' }}>
                                  <input
                                    type="number"
                                    step="0.5"
                                    min="0"
                                    className="form-control form-control-sm text-center"
                                    style={{ fontSize: '0.875rem', fontWeight: '500' }}
                                    value={participantShares[member.id] || 1}
                                    onChange={(e) => {
                                      const value = parseFloat(e.target.value);
                                      
                                      // Si la valeur est 0 ou vide, décocher le participant
                                      if (!value || value === 0) {
                                        setExpenseForm({
                                          ...expenseForm,
                                          participants: expenseForm.participants.filter(p => p.memberId !== member.id)
                                        });
                                        const newShares = { ...participantShares };
                                        delete newShares[member.id];
                                        setParticipantShares(newShares);
                                        setTimeout(() => calculateShareAmounts(newShares), 0);
                                      } else {
                                        // Sinon, mettre à jour les shares normalement
                                        const newShares = {
                                          ...participantShares,
                                          [member.id]: value
                                        };
                                        setParticipantShares(newShares);
                                        calculateShareAmounts(newShares);
                                      }
                                    }}
                                  />
                                  <span className="input-group-text" style={{ fontSize: '0.75rem' }}>parts</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Afficher la différence si les parts ne correspondent pas au montant */}
                  {expenseForm.amount && expenseForm.participants.length > 0 && (() => {
                    const totalAmount = parseFloat(expenseForm.amount);
                    const totalShares = expenseForm.participants.reduce((sum, p) => sum + parseFloat(p.share || 0), 0);
                    const difference = totalAmount - totalShares;
                    const currency = selectedGroup?.currency || 'EUR';
                    
                    if (Math.abs(difference) > 0.01) {
                      return (
                        <div className={`alert ${difference > 0 ? 'alert-warning' : 'alert-danger'} mt-3 mb-0`}>
                          <i className="feather-alert-circle me-2"></i>
                          <strong>Différence : {difference > 0 ? '+' : ''}{formatCurrency(Math.abs(difference), currency)}</strong>
                          <br />
                          <small>
                            Total des parts : {formatCurrency(totalShares, currency)} / 
                            Montant total : {formatCurrency(totalAmount, currency)}
                          </small>
                        </div>
                      );
                    }
                    return null;
                  })()}
                  
                  {/* Gestionnaire de photos */}
                  <div className="mt-4">
                    <ExpensePhotoManager
                      photos={expensePhotos}
                      selectedFiles={selectedPhotos}
                      onFileSelect={(files) => {
                        if (files.length > 5) {
                          toast.error('Maximum 5 photos autorisées');
                          return;
                        }
                        setSelectedPhotos(files);
                      }}
                      onRemoveFile={(index) => {
                        setSelectedPhotos(prev => prev.filter((_, i) => i !== index));
                      }}
                      onPhotosChange={async ({ type, index }) => {
                        if (type === 'remove' && editingExpense) {
                          try {
                            await expenseService.deletePhoto(editingExpense.id, index);
                            const updatedPhotos = expensePhotos.filter((_, i) => i !== index);
                            setExpensePhotos(updatedPhotos);
                            toast.success('Photo supprimée');
                            fetchGroupDetails(selectedGroup.id);
                          } catch (error) {
                            console.error('Erreur:', error);
                            toast.error('Erreur lors de la suppression de la photo');
                          }
                        }
                      }}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowExpenseModal(false)}>
                    Annuler
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editingExpense ? 'Modifier' : 'Créer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal Membre */}
      {showMemberModal && selectedGroup && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={handleAddMember}>
                <div className="modal-header">
                  <h5 className="modal-title">Ajouter un membre</h5>
                  <button type="button" className="btn-close" onClick={() => setShowMemberModal(false)}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Nom *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={memberForm.name}
                      onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={memberForm.email}
                      onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowMemberModal(false)}>
                    Annuler
                  </button>
                  <button type="submit" className="btn btn-primary">Ajouter</button>
                </div>
              </form>
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
      />
    </>
  );
};

export default ExpenseSharing;
