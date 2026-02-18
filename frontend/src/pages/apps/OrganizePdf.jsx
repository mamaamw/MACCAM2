import React, { useState, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const OrganizePdf = () => {
  const [pages, setPages] = useState([]); // Toutes les pages de tous les fichiers
  const [sourceFiles, setSourceFiles] = useState({}); // Map des fichiers originaux par ID
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);

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
    setPages(prev => prev.filter(p => p.id !== pageId));
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
                <div className="border-2 border-dashed rounded p-5 text-center">
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
              ) : (
                <>
                  {/* Header with actions */}
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <h6 className="mb-1">
                        <i className="feather-file-text me-2"></i>
                        {pages.length} page(s) • {Object.keys(sourceFiles).length} fichier(s)
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
    </div>
  );
};

export default OrganizePdf;
