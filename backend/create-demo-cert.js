import forge from 'node-forge';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔐 Création d\'un certificat de démonstration...\n');

// Créer une paire de clés RSA
console.log('Génération de la paire de clés RSA (2048 bits)...');
const keys = forge.pki.rsa.generateKeyPair(2048);
console.log('✅ Paire de clés générée\n');

// Créer un certificat auto-signé
console.log('Création du certificat auto-signé...');
const cert = forge.pki.createCertificate();
cert.publicKey = keys.publicKey;
cert.serialNumber = '01';
cert.validity.notBefore = new Date();
cert.validity.notAfter = new Date();
cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);

const attrs = [
  { name: 'commonName', value: 'Demo User' },
  { name: 'countryName', value: 'BE' },
  { name: 'organizationName', value: 'MACCAM CRM Demo' },
  { shortName: 'ST', value: 'Brussels' },
  { name: 'localityName', value: 'Brussels' }
];

cert.setSubject(attrs);
cert.setIssuer(attrs);

// Extensions
cert.setExtensions([
  {
    name: 'basicConstraints',
    cA: false
  },
  {
    name: 'keyUsage',
    digitalSignature: true,
    nonRepudiation: true,
    keyEncipherment: true
  },
  {
    name: 'extKeyUsage',
    serverAuth: true,
    clientAuth: true,
    codeSigning: true,
    emailProtection: true
  },
  {
    name: 'subjectAltName',
    altNames: [{
      type: 6, // URI
      value: 'http://localhost:3000'
    }, {
      type: 7, // IP
      ip: '127.0.0.1'
    }]
  }
]);

cert.sign(keys.privateKey, forge.md.sha256.create());
console.log('✅ Certificat créé\n');

// Créer le fichier P12 avec mot de passe "demo"
console.log('Création du fichier PKCS#12...');
const password = 'demo';
const p12Asn1 = forge.pkcs12.toPkcs12Asn1(
  keys.privateKey,
  cert,
  password,
  {
    algorithm: '3des'
  }
);

const p12Der = forge.asn1.toDer(p12Asn1).getBytes();
const p12Buffer = Buffer.from(p12Der, 'binary');

// Sauvegarder le fichier
const outputPath = path.join(__dirname, 'demo-certificate.p12');
fs.writeFileSync(outputPath, p12Buffer);

console.log('✅ Certificat sauvegardé\n');
console.log('📄 Informations du certificat:');
console.log('   Fichier: demo-certificate.p12');
console.log('   Chemin complet:', outputPath);
console.log('   Mot de passe: demo');
console.log('   Nom commun: Demo User');
console.log('   Organisation: MACCAM CRM Demo');
console.log('   Pays: BE');
console.log('   Validité: 1 an');
console.log('\n✨ Certificat prêt à utiliser pour les tests!\n');
console.log('💡 Utilisez ce certificat dans l\'interface de signature PDF');
console.log('   avec le mot de passe "demo"');
