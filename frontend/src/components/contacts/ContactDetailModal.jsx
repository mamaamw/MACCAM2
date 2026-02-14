import { useState, useEffect } from 'react';
import ContactFieldsManager from './ContactFieldsManager';
import { contactService } from '../../services/contactService';
import toast from 'react-hot-toast';

export default function ContactDetailModal({ contact, onClose, onSave, mode = 'create' }) {
  const [basicInfo, setBasicInfo] = useState({
    email: '',
    firstName: '',
    lastName: '',
    username: '',
    company: '',
    jobTitle: '',
    bio: ''
  });
  const [contactId, setContactId] = useState(contact?.id || null);
  const [isCreatingContact, setIsCreatingContact] = useState(false);

  const fieldsManager = ContactFieldsManager({
    userId: contactId,
    onSave: () => {
      if (onSave) onSave();
    }
  });

  useEffect(() => {
    if (contact && mode === 'edit') {
      setBasicInfo({
        email: contact.email || '',
        firstName: contact.firstName || '',
        lastName: contact.lastName || '',
        username: contact.username || '',
        company: contact.company || '',
        jobTitle: contact.jobTitle || '',
        bio: contact.bio || ''
      });
      setContactId(contact.id);
    }
  }, [contact, mode]);

  const handleSave = async () => {
    // Valider les infos de base
    if (!basicInfo.email || !basicInfo.firstName || !basicInfo.lastName || !basicInfo.username) {
      toast.error('Email, prénom, nom et nom d\'utilisateur sont requis');
      return;
    }

    try {
      // Si c'est une création et qu'on n'a pas encore d'ID, créer le contact d'abord
      if (mode === 'create' && !contactId) {
        setIsCreatingContact(true);
        const response = await contactService.createContact(basicInfo);
        const newContactId = response.data.id;
        setContactId(newContactId);
        toast.success('Contact créé ! Vous pouvez maintenant ajouter des champs supplémentaires.');
        setIsCreatingContact(false);
        // Ne pas fermer le modal, permettre d'ajouter des champs
        return;
      }

      // Sauvegarder les infos de base si modifiées
      if (contactId) {
        await contactService.updateContact(contactId, basicInfo);
      }

      // Sauvegarder les champs multiples
      await fieldsManager.saveAllFields();
      
      toast.success(mode === 'create' ? 'Contact créé avec succès !' : 'Contact modifié avec succès !');
      
      // Appeler onSave et fermer
      if (onSave) {
        onSave(basicInfo);
      }
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'enregistrement');
      setIsCreatingContact(false);
    }
  };

  return (
    <div className="modal d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
      <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              {mode === 'create' ? 'Nouveau contact' : 'Modifier le contact'}
            </h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body">
            <div className="row">
              {/* Colonne gauche - Infos de base */}
              <div className="col-md-4 border-end">
                <h6 className="text-primary mb-3">👤 Informations générales</h6>
                
                <div className="mb-3">
                  <label className="form-label">Email *</label>
                  <input
                    type="email"
                    className="form-control"
                    value={basicInfo.email}
                    onChange={(e) => setBasicInfo({...basicInfo, email: e.target.value})}
                    required
                    placeholder="email@exemple.com"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Prénom *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={basicInfo.firstName}
                    onChange={(e) => setBasicInfo({...basicInfo, firstName: e.target.value})}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Nom *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={basicInfo.lastName}
                    onChange={(e) => setBasicInfo({...basicInfo, lastName: e.target.value})}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Nom d'utilisateur *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={basicInfo.username}
                    onChange={(e) => setBasicInfo({...basicInfo, username: e.target.value})}
                    required
                    minLength="3"
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

                {mode === 'create' && !contactId && (
                  <div className="alert alert-info">
                    <small>
                      <i className="feather-info me-1"></i>
                      Créez d'abord le contact pour ensuite ajouter emails, téléphones et adresses.
                    </small>
                  </div>
                )}
              </div>

              {/* Colonne droite - Champs multiples */}
              <div className="col-md-8">
                {contactId ? (
                  <>
                    {/* EMAILS */}
                    <div className="mb-4">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h6 className="text-primary mb-0">📧 Emails</h6>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary"
                          onClick={fieldsManager.addEmail}
                        >
                          <i className="feather-plus me-1"></i>Ajouter
                        </button>
                      </div>
                      {fieldsManager.emails.map((email, index) => (
                        <div key={index} className="mb-2">
                          <div className="input-group">
                            <select
                              className="form-select" style={{maxWidth: '120px'}}
                              value={email.label}
                              onChange={(e) => fieldsManager.updateEmail(index, 'label', e.target.value)}
                            >
                              <option value="Travail">Travail</option>
                              <option value="Personnel">Personnel</option>
                              <option value="Autre">Autre</option>
                            </select>
                            <input
                              type="email"
                              className="form-control"
                              placeholder="email@exemple.com"
                              value={email.email}
                              onChange={(e) => fieldsManager.updateEmail(index, 'email', e.target.value)}
                            />
                            <div className="input-group-text">
                              <input
                                type="radio"
                                className="form-check-input mt-0"
                                checked={email.isPrimary}
                                onChange={() => fieldsManager.updateEmail(index, 'isPrimary', true)}
                                title="Email principal"
                              />
                            </div>
                            <button
                              type="button"
                              className="btn btn-outline-danger"
                              onClick={() => fieldsManager.removeEmail(index)}
                            >
                              <i className="feather-x"></i>
                            </button>
                          </div>
                        </div>
                      ))}
                      {fieldsManager.emails.length === 0 && (
                        <small className="text-muted">Aucun email ajouté</small>
                      )}
                    </div>

                    {/* PHONES */}
                    <div className="mb-4">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h6 className="text-primary mb-0">📱 Téléphones</h6>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary"
                          onClick={fieldsManager.addPhone}
                        >
                          <i className="feather-plus me-1"></i>Ajouter
                        </button>
                      </div>
                      {fieldsManager.phones.map((phone, index) => (
                        <div key={index} className="mb-2">
                          <div className="input-group">
                            <select
                              className="form-select" style={{maxWidth: '120px'}}
                              value={phone.label}
                              onChange={(e) => fieldsManager.updatePhone(index, 'label', e.target.value)}
                            >
                              <option value="Mobile">Mobile</option>
                              <option value="Travail">Travail</option>
                              <option value="Domicile">Domicile</option>
                              <option value="Principal">Principal</option>
                              <option value="Autre">Autre</option>
                            </select>
                            <input
                              type="tel"
                              className="form-control"
                              placeholder="+32 123 45 67 89"
                              value={phone.phone}
                              onChange={(e) => fieldsManager.updatePhone(index, 'phone', e.target.value)}
                            />
                            <div className="input-group-text">
                              <input
                                type="radio"
                                className="form-check-input mt-0"
                                checked={phone.isPrimary}
                                onChange={() => fieldsManager.updatePhone(index, 'isPrimary', true)}
                                title="Téléphone principal"
                              />
                            </div>
                            <button
                              type="button"
                              className="btn btn-outline-danger"
                              onClick={() => fieldsManager.removePhone(index)}
                            >
                              <i className="feather-x"></i>
                            </button>
                          </div>
                        </div>
                      ))}
                      {fieldsManager.phones.length === 0 && (
                        <small className="text-muted">Aucun téléphone ajouté</small>
                      )}
                    </div>

                    {/* ADDRESSES */}
                    <div className="mb-4">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h6 className="text-primary mb-0">📍 Adresses</h6>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary"
                          onClick={fieldsManager.addAddress}
                        >
                          <i className="feather-plus me-1"></i>Ajouter
                        </button>
                      </div>
                      {fieldsManager.addresses.map((address, index) => (
                        <div key={index} className="card mb-2">
                          <div className="card-body p-2">
                            <div className="d-flex justify-content-between mb-2">
                              <select
                                className="form-select form-select-sm" style={{maxWidth: '150px'}}
                                value={address.label}
                                onChange={(e) => fieldsManager.updateAddress(index, 'label', e.target.value)}
                              >
                                <option value="Domicile">Domicile</option>
                                <option value="Travail">Travail</option>
                                <option value="Autre">Autre</option>
                              </select>
                              <div>
                                <input
                                  type="radio"
                                  className="form-check-input me-2"
                                  checked={address.isPrimary}
                                  onChange={() => fieldsManager.updateAddress(index, 'isPrimary', true)}
                                  title="Adresse principale"
                                />
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => fieldsManager.removeAddress(index)}
                                >
                                  <i className="feather-x"></i>
                                </button>
                              </div>
                            </div>
                            <input
                              type="text"
                              className="form-control form-control-sm mb-2"
                              placeholder="Rue"
                              value={address.street}
                              onChange={(e) => fieldsManager.updateAddress(index, 'street', e.target.value)}
                            />
                            <div className="row g-2">
                              <div className="col-5">
                                <input
                                  type="text"
                                  className="form-control form-control-sm"
                                  placeholder="Ville"
                                  value={address.city}
                                  onChange={(e) => fieldsManager.updateAddress(index, 'city', e.target.value)}
                                />
                              </div>
                              <div className="col-3">
                                <input
                                  type="text"
                                  className="form-control form-control-sm"
                                  placeholder="CP"
                                  value={address.postalCode}
                                  onChange={(e) => fieldsManager.updateAddress(index, 'postalCode', e.target.value)}
                                />
                              </div>
                              <div className="col-4">
                                <input
                                  type="text"
                                  className="form-control form-control-sm"
                                  placeholder="Pays"
                                  value={address.country}
                                  onChange={(e) => fieldsManager.updateAddress(index, 'country', e.target.value)}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      {fieldsManager.addresses.length === 0 && (
                        <small className="text-muted">Aucune adresse ajoutée</small>
                      )}
                    </div>

                    {/* WEBSITES */}
                    <div className="mb-4">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h6 className="text-primary mb-0">🌐 Sites web</h6>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary"
                          onClick={fieldsManager.addWebsite}
                        >
                          <i className="feather-plus me-1"></i>Ajouter
                        </button>
                      </div>
                      {fieldsManager.websites.map((website, index) => (
                        <div key={index} className="mb-2">
                          <div className="input-group">
                            <select
                              className="form-select" style={{maxWidth: '120px'}}
                              value={website.label}
                              onChange={(e) => fieldsManager.updateWebsite(index, 'label', e.target.value)}
                            >
                              <option value="Site Web">Site Web</option>
                              <option value="Blog">Blog</option>
                              <option value="Profil">Profil</option>
                              <option value="Travail">Travail</option>
                              <option value="Autre">Autre</option>
                            </select>
                            <input
                              type="url"
                              className="form-control"
                              placeholder="https://..."
                              value={website.url}
                              onChange={(e) => fieldsManager.updateWebsite(index, 'url', e.target.value)}
                            />
                            <button
                              type="button"
                              className="btn btn-outline-danger"
                              onClick={() => fieldsManager.removeWebsite(index)}
                            >
                              <i className="feather-x"></i>
                            </button>
                          </div>
                        </div>
                      ))}
                      {fieldsManager.websites.length === 0 && (
                        <small className="text-muted">Aucun site web ajouté</small>
                      )}
                    </div>

                    {/* DATES */}
                    <div className="mb-4">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h6 className="text-primary mb-0">📅 Dates importantes</h6>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-primary"
                          onClick={fieldsManager.addDate}
                        >
                          <i className="feather-plus me-1"></i>Ajouter
                        </button>
                      </div>
                      {fieldsManager.dates.map((date, index) => (
                        <div key={index} className="mb-2">
                          <div className="input-group">
                            <select
                              className="form-select" style={{maxWidth: '140px'}}
                              value={date.label}
                              onChange={(e) => fieldsManager.updateDate(index, 'label', e.target.value)}
                            >
                              <option value="Anniversaire">Anniversaire</option>
                              <option value="Événement">Événement</option>
                              <option value="Autre">Autre</option>
                            </select>
                            <input
                              type="date"
                              className="form-control"
                              value={date.date ? (typeof date.date === 'string' ? date.date.split('T')[0] : date.date) : ''}
                              onChange={(e) => fieldsManager.updateDate(index, 'date', e.target.value)}
                            />
                            <button
                              type="button"
                              className="btn btn-outline-danger"
                              onClick={() => fieldsManager.removeDate(index)}
                            >
                              <i className="feather-x"></i>
                            </button>
                          </div>
                        </div>
                      ))}
                      {fieldsManager.dates.length === 0 && (
                        <small className="text-muted">Aucune date ajoutée</small>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="d-flex align-items-center justify-content-center h-100">
                    <div className="text-center text-muted">
                      <i className="feather-info" style={{fontSize: '48px'}}></i>
                      <p className="mt-3">
                        Créez d'abord le contact pour ajouter<br/>
                        des emails, téléphones et adresses
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              {contactId ? 'Fermer' : 'Annuler'}
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSave}
              disabled={fieldsManager.loading || isCreatingContact}
            >
              {isCreatingContact || fieldsManager.loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Enregistrement...
                </>
              ) : contactId ? (
                <>
                  <i className="feather-save me-2"></i>
                  Enregistrer
                </>
              ) : (
                <>
                  <i className="feather-plus me-2"></i>
                  Créer le contact
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}