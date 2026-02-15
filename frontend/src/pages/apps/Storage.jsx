import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';

export default function Storage() {
  const [files, setFiles] = useState([]);
  const [currentPath, setCurrentPath] = useState('');
  const [currentShare, setCurrentShare] = useState('Camille et Marius'); // Partage par défaut
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // grid | list | gallery
  const [selectedFile, setSelectedFile] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [galleryMedia, setGalleryMedia] = useState([]);
  const [showLightbox, setShowLightbox] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadFiles(currentPath);
  }, [currentPath, currentShare]);

  useEffect(() => {
    if (viewMode === 'gallery') {
      loadGallery();
    }
  }, [viewMode, currentPath]);

  // Navigation clavier
  useEffect(() => {
    if (!showLightbox) return;

    const handleKeyPress = (e) => {
      if (e.key === 'ArrowRight') handleNextMedia();
      if (e.key === 'ArrowLeft') handlePrevMedia();
      if (e.key === 'Escape') setShowLightbox(false);
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [showLightbox, currentMediaIndex, galleryMedia]);

  const loadFiles = async (path) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const url = `http://localhost:5000/api/v1/storage?path=${encodeURIComponent(path)}&share=${encodeURIComponent(currentShare)}`;
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        setFiles(data.files);
      } else {
        toast.error(data.message || 'Erreur de chargement');
      }
    } catch (error) {
      toast.error('Erreur de connexion au NAS');
    } finally {
      setLoading(false);
    }
  };

  const loadGallery = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const url = `http://localhost:5000/api/v1/storage/gallery?path=${encodeURIComponent(currentPath)}&share=${encodeURIComponent(currentShare)}`;
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      if (data.success) {
        setGalleryMedia(data.media);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('path', currentPath);
    formData.append('share', currentShare);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/v1/storage/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Fichier uploadé !');
        setShowUploadModal(false);
        loadFiles(currentPath);
        if (fileInputRef.current) fileInputRef.current.value = '';
      } else {
        toast.error(data.message || 'Erreur d\'upload');
      }
    } catch (error) {
      toast.error('Erreur lors de l\'upload');
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return toast.error('Nom du dossier requis');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/v1/storage/folder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ path: currentPath, name: newFolderName, share: currentShare })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Dossier créé !');
        setShowNewFolderModal(false);
        setNewFolderName('');
        loadFiles(currentPath);
      }
    } catch (error) {
      toast.error('Erreur création dossier');
    }
  };

  const handleDeleteFile = async (filePath) => {
    if (!window.confirm('Supprimer ce fichier ?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/v1/storage/file', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ path: filePath, share: currentShare })
      });

      const data = await response.json();
      if (data.success) {
        toast.success('Fichier supprimé !');
        loadFiles(currentPath);
      }
    } catch (error) {
      toast.error('Erreur suppression');
    }
  };

  const handleDownload = async (filePath, fileName) => {
    try {
      const token = localStorage.getItem('token');
      const url = `http://localhost:5000/api/v1/storage/download/${encodeURIComponent(filePath)}?share=${encodeURIComponent(currentShare)}`;
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(blobUrl);
      document.body.removeChild(a);
      toast.success('Téléchargement démarré !');
    } catch (error) {
      toast.error('Erreur téléchargement');
    }
  };

  const navigateToFolder = (folderPath) => setCurrentPath(folderPath);

  const goBack = () => {
    if (currentPath) {
      const parts = currentPath.split('/');
      parts.pop();
      setCurrentPath(parts.join('/'));
    }
  };

  const getPathBreadcrumbs = () => {
    if (!currentPath) return [];
    return currentPath.split('/').map((part, index, arr) => ({
      name: part,
      path: arr.slice(0, index + 1).join('/')
    }));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (file) => {
    if (file.isShare || file.type === 'share') return 'server';
    if (file.isDirectory) return 'folder';
    const icons = {
      image: 'image', video: 'video', audio: 'music',
      document: 'file-text', spreadsheet: 'grid',
      archive: 'archive'
    };
    return icons[file.type] || 'file';
  };

  const getPreviewUrl = (filePath, thumbnail = false) => {
    const token = localStorage.getItem('token');
    return `http://localhost:5000/api/v1/storage/preview/${encodeURIComponent(filePath)}?thumbnail=${thumbnail}&share=${encodeURIComponent(currentShare)}`;
  };

  const handleOpenLightbox = (index) => {
    setCurrentMediaIndex(index);
    setShowLightbox(true);
  };

  const handleNextMedia = () => {
    if (currentMediaIndex < galleryMedia.length - 1) setCurrentMediaIndex(currentMediaIndex + 1);
  };

  const handlePrevMedia = () => {
    if (currentMediaIndex > 0) setCurrentMediaIndex(currentMediaIndex - 1);
  };

  return (
    <div className="container-fluid">
      <div className="page-header">
        <div className="row align-items-center">
          <div className="col">
            <h1 className="page-title">
              <i className="feather-hard-drive me-2"></i>
              Stockage NAS
            </h1>
            <p className="text-muted">UGREEN - \\macareux</p>
          </div>
          <div className="col-auto">
            <select 
              className="form-select form-select-sm me-2 d-inline-block" 
              style={{ width: 'auto' }}
              value={currentShare}
              onChange={(e) => {
                setCurrentShare(e.target.value);
                setCurrentPath(''); // Retour à la racine du nouveau partage
              }}
            >
              <option value="Camille et Marius">Camille et Marius</option>
              <option value="Photos-vidéos">Photos-vidéos</option>
              <option value="Photos">Photos</option>
              <option value="Films">Films</option>
              <option value="Musiques">Musiques</option>
              <option value="Divers">Divers</option>
            </select>
            <div className="btn-group me-2">
              <button className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setViewMode('grid')}>
                <i className="feather-grid"></i>
              </button>
              <button className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setViewMode('list')}>
                <i className="feather-list"></i>
              </button>
              <button className={`btn btn-sm ${viewMode === 'gallery' ? 'btn-primary' : 'btn-outline-primary'}`} onClick={() => setViewMode('gallery')}>
                <i className="feather-image"></i>
              </button>
            </div>
            <button className="btn btn-sm btn-success me-2" onClick={() => setShowNewFolderModal(true)}>
              <i className="feather-folder-plus me-1"></i> Dossier
            </button>
            <button className="btn btn-sm btn-primary" onClick={() => setShowUploadModal(true)}>
              <i className="feather-upload me-1"></i> Upload
            </button>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="card mb-3">
        <div className="card-body py-2">
          <nav>
            <ol className="breadcrumb mb-0">
              <li className="breadcrumb-item">
                <a href="#" onClick={() => setCurrentPath('')}><i className="feather-home"></i> Racine</a>
              </li>
              {getPathBreadcrumbs().map((crumb, idx) => (
                <li key={idx} className="breadcrumb-item">
                  <a href="#" onClick={() => navigateToFolder(crumb.path)}>{crumb.name}</a>
                </li>
              ))}
            </ol>
          </nav>
          {currentPath && (
            <button className="btn btn-sm btn-link" onClick={goBack}>
              <i className="feather-arrow-left me-1"></i> Retour
            </button>
          )}
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="row g-3">
          {loading ? (
            <div className="col-12 text-center py-5">
              <div className="spinner-border text-primary"></div>
            </div>
          ) : files.length === 0 ? (
            <div className="col-12 text-center py-5">
              <i className="feather-folder-minus" style={{ fontSize: '4rem', opacity: 0.3 }}></i>
              <p className="text-muted mt-3">Dossier vide</p>
            </div>
          ) : (
            files.map((file, idx) => (
              <div key={idx} className="col-md-3">
                <div className="card h-100">
                  {file.type === 'image' && !file.isDirectory ? (
                    <div style={{ height: '200px', overflow: 'hidden', cursor: 'pointer' }} onClick={() => setSelectedFile(file)}>
                      <img src={getPreviewUrl(file.path, true)} alt={file.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ) : (
                    <div className="card-body text-center" style={{ cursor: file.isDirectory ? 'pointer' : 'default', minHeight: '150px' }}
                      onClick={() => file.isDirectory && navigateToFolder(file.path)}>
                      <i className={`feather-${getFileIcon(file)} ${file.isShare ? 'text-info' : file.isDirectory ? 'text-warning' : 'text-primary'}`} style={{ fontSize: '4rem' }}></i>
                    </div>
                  )}
                  <div className="card-body">
                    <p className="card-text text-truncate mb-1" title={file.name}>
                      <small><strong>{file.name}</strong></small>
                      {file.isShare && <span className="badge bg-info ms-2" style={{ fontSize: '0.6rem' }}>Partage</span>}
                    </p>
                    {!file.isDirectory && <p className="text-muted mb-2"><small>{formatFileSize(file.size)}</small></p>}
                    <div className="d-flex gap-1">
                      {file.isDirectory ? (
                        <button className="btn btn-sm btn-primary flex-grow-1" onClick={() => navigateToFolder(file.path)}>
                          <i className="feather-folder"></i>
                        </button>
                      ) : (
                        <>
                          <button className="btn btn-sm btn-info flex-grow-1" onClick={() => setSelectedFile(file)}>
                            <i className="feather-eye"></i>
                          </button>
                          <button className="btn btn-sm btn-success" onClick={() => handleDownload(file.path, file.name)}>
                            <i className="feather-download"></i>
                          </button>
                          <button className="btn btn-sm btn-danger" onClick={() => handleDeleteFile(file.path)}>
                            <i className="feather-trash-2"></i>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="card">
          <table className="table table-hover mb-0">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Type</th>
                <th>Taille</th>
                <th>Modifié</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="text-center py-5"><div className="spinner-border text-primary"></div></td></tr>
              ) : files.map((file, idx) => (
                <tr key={idx}>
                  <td>
                    <i className={`feather-${getFileIcon(file)} me-2 ${file.isShare ? 'text-info' : file.isDirectory ? 'text-warning' : 'text-primary'}`}></i>
                    {file.isDirectory ? <a href="#" onClick={() => navigateToFolder(file.path)}><strong>{file.name}</strong></a> : file.name}
                  </td>
                  <td><span className={`badge ${file.isShare ? 'bg-info' : 'bg-secondary'}`}>{file.isShare ? 'Partage' : file.isDirectory ? 'Dossier' : file.type}</span></td>
                  <td>{file.isDirectory ? '-' : formatFileSize(file.size)}</td>
                  <td><small className="text-muted">{file.modifiedTime ? new Date(file.modifiedTime).toLocaleDateString('fr-FR') : '-'}</small></td>
                  <td>
                    {file.isDirectory ? (
                      <button className="btn btn-sm btn-primary" onClick={() => navigateToFolder(file.path)}>Ouvrir</button>
                    ) : (
                      <div className="btn-group btn-group-sm">
                        <button className="btn btn-info" onClick={() => setSelectedFile(file)}><i className="feather-eye"></i></button>
                        <button className="btn btn-success" onClick={() => handleDownload(file.path, file.name)}><i className="feather-download"></i></button>
                        <button className="btn btn-danger" onClick={() => handleDeleteFile(file.path)}><i className="feather-trash-2"></i></button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Gallery View */}
      {viewMode === 'gallery' && (
        <div className="row g-2">
          {loading ? (
            <div className="col-12 text-center py-5"><div className="spinner-border text-primary"></div></div>
          ) : galleryMedia.length === 0 ? (
            <div className="col-12 text-center py-5">
              <i className="feather-image" style={{ fontSize: '4rem', opacity: 0.3 }}></i>
              <p className="text-muted mt-3">Aucune image/vidéo</p>
            </div>
          ) : (
            galleryMedia.map((media, idx) => (
              <div key={idx} className="col-md-2">
                <div className="card" style={{ cursor: 'pointer' }} onClick={() => handleOpenLightbox(idx)}>
                  {media.type === 'image' ? (
                    <img src={getPreviewUrl(media.path, true)} alt={media.name} style={{ width: '100%', height: '150px', objectFit: 'cover' }} />
                  ) : (
                    <div className="bg-dark text-center" style={{ height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <i className="feather-video text-white" style={{ fontSize: '3rem' }}></i>
                    </div>
                  )}
                  <div className="card-body p-2">
                    <small className="text-truncate d-block">{media.name}</small>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title"><i className="feather-upload me-2"></i>Uploader</h5>
                <button className="btn-close" onClick={() => setShowUploadModal(false)}></button>
              </div>
              <div className="modal-body">
                <input type="file" className="form-control" ref={fileInputRef} onChange={handleFileUpload} />
                <small className="text-muted">Max : 100MB</small>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Folder Modal */}
      {showNewFolderModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title"><i className="feather-folder-plus me-2"></i>Nouveau dossier</h5>
                <button className="btn-close" onClick={() => setShowNewFolderModal(false)}></button>
              </div>
              <div className="modal-body">
                <input type="text" className="form-control" placeholder="Nom" value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()} />
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowNewFolderModal(false)}>Annuler</button>
                <button className="btn btn-primary" onClick={handleCreateFolder}>Créer</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {selectedFile && !selectedFile.isDirectory && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.9)' }}>
          <div className="modal-dialog modal-dialog-centered modal-xl">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{selectedFile.name}</h5>
                <button className="btn-close btn-close-white" onClick={() => setSelectedFile(null)}></button>
              </div>
              <div className="modal-body text-center" style={{ maxHeight: '70vh' }}>
                {selectedFile.type === 'image' && <img src={getPreviewUrl(selectedFile.path)} alt={selectedFile.name} style={{ maxWidth: '100%', maxHeight: '65vh' }} />}
                {selectedFile.type === 'video' && <video controls style={{ maxWidth: '100%', maxHeight: '65vh' }}><source src={getPreviewUrl(selectedFile.path)} /></video>}
                {selectedFile.type === 'audio' && <audio controls className="w-100"><source src={getPreviewUrl(selectedFile.path)} /></audio>}
                {!['image', 'video', 'audio'].includes(selectedFile.type) && (
                  <div className="py-5">
                    <i className="feather-file" style={{ fontSize: '6rem', opacity: 0.3 }}></i>
                    <p className="text-muted mt-3">Aperçu non disponible</p>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn btn-success" onClick={() => handleDownload(selectedFile.path, selectedFile.name)}>
                  <i className="feather-download me-2"></i>Télécharger
                </button>
                <button className="btn btn-secondary" onClick={() => setSelectedFile(null)}>Fermer</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {showLightbox && galleryMedia.length > 0 && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.95)', zIndex: 1060 }} onClick={() => setShowLightbox(false)}>
          <button className="btn-close btn-close-white position-absolute top-0 end-0 m-3" style={{ zIndex: 1061 }} onClick={() => setShowLightbox(false)}></button>
          <div className="d-flex align-items-center justify-content-center" style={{ height: '100vh' }}>
            {currentMediaIndex > 0 && (
              <button className="btn btn-light position-absolute start-0 ms-3" style={{ zIndex: 1061, width: '50px', height: '50px' }}
                onClick={(e) => { e.stopPropagation(); handlePrevMedia(); }}>
                <i className="feather-chevron-left"></i>
              </button>
            )}
            <div className="text-center" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '90vw' }}>
              {galleryMedia[currentMediaIndex].type === 'image' ? (
                <div>
                  <img src={getPreviewUrl(galleryMedia[currentMediaIndex].path)} alt={galleryMedia[currentMediaIndex].name}
                    style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain' }} />
                  <div className="bg-dark bg-opacity-75 text-white p-3 mt-2 rounded">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <strong>{galleryMedia[currentMediaIndex].name}</strong><br />
                        <small>{formatFileSize(galleryMedia[currentMediaIndex].size)}</small>
                        <small className="ms-3">{currentMediaIndex + 1} / {galleryMedia.length}</small>
                      </div>
                      <button className="btn btn-sm btn-light" onClick={() => handleDownload(galleryMedia[currentMediaIndex].path, galleryMedia[currentMediaIndex].name)}>
                        <i className="feather-download me-2"></i>Télécharger
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <video controls autoPlay style={{ maxWidth: '100%', maxHeight: '80vh' }}>
                    <source src={getPreviewUrl(galleryMedia[currentMediaIndex].path)} />
                  </video>
                  <div className="bg-dark bg-opacity-75 text-white p-3 mt-2 rounded">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <strong>{galleryMedia[currentMediaIndex].name}</strong><br />
                        <small>{formatFileSize(galleryMedia[currentMediaIndex].size)}</small>
                        <small className="ms-3">{currentMediaIndex + 1} / {galleryMedia.length}</small>
                      </div>
                      <button className="btn btn-sm btn-light" onClick={() => handleDownload(galleryMedia[currentMediaIndex].path, galleryMedia[currentMediaIndex].name)}>
                        <i className="feather-download me-2"></i>Télécharger
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {currentMediaIndex < galleryMedia.length - 1 && (
              <button className="btn btn-light position-absolute end-0 me-3" style={{ zIndex: 1061, width: '50px', height: '50px' }}
                onClick={(e) => { e.stopPropagation(); handleNextMedia(); }}>
                <i className="feather-chevron-right"></i>
              </button>
            )}
          </div>
          <div className="position-absolute bottom-0 start-50 translate-middle-x mb-3 text-white text-center" style={{ zIndex: 1061 }}>
            <small><kbd>←</kbd> Précédent · <kbd>→</kbd> Suivant · <kbd>Esc</kbd> Fermer</small>
          </div>
        </div>
      )}
    </div>
  )
}
