import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import pdfMergeProjectService from '../../services/pdfMergeProjectService';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const OrganizePdf = () => {
  const [pages, setPages] = useState([]); // Toutes les pages de tous les fichiers
  const [sourceFiles, setSourceFiles] = useState({}); // Map des fichiers originaux par ID
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);
  
  // États pour la sauvegarde/chargement de projets
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showLoadModal, setShowLoadModal] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [savedProjects, setSavedProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [projectsLoaded, setProjectsLoaded] = useState(false);

  const handleFileSelect = async (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (selectedFiles.length === 0) return;

    for (const file of selectedFiles) {
      if (file.type !== 'application/pdf') {
        toast.error(`${file.name} n'est pas un fichier PDF`);
        continue;
      }

      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const numPages = pdfDoc.getPageCount();

        const fileId = `${file.name}-${Date.now()}-${Math.random()}`;

        // Sauvegarder le fichier source
        setSourceFiles(prev => ({
          ...prev,
          [fileId]: {
            id: fileId,
            file: file,
            name: file.name
          }
        }));

        // Charger avec pdf.js pour générer les miniatures
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;

        const newPages = [];
        for (let i = 1; i <= numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 0.3 });

          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          await page.render({
            canvasContext: context,
            viewport: viewport
          }).promise;

          const thumbnail = canvas.toDataURL('image/jpeg', 0.5);

          newPages.push({
            id: `${fileId}-page-${i}-${Date.now()}-${Math.random()}`,
            sourceFileId: fileId,
            sourceFileName: file.name,
            sourcePageNumber: i,
            thumbnail: thumbnail,
            selected: false
          });
        }

        setPages(prev => [...prev, ...newPages]);
      } catch (error) {
        console.error('Erreur lors du chargement:', error);
        toast.error(`Erreur lors du chargement de ${file.name}`);
      }
    }

    toast.success(`${selectedFiles.length} fichier(s) ajouté(s)`);
  };

  const removePage = (pageId) => {
    setPages(prev => {
      const newPages = prev.filter(p => p.id !== pageId);
      
      // Nettoyer les fichiers sources qui n'ont plus de pages
      const remainingFileIds = new Set(newPages.map(p => p.sourceFileId));
      setSourceFiles(prevFiles => {
        const cleanedFiles = {};
        Object.keys(prevFiles).forEach(fileId => {
          if (remainingFileIds.has(fileId)) {
            cleanedFiles[fileId] = prevFiles[fileId];
          }
        });
        return cleanedFiles;
      });
      
      return newPages;
    });
  };

  const movePage = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= pages.length) return;

    setPages(prev => {
      const newPages = [...prev];
      [newPages[index], newPages[newIndex]] = [newPages[newIndex], newPages[index]];
      return newPages;
    });
  };

  const togglePageSelection = (pageId) => {
    setPages(prev => prev.map(p =>
      p.id === pageId ? { ...p, selected: !p.selected } : p
    ));
  };

  const selectAllPages = () => {
    setPages(prev => prev.map(p => ({ ...p, selected: true })));
  };

  const deselectAllPages = () => {
    setPages(prev => prev.map(p => ({ ...p, selected: false })));
  };

  const handleMerge = async () => {
    if (pages.length === 0) {
      toast.error('Veuillez ajouter au moins un fichier PDF');
      return;
    }

    setIsProcessing(true);

    try {
      const mergedPdf = await PDFDocument.create();

      // Grouper les pages par fichier source pour optimiser
      const pagesByFile = {};
      pages.forEach(page => {
        if (!pagesByFile[page.sourceFileId]) {
          pagesByFile[page.sourceFileId] = [];
        }
        pagesByFile[page.sourceFileId].push(page);
      });

      // Charger tous les PDFs sources
      const loadedPdfs = {};
      for (const fileId of Object.keys(pagesByFile)) {
        const sourceFile = sourceFiles[fileId];
        const arrayBuffer = await sourceFile.file.arrayBuffer();
        loadedPdfs[fileId] = await PDFDocument.load(arrayBuffer);
      }

      // Copier les pages dans l'ordre d'affichage
      for (const page of pages) {
        const sourcePdf = loadedPdfs[page.sourceFileId];
        const [copiedPage] = await mergedPdf.copyPages(sourcePdf, [page.sourcePageNumber - 1]);
        mergedPdf.addPage(copiedPage);
      }

      const mergedPdfBytes = await mergedPdf.save();
      const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'merged.pdf';
      a.click();
      URL.revokeObjectURL(url);

      toast.success('PDF fusionné avec succès !');
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de la fusion des PDF');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExtract = async () => {
    const selectedPages = pages.filter(p => p.selected);
    if (selectedPages.length === 0) {
      toast.error('Veuillez sélectionner au moins une page à extraire');
      return;
    }

    setIsProcessing(true);

    try {
      const newPdf = await PDFDocument.create();

      // Grouper les pages sélectionnées par fichier source
      const pagesByFile = {};
      selectedPages.forEach(page => {
        if (!pagesByFile[page.sourceFileId]) {
          pagesByFile[page.sourceFileId] = [];
        }
        pagesByFile[page.sourceFileId].push(page);
      });

      // Charger tous les PDFs sources
      const loadedPdfs = {};
      for (const fileId of Object.keys(pagesByFile)) {
        const sourceFile = sourceFiles[fileId];
        const arrayBuffer = await sourceFile.file.arrayBuffer();
        loadedPdfs[fileId] = await PDFDocument.load(arrayBuffer);
      }

      // Copier les pages dans l'ordre de sélection
      for (const page of selectedPages) {
        const sourcePdf = loadedPdfs[page.sourceFileId];
        const [copiedPage] = await newPdf.copyPages(sourcePdf, [page.sourcePageNumber - 1]);
        newPdf.addPage(copiedPage);
      }

      const pdfBytes = await newPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'extracted.pdf';
      a.click();
      URL.revokeObjectURL(url);

      toast.success(`${selectedPages.length} page(s) extraite(s) avec succès !`);
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors de l\'extraction');
    } finally {
      setIsProcessing(false);
    }
  };

  // Charger la liste des projets sauvegardés
  const loadSavedProjects = async (force = false) => {
    if (loadingProjects && !force) return; // Éviter les chargements multiples sauf si forcé
    
    setLoadingProjects(true);
    try {
      const projects = await pdfMergeProjectService.getProjects();
      setSavedProjects(projects || []);
      setProjectsLoaded(true);
    } catch (error) {
      console.error('Erreur lors du chargement des projets:', error);
      // Ne pas afficher d'erreur toast au chargement initial pour ne pas gêner l'utilisateur
      setSavedProjects([]);
      setProjectsLoaded(true);
    } finally {
      setLoadingProjects(false);
    }
  };

  // Sauvegarder le projet actuel
  const handleSaveProject = async () => {
    if (!projectName.trim()) {
      toast.error('Veuillez entrer un nom de projet');
      return;
    }

    if (pages.length === 0) {
      toast.error('Aucune page à sauvegarder');
      return;
    }

    setIsProcessing(true);

    try {
      // Regrouper les pages par fichier source
      const fileGroups = {};
      pages.forEach(page => {
        if (!fileGroups[page.sourceFileId]) {
          fileGroups[page.sourceFileId] = {
            fileId: page.sourceFileId,
            fileName: page.sourceFileName,
            pages: []
          };
        }
        fileGroups[page.sourceFileId].pages.push({
          pageNumber: page.sourcePageNumber,
          selected: page.selected
        });
      });

      // Préparer les données du projet
      const projectData = {
        name: projectName,
        description: projectDescription,
        files: Object.values(fileGroups).map(group => ({
          name: group.fileName,
          file: sourceFiles[group.fileId].file,
          pageCount: group.pages.length,
          selectedPages: group.pages.map(p => p.pageNumber)
        }))
      };

      const result = await pdfMergeProjectService.createProject(projectData);
      toast.success('Projet sauvegardé avec succès !');
      setShowSaveModal(false);
      setProjectName('');
      setProjectDescription('');
      // Recharger la liste des projets (forcé)
      await loadSavedProjects(true);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde du projet');
    } finally {
      setIsProcessing(false);
    }
  };

  // Charger un projet existant
  const handleLoadProject = async (projectId) => {
    setIsProcessing(true);

    try {
      const project = await pdfMergeProjectService.getProject(projectId);
      const projectFiles = await pdfMergeProjectService.getProjectFiles(projectId);

      // Réinitialiser l'état
      setPages([]);
      setSourceFiles({});

      // Charger chaque fichier du projet
      for (const fileData of projectFiles) {
        const blob = await pdfMergeProjectService.downloadFile(projectId, fileData.originalName);
        const file = new File([blob], fileData.originalName, { type: 'application/pdf' });

        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const numPages = pdfDoc.getPageCount();

        const fileId = `${file.name}-${Date.now()}-${Math.random()}`;

        // Sauvegarder le fichier source
        setSourceFiles(prev => ({
          ...prev,
          [fileId]: {
            id: fileId,
            file: file,
            name: file.name
          }
        }));

        // Générer les miniatures
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;

        const newPages = [];
        for (let i = 1; i <= numPages; i++) {
          const page = await pdf.getPage(i);
          const viewport = page.getViewport({ scale: 0.3 });

          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          await page.render({
            canvasContext: context,
            viewport: viewport
          }).promise;

          const thumbnail = canvas.toDataURL('image/jpeg', 0.5);

          newPages.push({
            id: `${fileId}-page-${i}-${Date.now()}-${Math.random()}`,
            sourceFileId: fileId,
            sourceFileName: file.name,
            sourcePageNumber: i,
            thumbnail: thumbnail,
            selected: false
          });
        }

        setPages(prev => [...prev, ...newPages]);
      }

      toast.success('Projet chargé avec succès !');
      setShowLoadModal(false);
    } catch (error) {
      console.error('Erreur lors du chargement du projet:', error);
      toast.error('Erreur lors du chargement du projet');
    } finally {
      setIsProcessing(false);
    }
  };

  // Supprimer un projet
  const handleDeleteProject = async (projectId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
      return;
    }

    try {
      await pdfMergeProjectService.deleteProject(projectId);
      toast.success('Projet supprimé avec succès !');
      await loadSavedProjects(true);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression du projet');
    }
  };

  // Charger les projets au montage du composant
  useEffect(() => {
    if (!projectsLoaded) {
      loadSavedProjects().catch(err => {
        console.error('Erreur de chargement des projets:', err);
      });
    }
  }, [projectsLoaded]);

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h4 className="card-title mb-0">
                <i className="feather-layers me-2"></i>
                Fusionner & Organiser PDF
              </h4>
            </div>
            <div className="card-body">
              {/* File Upload */}
              {pages.length === 0 ? (
                <>
                  <div className="border-2 border-dashed rounded p-5 text-center mb-4">
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="d-none"
                      accept=".pdf"
                      multiple
                      onChange={handleFileSelect}
                    />
                    <button
                      className="btn"
                      onClick={() => fileInputRef.current?.click()}
                      style={{ background: 'none', border: 'none', width: '100%' }}
                    >
                      <i className="feather-upload display-4 text-muted mb-3 d-block"></i>
                      <h5>Cliquez pour sélectionner des PDFs</h5>
                      <p className="text-muted mb-0">ou glissez-déposez les fichiers ici</p>
                    </button>
                  </div>

                  {/* Projets sauvegardés */}
                  <div className="mt-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h6 className="mb-0">
                        <i className="feather-folder me-2"></i>
                        Projets sauvegardés
                      </h6>
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => loadSavedProjects(true)}
                        disabled={loadingProjects}
                      >
                        <i className="feather-refresh-cw me-1"></i>
                        Actualiser
                      </button>
                    </div>

                    {!projectsLoaded && loadingProjects ? (
                      <div className="text-center py-4">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Chargement...</span>
                        </div>
                        <p className="mt-2 text-muted small">Chargement des projets...</p>
                      </div>
                    ) : !Array.isArray(savedProjects) || savedProjects.length === 0 ? (
                      <div className="text-center py-4">
                        <i className="feather-folder" style={{ fontSize: '48px', opacity: 0.3 }}></i>
                        <p className="mt-3 text-muted">Aucun projet sauvegardé</p>
                        <p className="text-muted small">Chargez des fichiers PDF et sauvegardez votre premier projet</p>
                      </div>
                    ) : (
                      <div className="row g-3">
                        {savedProjects.map((project) => (
                          <div key={project.id} className="col-md-6 col-lg-4">
                            <div className="card h-100 border">
                              <div className="card-body">
                                <h6 className="card-title mb-2">{project.name}</h6>
                                {project.description && (
                                  <p className="card-text text-muted small mb-3">{project.description}</p>
                                )}
                                <div className="d-flex align-items-center text-muted small mb-3">
                                  <i className="feather-calendar me-1"></i>
                                  <span className="me-3">
                                    {new Date(project.createdAt).toLocaleDateString('fr-FR')}
                                  </span>
                                  <i className="feather-file-text me-1"></i>
                                  <span>{project.files?.length || 0} fichier(s)</span>
                                </div>
                                <div className="d-flex gap-2">
                                  <button
                                    className="btn btn-sm btn-primary flex-grow-1"
                                    onClick={() => handleLoadProject(project.id)}
                                    disabled={isProcessing}
                                  >
                                    <i className="feather-download me-1"></i>
                                    Charger
                                  </button>
                                  <button
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => handleDeleteProject(project.id)}
                                    disabled={isProcessing}
                                    title="Supprimer"
                                  >
                                    <i className="feather-trash-2"></i>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  {/* Header with actions */}
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <h6 className="mb-1">
                        <i className="feather-file-text me-2"></i>
                        {pages.length} page(s) • {new Set(pages.map(p => p.sourceFileId)).size} fichier(s)
                      </h6>
                      <small className="text-muted">
                        {pages.filter(p => p.selected).length > 0 && (
                          <span className="badge bg-primary">
                            {pages.filter(p => p.selected).length} sélectionnée(s)
                          </span>
                        )}
                      </small>
                    </div>
                    <div className="btn-group">
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={selectAllPages}
                      >
                        Tout sélectionner
                      </button>
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={deselectAllPages}
                      >
                        Tout désélectionner
                      </button>
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <i className="feather-plus me-1"></i>
                        Ajouter des fichiers
                      </button>
                      <button
                        className="btn btn-sm btn-outline-success"
                        onClick={() => setShowSaveModal(true)}
                        disabled={pages.length === 0}
                      >
                        <i className="feather-save me-1"></i>
                        Sauvegarder
                      </button>
                      <button
                        className="btn btn-sm btn-outline-info"
                        onClick={() => setShowLoadModal(true)}
                      >
                        <i className="feather-folder-open me-1"></i>
                        Charger
                      </button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="d-none"
                        accept=".pdf"
                        multiple
                        onChange={handleFileSelect}
                      />
                    </div>
                  </div>

                  {/* Pages Grid */}
                  <div className="row g-2 mb-4">
                    {pages.map((page, index) => (
                      <div key={page.id} className="col-6 col-sm-4 col-md-3 col-lg-2">
                        <div
                          className={`card cursor-pointer ${
                            page.selected ? 'border-primary border-2' : ''
                          }`}
                          onClick={() => togglePageSelection(page.id)}
                          style={{
                            transition: 'all 0.2s',
                            boxShadow: page.selected ? '0 4px 8px rgba(13, 110, 253, 0.2)' : ''
                          }}
                        >
                          <div className="card-body p-2 position-relative">
                            {/* Selection indicator */}
                            {page.selected && (
                              <div
                                className="position-absolute top-0 end-0 m-1"
                                style={{ zIndex: 10 }}
                              >
                                <div
                                  className="bg-primary rounded-circle d-flex align-items-center justify-content-center"
                                  style={{ width: '20px', height: '20px' }}
                                >
                                  <i className="feather-check text-white" style={{ fontSize: '12px' }}></i>
                                </div>
                              </div>
                            )}
                            
                            {/* Delete button */}
                            <button
                              className="btn btn-sm btn-danger position-absolute top-0 start-0 m-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                removePage(page.id);
                              }}
                              style={{ 
                                zIndex: 10, 
                                padding: '2px 6px',
                                fontSize: '10px',
                                lineHeight: 1
                              }}
                              title="Supprimer cette page"
                            >
                              <i className="feather-x"></i>
                            </button>

                            {/* Page thumbnail */}
                            <img
                              src={page.thumbnail}
                              alt={`Page ${page.sourcePageNumber}`}
                              className="w-100 rounded mb-1"
                              style={{ maxHeight: '150px', objectFit: 'contain' }}
                            />
                            
                            {/* Page info */}
                            <div className="text-center mb-1">
                              <div className="badge bg-secondary" style={{ fontSize: '10px' }}>
                                Page {page.sourcePageNumber}
                              </div>
                              <div 
                                className="text-muted text-truncate" 
                                style={{ fontSize: '9px' }} 
                                title={page.sourceFileName}
                              >
                                {page.sourceFileName}
                              </div>
                            </div>
                            
                            {/* Move buttons */}
                            <div className="btn-group btn-group-sm w-100">
                              <button
                                className="btn btn-outline-secondary"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  movePage(index, -1);
                                }}
                                disabled={index === 0}
                                style={{ fontSize: '10px', padding: '2px' }}
                                title="Déplacer vers la gauche"
                              >
                                <i className="feather-arrow-left"></i>
                              </button>
                              <button
                                className="btn btn-outline-secondary"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  movePage(index, 1);
                                }}
                                disabled={index === pages.length - 1}
                                style={{ fontSize: '10px', padding: '2px' }}
                                title="Déplacer vers la droite"
                              >
                                <i className="feather-arrow-right"></i>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Action info */}
                  <div className="alert alert-light border mb-3">
                    <strong>Options disponibles :</strong>
                    <ul className="mb-0 mt-2" style={{ fontSize: '13px' }}>
                      <li>Cliquez sur une page pour la sélectionner/désélectionner</li>
                      <li>Utilisez les flèches pour réorganiser les pages librement</li>
                      <li>Fusionnez toutes les pages dans l'ordre actuel</li>
                      <li>Extrayez uniquement les pages sélectionnées</li>
                      <li>Supprimez une page avec le bouton X rouge</li>
                    </ul>
                  </div>

                  {/* Action Buttons */}
                  <div className="d-flex gap-2 justify-content-center">
                    <button
                      className="btn btn-primary btn-lg px-4"
                      onClick={handleMerge}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Traitement...
                        </>
                      ) : (
                        <>
                          <i className="feather-git-merge me-2"></i>
                          Fusionner toutes les pages
                        </>
                      )}
                    </button>
                    
                    <button
                      className="btn btn-success btn-lg px-4"
                      onClick={handleExtract}
                      disabled={isProcessing || pages.filter(p => p.selected).length === 0}
                    >
                      {isProcessing ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Traitement...
                        </>
                      ) : (
                        <>
                          <i className="feather-copy me-2"></i>
                          Extraire {pages.filter(p => p.selected).length} page(s)
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de sauvegarde */}
      {showSaveModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="feather-save me-2"></i>
                  Sauvegarder le projet
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowSaveModal(false)}
                  disabled={isProcessing}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Nom du projet *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Mon projet PDF"
                    disabled={isProcessing}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Description (optionnel)</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    placeholder="Description du projet..."
                    disabled={isProcessing}
                  ></textarea>
                </div>
                <div className="alert alert-info">
                  <small>
                    <i className="feather-info me-1"></i>
                    Ce projet contient {pages.length} page(s) de {new Set(pages.map(p => p.sourceFileId)).size} fichier(s)
                  </small>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowSaveModal(false)}
                  disabled={isProcessing}
                >
                  Annuler
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSaveProject}
                  disabled={isProcessing || !projectName.trim()}
                >
                  {isProcessing ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Sauvegarde...
                    </>
                  ) : (
                    <>
                      <i className="feather-save me-2"></i>
                      Sauvegarder
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de chargement */}
      {showLoadModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="feather-folder-open me-2"></i>
                  Charger un projet
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowLoadModal(false)}
                  disabled={isProcessing}
                ></button>
              </div>
              <div className="modal-body">
                {loadingProjects ? (
                  <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Chargement...</span>
                    </div>
                    <p className="mt-2 text-muted">Chargement des projets...</p>
                  </div>
                ) : savedProjects.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="feather-folder" style={{ fontSize: '48px', opacity: 0.3 }}></i>
                    <p className="mt-3 text-muted">Aucun projet sauvegardé</p>
                  </div>
                ) : (
                  <div className="list-group">
                    {savedProjects.map((project) => (
                      <div key={project.id} className="list-group-item">
                        <div className="d-flex justify-content-between align-items-start">
                          <div className="flex-grow-1">
                            <h6 className="mb-1">{project.name}</h6>
                            {project.description && (
                              <p className="mb-2 text-muted small">{project.description}</p>
                            )}
                            <small className="text-muted">
                              <i className="feather-calendar me-1"></i>
                              {new Date(project.createdAt).toLocaleDateString('fr-FR')}
                              <span className="mx-2">•</span>
                              <i className="feather-file-text me-1"></i>
                              {project.files?.length || 0} fichier(s)
                            </small>
                          </div>
                          <div className="btn-group btn-group-sm">
                            <button
                              className="btn btn-outline-primary"
                              onClick={() => handleLoadProject(project.id)}
                              disabled={isProcessing}
                            >
                              <i className="feather-download me-1"></i>
                              Charger
                            </button>
                            <button
                              className="btn btn-outline-danger"
                              onClick={() => handleDeleteProject(project.id)}
                              disabled={isProcessing}
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
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowLoadModal(false)}
                  disabled={isProcessing}
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizePdf;
