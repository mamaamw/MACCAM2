import { useState } from 'react';
import contactFieldsService from '../services/contactFieldsService';
import toast from 'react-hot-toast';

export default function MultiFieldEmail({ userId, onUpdate }) {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadEmails = async () => {
    try {
      const response = await contactFieldsService.getEmails(userId);
      setEmails(response.data || []);
    } catch {
    }
  };

  const addEmail = () => {
    setEmails([...emails, { email: '', label: 'Travail', isPrimary: emails.length === 0, isNew: true }]);
  };

  const updateEmail = (index, field, value) => {
    const updated = [...emails];
    updated[index] = { ...updated[index], [field]: value };
    setEmails(updated);
  };

  const setPrimary = (index) => {
    const updated = emails.map((email, i) => ({
      ...email,
      isPrimary: i === index
    }));
    setEmails(updated);
  };

  const removeEmail = async (index) => {
    const email = emails[index];
    
    if (email.id && !email.isNew) {
      try {
        await contactFieldsService.deleteEmail(email.id);
        toast.success('Email supprimé');
      } catch (error) {
        toast.error('Erreur lors de la suppression');
        return;
      }
    }
    
    const updated = emails.filter((_, i) => i !== index);
    setEmails(updated);
    if (onUpdate) onUpdate();
  };

  const saveEmails = async () => {
    setLoading(true);
    try {
      for (const email of emails) {
        if (!email.email) continue;
        
        if (email.isNew) {
          await contactFieldsService.addEmail(userId, {
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
      toast.success('Emails enregistrés');
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  return {
    emails,
    setEmails,
    addEmail,
    updateEmail,
    setPrimary,
    removeEmail,
    saveEmails,
    loadEmails,
    loading
  };
}
