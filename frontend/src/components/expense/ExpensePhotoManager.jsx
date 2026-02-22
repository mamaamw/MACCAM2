import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

const ExpensePhotoManager = ({ photos = [], selectedFiles = [], onFileSelect, onRemoveFile, onPhotosChange }) => {
  const [viewerPhoto, setViewerPhoto] = useState(null);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (onFileSelect) {
      onFileSelect(files);
    }
  };

  const handleRemoveFile = (index) => {
    if (onRemoveFile) {
      onRemoveFile(index);
    }
  };

  const getPhotoUrl = (photo) => {
    if (typeof photo === 'string') {
      return `http://localhost:5000${photo}`;
    }
    return URL.createObjectURL(photo);
  };

  const handleRemovePhoto = (index) => {
    if (onPhotosChange) {
      onPhotosChange({ type: 'remove', index });
    }
  };

  return (
    <div className="expense-photo-manager">
      {/* Photos existantes */}
      {photos && photos.length > 0 && (
        <div className="mb-3">
          <label className="form-label">Photos de la dépense</label>
          <div className="row g-2">
            {photos.map((photo, index) => (
              <div key={index} className="col-6 col-md-4 col-lg-3">
                <div className="position-relative">
                  <img
                    src={getPhotoUrl(photo)}
                    alt={`Photo ${index + 1}`}
                    className="img-thumbnail w-100"
                    style={{ height: '120px', objectFit: 'cover', cursor: 'pointer' }}
                    onClick={() => setViewerPhoto(photo)}
                  />
                  <button
                    type="button"
                    className="btn btn-sm btn-danger position-absolute top-0 end-0 m-1"
                    onClick={() => handleRemovePhoto(index)}
                    style={{ padding: '2px 6px' }}
                  >
                    <i className="feather-x"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sélection de nouvelles photos */}
      <div className="mb-3">
        <label className="form-label">
          {photos && photos.length > 0 ? 'Ajouter des photos' : 'Photos (optionnel)'}
        </label>
        <input
          type="file"
          className="form-control"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
        />
        <small className="text-muted">Maximum 5 photos (JPEG, PNG, GIF, WebP)</small>
      </div>

      {/* Prévisualisation des fichiers sélectionnés */}
      {selectedFiles && selectedFiles.length > 0 && (
        <div className="mb-3">
          <label className="form-label">Fichiers sélectionnés ({selectedFiles.length})</label>
          <div className="row g-2">
            {selectedFiles.map((file, index) => (
              <div key={index} className="col-6 col-md-4 col-lg-3">
                <div className="position-relative">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="img-thumbnail w-100"
                    style={{ height: '120px', objectFit: 'cover' }}
                  />
                  <button
                    type="button"
                    className="btn btn-sm btn-warning position-absolute top-0 end-0 m-1"
                    onClick={() => handleRemoveFile(index)}
                    style={{ padding: '2px 6px' }}
                  >
                    <i className="feather-x"></i>
                  </button>
                  <div className="position-absolute bottom-0 start-0 end-0 bg-dark bg-opacity-50 text-white p-1">
                    <small className="text-truncate d-block">{file.name}</small>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Viewer modal */}
      {viewerPhoto && (
        <div
          className="modal fade show d-block"
          style={{ backgroundColor: 'rgba(0,0,0,0.9)' }}
          onClick={() => setViewerPhoto(null)}
        >
          <div className="modal-dialog modal-dialog-centered modal-xl">
            <div className="modal-content bg-transparent border-0">
              <div className="modal-body p-0 text-center">
                <img
                  src={getPhotoUrl(viewerPhoto)}
                  alt="Photo en grand"
                  className="img-fluid"
                  style={{ maxHeight: '90vh' }}
                />
              </div>
              <button
                type="button"
                className="btn-close btn-close-white position-absolute top-0 end-0 m-3"
                onClick={() => setViewerPhoto(null)}
              ></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export { ExpensePhotoManager };
export default ExpensePhotoManager;
