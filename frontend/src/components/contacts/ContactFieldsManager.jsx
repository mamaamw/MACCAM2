import { useState, useEffect, useRef } from 'react';
import contactFieldsService from '../../services/contactFieldsService';
import toast from 'react-hot-toast';

export default function ContactFieldsManager({ userId, onSave }) {
  const [emails, setEmails] = useState([]);
  const [phones, setPhones] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [websites, setWebsites] = useState([]);
  const [dates, setDates] = useState([]);
  const [loading, setLoading] = useState(false);
  const userIdRef = useRef(userId);

  useEffect(() => {
    userIdRef.current = userId;
    
    // Réinitialiser l'état quand userId change ou au mount
    setEmails([]);
    setPhones([]);
    setAddresses([]);
    setWebsites([]);
    setDates([]);
    
    if (userId) {
      loadAllFields();
    }
  }, [userId]);

  const loadAllFields = async () => {
    if (!userIdRef.current) return;
    try {
      setLoading(true);
      const data = await contactFieldsService.getAllFields(userIdRef.current);
      setEmails(data.emails);
      setPhones(data.phones);
      setAddresses(data.addresses);
      setWebsites(data.websites);
      setDates(data.dates);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  // ========== EMAILS ==========
  const addEmail = () => {
    setEmails([...emails, { email: '', label: 'Travail', isPrimary: emails.length === 0, _isNew: true }]);
  };

  const updateEmail = (index, field, value) => {
    const updated = [...emails];
    if (field === 'isPrimary' && value) {
      updated.forEach((e, i) => e.isPrimary = i === index);
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setEmails(updated);
  };

  const removeEmail = async (index) => {
    const email = emails[index];
    if (email.id) {
      try {
        await contactFieldsService.deleteEmail(email.id);
        toast.success('Email supprimé');
      } catch (error) {
        toast.error('Erreur suppression');
        return;
      }
    }
    setEmails(emails.filter((_, i) => i !== index));
  };

  // ========== PHONES ==========
  const addPhone = () => {
    setPhones([...phones, { phone: '', label: 'Mobile', isPrimary: phones.length === 0, _isNew: true }]);
  };

  const updatePhone = (index, field, value) => {
    const updated = [...phones];
    if (field === 'isPrimary' && value) {
      updated.forEach((p, i) => p.isPrimary = i === index);
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setPhones(updated);
  };

  const removePhone = async (index) => {
    const phone = phones[index];
    if (phone.id) {
      try {
        await contactFieldsService.deletePhone(phone.id);
        toast.success('Téléphone supprimé');
      } catch (error) {
        toast.error('Erreur suppression');
        return;
      }
    }
    setPhones(phones.filter((_, i) => i !== index));
  };

  // ========== ADDRESSES ==========
  const addAddress = () => {
    setAddresses([...addresses, { 
      label: 'Domicile', 
      street: '', 
      city: '', 
      state: '', 
      postalCode: '', 
      country: '', 
      isPrimary: addresses.length === 0,
      _isNew: true 
    }]);
  };

  const updateAddress = (index, field, value) => {
    const updated = [...addresses];
    if (field === 'isPrimary' && value) {
      updated.forEach((a, i) => a.isPrimary = i === index);
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }
    setAddresses(updated);
  };

  const removeAddress = async (index) => {
    const address = addresses[index];
    if (address.id) {
      try {
        await contactFieldsService.deleteAddress(address.id);
        toast.success('Adresse supprimée');
      } catch (error) {
        toast.error('Erreur suppression');
        return;
      }
    }
    setAddresses(addresses.filter((_, i) => i !== index));
  };

  // ========== WEBSITES ==========
  const addWebsite = () => {
    setWebsites([...websites, { url: '', label: 'Site Web', _isNew: true }]);
  };

  const updateWebsite = (index, field, value) => {
    const updated = [...websites];
    updated[index] = { ...updated[index], [field]: value };
    setWebsites(updated);
  };

  const removeWebsite = async (index) => {
    const website = websites[index];
    if (website.id) {
      try {
        await contactFieldsService.deleteWebsite(website.id);
        toast.success('Site web supprimé');
      } catch (error) {
        toast.error('Erreur suppression');
        return;
      }
    }
    setWebsites(websites.filter((_, i) => i !== index));
  };

  // ========== DATES ==========
  const addDate = () => {
    setDates([...dates, { date: '', label: 'Anniversaire', _isNew: true }]);
  };

  const updateDate = (index, field, value) => {
    const updated = [...dates];
    updated[index] = { ...updated[index], [field]: value };
    setDates(updated);
  };

  const removeDate = async (index) => {
    const date = dates[index];
    if (date.id) {
      try {
        await contactFieldsService.deleteDate(date.id);
        toast.success('Date supprimée');
      } catch (error) {
        toast.error('Erreur suppression');
        return;
      }
    }
    setDates(dates.filter((_, i) => i !== index));
  };

  // ========== SAVE ALL ==========
  const saveAllFields = async () => {
    if (!userIdRef.current) {
      toast.error('Contact non trouvé');
      return;
    }
    setLoading(true);
    try {
      // Save emails
      for (const email of emails) {
        if (!email.email) continue;
        if (email._isNew) {
          await contactFieldsService.addEmail(userIdRef.current, {
            email: email.email,
            label: email.label,
            isPrimary: email.isPrimary
          });
        } else if (email.id) {
          await contactFieldsService.updateEmail(email.id, {
            email: email.email,
            label: email.label,
            isPrimary: email.isPrimary
          });
        }
      }

      // Save phones
      for (const phone of phones) {
        if (!phone.phone) continue;
        if (phone._isNew) {
          await contactFieldsService.addPhone(userIdRef.current, {
            phone: phone.phone,
            label: phone.label,
            isPrimary: phone.isPrimary
          });
        } else if (phone.id) {
          await contactFieldsService.updatePhone(phone.id, {
            phone: phone.phone,
            label: phone.label,
            isPrimary: phone.isPrimary
          });
        }
      }

      // Save addresses
      for (const address of addresses) {
        if (!address.street && !address.city) continue;
        if (address._isNew) {
          await contactFieldsService.addAddress(userIdRef.current, {
            label: address.label,
            street: address.street,
            city: address.city,
            state: address.state,
            postalCode: address.postalCode,
            country: address.country,
            isPrimary: address.isPrimary
          });
        } else if (address.id) {
          await contactFieldsService.updateAddress(address.id, {
            label: address.label,
            street: address.street,
            city: address.city,
            state: address.state,
            postalCode: address.postalCode,
            country: address.country,
            isPrimary: address.isPrimary
          });
        }
      }

      // Save websites
      for (const website of websites) {
        if (!website.url) continue;
        if (website._isNew) {
          await contactFieldsService.addWebsite(userIdRef.current, {
            url: website.url,
            label: website.label
          });
        } else if (website.id) {
          await contactFieldsService.updateWebsite(website.id, {
            url: website.url,
            label: website.label
          });
        }
      }

      // Save dates
      for (const date of dates) {
        if (!date.date) continue;
        if (date._isNew) {
          await contactFieldsService.addDate(userIdRef.current, {
            date: date.date,
            label: date.label
          });
        } else if (date.id) {
          await contactFieldsService.updateDate(date.id, {
            date: date.date,
            label: date.label
          });
        }
      }

      toast.success('Champs enregistrés avec succès');
      if (onSave) onSave();
      await loadAllFields(); // Recharger avec les IDs
    } catch (error) {
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  return {
    // State
    emails, phones, addresses, websites, dates, loading,
    // Email methods
    addEmail, updateEmail, removeEmail,
    // Phone methods
    addPhone, updatePhone, removePhone,
    // Address methods
    addAddress, updateAddress, removeAddress,
    // Website methods
    addWebsite, updateWebsite, removeWebsite,
    // Date methods
    addDate, updateDate, removeDate,
    // General
    saveAllFields,
    loadAllFields
  };
}
