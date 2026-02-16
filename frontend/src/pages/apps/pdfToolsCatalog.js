export const PDF_TOOLS = [
  { slug: 'merge-pdf', title: 'Fusionner PDF', description: 'Fusionner et combiner des fichiers PDF et les mettre dans l\'ordre que vous voulez. C\'est très facile et rapide!', color: 'text-danger', icon: 'feather-git-merge', action: 'Fusionner les PDF', accept: '.pdf', multiple: true },
  { slug: 'split-pdf', title: 'Diviser PDF', description: 'Sélectionner la portée de pages, séparer une page, ou convertir chaque page du document en fichier PDF indépendant.', color: 'text-danger', icon: 'feather-scissors', action: 'Diviser le PDF', accept: '.pdf', multiple: false },
  { slug: 'compress-pdf', title: 'Compresser PDF', description: 'Diminuer la taille de votre fichier PDF, tout en conservant la meilleure qualité possible. Optimisez vos PDF.', color: 'text-success', icon: 'feather-minimize-2', action: 'Compresser le PDF', accept: '.pdf', multiple: false },
  { slug: 'pdf-to-word', title: 'PDF en Word', description: 'Convertissez facilement vos fichiers PDF en documents DOC et DOCX faciles à éditer.', color: 'text-primary', icon: 'feather-file-text', action: 'Convertir en Word', accept: '.pdf', multiple: true },
  { slug: 'pdf-to-powerpoint', title: 'PDF en PowerPoint', description: 'Transformez vos fichiers PDF en présentations PPT et PPTX faciles à éditer.', color: 'text-warning', icon: 'feather-monitor', action: 'Convertir en PowerPoint', accept: '.pdf', multiple: true },
  { slug: 'pdf-to-excel', title: 'PDF en Excel', description: 'Transférez les données de fichiers PDF vers des feuilles de calcul Excel en quelques secondes.', color: 'text-success', icon: 'feather-grid', action: 'Convertir en Excel', accept: '.pdf', multiple: true },
  { slug: 'word-to-pdf', title: 'Word en PDF', description: 'Convertir vos documents dans un fichier PDF avec la meilleure qualité possible.', color: 'text-primary', icon: 'feather-file-plus', action: 'Convertir en PDF', accept: '.doc,.docx', multiple: true },
  { slug: 'powerpoint-to-pdf', title: 'PowerPoint en PDF', description: 'Convertissez vos présentations PPT et PPTX en PDF.', color: 'text-warning', icon: 'feather-cast', action: 'Convertir en PDF', accept: '.ppt,.pptx', multiple: true },
  { slug: 'excel-to-pdf', title: 'Excel en PDF', description: 'Convertissez vos feuilles de calcul EXCEL en PDF.', color: 'text-success', icon: 'feather-layout', action: 'Convertir en PDF', accept: '.xls,.xlsx,.csv', multiple: true },
  { slug: 'edit-pdf', title: 'Modifier PDF', description: 'Ajouter du texte, des images, des formes ou des annotations à un document PDF.', color: 'text-purple', icon: 'feather-edit-3', action: 'Éditer le PDF', accept: '.pdf', multiple: false },
  { slug: 'pdf-to-jpg', title: 'PDF en JPG', description: 'Extraire toutes les images contenues dans un fichier PDF ou convertir chaque page dans un fichier JPG.', color: 'text-warning', icon: 'feather-image', action: 'Convertir en JPG', accept: '.pdf', multiple: true },
  { slug: 'jpg-to-pdf', title: 'JPG en PDF', description: 'Convertissez vos images en PDF. Ajustez l\'orientation et les marges.', color: 'text-warning', icon: 'feather-camera', action: 'Convertir en PDF', accept: '.jpg,.jpeg,.png,.webp', multiple: true },
  { slug: 'sign-pdf', title: 'Signer PDF', description: 'Signez vous-même ou demandez des signatures électroniques à des tiers.', color: 'text-primary', icon: 'feather-edit', action: 'Signer le PDF', accept: '.pdf', multiple: false },
  { slug: 'watermark-pdf', title: 'Filigrane', description: 'Choisissez une image ou un texte à appliquer sur votre PDF.', color: 'text-purple', icon: 'feather-droplet', action: 'Ajouter le filigrane', accept: '.pdf', multiple: true },
  { slug: 'rotate-pdf', title: 'Faire pivoter PDF', description: 'Faites pivoter votre PDF comme vous le souhaitez.', color: 'text-purple', icon: 'feather-refresh-ccw', action: 'Faire pivoter le PDF', accept: '.pdf', multiple: true },
  { slug: 'html-to-pdf', title: 'HTML en PDF', description: 'Convertissez des pages web HTML en PDF.', color: 'text-warning', icon: 'feather-code', action: 'Convertir en PDF', accept: '.html,.htm', multiple: true },
  { slug: 'unlock-pdf', title: 'Déverrouiller PDF', description: 'Retirez le mot de passe de sécurité du PDF.', color: 'text-primary', icon: 'feather-unlock', action: 'Déverrouiller le PDF', accept: '.pdf', multiple: false },
  { slug: 'protect-pdf', title: 'Protéger PDF', description: 'Protégez les fichiers PDF avec un mot de passe.', color: 'text-primary', icon: 'feather-shield', action: 'Protéger le PDF', accept: '.pdf', multiple: true },
  { slug: 'organize-pdf', title: 'Organiser PDF', description: 'Triez, supprimez ou ajoutez des pages PDF.', color: 'text-danger', icon: 'feather-layers', action: 'Organiser le PDF', accept: '.pdf', multiple: false },
  { slug: 'pdf-to-pdfa', title: 'PDF en PDF/A', description: 'Transformez votre PDF en PDF/A pour un archivage à long-terme.', color: 'text-primary', icon: 'feather-archive', action: 'Convertir en PDF/A', accept: '.pdf', multiple: true },
  { slug: 'repair-pdf', title: 'Réparer PDF', description: 'Réparez un PDF endommagé et restaurez les données.', color: 'text-success', icon: 'feather-tool', action: 'Réparer le PDF', accept: '.pdf', multiple: false },
  { slug: 'page-numbers', title: 'Numéros de pages', description: 'Insérez des numéros de pages dans les documents PDF.', color: 'text-purple', icon: 'feather-list', action: 'Ajouter les numéros', accept: '.pdf', multiple: true },
  { slug: 'scan-to-pdf', title: 'Numériser au format PDF', description: 'Numérisez des documents et exportez-les en PDF.', color: 'text-danger', icon: 'feather-printer', action: 'Créer le PDF', accept: 'image/*', multiple: true },
  { slug: 'ocr-pdf', title: 'OCR PDF', description: 'Convertissez vos PDF numérisés en documents indexables et modifiables.', color: 'text-success', icon: 'feather-type', action: 'Lancer l\'OCR', accept: '.pdf', multiple: true },
  { slug: 'compare-pdf', title: 'Comparer PDF', description: 'Comparer des documents côte à côte et détecter les changements.', color: 'text-primary', icon: 'feather-columns', action: 'Comparer les PDF', accept: '.pdf', multiple: true },
  { slug: 'redact-pdf', title: 'Censurer PDF', description: 'Supprimez définitivement les informations sensibles d\'un PDF.', color: 'text-primary', icon: 'feather-eye-off', action: 'Censurer le PDF', accept: '.pdf', multiple: false },
  { slug: 'crop-pdf', title: 'Rogner PDF', description: 'Réduisez les marges ou rogne des zones de pages PDF.', color: 'text-purple', icon: 'feather-crop', action: 'Rogner le PDF', accept: '.pdf', multiple: true },
  { slug: 'translate-pdf', title: 'Traduire le PDF', description: 'Traduisez facilement les fichiers PDF gérés par l\'IA.', color: 'text-indigo', icon: 'feather-globe', action: 'Traduire le PDF', accept: '.pdf', multiple: true }
]

export const PDF_TOOLS_BY_SLUG = PDF_TOOLS.reduce((acc, tool) => {
  acc[tool.slug] = tool
  return acc
}, {})
