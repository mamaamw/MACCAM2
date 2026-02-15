const TRANSLATION_RULES = [
  {
    from: [/Invoices Awaiting Payment/gi, /Factures en attente de paiement/gi],
    to: {
      en: 'Invoices awaiting payment',
      nl: 'Facturen in afwachting van betaling',
      de: 'Rechnungen ausstehend',
      es: 'Facturas pendientes de pago',
    },
  },
  {
    from: [/Invoices Awaiting/gi, /Factures en attente/gi],
    to: {
      en: 'Invoices awaiting',
      nl: 'Facturen in afwachting',
      de: 'Rechnungen ausstehend',
      es: 'Facturas pendientes',
    },
  },
  {
    from: [/Converted Leads/gi, /Prospects convertis/gi],
    to: {
      en: 'Converted leads',
      nl: 'Geconverteerde prospects',
      de: 'Konvertierte Leads',
      es: 'Prospectos convertidos',
    },
  },
  {
    from: [/Projects In Progress/gi, /Projets en cours/gi],
    to: {
      en: 'Projects in progress',
      nl: 'Projecten in uitvoering',
      de: 'Projekte in Bearbeitung',
      es: 'Proyectos en curso',
    },
  },
  {
    from: [/Completed/gi, /Terminé/gi],
    to: {
      en: 'Completed',
      nl: 'Voltooid',
      de: 'Abgeschlossen',
      es: 'Completado',
    },
  },
  {
    from: [/from last week/gi, /depuis la semaine dernière/gi],
    to: {
      en: 'from last week',
      nl: 'ten opzichte van vorige week',
      de: 'seit letzter Woche',
      es: 'desde la semana pasada',
    },
  },
  {
    from: [/more/gi, /de plus/gi],
    to: {
      en: 'more',
      nl: 'meer',
      de: 'mehr',
      es: 'más',
    },
  },
  {
    from: [/Tasks Completed/gi, /Tâches terminées/gi],
    to: {
      en: 'Tasks completed',
      nl: 'Voltooide taken',
      de: 'Abgeschlossene Aufgaben',
      es: 'Tareas completadas',
    },
  },
  {
    from: [/New Tasks/gi, /Nouvelles tâches/gi],
    to: {
      en: 'New tasks',
      nl: 'Nieuwe taken',
      de: 'Neue Aufgaben',
      es: 'Nuevas tareas',
    },
  },
  {
    from: [/Project Done/gi, /Projet terminé/gi],
    to: {
      en: 'Project done',
      nl: 'Project afgerond',
      de: 'Projekt abgeschlossen',
      es: 'Proyecto completado',
    },
  },
  {
    from: [/Leads Overview/gi, /Aperçu des prospects/gi],
    to: {
      en: 'Leads overview',
      nl: 'Prospectoverzicht',
      de: 'Lead-Übersicht',
      es: 'Resumen de prospectos',
    },
  },
  {
    from: [/Upcoming Schedule/gi, /Planning à venir/gi],
    to: {
      en: 'Upcoming schedule',
      nl: 'Komende planning',
      de: 'Kommender Zeitplan',
      es: 'Próxima agenda',
    },
  },
  {
    from: [/Upcomming Schedule/gi, /Planning à venir/gi],
    to: {
      en: 'Upcoming schedule',
      nl: 'Komende planning',
      de: 'Kommender Zeitplan',
      es: 'Próxima agenda',
    },
  },
  {
    from: [/Latest Leads/gi, /Derniers prospects/gi],
    to: {
      en: 'Latest leads',
      nl: 'Laatste prospects',
      de: 'Neueste Leads',
      es: 'Últimos prospectos',
    },
  },
  {
    from: [/Project Status/gi, /Statut du projet/gi],
    to: {
      en: 'Project status',
      nl: 'Projectstatus',
      de: 'Projektstatus',
      es: 'Estado del proyecto',
    },
  },
  {
    from: [/Team Progress/gi, /Progression de l'équipe/gi],
    to: {
      en: 'Team progress',
      nl: 'Teamvoortgang',
      de: 'Teamfortschritt',
      es: 'Progreso del equipo',
    },
  },
  {
    from: [/Upcomming Projects/gi, /Projets à venir/gi],
    to: {
      en: 'Upcoming projects',
      nl: 'Aankomende projecten',
      de: 'Anstehende Projekte',
      es: 'Próximos proyectos',
    },
  },
  {
    from: [/Payment Record/gi, /Historique de paiement/gi],
    to: {
      en: 'Payment record',
      nl: 'Betalingsoverzicht',
      de: 'Zahlungsverlauf',
      es: 'Registro de pagos',
    },
  },
  {
    from: [/Total Sales/gi, /Ventes totales/gi],
    to: {
      en: 'Total sales',
      nl: 'Totale verkoop',
      de: 'Gesamtumsatz',
      es: 'Ventas totales',
    },
  },
  {
    from: [/Full Details/gi, /Détails complets/gi],
    to: {
      en: 'Full details',
      nl: 'Volledige details',
      de: 'Vollständige Details',
      es: 'Detalles completos',
    },
  },
  {
    from: [/Awaiting/gi, /En attente/gi],
    to: {
      en: 'Awaiting',
      nl: 'In afwachting',
      de: 'Ausstehend',
      es: 'Pendiente',
    },
  },
  {
    from: [/Revenue/gi, /Revenu/gi],
    to: {
      en: 'Revenue',
      nl: 'Omzet',
      de: 'Umsatz',
      es: 'Ingresos',
    },
  },
  {
    from: [/New/gi, /Nouveau/gi],
    to: {
      en: 'New',
      nl: 'Nieuw',
      de: 'Neu',
      es: 'Nuevo',
    },
  },
  {
    from: [/Event/gi, /Événement/gi],
    to: {
      en: 'Event',
      nl: 'Evenement',
      de: 'Ereignis',
      es: 'Evento',
    },
  },
  {
    from: [/Snoozed/gi, /Différé/gi],
    to: {
      en: 'Snoozed',
      nl: 'Uitgesteld',
      de: 'Verschoben',
      es: 'Pospuesto',
    },
  },
  {
    from: [/Deleted/gi, /Supprimé/gi],
    to: {
      en: 'Deleted',
      nl: 'Verwijderd',
      de: 'Gelöscht',
      es: 'Eliminado',
    },
  },
  {
    from: [/Settings/gi, /Paramètres/gi],
    to: {
      en: 'Settings',
      nl: 'Instellingen',
      de: 'Einstellungen',
      es: 'Configuración',
    },
  },
  {
    from: [/Tips & Tricks/gi, /Astuces/gi],
    to: {
      en: 'Tips & tricks',
      nl: 'Tips en trucs',
      de: 'Tipps & Tricks',
      es: 'Consejos y trucos',
    },
  },
  {
    from: [/Refresh/gi, /Rafraîchir/gi],
    to: {
      en: 'Refresh',
      nl: 'Vernieuwen',
      de: 'Aktualisieren',
      es: 'Actualizar',
    },
  },
  {
    from: [/Maximize\/Minimize/gi, /Agrandir\/Réduire/gi],
    to: {
      en: 'Maximize/Minimize',
      nl: 'Maximaliseren/Minimaliseren',
      de: 'Maximieren/Minimieren',
      es: 'Maximizar/Minimizar',
    },
  },
  {
    from: [/Options/gi, /Options/gi],
    to: {
      en: 'Options',
      nl: 'Opties',
      de: 'Optionen',
      es: 'Opciones',
    },
  },
  {
    from: [/Users/gi, /Utilisateurs/gi],
    to: {
      en: 'Users',
      nl: 'Gebruikers',
      de: 'Benutzer',
      es: 'Usuarios',
    },
  },
  {
    from: [/Proposal/gi, /Proposition/gi],
    to: {
      en: 'Proposal',
      nl: 'Voorstel',
      de: 'Angebot',
      es: 'Propuesta',
    },
  },
  {
    from: [/Status/gi, /Statut/gi],
    to: {
      en: 'Status',
      nl: 'Status',
      de: 'Status',
      es: 'Estado',
    },
  },
  {
    from: [/Returning/gi, /Récurrent/gi],
    to: {
      en: 'Returning',
      nl: 'Terugkerend',
      de: 'Wiederkehrend',
      es: 'Recurrente',
    },
  },
  {
    from: [/Not Interested/gi, /Pas intéressé/gi],
    to: {
      en: 'Not interested',
      nl: 'Niet geïnteresseerd',
      de: 'Nicht interessiert',
      es: 'No interesado',
    },
  },
  {
    from: [/In Progress/gi, /En cours/gi],
    to: {
      en: 'In progress',
      nl: 'In uitvoering',
      de: 'In Bearbeitung',
      es: 'En progreso',
    },
  },
  {
    from: [/Progress/gi, /Progression/gi],
    to: {
      en: 'Progress',
      nl: 'Voortgang',
      de: 'Fortschritt',
      es: 'Progreso',
    },
  },
  {
    from: [/Others/gi, /Autres/gi],
    to: {
      en: 'Others',
      nl: 'Overig',
      de: 'Andere',
      es: 'Otros',
    },
  },
  {
    from: [/Contacted/gi, /Contacté/gi],
    to: {
      en: 'Contacted',
      nl: 'Gecontacteerd',
      de: 'Kontaktiert',
      es: 'Contactado',
    },
  },
  {
    from: [/Qualified/gi, /Qualifié/gi],
    to: {
      en: 'Qualified',
      nl: 'Gekwalificeerd',
      de: 'Qualifiziert',
      es: 'Calificado',
    },
  },
  {
    from: [/Working/gi, /En traitement/gi],
    to: {
      en: 'Working',
      nl: 'In behandeling',
      de: 'In Arbeit',
      es: 'En proceso',
    },
  },
  {
    from: [/Customer/gi, /Client/gi],
    to: {
      en: 'Customer',
      nl: 'Klant',
      de: 'Kunde',
      es: 'Cliente',
    },
  },
  {
    from: [/Dashboard Design/gi, /Design du tableau de bord/gi],
    to: {
      en: 'Dashboard design',
      nl: 'Dashboardontwerp',
      de: 'Dashboard-Design',
      es: 'Diseño de panel',
    },
  },
  {
    from: [/Apps Development/gi, /Développement d'applications/gi],
    to: {
      en: 'Apps development',
      nl: 'App-ontwikkeling',
      de: 'App-Entwicklung',
      es: 'Desarrollo de apps',
    },
  },
  {
    from: [/Facebook Marketing/gi, /Marketing Facebook/gi],
    to: {
      en: 'Facebook marketing',
      nl: 'Facebook-marketing',
      de: 'Facebook-Marketing',
      es: 'Marketing en Facebook',
    },
  },
  {
    from: [/React Dashboard Github/gi, /Tableau de bord React Github/gi],
    to: {
      en: 'React dashboard Github',
      nl: 'React-dashboard Github',
      de: 'React-Dashboard Github',
      es: 'Panel React Github',
    },
  },
  {
    from: [/Paypal Payment Gateway/gi, /Passerelle de paiement Paypal/gi],
    to: {
      en: 'Paypal payment gateway',
      nl: 'Paypal-betaalgateway',
      de: 'Paypal-Zahlungsgateway',
      es: 'Pasarela de pago Paypal',
    },
  },
  {
    from: [/Applications/gi],
    to: {
      en: 'Applications',
      nl: 'Applicaties',
      de: 'Anwendungen',
      es: 'Aplicaciones',
    },
  },
  {
    from: [/Marketing/gi],
    to: {
      en: 'Marketing',
      nl: 'Marketing',
      de: 'Marketing',
      es: 'Marketing',
    },
  },
  {
    from: [/Total prospects/gi, /Total prospects/gi],
    to: {
      en: 'Total leads',
      nl: 'Totaal prospects',
      de: 'Leads gesamt',
      es: 'Total de prospectos',
    },
  },
  {
    from: [/Prospects par source/gi, /Leads by source/gi],
    to: {
      en: 'Leads by source',
      nl: 'Prospects per bron',
      de: 'Leads nach Quelle',
      es: 'Prospectos por fuente',
    },
  },
  {
    from: [/Prospects par statut/gi, /Leads by status/gi],
    to: {
      en: 'Leads by status',
      nl: 'Prospects per status',
      de: 'Leads nach Status',
      es: 'Prospectos por estado',
    },
  },
  {
    from: [/Prospects récents/gi, /Recent leads/gi],
    to: {
      en: 'Recent leads',
      nl: 'Recente prospects',
      de: 'Aktuelle Leads',
      es: 'Prospectos recientes',
    },
  },
  {
    from: [/Créer un prospect/gi, /Create lead/gi],
    to: {
      en: 'Create lead',
      nl: 'Prospect aanmaken',
      de: 'Lead erstellen',
      es: 'Crear prospecto',
    },
  },
  {
    from: [/Détails du prospect/gi, /Lead details/gi],
    to: {
      en: 'Lead details',
      nl: 'Prospectdetails',
      de: 'Lead-Details',
      es: 'Detalles del prospecto',
    },
  },
  {
    from: [/Prospects/gi, /Leads/gi],
    to: {
      en: 'Leads',
      nl: 'Prospects',
      de: 'Leads',
      es: 'Prospectos',
    },
  },
  {
    from: [/Clients/gi, /Customers/gi],
    to: {
      en: 'Customers',
      nl: 'Klanten',
      de: 'Kunden',
      es: 'Clientes',
    },
  },
  {
    from: [/Projets/gi, /Projects/gi],
    to: {
      en: 'Projects',
      nl: 'Projecten',
      de: 'Projekte',
      es: 'Proyectos',
    },
  },
  {
    from: [/Tâches/gi, /Tasks/gi],
    to: {
      en: 'Tasks',
      nl: 'Taken',
      de: 'Aufgaben',
      es: 'Tareas',
    },
  },
  {
    from: [/Paramètres/gi, /Settings/gi],
    to: {
      en: 'Settings',
      nl: 'Instellingen',
      de: 'Einstellungen',
      es: 'Configuración',
    },
  },
  {
    from: [/Facture/gi, /Invoice/gi],
    to: {
      en: 'Invoice',
      nl: 'Factuur',
      de: 'Rechnung',
      es: 'Factura',
    },
  },
  {
    from: [/Factures/gi, /Invoices/gi],
    to: {
      en: 'Invoices',
      nl: 'Facturen',
      de: 'Rechnungen',
      es: 'Facturas',
    },
  },
  {
    from: [/Proposition/gi, /Proposal/gi],
    to: {
      en: 'Proposal',
      nl: 'Voorstel',
      de: 'Angebot',
      es: 'Propuesta',
    },
  },
  {
    from: [/Documentation/gi],
    to: {
      en: 'Documentation',
      nl: 'Documentatie',
      de: 'Dokumentation',
      es: 'Documentación',
    },
  },
  {
    from: [/Rechercher/gi, /Search/gi],
    to: {
      en: 'Search',
      nl: 'Zoeken',
      de: 'Suchen',
      es: 'Buscar',
    },
  },
  {
    from: [/Filtrer/gi, /Filter/gi],
    to: {
      en: 'Filter',
      nl: 'Filteren',
      de: 'Filtern',
      es: 'Filtrar',
    },
  },
  {
    from: [/Voir/gi, /View/gi],
    to: {
      en: 'View',
      nl: 'Bekijken',
      de: 'Ansehen',
      es: 'Ver',
    },
  },
  {
    from: [/Créer/gi, /Create/gi],
    to: {
      en: 'Create',
      nl: 'Aanmaken',
      de: 'Erstellen',
      es: 'Crear',
    },
  },
  {
    from: [/Modifier/gi, /Edit/gi],
    to: {
      en: 'Edit',
      nl: 'Bewerken',
      de: 'Bearbeiten',
      es: 'Editar',
    },
  },
  {
    from: [/Supprimer/gi, /Delete/gi],
    to: {
      en: 'Delete',
      nl: 'Verwijderen',
      de: 'Löschen',
      es: 'Eliminar',
    },
  },
  {
    from: [/Enregistrer/gi, /Save/gi],
    to: {
      en: 'Save',
      nl: 'Opslaan',
      de: 'Speichern',
      es: 'Guardar',
    },
  },
  {
    from: [/Annuler/gi, /Cancel/gi],
    to: {
      en: 'Cancel',
      nl: 'Annuleren',
      de: 'Abbrechen',
      es: 'Cancelar',
    },
  },
  {
    from: [/Soumettre/gi, /Submit/gi],
    to: {
      en: 'Submit',
      nl: 'Verzenden',
      de: 'Senden',
      es: 'Enviar',
    },
  },
  {
    from: [/Statut/gi, /Status/gi],
    to: {
      en: 'Status',
      nl: 'Status',
      de: 'Status',
      es: 'Estado',
    },
  },
  {
    from: [/Actif/gi, /Active/gi],
    to: {
      en: 'Active',
      nl: 'Actief',
      de: 'Aktiv',
      es: 'Activo',
    },
  },
  {
    from: [/Inactif/gi, /Inactive/gi],
    to: {
      en: 'Inactive',
      nl: 'Inactief',
      de: 'Inaktiv',
      es: 'Inactivo',
    },
  },
  {
    from: [/En attente/gi, /Pending/gi],
    to: {
      en: 'Pending',
      nl: 'In afwachting',
      de: 'Ausstehend',
      es: 'Pendiente',
    },
  },
  {
    from: [/Brouillon/gi, /Draft/gi],
    to: {
      en: 'Draft',
      nl: 'Concept',
      de: 'Entwurf',
      es: 'Borrador',
    },
  },
  {
    from: [/Envoyé/gi, /Sent/gi],
    to: {
      en: 'Sent',
      nl: 'Verzonden',
      de: 'Gesendet',
      es: 'Enviado',
    },
  },
  {
    from: [/Accepté/gi, /Accepted/gi],
    to: {
      en: 'Accepted',
      nl: 'Geaccepteerd',
      de: 'Akzeptiert',
      es: 'Aceptado',
    },
  },
  {
    from: [/Refusé/gi, /Rejected/gi],
    to: {
      en: 'Rejected',
      nl: 'Afgewezen',
      de: 'Abgelehnt',
      es: 'Rechazado',
    },
  },
  {
    from: [/Télécharger/gi, /Download/gi],
    to: {
      en: 'Download',
      nl: 'Downloaden',
      de: 'Herunterladen',
      es: 'Descargar',
    },
  },
  {
    from: [/Importer/gi, /Upload/gi],
    to: {
      en: 'Upload',
      nl: 'Uploaden',
      de: 'Hochladen',
      es: 'Subir',
    },
  },
  {
    from: [/Paiement/gi, /Payment/gi],
    to: {
      en: 'Payment',
      nl: 'Betaling',
      de: 'Zahlung',
      es: 'Pago',
    },
  },
  {
    from: [/Gestion des utilisateurs/gi, /User management/gi],
    to: {
      en: 'User management',
      nl: 'Gebruikersbeheer',
      de: 'Benutzerverwaltung',
      es: 'Gestión de usuarios',
    },
  },
  {
    from: [/Gérez les comptes et les droits d'accès/gi, /Manage accounts and permissions/gi],
    to: {
      en: 'Manage accounts and permissions',
      nl: 'Beheer accounts en rechten',
      de: 'Konten und Berechtigungen verwalten',
      es: 'Gestiona cuentas y permisos',
    },
  },
  {
    from: [/Ajouter un utilisateur/gi, /Add user/gi],
    to: {
      en: 'Add user',
      nl: 'Gebruiker toevoegen',
      de: 'Benutzer hinzufügen',
      es: 'Agregar usuario',
    },
  },
  {
    from: [/Rechercher par nom ou email\.\.\./gi, /Search by name or email\.\.\./gi],
    to: {
      en: 'Search by name or email...',
      nl: 'Zoeken op naam of e-mail...',
      de: 'Nach Name oder E-Mail suchen...',
      es: 'Buscar por nombre o correo...',
    },
  },
  {
    from: [/Tous les rôles/gi, /All roles/gi],
    to: {
      en: 'All roles',
      nl: 'Alle rollen',
      de: 'Alle Rollen',
      es: 'Todos los roles',
    },
  },
  {
    from: [/Administrateurs/gi, /Administrators/gi],
    to: {
      en: 'Administrators',
      nl: 'Beheerders',
      de: 'Administratoren',
      es: 'Administradores',
    },
  },
  {
    from: [/Gestionnaires/gi, /Managers/gi],
    to: {
      en: 'Managers',
      nl: 'Managers',
      de: 'Manager',
      es: 'Gerentes',
    },
  },
  {
    from: [/Aucun utilisateur trouvé/gi, /No users found/gi],
    to: {
      en: 'No users found',
      nl: 'Geen gebruikers gevonden',
      de: 'Keine Benutzer gefunden',
      es: 'No se encontraron usuarios',
    },
  },
  {
    from: [/Nouvel utilisateur/gi, /New user/gi],
    to: {
      en: 'New user',
      nl: 'Nieuwe gebruiker',
      de: 'Neuer Benutzer',
      es: 'Nuevo usuario',
    },
  },
  {
    from: [/Modifier l'utilisateur/gi, /Edit user/gi],
    to: {
      en: 'Edit user',
      nl: 'Gebruiker bewerken',
      de: 'Benutzer bearbeiten',
      es: 'Editar usuario',
    },
  },
  {
    from: [/Créer l'utilisateur/gi, /Create user/gi],
    to: {
      en: 'Create user',
      nl: 'Gebruiker aanmaken',
      de: 'Benutzer erstellen',
      es: 'Crear usuario',
    },
  },
  {
    from: [/Mettre à jour l'utilisateur/gi, /Update user/gi],
    to: {
      en: 'Update user',
      nl: 'Gebruiker bijwerken',
      de: 'Benutzer aktualisieren',
      es: 'Actualizar usuario',
    },
  },
  {
    from: [/Chargement\.\.\./gi, /Loading\.\.\./gi],
    to: {
      en: 'Loading...',
      nl: 'Laden...',
      de: 'Lädt...',
      es: 'Cargando...',
    },
  },
  {
    from: [/Actions/gi],
    to: {
      en: 'Actions',
      nl: 'Acties',
      de: 'Aktionen',
      es: 'Acciones',
    },
  },
  {
    from: [/Vous ne pouvez pas modifier votre propre rôle/gi, /You cannot edit your own role/gi],
    to: {
      en: 'You cannot edit your own role',
      nl: 'Je kunt je eigen rol niet wijzigen',
      de: 'Sie können Ihre eigene Rolle nicht ändern',
      es: 'No puedes editar tu propio rol',
    },
  },
  {
    from: [/Gestion des Tags/gi, /Tag management/gi],
    to: {
      en: 'Tag management',
      nl: 'Tagbeheer',
      de: 'Tag-Verwaltung',
      es: 'Gestión de etiquetas',
    },
  },
  {
    from: [/Ajouter un Tag/gi, /Add tag/gi],
    to: {
      en: 'Add tag',
      nl: 'Tag toevoegen',
      de: 'Tag hinzufügen',
      es: 'Agregar etiqueta',
    },
  },
  {
    from: [/Rouge/gi, /Red/gi],
    to: {
      en: 'Red',
      nl: 'Rood',
      de: 'Rot',
      es: 'Rojo',
    },
  },
  {
    from: [/Jaune/gi, /Yellow/gi],
    to: {
      en: 'Yellow',
      nl: 'Geel',
      de: 'Gelb',
      es: 'Amarillo',
    },
  },
  {
    from: [/Paramètres/gi, /Settings/gi],
    to: {
      en: 'Settings',
      nl: 'Instellingen',
      de: 'Einstellungen',
      es: 'Configuración',
    },
  },
  {
    from: [/Configurez votre application - À implémenter/gi, /Configure your application - To be implemented/gi],
    to: {
      en: 'Configure your application - To be implemented',
      nl: 'Configureer je applicatie - Nog te implementeren',
      de: 'Konfigurieren Sie Ihre Anwendung - Noch zu implementieren',
      es: 'Configura tu aplicación - Pendiente de implementar',
    },
  },
  {
    from: [/Gérez vos tâches - À implémenter/gi, /Manage your tasks - To be implemented/gi],
    to: {
      en: 'Manage your tasks - To be implemented',
      nl: 'Beheer je taken - Nog te implementeren',
      de: 'Verwalten Sie Ihre Aufgaben - Noch zu implementieren',
      es: 'Gestiona tus tareas - Pendiente de implementar',
    },
  },
  {
    from: [/Widgets - Tableaux/gi, /Widgets - Tables/gi],
    to: {
      en: 'Widgets - Tables',
      nl: 'Widgets - Tabellen',
      de: 'Widgets - Tabellen',
      es: 'Widgets - Tablas',
    },
  },
  {
    from: [/Widgets - Statistiques/gi, /Widgets - Statistics/gi],
    to: {
      en: 'Widgets - Statistics',
      nl: 'Widgets - Statistieken',
      de: 'Widgets - Statistiken',
      es: 'Widgets - Estadísticas',
    },
  },
  {
    from: [/Widgets - Divers/gi, /Widgets - Miscellaneous/gi],
    to: {
      en: 'Widgets - Miscellaneous',
      nl: 'Widgets - Diversen',
      de: 'Widgets - Sonstiges',
      es: 'Widgets - Varios',
    },
  },
  {
    from: [/Widgets - Listes/gi, /Widgets - Lists/gi],
    to: {
      en: 'Widgets - Lists',
      nl: 'Widgets - Lijsten',
      de: 'Widgets - Listen',
      es: 'Widgets - Listas',
    },
  },
  {
    from: [/Widgets - Graphiques/gi, /Widgets - Charts/gi],
    to: {
      en: 'Widgets - Charts',
      nl: 'Widgets - Grafieken',
      de: 'Widgets - Diagramme',
      es: 'Widgets - Gráficos',
    },
  },
  {
    from: [/Liste Simple/gi, /Simple List/gi],
    to: {
      en: 'Simple list',
      nl: 'Eenvoudige lijst',
      de: 'Einfache Liste',
      es: 'Lista simple',
    },
  },
  {
    from: [/Exemple de widget personnalisé/gi, /Custom widget example/gi],
    to: {
      en: 'Custom widget example',
      nl: 'Voorbeeld van aangepaste widget',
      de: 'Beispiel für benutzerdefiniertes Widget',
      es: 'Ejemplo de widget personalizado',
    },
  },
  {
    from: [/Graphiques à venir/gi, /Charts coming soon/gi],
    to: {
      en: 'Charts coming soon',
      nl: 'Grafieken binnenkort beschikbaar',
      de: 'Diagramme folgen bald',
      es: 'Gráficos próximamente',
    },
  },
  {
    from: [/Intégration ApexCharts\/Chart\.js/gi, /ApexCharts\/Chart\.js integration/gi],
    to: {
      en: 'ApexCharts/Chart.js integration',
      nl: 'ApexCharts/Chart.js-integratie',
      de: 'ApexCharts/Chart.js-Integration',
      es: 'Integración de ApexCharts/Chart.js',
    },
  },
  {
    from: [/Rapport des ventes/gi, /Sales report/gi],
    to: {
      en: 'Sales report',
      nl: 'Verkooprapport',
      de: 'Verkaufsbericht',
      es: 'Informe de ventas',
    },
  },
  {
    from: [/Rapport des prospects/gi, /Leads report/gi],
    to: {
      en: 'Leads report',
      nl: 'Prospectrapport',
      de: 'Lead-Bericht',
      es: 'Informe de prospectos',
    },
  },
  {
    from: [/Rapport des projets/gi, /Projects report/gi],
    to: {
      en: 'Projects report',
      nl: 'Projectrapport',
      de: 'Projektbericht',
      es: 'Informe de proyectos',
    },
  },
  {
    from: [/Rapport des temps/gi, /Timesheets report/gi],
    to: {
      en: 'Timesheets report',
      nl: 'Urenrapport',
      de: 'Stundenbericht',
      es: 'Informe de horas',
    },
  },
  {
    from: [/Mettre à jour le mot de passe/gi, /Update password/gi],
    to: {
      en: 'Update password',
      nl: 'Wachtwoord bijwerken',
      de: 'Passwort aktualisieren',
      es: 'Actualizar contraseña',
    },
  },
  {
    from: [/Mot de passe actuel/gi, /Current password/gi],
    to: {
      en: 'Current password',
      nl: 'Huidig wachtwoord',
      de: 'Aktuelles Passwort',
      es: 'Contraseña actual',
    },
  },
  {
    from: [/Nouveau mot de passe/gi, /New password/gi],
    to: {
      en: 'New password',
      nl: 'Nieuw wachtwoord',
      de: 'Neues Passwort',
      es: 'Nueva contraseña',
    },
  },
  {
    from: [/Confirmer le mot de passe/gi, /Confirm password/gi],
    to: {
      en: 'Confirm password',
      nl: 'Wachtwoord bevestigen',
      de: 'Passwort bestätigen',
      es: 'Confirmar contraseña',
    },
  },
  {
    from: [/Mis à jour il y a 30 min/gi, /Update 30 Min Ago/gi],
    to: {
      en: 'Updated 30 min ago',
      nl: '30 min geleden bijgewerkt',
      de: 'Vor 30 Min. aktualisiert',
      es: 'Actualizado hace 30 min',
    },
  },
]

export function translateDomText(originalText, language) {
  if (!originalText || language === 'fr') return originalText

  let result = originalText

  for (const rule of TRANSLATION_RULES) {
    const replacement = rule.to?.[language]
    if (!replacement) continue

    for (const pattern of rule.from) {
      result = result.replace(pattern, replacement)
    }
  }

  return result
}
