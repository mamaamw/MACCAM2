import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { contactService } from '../services/contactService';
import ContactFieldsManager from '../components/contacts/ContactFieldsManager';
import toast from 'react-hot-toast';

export default function ContactDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [basicInfo, setBasicInfo] = useState({
    email: '',
    firstName: '',
    lastName: '',
    username: '',
    company: '',
    jobTitle: '',
    bio: ''
  });

  const fieldsManager = ContactFieldsManager({
    userId: id,
    onSave: () => {
      toast.success('Modifications enregistrées');
    }
  });

  const loadContact = useCallback(async () => {
    try {
      setLoading(true);
      const response = await contactService.getAllContacts();
      const foundContact = response.data.find(c => c.id === id);
      
      if (!foundContact) {
        toast.error('Contact non trouvé');
        navigate('/contacts');
        return;
      }

      setContact(foundContact);
      setBasicInfo({
        email: foundContact.email || '',
        firstName: foundContact.firstName || '',
        lastName: foundContact.lastName || '',
        username: foundContact.username || '',
        company: foundContact.company || '',
        jobTitle: foundContact.jobTitle || '',
        bio: foundContact.bio || ''
      });
    } catch (error) {
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    loadContact();
  }, [loadContact]);

  const handleSaveBasicInfo = async () => {
    try {
      setSaving(true);
      await contactService.updateContact(id, basicInfo);
      toast.success('Informations de base mises à jour');
      loadContact();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAll = async () => {
    try {
      setSaving(true);
      // Sauvegarder les infos de base
      await contactService.updateContact(id, basicInfo);
      // Sauvegarder les champs multiples
      await fieldsManager.saveAllFields();
      toast.success('Toutes les modifications enregistrées !');
      loadContact();
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async () => {
    if (!confirm('Êtes-vous sûr de vouloir désactiver cet utilisateur ? Il ne pourra plus se connecter.')) return;
    
    try {
      await contactService.deactivateContact(id);
      toast.success('Utilisateur désactivé avec succès');
      loadContact();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la désactivation');
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{height: '400px'}}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Chargement...</span>
        </div>
      </div>
    );
  }

  if (!contact) {
    return null;
  }

  return (
    <div className="container-fluid p-0">
      {/* Header */}
      <div className="mb-4">
        <div className="row align-items-center">
          <div className="col">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb">
                <li className="breadcrumb-item">
                  <Link to="/contacts">Contacts</Link>
                </li>
                <li className="breadcrumb-item active">
                  {contact.firstName} {contact.lastName}
                </li>
              </ol>
            </nav>
          </div>
          <div className="col-auto">
            <button
              className="btn btn-outline-secondary me-2"
              onClick={() => navigate('/contacts')}
            >
              <i className="feather-arrow-left me-1"></i>
              Retour
            </button>
            <button
              className="btn btn-success me-2"
              onClick={handleSaveAll}
              disabled={fieldsManager.loading || saving}
            >
              {fieldsManager.loading || saving ? (
                <>
                  <span className="spinner-border spinner-border-sm me-1"></span>
                  Enregistrement...
                </>
              ) : (
                <>
                  <i className="feather-save me-1"></i>
                  Enregistrer
                </>
              )}
            </button>
            {contact.isActive && (
              <button
                className="btn btn-outline-warning"
                onClick={handleDeactivate}
              >
                <i className="feather-user-x me-1"></i>
                Désactiver
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="row">
        {/* Colonne gauche - Informations de base */}
        <div className="col-lg-4">
          <div className="card mb-4">
            <div className="card-body text-center">
              <div className="avatar avatar-xl mb-3 mx-auto">
                <div className="avatar-title bg-primary text-white rounded-circle" style={{fontSize: '2rem'}}>
                  {contact.firstName?.[0]}{contact.lastName?.[0]}
                </div>
              </div>
              <h4 className="mb-1">{contact.firstName} {contact.lastName}</h4>
              <p className="text-muted mb-3">{contact.jobTitle || 'Aucun poste'}</p>
              <div className="d-flex justify-content-center gap-2 mb-3">
                <span className={`badge ${
                  contact.role === 'ADMIN' ? 'bg-danger' : 
                  contact.role === 'MANAGER' ? 'bg-info' : 'bg-primary'
                }`}>
                  {contact.role === 'ADMIN' ? 'Administrateur' : 
                   contact.role === 'MANAGER' ? 'Gestionnaire' : 'Utilisateur'}
                </span>
                {contact.isActive ? (
                  <span className="badge bg-success">Actif</span>
                ) : (
                  <span className="badge bg-warning">En attente</span>
                )}
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">Informations de base</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label">Email *</label>
                <input
                  type="email"
                  className="form-control"
                  value={basicInfo.email}
                  onChange={(e) => setBasicInfo({...basicInfo, email: e.target.value})}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Prénom *</label>
                <input
                  type="text"
                  className="form-control"
                  value={basicInfo.firstName}
                  onChange={(e) => setBasicInfo({...basicInfo, firstName: e.target.value})}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Nom *</label>
                <input
                  type="text"
                  className="form-control"
                  value={basicInfo.lastName}
                  onChange={(e) => setBasicInfo({...basicInfo, lastName: e.target.value})}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Nom d'utilisateur *</label>
                <input
                  type="text"
                  className="form-control"
                  value={basicInfo.username}
                  onChange={(e) => setBasicInfo({...basicInfo, username: e.target.value})}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Entreprise</label>
                <input
                  type="text"
                  className="form-control"
                  value={basicInfo.company}
                  onChange={(e) => setBasicInfo({...basicInfo, company: e.target.value})}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Fonction</label>
                <input
                  type="text"
                  className="form-control"
                  value={basicInfo.jobTitle}
                  onChange={(e) => setBasicInfo({...basicInfo, jobTitle: e.target.value})}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Notes</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={basicInfo.bio}
                  onChange={(e) => setBasicInfo({...basicInfo, bio: e.target.value})}
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        {/* Colonne droite - Champs multiples */}
        <div className="col-lg-8">
          {/* Emails */}
          <div className="card mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">
                <i className="feather-mail me-2"></i>
                Emails
              </h5>
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={fieldsManager.addEmail}
              >
                <i className="feather-plus me-1"></i>
                Ajouter
              </button>
            </div>
            <div className="card-body">
              {fieldsManager.emails.length === 0 ? (
                <p className="text-muted mb-0">Aucun email supplémentaire</p>
              ) : (
                <div className="list-group list-group-flush">
                  {fieldsManager.emails.map((email, index) => (
                    <div key={index} className="list-group-item px-0">
                      <div className="row align-items-center g-2">
                        <div className="col-md-5">
                          <input
                            type="email"
                            className="form-control form-control-sm"
                            placeholder="Email"
                            value={email.email}
                            onChange={(e) => fieldsManager.updateEmail(index, 'email', e.target.value)}
                          />
                        </div>
                        <div className="col-md-3">
                          <select
                            className="form-select form-select-sm"
                            value={email.label}
                            onChange={(e) => fieldsManager.updateEmail(index, 'label', e.target.value)}
                          >
                            <option value="Travail">Travail</option>
                            <option value="Personnel">Personnel</option>
                            <option value="Autre">Autre</option>
                          </select>
                        </div>
                        <div className="col-md-2">
                          <div className="form-check">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              checked={email.isPrimary}
                              onChange={(e) => fieldsManager.updateEmail(index, 'isPrimary', e.target.checked)}
                            />
                            <label className="form-check-label small">Principal</label>
                          </div>
                        </div>
                        <div className="col-md-2 text-end">
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => fieldsManager.removeEmail(index)}
                          >
                            <i className="feather-trash-2"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Téléphones */}
          <div className="card mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">
                <i className="feather-phone me-2"></i>
                Téléphones
              </h5>
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={fieldsManager.addPhone}
              >
                <i className="feather-plus me-1"></i>
                Ajouter
              </button>
            </div>
            <div className="card-body">
              {fieldsManager.phones.length === 0 ? (
                <p className="text-muted mb-0">Aucun téléphone</p>
              ) : (
                <div className="list-group list-group-flush">
                  {fieldsManager.phones.map((phone, index) => (
                    <div key={index} className="list-group-item px-0">
                      <div className="row align-items-center g-2">
                        <div className="col-md-5">
                          <input
                            type="tel"
                            className="form-control form-control-sm"
                            placeholder="Téléphone"
                            value={phone.phone}
                            onChange={(e) => fieldsManager.updatePhone(index, 'phone', e.target.value)}
                          />
                        </div>
                        <div className="col-md-3">
                          <select
                            className="form-select form-select-sm"
                            value={phone.label}
                            onChange={(e) => fieldsManager.updatePhone(index, 'label', e.target.value)}
                          >
                            <option value="Mobile">Mobile</option>
                            <option value="Travail">Travail</option>
                            <option value="Domicile">Domicile</option>
                            <option value="Autre">Autre</option>
                          </select>
                        </div>
                        <div className="col-md-2">
                          <div className="form-check">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              checked={phone.isPrimary}
                              onChange={(e) => fieldsManager.updatePhone(index, 'isPrimary', e.target.checked)}
                            />
                            <label className="form-check-label small">Principal</label>
                          </div>
                        </div>
                        <div className="col-md-2 text-end">
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => fieldsManager.removePhone(index)}
                          >
                            <i className="feather-trash-2"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Adresses */}
          <div className="card mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">
                <i className="feather-map-pin me-2"></i>
                Adresses
              </h5>
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={fieldsManager.addAddress}
              >
                <i className="feather-plus me-1"></i>
                Ajouter
              </button>
            </div>
            <div className="card-body">
              {fieldsManager.addresses.length === 0 ? (
                <p className="text-muted mb-0">Aucune adresse</p>
              ) : (
                <div className="list-group list-group-flush">
                  {fieldsManager.addresses.map((address, index) => (
                    <div key={index} className="list-group-item px-0">
                      <div>
                        <div className="row g-2 mb-2">
                          <div className="col-md-6">
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              placeholder="Rue"
                              value={address.street}
                              onChange={(e) => fieldsManager.updateAddress(index, 'street', e.target.value)}
                            />
                          </div>
                          <div className="col-md-6">
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              placeholder="Ville"
                              value={address.city}
                              onChange={(e) => fieldsManager.updateAddress(index, 'city', e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="row g-2 mb-2">
                          <div className="col-md-4">
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              placeholder="Code postal"
                              value={address.postalCode}
                              onChange={(e) => fieldsManager.updateAddress(index, 'postalCode', e.target.value)}
                            />
                          </div>
                          <div className="col-md-4">
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              placeholder="Pays"
                              value={address.country}
                              onChange={(e) => fieldsManager.updateAddress(index, 'country', e.target.value)}
                            />
                          </div>
                          <div className="col-md-4">
                            <select
                              className="form-select form-select-sm"
                              value={address.label}
                              onChange={(e) => fieldsManager.updateAddress(index, 'label', e.target.value)}
                            >
                              <option value="Domicile">Domicile</option>
                              <option value="Travail">Travail</option>
                              <option value="Autre">Autre</option>
                            </select>
                          </div>
                        </div>
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="form-check">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              checked={address.isPrimary}
                              onChange={(e) => fieldsManager.updateAddress(index, 'isPrimary', e.target.checked)}
                            />
                            <label className="form-check-label small">Adresse principale</label>
                          </div>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => fieldsManager.removeAddress(index)}
                          >
                            <i className="feather-trash-2"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sites web */}
          <div className="card mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">
                <i className="feather-globe me-2"></i>
                Sites web
              </h5>
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={fieldsManager.addWebsite}
              >
                <i className="feather-plus me-1"></i>
                Ajouter
              </button>
            </div>
            <div className="card-body">
              {fieldsManager.websites.length === 0 ? (
                <p className="text-muted mb-0">Aucun site web</p>
              ) : (
                <div className="list-group list-group-flush">
                  {fieldsManager.websites.map((website, index) => (
                    <div key={index} className="list-group-item px-0">
                      <div className="row align-items-center g-2">
                        <div className="col-md-6">
                          <input
                            type="url"
                            className="form-control form-control-sm"
                            placeholder="URL"
                            value={website.url}
                            onChange={(e) => fieldsManager.updateWebsite(index, 'url', e.target.value)}
                          />
                        </div>
                        <div className="col-md-4">
                          <select
                            className="form-select form-select-sm"
                            value={website.label}
                            onChange={(e) => fieldsManager.updateWebsite(index, 'label', e.target.value)}
                          >
                            <option value="Site web">Site web</option>
                            <option value="Portfolio">Portfolio</option>
                            <option value="LinkedIn">LinkedIn</option>
                            <option value="Autre">Autre</option>
                          </select>
                        </div>
                        <div className="col-md-2 text-end">
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => fieldsManager.removeWebsite(index)}
                          >
                            <i className="feather-trash-2"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Dates importantes */}
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">
                <i className="feather-calendar me-2"></i>
                Dates importantes
              </h5>
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={fieldsManager.addDate}
              >
                <i className="feather-plus me-1"></i>
                Ajouter
              </button>
            </div>
            <div className="card-body">
              {fieldsManager.dates.length === 0 ? (
                <p className="text-muted mb-0">Aucune date</p>
              ) : (
                <div className="list-group list-group-flush">
                  {fieldsManager.dates.map((date, index) => (
                    <div key={index} className="list-group-item px-0">
                      <div className="row align-items-center g-2">
                        <div className="col-md-5">
                          <input
                            type="date"
                            className="form-control form-control-sm"
                            value={date.date}
                            onChange={(e) => fieldsManager.updateDate(index, 'date', e.target.value)}
                          />
                        </div>
                        <div className="col-md-5">
                          <select
                            className="form-select form-select-sm"
                            value={date.label}
                            onChange={(e) => fieldsManager.updateDate(index, 'label', e.target.value)}
                          >
                            <option value="Anniversaire">Anniversaire</option>
                            <option value="Anniversaire de mariage">Anniversaire de mariage</option>
                            <option value="Autre">Autre</option>
                          </select>
                        </div>
                        <div className="col-md-2 text-end">
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => fieldsManager.removeDate(index)}
                          >
                            <i className="feather-trash-2"></i>
                          </button>
                        </div>
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
  );
}
