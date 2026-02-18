import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const OrganizePdf = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [pages, setPages] = useState([]);
  const [selectedPages, setSelectedPages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Veuillez sélectionner un fichier PDF');
      return;
    }

    setPdfFile(file);
    
    try {
      // Charger le PDF pour compter les pages
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const numPages = pdfDoc.getPageCount();
      
      // Charger avec pdf.js pour générer les miniatures
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      
      // Générer les miniatures pour chaque page
      const pagesArray = [];
      
      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 0.5 });
        
        // Créer un canvas pour la miniature
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        // Rendre la page sur le canvas
        await page.render({
          canvasContext: context,
          viewport: viewport
        }).promise;
        
        // Convertir en data URL
        const thumbnail = canvas.toDataURL('image/jpeg', 0.7);
        
        pagesArray.push({
          id: i,
          number: i,
          thumbnail: thumbnail
        });
      }
      
      setPages(pagesArray);
      setSelectedPages([]);
      toast.success(`PDF chargé avec succès (${numPages} pages)`);
    } catch (error) {
      console.error('Erreur lors du chargement du PDF:', error);
      toast.error('Erreur lors du chargement du PDF');
      setPdfFile(null);
    }
  };

  const handleRemoveFile = () => {
    setPdfFile(null);
    setPages([]);
    setSelectedPages([]);
  };

  const togglePageSelection = (pageId) => {
    setSelectedPages(prev => 
      prev.includes(pageId) 
        ? prev.filter(id => id !== pageId)
        : [...prev, pageId]
    );
  };

  const handleProcess = async (action) => {
    if (!pdfFile) {
      toast.error('Veuillez charger un fichier PDF');
      return;
    }

    if (action === 'extract' && selectedPages.length === 0) {
      toast.error('Veuillez sélectionner au moins une page à extraire');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Charger le PDF source
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      
      // Créer un nouveau PDF
      const newPdfDoc = await PDFDocument.create();
      
      let pagesToCopy = [];
      let message = '';
      let filename = '';

      if (action === 'reorder') {
        // Copier les pages dans le nouvel ordre
        pagesToCopy = pages.map(p => p.number - 1);
        message = 'Pages réorganisées avec succès !';
        filename = `${pdfFile.name.replace('.pdf', '')}_reorganise.pdf`;
      } else if (action === 'extract') {
        // Copier seulement les pages sélectionnées
        pagesToCopy = pages
          .filter(p => selectedPages.includes(p.id))
          .map(p => p.number - 1);
        message = `${selectedPages.length} page(s) extraite(s) avec succès !`;
        filename = `${pdfFile.name.replace('.pdf', '')}_extrait.pdf`;
      }

      // Copier les pages sélectionnées
      const copiedPages = await newPdfDoc.copyPages(pdfDoc, pagesToCopy);
      copiedPages.forEach(page => newPdfDoc.addPage(page));

      // Sauvegarder le nouveau PDF
      const pdfBytes = await newPdfDoc.save();
      
      toast.success(message);
      
      // Télécharger le PDF
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Une erreur est survenue lors du traitement');
    } finally {
      setIsProcessing(false);
    }
  };

  const movePageUp = (index) => {
    if (index === 0) return;
    const newPages = [...pages];
    [newPages[index - 1], newPages[index]] = [newPages[index], newPages[index - 1]];
    setPages(newPages);
  };

  const movePageDown = (index) => {
    if (index === pages.length - 1) return;
    const newPages = [...pages];
    [newPages[index], newPages[index + 1]] = [newPages[index + 1], newPages[index]];
    setPages(newPages);
  };

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h4 className="card-title mb-0">
                <i className="feather-layers me-2"></i>
                Organiser PDF
              </h4>
            </div>
            <div className="card-body">
              {/* File Upload */}
              {!pdfFile ? (
                <div className="border-2 border-dashed rounded p-5 text-center">
                  <input
                    type="file"
                    id="pdfUpload"
                    className="d-none"
                    accept=".pdf"
                    onChange={handleFileUpload}
                  />
                  <label htmlFor="pdfUpload" className="cursor-pointer">
                    <i className="feather-upload display-4 text-muted mb-3 d-block"></i>
                    <h5>Cliquez pour sélectionner un PDF</h5>
                    <p className="text-muted mb-0">ou glissez-déposez le fichier ici</p>
                  </label>
                </div>
              ) : (
                <>
                  {/* File Info */}
                  <div className="alert alert-info d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center">
                      <i className="feather-file-text fs-5 me-2"></i>
                      <div>
                        <strong>{pdfFile.name}</strong>
                        <small className="d-block text-muted">
                          {(pdfFile.size / 1024 / 1024).toFixed(2)} MB • {pages.length} pages
                        </small>
                      </div>
                    </div>
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={handleRemoveFile}
                    >
                      <i className="feather-x"></i>
                    </button>
                  </div>

                  {/* Instructions */}
                  <div className="alert alert-light border mb-4">
                    <div className="d-flex align-items-start">
                      <i className="feather-info text-primary fs-5 me-2"></i>
                      <div>
                        <strong>Comment utiliser :</strong>
                        <ul className="mb-0 mt-2" style={{ fontSize: '13px' }}>
                          <li>Utilisez les flèches pour réorganiser l'ordre des pages</li>
                          <li>Cliquez sur les pages pour les sélectionner (pour extraction)</li>
                          <li>Téléchargez le PDF réorganisé ou extrayez seulement les pages sélectionnées</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Pages Grid */}
                  <div className="mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h6 className="mb-0">
                        Pages du document
                        {selectedPages.length > 0 && (
                          <span className="badge bg-primary ms-2">
                            {selectedPages.length} sélectionnée(s)
                          </span>
                        )}
                      </h6>
                      <div>
                        <button
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() => setSelectedPages(pages.map(p => p.id))}
                        >
                          Tout sélectionner
                        </button>
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => setSelectedPages([])}
                        >
                          Tout désélectionner
                        </button>
                      </div>
                    </div>

                    <div className="row g-3">
                      {pages.map((page, index) => (
                        <div key={page.id} className="col-md-3 col-sm-4 col-6">
                          <div
                            className={`card h-100 cursor-pointer ${
                              selectedPages.includes(page.id) ? 'border-primary border-2' : ''
                            }`}
                            onClick={() => togglePageSelection(page.id)}
                            style={{ 
                              transition: 'all 0.2s',
                              boxShadow: selectedPages.includes(page.id) ? '0 4px 8px rgba(13, 110, 253, 0.2)' : ''
                            }}
                          >
                            <div className="card-body text-center p-3 position-relative">
                              {selectedPages.includes(page.id) && (
                                <div className="position-absolute top-0 end-0 m-2" style={{ zIndex: 10 }}>
                                        <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: '24px', height: '24px' }}>
                                          <i className="feather-check text-white" style={{ fontSize: '14px' }}></i>
                                        </div>
                                      </div>
                                    )}
                                    
                                    {page.thumbnail ? (
                                      <div className="mb-2">
                                        <img 
                                          src={page.thumbnail} 
                                          alt={`Page ${page.number}`}
                                          className="w-100 rounded"
                                          style={{ 
                                            maxHeight: '200px',
                                            objectFit: 'contain',
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                          }}
                                        />
                                      </div>
                                    ) : (
                                      <div 
                                        className="bg-white border rounded mb-2 d-flex flex-column align-items-center justify-content-center position-relative" 
                                        style={{ 
                                          height: '180px',
                                          background: 'linear-gradient(to bottom, #ffffff 0%, #f8f9fa 100%)',
                                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                                        }}
                                      >
                                        {/* Simulate page content */}
                                        <div className="w-75 mb-2" style={{ height: '8px', background: '#dee2e6', borderRadius: '2px' }}></div>
                                        <div className="w-100 px-3">
                                          <div className="mb-1" style={{ height: '4px', background: '#e9ecef', borderRadius: '2px' }}></div>
                                          <div className="mb-1" style={{ height: '4px', background: '#e9ecef', borderRadius: '2px' }}></div>
                                          <div className="mb-1" style={{ height: '4px', background: '#e9ecef', borderRadius: '2px', width: '80%' }}></div>
                                          <div className="my-2"></div>
                                          <div className="mb-1" style={{ height: '4px', background: '#e9ecef', borderRadius: '2px' }}></div>
                                          <div className="mb-1" style={{ height: '4px', background: '#e9ecef', borderRadius: '2px', width: '90%' }}></div>
                                        </div>
                                        <div className="position-absolute bottom-0 end-0 m-2">
                                          <i className="feather-file-text text-muted" style={{ fontSize: '20px', opacity: 0.3 }}></i>
                                        </div>
                                      </div>
                                    )}
                                    <div className="d-flex align-items-center justify-content-center">
                                      <span className="badge bg-secondary">Page {page.number}</span>
                                    </div>
                                    
                                    <div className="btn-group btn-group-sm mt-2 w-100">
                                      <button
                                        className="btn btn-outline-secondary"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          movePageUp(index);
                                        }}
                                        disabled={index === 0}
                                      >
                                        <i className="feather-arrow-up"></i>
                                      </button>
                                      <button
                                        className="btn btn-outline-secondary"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          movePageDown(index);
                                        }}
                                        disabled={index === pages.length - 1}
                                      >
                                        <i className="feather-arrow-down"></i>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="d-flex gap-3 justify-content-center">
                          <button
                            className="btn btn-primary btn-lg px-4"
                            onClick={() => handleProcess('reorder')}
                            disabled={isProcessing}
                          >
                            {isProcessing ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2"></span>
                                Traitement...
                              </>
                            ) : (
                              <>
                                <i className="feather-download me-2"></i>
                                Télécharger PDF réorganisé
                              </>
                            )}
                          </button>
                          
                          <button
                            className="btn btn-success btn-lg px-4"
                            onClick={() => handleProcess('extract')}
                            disabled={isProcessing || selectedPages.length === 0}
                          >
                            {isProcessing ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-2"></span>
                                Traitement...
                              </>
                            ) : (
                              <>
                                <i className="feather-copy me-2"></i>
                                Extraire {selectedPages.length > 0 ? `${selectedPages.length} page(s)` : 'les pages'}
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
