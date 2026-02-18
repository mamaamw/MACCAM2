export const PDF_TOOLS = [
  { slug: 'organize-pdf', title: 'Organiser & Fusionner PDF', description: 'Fusionner plusieurs PDFs, réorganiser les pages, supprimer ou extraire des pages de vos PDF', color: 'text-danger', icon: 'feather-layers', action: 'Organiser le PDF', accept: '.pdf', multiple: true, category: 'manipulation', isGrouped: true },
  { slug: 'split-pdf', title: 'Diviser PDF', description: 'Sélectionner la portée de pages, séparer une page, ou convertir chaque page du document en fichier PDF indépendant.', color: 'text-danger', icon: 'feather-scissors', action: 'Diviser le PDF', accept: '.pdf', multiple: false, category: 'manipulation' },
  { slug: 'page-numbers', title: 'Numéroter au format PDF', description: 'Insérez des numéros de pages dans les documents PDF.', color: 'text-danger', icon: 'feather-hash', action: 'Ajouter les numéros', accept: '.pdf', multiple: true, category: 'manipulation' },
  
  { slug: 'convert-to-pdf', title: 'Convertir en PDF', description: 'Word, Excel, PowerPoint, Images, HTML vers PDF', color: 'text-primary', icon: 'feather-file-plus', action: 'Convertir en PDF', accept: '.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.html', multiple: true, category: 'to-pdf', isGrouped: true },
  
  { slug: 'convert-from-pdf', title: 'Convertir depuis PDF', description: 'PDF vers Word, Excel, PowerPoint, Images, PDF/A', color: 'text-warning', icon: 'feather-share-2', action: 'Convertir depuis PDF', accept: '.pdf', multiple: true, category: 'from-pdf', isGrouped: true },
  
  { slug: 'edit-pdf', title: 'Modifier PDF', description: 'Ajouter du texte, des images, des formes ou des annotations à un document PDF.', color: 'text-purple', icon: 'feather-edit-3', action: 'Éditer le PDF', accept: '.pdf', multiple: false, category: 'edit' },
  { slug: 'rotate-pdf', title: 'Faire pivoter PDF', description: 'Faites pivoter votre PDF comme vous le souhaitez.', color: 'text-purple', icon: 'feather-refresh-ccw', action: 'Faire pivoter le PDF', accept: '.pdf', multiple: true, category: 'edit' },
  { slug: 'watermark-pdf', title: 'Ajouter un filigrane', description: 'Choisissez une image ou un texte à appliquer sur votre PDF.', color: 'text-purple', icon: 'feather-droplet', action: 'Ajouter le filigrane', accept: '.pdf', multiple: true, category: 'edit' },
  { slug: 'crop-pdf', title: 'Rogner PDF', description: 'Réduisez les marges ou rogne des zones de pages PDF.', color: 'text-purple', icon: 'feather-crop', action: 'Rogner le PDF', accept: '.pdf', multiple: true, category: 'edit' },
  
  { slug: 'unlock-pdf', title: 'Déverrouiller PDF', description: 'Retirez le mot de passe de sécurité du PDF.', color: 'text-primary', icon: 'feather-unlock', action: 'Déverrouiller le PDF', accept: '.pdf', multiple: false, category: 'security' },
  { slug: 'protect-pdf', title: 'Protéger PDF', description: 'Protégez les fichiers PDF avec un mot de passe.', color: 'text-primary', icon: 'feather-shield', action: 'Protéger le PDF', accept: '.pdf', multiple: true, category: 'security' },
  { slug: 'sign-pdf', title: 'Signer PDF', description: 'Signez vous-même ou demandez des signatures électroniques à des tiers.', color: 'text-primary', icon: 'feather-edit', action: 'Signer le PDF', accept: '.pdf', multiple: false, category: 'security' },
  { slug: 'redact-pdf', title: 'Censurer PDF', description: 'Supprimez définitivement les informations sensibles d\'un PDF.', color: 'text-primary', icon: 'feather-eye-off', action: 'Censurer le PDF', accept: '.pdf', multiple: false, category: 'security' },
  
  { slug: 'compress-pdf', title: 'Compresser PDF', description: 'Diminuer la taille de votre fichier PDF, tout en conservant la meilleure qualité possible. Optimisez vos PDF.', color: 'text-success', icon: 'feather-minimize-2', action: 'Compresser le PDF', accept: '.pdf', multiple: false, category: 'optimize' },
  { slug: 'repair-pdf', title: 'Réparer PDF', description: 'Réparez un PDF endommagé et restaurez les données.', color: 'text-success', icon: 'feather-tool', action: 'Réparer le PDF', accept: '.pdf', multiple: false, category: 'optimize' },
  { slug: 'ocr-pdf', title: 'OCR PDF', description: 'Convertissez vos PDF numérisés en documents indexables et modifiables.', color: 'text-success', icon: 'feather-type', action: 'Lancer l\'OCR', accept: '.pdf', multiple: true, category: 'optimize' },
  
  { slug: 'compare-pdf', title: 'Comparer PDF', description: 'Comparer des documents côte à côte et détecter les changements.', color: 'text-primary', icon: 'feather-columns', action: 'Comparer les PDF', accept: '.pdf', multiple: true, category: 'advanced' },
  { slug: 'translate-pdf', title: 'Traduire le PDF', description: 'Traduisez facilement les fichiers PDF gérés par l\'IA.', color: 'text-indigo', icon: 'feather-globe', action: 'Traduire le PDF', accept: '.pdf', multiple: true, category: 'advanced' }
]

export const PDF_CATEGORIES = [
  {
    id: 'manipulation',
    title: 'Organiser PDF',
    description: 'Fusionner, diviser et organiser vos documents',
    icon: 'feather-layers',
    color: 'text-danger'
  },
  {
    id: 'to-pdf',
    title: 'Convertir vers PDF',
    description: 'Transformez vos documents en format PDF',
    icon: 'feather-file-plus',
    color: 'text-primary'
  },
  {
    id: 'from-pdf',
    title: 'Convertir depuis PDF',
    description: 'Exportez vos PDF vers d\'autres formats',
    icon: 'feather-share-2',
    color: 'text-warning'
  },
  {
    id: 'edit',
    title: 'Modifier PDF',
    description: 'Modifiez et annotez vos documents PDF',
    icon: 'feather-edit-3',
    color: 'text-purple'
  },
  {
    id: 'security',
    title: 'Sécurité PDF',
    description: 'Protégez et sécurisez vos fichiers PDF',
    icon: 'feather-shield',
    color: 'text-primary'
  },
  {
    id: 'optimize',
    title: 'Optimiser le PDF',
    description: 'Optimisez et améliorez vos PDF',
    icon: 'feather-maximize-2',
    color: 'text-success'
  },
  {
    id: 'advanced',
    title: 'Intelligence PDF',
    description: 'Fonctionnalités avancées pour vos PDF',
    icon: 'feather-award',
    color: 'text-indigo'
  }
]

export const PDF_TOOLS_BY_SLUG = PDF_TOOLS.reduce((acc, tool) => {
  acc[tool.slug] = tool
  return acc
}, {})

export const PDF_TOOLS_BY_CATEGORY = PDF_TOOLS.reduce((acc, tool) => {
  if (!acc[tool.category]) {
    acc[tool.category] = []
  }
  acc[tool.category].push(tool)
  return acc
}, {})
