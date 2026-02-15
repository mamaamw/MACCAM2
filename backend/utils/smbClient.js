import SMB2 from '@marsaud/smb2';

let smbClients = {};

/**
 * Obtenir une instance du client SMB pour un partage spécifique
 */
export const getSMBClient = (shareName = null) => {
  const share = shareName || process.env.NAS_SHARE || 'IPC$';
  
  if (!smbClients[share]) {
    smbClients[share] = new SMB2({
      share: `\\\\${process.env.NAS_HOST}\\${share}`,
      domain: process.env.NAS_DOMAIN || '',
      username: process.env.NAS_USERNAME || '',
      password: process.env.NAS_PASSWORD || '',
      autoCloseTimeout: 10000
    });
  }
  return smbClients[share];
};

/**
 * Lister les partages disponibles sur le NAS
 */
export const listShares = () => {
  return new Promise((resolve, reject) => {
    const client = getSMBClient('IPC$');
    
    // Liste les partages via NetShareEnum
    client.readdir('', (err, files) => {
      if (err) {
        // Si IPC$ ne fonctionne pas, essayer de lister manuellement les partages connus
        resolve([
          { name: 'Public', type: 'folder' },
          { name: 'Camille et Marius', type: 'folder' },
          { name: 'Private', type: 'folder' }
        ]);
      } else {
        resolve(files.map(f => ({ name: f, type: 'share' })));
      }
    });
  });
};

/**
 * Lister les fichiers d'un dossier
 */
export const listFiles = (path = '', shareName = null) => {
  return new Promise((resolve, reject) => {
    const share = shareName || process.env.NAS_SHARE;
    
    // Si pas de partage et pas de path, lister les partages
    if (!share && !path) {
      return listShares().then(resolve).catch(reject);
    }
    
    const client = getSMBClient(share);
    const fullPath = process.env.NAS_FOLDER ? `${process.env.NAS_FOLDER}/${path}` : path;
    
    client.readdir(fullPath, (err, files) => {
      if (err) {
        reject(err);
      } else {
        resolve(files);
      }
    });
  });
};

/**
 * Parser un path pour extraire le share et le chemin relatif
 * Format: "ShareName/folder/file" ou juste "folder/file"
 */
const parsePath = (path) => {
  if (!path || path === '') {
    return { share: null, relativePath: '' };
  }
  
  // Si le path commence par un share connu, l'extraire
  const parts = path.split('/');
  const firstPart = parts[0];
  
  // Liste des partages potentiels (on pourrait améliorer ça)
  // Si le premier élément ne contient pas de point (fichier), c'est potentiellement un share
  if (parts.length > 1 && !firstPart.includes('.')) {
    return {
      share: firstPart,
      relativePath: parts.slice(1).join('/')
    };
  }
  
  return { share: null, relativePath: path };
};

/**
 * Lire un fichier
 */
export const readFile = (path, shareName = null) => {
  return new Promise((resolve, reject) => {
    const parsed = parsePath(path);
    const share = shareName || parsed.share || process.env.NAS_SHARE;
    const client = getSMBClient(share);
    const fullPath = process.env.NAS_FOLDER ? `${process.env.NAS_FOLDER}/${parsed.relativePath}` : parsed.relativePath;
    
    client.readFile(fullPath, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
};

/**
 * Écrire un fichier
 */
export const writeFile = (path, data, shareName = null) => {
  return new Promise((resolve, reject) => {
    const parsed = parsePath(path);
    const share = shareName || parsed.share || process.env.NAS_SHARE;
    const client = getSMBClient(share);
    const fullPath = process.env.NAS_FOLDER ? `${process.env.NAS_FOLDER}/${parsed.relativePath}` : parsed.relativePath;
    
    client.writeFile(fullPath, data, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

/**
 * Supprimer un fichier
 */
export const deleteFile = (path, shareName = null) => {
  return new Promise((resolve, reject) => {
    const parsed = parsePath(path);
    const share = shareName || parsed.share || process.env.NAS_SHARE;
    const client = getSMBClient(share);
    const fullPath = process.env.NAS_FOLDER ? `${process.env.NAS_FOLDER}/${parsed.relativePath}` : parsed.relativePath;
    
    client.unlink(fullPath, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

/**
 * Créer un dossier
 */
export const createDirectory = (path, shareName = null) => {
  return new Promise((resolve, reject) => {
    const parsed = parsePath(path);
    const share = shareName || parsed.share || process.env.NAS_SHARE;
    const client = getSMBClient(share);
    const fullPath = process.env.NAS_FOLDER ? `${process.env.NAS_FOLDER}/${parsed.relativePath}` : parsed.relativePath;
    
    client.mkdir(fullPath, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

/**
 * Supprimer un dossier
 */
export const deleteDirectory = (path, shareName = null) => {
  return new Promise((resolve, reject) => {
    const parsed = parsePath(path);
    const share = shareName || parsed.share || process.env.NAS_SHARE;
    const client = getSMBClient(share);
    const fullPath = process.env.NAS_FOLDER ? `${process.env.NAS_FOLDER}/${parsed.relativePath}` : parsed.relativePath;
    
    client.rmdir(fullPath, (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

/**
 * Obtenir les infos d'un fichier
 */
export const getFileInfo = (path, shareName = null) => {
  return new Promise((resolve, reject) => {
    const parsed = parsePath(path);
    const share = shareName || parsed.share || process.env.NAS_SHARE;
    const client = getSMBClient(share);
    const fullPath = process.env.NAS_FOLDER ? `${process.env.NAS_FOLDER}/${parsed.relativePath}` : parsed.relativePath;
    
    client.stat(fullPath, (err, stats) => {
      if (err) {
        reject(err);
      } else {
        resolve(stats);
      }
    });
  });
};

/**
 * Vérifier si un fichier/dossier existe
 */
export const exists = async (path, shareName = null) => {
  try {
    await getFileInfo(path, shareName);
    return true;
  } catch (err) {
    return false;
  }
};
